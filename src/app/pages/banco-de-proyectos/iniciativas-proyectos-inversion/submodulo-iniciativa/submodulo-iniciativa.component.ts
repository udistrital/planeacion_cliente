import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { mensajeDeError, IniciativaService } from '../iniciativa.service';
import {
  Datos,
  Definicion,
  ESTADO_SUBMODULO_CON_OBSERVACIONES,
  NodoDefinicion,
  ResumenIniciativa,
  ResumenSubmodulo,
  RUTA_INICIATIVAS,
  SubmoduloVista,
} from '../utils';
import {
  ContextoFormulario,
  copiar,
  indexarPorRuta,
  prepararEstructura,
  submodulosDeDefinicion,
  submodulosDeResumen,
} from '../utils/formulario.utils';
import { rolParaComentar } from '../utils/observaciones.utils';
import { puedeFormular, puedeRevisar } from '../utils/roles.utils';
import {
  DatosObservaciones,
  ObservacionesSubmoduloIniciativaComponent,
} from './observaciones-submodulo-iniciativa/observaciones-submodulo-iniciativa.component';

const HTTP_CONFLICTO = 409;

/**
 * Formulario de un submódulo (hoja) de la iniciativa. El formulario se arma con la
 * definición de la plantilla; el servidor valida y decide el estado del submódulo.
 */
@Component({
  selector: 'app-submodulo-iniciativa',
  templateUrl: './submodulo-iniciativa.component.html',
  styleUrls: ['./submodulo-iniciativa.component.scss'],
})
export class SubmoduloIniciativaComponent implements OnInit, OnDestroy {
  resumen: ResumenIniciativa | null = null;
  nodo: NodoDefinicion | null = null;
  submodulo: SubmoduloVista | null = null;
  datos: Datos = {};
  contexto: ContextoFormulario | null = null;
  cargando = true;
  guardando = false;
  private roles: string[] = [];
  private usuario = '';
  private iniciativaId: string;
  private clave: string;
  private relacionadas: { [submodulo: string]: Datos } = {};
  /** La definición es la plantilla y no cambia: se pide una vez por iniciativa, no en cada submódulo. */
  private definicion: Definicion | null = null;
  private readonly destruir$ = new Subject<void>();

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private servicio: IniciativaService,
    private autenticacion: ImplicitAutenticationService,
    private dialogo: MatDialog,
  ) {}

  async ngOnInit(): Promise<void> {
    this.roles = (await this.autenticacion.getRole()) as string[];
    this.usuario = String((await this.autenticacion.getDocument()) || '');
    // La misma instancia se reutiliza al pasar al submódulo anterior o siguiente.
    this.ruta.paramMap.pipe(takeUntil(this.destruir$)).subscribe((parametros) => {
      this.iniciativaId = parametros.get('id');
      this.clave = parametros.get('clave');
      this.cargar();
    });
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  get puedeEditar(): boolean {
    return puedeFormular(this.resumen, this.roles);
  }

  get puedeRevisar(): boolean {
    return !!this.submodulo && puedeRevisar(this.resumen, this.submodulo.estado, this.roles);
  }

  /** Rol con el que el usuario publica observaciones ahora; null si solo puede leerlas. */
  get rolComentario(): string | null {
    return this.submodulo ? rolParaComentar(this.resumen, this.submodulo.estado, this.roles) : null;
  }

  /** Qué pasa al publicar: si Planeación está revisando, el submódulo queda «Con observaciones». */
  get avisoComentario(): string {
    return this.puedeRevisar ? 'Al publicar, el submódulo queda «Con observaciones».' : '';
  }

  /** Planeación dejó observaciones que la dependencia debe atender. */
  get conObservaciones(): boolean {
    return !!this.submodulo && this.submodulo.estado.codigo_abreviacion === ESTADO_SUBMODULO_CON_OBSERVACIONES;
  }

  get anterior(): ResumenSubmodulo | null {
    return this.vecina(-1);
  }

  get siguiente(): ResumenSubmodulo | null {
    return this.vecina(1);
  }

  guardar(): void {
    this.guardando = true;
    this.servicio.guardarSubmodulo(this.iniciativaId, this.clave, this.submodulo.version, this.datos).subscribe(
      (vista) => {
        this.guardando = false;
        this.mostrar(vista);
        const pendientes = vista.errores.length;
        Swal.fire(
          pendientes
            ? { icon: 'warning', title: 'Guardado con pendientes', text: `El submódulo quedó «${vista.estado.nombre}». Revise los ${pendientes} puntos señalados.` }
            : { icon: 'success', title: 'Submódulo formulado', timer: 2000, showConfirmButton: false },
        );
      },
      (error) => {
        this.guardando = false;
        this.manejarErrorDeEscritura(error);
      },
    );
  }

  /** Planeación da el submódulo por revisado sin observaciones. */
  marcarSinObservaciones(): void {
    this.guardando = true;
    this.servicio.marcarSinObservaciones(this.iniciativaId, this.clave, this.submodulo.version).subscribe(
      (vista) => {
        this.guardando = false;
        this.mostrar(vista);
        Swal.fire({ icon: 'success', title: `Submódulo «${vista.estado.nombre}»`, timer: 2000, showConfirmButton: false });
      },
      (error) => {
        this.guardando = false;
        this.manejarErrorDeEscritura(error);
      },
    );
  }

  /**
   * Abre el modal de observaciones: se leen todas y, si el usuario puede comentar ahora,
   * publica nuevas. Cada publicación actualiza el estado del submódulo de una vez; no
   * cambia la versión, así que no interfiere con cambios sin guardar en el formulario.
   */
  abrirObservaciones(): void {
    const datos: DatosObservaciones = {
      iniciativaId: this.iniciativaId,
      clave: this.clave,
      nombreSubmodulo: this.nodo.nombre,
      observaciones: this.submodulo.observaciones,
      usuario: this.usuario,
      rol: this.rolComentario,
      aviso: this.avisoComentario,
    };
    const modal = this.dialogo.open(ObservacionesSubmoduloIniciativaComponent, { width: '760px', maxWidth: '95vw', data: datos });
    modal.componentInstance.publicada
      .pipe(takeUntil(modal.afterClosed()))
      .subscribe((vista: SubmoduloVista) => this.aplicarObservaciones(vista));
  }

  irA(submodulo: ResumenSubmodulo): void {
    this.router.navigate([RUTA_INICIATIVAS, this.iniciativaId, 'submodulo', submodulo.clave]);
  }

  volver(): void {
    this.router.navigate([RUTA_INICIATIVAS, this.iniciativaId]);
  }

  private cargar(): void {
    this.cargando = true;
    const mismaIniciativa = !!this.resumen && this.resumen.id === this.iniciativaId;
    // Al pasar al submódulo anterior o siguiente esto corre en medio de la navegación, y
    // pages.component cierra cualquier Swal en cada evento del router: el aviso se abre al terminar.
    setTimeout(() => {
      if (this.cargando) {
        Swal.fire({ title: 'Cargando el submódulo…', allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() });
      }
    });
    forkJoin({
      resumen: this.servicio.resumen(this.iniciativaId),
      definicion: mismaIniciativa && this.definicion ? of(this.definicion) : this.servicio.definicion(this.iniciativaId),
      submodulo: this.servicio.submodulo(this.iniciativaId, this.clave),
    }).subscribe(
      ({ resumen, definicion, submodulo }) => {
        this.resumen = resumen;
        this.definicion = definicion;
        this.nodo = submodulosDeDefinicion(definicion).find((s) => s.dato.clave === this.clave) || null;
        this.relacionadas = submodulo.relacionadas || {};
        this.mostrar(submodulo.submodulo);
        this.cargando = false;
        Swal.close();
      },
      (error) => {
        this.cargando = false;
        Swal.fire({ icon: 'error', title: 'Error', text: mensajeDeError(error) });
      },
    );
  }

  /** Arma los datos editables y el contexto del formulario a partir de lo que respondió el servidor. */
  private mostrar(vista: SubmoduloVista): void {
    this.submodulo = vista;
    this.datos = copiar(vista.datos) || {};
    this.contexto = {
      claveSubmodulo: this.clave,
      datosSubmodulo: this.datos,
      relacionadas: this.relacionadas,
      soloLectura: !this.puedeEditar,
      errores: indexarPorRuta(vista.errores),
      nombreEnCatalogo: (catalogo, codigo) => this.servicio.nombreEnCatalogo(catalogo, codigo),
    };
    if (this.nodo) {
      prepararEstructura(this.nodo.hijos, this.datos, this.contexto);
    }
    this.actualizarEstadoEnResumen(vista);
  }

  /**
   * Tras publicar una observación solo cambian el historial y el estado: los datos del
   * formulario (quizá con cambios sin guardar) y la versión se conservan.
   */
  private aplicarObservaciones(vista: SubmoduloVista): void {
    this.submodulo = { ...this.submodulo, estado: vista.estado, observaciones: vista.observaciones };
    this.actualizarEstadoEnResumen(vista);
  }

  private actualizarEstadoEnResumen(vista: SubmoduloVista): void {
    const enResumen = this.resumen && submodulosDeResumen(this.resumen).find((s) => s.clave === this.clave);
    if (enResumen) {
      enResumen.estado = vista.estado;
      enResumen.observaciones = vista.observaciones.length;
    }
  }

  private manejarErrorDeEscritura(error: any): void {
    if (error && error.status === HTTP_CONFLICTO) {
      Swal.fire({ icon: 'warning', title: 'No se guardó', text: mensajeDeError(error), confirmButtonText: 'Recargar' }).then(() =>
        this.cargar(),
      );
      return;
    }
    Swal.fire({ icon: 'error', title: 'No se guardó', text: mensajeDeError(error) });
  }

  private vecina(desplazamiento: number): ResumenSubmodulo | null {
    const submodulos = this.resumen ? submodulosDeResumen(this.resumen) : [];
    const posicion = submodulos.findIndex((s) => s.clave === this.clave);
    return posicion < 0 ? null : submodulos[posicion + desplazamiento] || null;
  }
}
