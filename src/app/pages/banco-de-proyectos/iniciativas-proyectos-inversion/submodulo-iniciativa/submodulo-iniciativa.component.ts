import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { Component, ElementRef, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, from, Observable, of, Subject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';
import { mensajeDeError, IniciativaService } from '../iniciativa.service';
import { NotificacionesIniciativaService } from '../notificaciones-iniciativa.service';
import {
  Datos,
  Definicion,
  Estado,
  ESTADO_INICIATIVA_APROBADA,
  ESTADO_SUBMODULO_APROBADO,
  ESTADO_SUBMODULO_CON_OBSERVACIONES,
  COLUMNAS_RESUMEN,
  GRUPOS_EN_ARBOL,
  GRUPOS_EN_COLUMNAS,
  HTTP_CONFLICTO,
  ICONOS_SECCIONES,
  LISTAS_EN_TABLA,
  NodoDefinicion,
  ReferenciaDocumento,
  ResumenIniciativa,
  ResumenSubmodulo,
  RUTA_INICIATIVAS,
  SubmoduloVista,
  SUBMODULOS_PLEGABLES,
  Veredicto,
  VEREDICTOS,
} from '../utils';
import { dependientesDe, estadoTrasVeredicto, estaAprobado, veredictoDe } from '../utils/estados.utils';
import {
  ContextoFormulario,
  copiar,
  EstructuraDocumentos,
  estructuraDeDocumentos,
  indexarPorRuta,
  prepararEstructura,
  submodulosDeDefinicion,
  submodulosDeResumen,
} from '../utils/formulario.utils';
import { GuardadoEnCola } from '../utils/guardado.utils';
import { registrarContenedorConScroll } from '../utils/scroll.utils';
import {
  DatosObservaciones,
  ObservacionesSubmoduloIniciativaComponent,
} from './observaciones-submodulo-iniciativa/observaciones-submodulo-iniciativa.component';

/**
 * Formulario de un submódulo (hoja) de la iniciativa. El formulario se arma con la
 * definición de la plantilla; el servidor valida y decide el estado del submódulo.
 * Lo que el usuario hace aquí (formular, revisar o consultar) lo dice el mid en el resumen.
 * Fuera de las fechas de la unidad se muestra en solo lectura; si las fechas se cierran con
 * el submódulo abierto, el mid rechaza el guardado (409) y el submódulo se recarga así.
 *
 * Revisar: el Jefe solo observa; la OAP da el veredicto «Aprobado» o «Con observaciones». Si
 * el último veredicto cambia el estado de la iniciativa, se notifica y la pantalla se recarga
 * con los permisos nuevos.
 */
@Component({
  selector: 'app-submodulo-iniciativa',
  templateUrl: './submodulo-iniciativa.component.html',
  styleUrls: ['./submodulo-iniciativa.component.scss'],
})
export class SubmoduloIniciativaComponent implements OnInit, OnDestroy {
  readonly veredictos = VEREDICTOS;
  resumen: ResumenIniciativa | null = null;
  nodo: NodoDefinicion | null = null;
  /** Si el submódulo solo tiene documentos (Anexos), se dibuja como una sola tabla; si no, null. */
  documentos: EstructuraDocumentos | null = null;
  submodulo: SubmoduloVista | null = null;
  datos: Datos = {};
  contexto: ContextoFormulario | null = null;
  cargando = true;
  guardando = false;
  private usuario = '';
  private iniciativaId: string;
  private clave: string;
  private relacionadas: { [submodulo: string]: Datos } = {};
  /** La definición es la plantilla y no cambia: se pide una vez por iniciativa, no en cada submódulo. */
  private definicion: Definicion | null = null;
  /** Guardados sin aviso de lo que está en pantalla (contexto.guardarAutomatico); se arma en mostrar. */
  private guardadoAutomatico: GuardadoEnCola | null = null;
  /** Se pidió un guardado automático mientras corría el Guardar: se hace cuando este responda. */
  private guardarTrasGuardar = false;
  private readonly destruir$ = new Subject<void>();
  /** Quita del ScrollDispatcher el contenedor con scroll de la página (ver registrarContenedorConScroll). */
  private quitarContenedorConScroll: () => void = () => {};

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private servicio: IniciativaService,
    private notificaciones: NotificacionesIniciativaService,
    private dialogo: MatDialog,
    private gestor: GestorDocumentalService,
    private elemento: ElementRef<HTMLElement>,
    private despachadorScroll: ScrollDispatcher,
    private zona: NgZone,
  ) {}

  async ngOnInit(): Promise<void> {
    // Las listas (catálogos, selects) siguen a su campo al bajar por el formulario.
    this.quitarContenedorConScroll = registrarContenedorConScroll(this.elemento.nativeElement, this.despachadorScroll, this.zona);
    this.usuario = (await this.servicio.actor().toPromise()).usuario;
    // La misma instancia se reutiliza al pasar al submódulo anterior o siguiente.
    this.ruta.paramMap.pipe(takeUntil(this.destruir$)).subscribe((parametros) => {
      this.iniciativaId = parametros.get('id');
      this.clave = parametros.get('clave');
      this.cargar();
    });
  }

  ngOnDestroy(): void {
    this.quitarContenedorConScroll();
    this.destruir$.next();
    this.destruir$.complete();
  }

  /** El submódulo en el resumen: trae lo que el usuario hace con él (formular, revisar o consultar). */
  get enResumen(): ResumenSubmodulo | null {
    return (this.resumen && submodulosDeResumen(this.resumen).find((s) => s.clave === this.clave)) || null;
  }

  get puedeEditar(): boolean {
    return !!this.enResumen && this.enResumen.accion === 'formular';
  }

  /** Tendría algo que hacer, pero hoy no hay fechas habilitadas para la unidad de la iniciativa. */
  get fueraDeFechas(): boolean {
    return !!this.resumen && this.resumen.fuera_de_fechas;
  }

  get puedeRevisar(): boolean {
    return !!this.enResumen && this.enResumen.accion === 'revisar';
  }

  /** Revisa como OAP, así que da el veredicto del submódulo; el Jefe solo observa. */
  get daVeredicto(): boolean {
    return this.puedeRevisar && this.resumen.permisos.aprobar_submodulos;
  }

  /** Veredicto que ya tiene el submódulo; null si aún no tiene (Formulado). */
  get veredictoActual(): Veredicto | null {
    return this.submodulo ? veredictoDe(this.submodulo.estado.codigo_abreviacion) : null;
  }

  /** Puede escribir observaciones: el Jefe y la OAP cuando revisan; la unidad solo las lee. */
  get puedePublicar(): boolean {
    return this.puedeRevisar && this.resumen.permisos.observar;
  }

  /** El submódulo tiene observaciones que la unidad debe atender. */
  get conObservaciones(): boolean {
    return !!this.submodulo && this.submodulo.estado.codigo_abreviacion === ESTADO_SUBMODULO_CON_OBSERVACIONES;
  }

  /** Por qué está en solo lectura (fuera de fechas se avisa aparte). */
  get motivoSoloLectura(): string {
    const aprobado = !!this.submodulo && this.submodulo.estado.codigo_abreviacion === ESTADO_SUBMODULO_APROBADO;
    if (aprobado && this.resumen && this.resumen.permisos.editar) {
      return 'el submódulo está aprobado';
    }
    return this.resumen ? `la iniciativa está «${this.resumen.estado.nombre}»` : '';
  }

  get claveActual(): string {
    return this.clave;
  }

  get anterior(): ResumenSubmodulo | null {
    return this.vecina(-1);
  }

  get siguiente(): ResumenSubmodulo | null {
    return this.vecina(1);
  }

  /** Hay un guardado automático en curso (tras adjuntar, quitar o eliminar un documento). */
  get guardandoDocumentos(): boolean {
    return !!this.guardadoAutomatico && this.guardadoAutomatico.ocupado;
  }

  async guardar(): Promise<void> {
    if (this.guardando || this.guardandoDocumentos || !(await this.confirmarDependientes())) {
      return;
    }
    this.guardando = true;
    this.servicio.guardarSubmodulo(this.iniciativaId, this.clave, this.submodulo.version, this.datos).subscribe(
      (vista) => {
        this.guardando = false;
        if (this.guardarTrasGuardar) {
          // Mientras se guardaba se adjuntó, quitó o eliminó un documento: la pantalla ya lo tiene, así
          // que se conserva y se guarda otra vez con la versión nueva.
          this.guardarTrasGuardar = false;
          this.aplicarGuardadoSinAviso(vista);
          this.guardadoAutomatico.pedir();
        } else {
          this.mostrar(vista);
        }
        const pendientes = vista.errores.length;
        Swal.fire(
          pendientes
            ? { icon: 'warning', title: 'Guardado con pendientes', text: `El submódulo quedó «${vista.estado.nombre}». Revise los ${pendientes} puntos señalados.` }
            : { icon: 'success', title: 'Submódulo formulado', timer: 2000, showConfirmButton: false },
        );
      },
      (error) => {
        this.guardando = false;
        this.guardarTrasGuardar = false;
        this.manejarErrorDeEscritura(error);
      },
    );
  }

  /**
   * Veredicto de la OAP desde el seleccionable. El grupo vuelve al veredicto que tiene el
   * submódulo: cambia solo cuando el mid lo confirma (si se cancela, no queda marcado otro).
   */
  async elegirVeredicto(veredicto: Veredicto, grupo: MatButtonToggleGroup): Promise<void> {
    grupo.value = this.veredictoActual;
    if (veredicto === this.veredictoActual && veredicto === 'aprobado') {
      return;
    }
    if (!(await this.confirmarUltimoVeredicto(veredicto))) {
      return;
    }
    if (veredicto === 'con_observaciones') {
      this.abrirObservaciones();
      return;
    }
    this.aprobar();
  }

  /** Veredicto «Aprobado» de la OAP. */
  private aprobar(): void {
    this.guardando = true;
    this.servicio.aprobarSubmodulo(this.iniciativaId, this.clave, this.submodulo.version).subscribe(
      (vista) => {
        this.guardando = false;
        this.mostrar(vista);
        if (vista.estado_iniciativa) {
          this.trasCambioDeEstado(vista.estado_iniciativa);
          return;
        }
        Swal.fire({ icon: 'success', title: 'Submódulo aprobado', timer: 2000, showConfirmButton: false });
      },
      (error) => {
        this.guardando = false;
        this.manejarErrorDeEscritura(error);
      },
    );
  }

  /**
   * Abre el modal de observaciones: se leen todas y, si el usuario puede publicar ahora,
   * publica nuevas. Cada publicación deja el submódulo «Con observaciones» de una vez, sin
   * cambiar la versión. Si la observación es el último veredicto de la OAP, el modal se cierra y
   * la iniciativa se recarga.
   */
  abrirObservaciones(): void {
    const datos: DatosObservaciones = {
      iniciativaId: this.iniciativaId,
      clave: this.clave,
      nombreSubmodulo: this.nodo.nombre,
      observaciones: this.submodulo.observaciones,
      usuario: this.usuario,
      puedePublicar: this.puedePublicar,
    };
    const modal = this.dialogo.open(ObservacionesSubmoduloIniciativaComponent, { width: '760px', maxWidth: '95vw', data: datos });
    modal.componentInstance.publicada.pipe(takeUntil(modal.afterClosed())).subscribe((vista: SubmoduloVista) => {
      this.aplicarObservaciones(vista);
      if (vista.estado_iniciativa) {
        modal.close();
        this.trasCambioDeEstado(vista.estado_iniciativa);
      }
    });
  }

  /** Antes del último veredicto, avisa qué pasará con la iniciativa y pide confirmarlo. */
  private async confirmarUltimoVeredicto(veredicto: Veredicto): Promise<boolean> {
    const destino = estadoTrasVeredicto(this.resumen, this.clave, veredicto);
    if (!destino) {
      return true;
    }
    const aprobada = destino === ESTADO_INICIATIVA_APROBADA;
    const respuesta = await Swal.fire({
      title: aprobada ? '¿Aprobar la iniciativa?' : '¿Devolver la iniciativa a la unidad?',
      text: aprobada
        ? 'Es el último submódulo por revisar: al aprobarlo, la iniciativa queda aprobada.'
        : 'Es el último submódulo por revisar: al publicar la observación, la iniciativa vuelve a la unidad para corregirla.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: aprobada ? 'Sí, aprobar' : 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    });
    return respuesta.isConfirmed;
  }

  /**
   * Si el submódulo tiene dependientes aprobados, avisa antes de guardar: los aprobados no se
   * vuelven a validar, y quien revisa decide si los observa de nuevo. Los demás dependientes se
   * revalidan solos al guardar, así que no hace falta avisar por ellos.
   */
  private async confirmarDependientes(): Promise<boolean> {
    const dependientes = dependientesDe(this.resumen, this.clave);
    const aprobados = dependientes.filter(estaAprobado);
    if (aprobados.length === 0) {
      return true;
    }
    const nombres = (lista: ResumenSubmodulo[]) => lista.map((s) => `«${s.nombre}»`).join(', ');
    const respuesta = await Swal.fire({
      title: 'Submódulos que dependen de este',
      html:
        `<p>${nombres(dependientes)} ${dependientes.length === 1 ? 'toma' : 'toman'} datos de «${this.nodo.nombre}».</p>` +
        `<p>${nombres(aprobados)} ${aprobados.length === 1 ? 'está aprobado y no se vuelve' : 'están aprobados y no se vuelven'} a validar: ` +
        'si su cambio los afecta, quien revise decidirá si los observa de nuevo.</p>',
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Guardar',
      cancelButtonText: 'Cancelar',
    });
    return respuesta.isConfirmed;
  }

  /** El último veredicto cambió el estado de la iniciativa: se notifica y se recarga con los permisos nuevos. */
  private trasCambioDeEstado(estado: Estado): void {
    this.notificaciones.notificar({
      iniciativaId: this.resumen.id,
      nombre: this.resumen.nombre,
      dependenciaId: this.resumen.dependencia_id,
      estado: estado.codigo_abreviacion,
    });
    const titulo = estado.codigo_abreviacion === ESTADO_INICIATIVA_APROBADA ? 'Iniciativa aprobada' : 'Iniciativa devuelta a la unidad';
    Swal.fire({ icon: 'success', title: titulo, confirmButtonText: 'Aceptar' }).then(() => this.cargar());
  }

  irA(submodulo: ResumenSubmodulo): void {
    this.router.navigate([RUTA_INICIATIVAS, this.iniciativaId, 'submodulo', submodulo.clave]);
  }

  /** El nombre de la iniciativa no cabe en las dos líneas del título (termina en «…»). */
  estaCortado(titulo: HTMLElement): boolean {
    return titulo.scrollHeight > titulo.clientHeight + 1;
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
        this.documentos = this.nodo ? estructuraDeDocumentos(this.nodo.hijos) : null;
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
      listasEnTabla: LISTAS_EN_TABLA[this.clave] || [],
      gruposEnColumnas: GRUPOS_EN_COLUMNAS[this.clave] || [],
      gruposEnArbol: GRUPOS_EN_ARBOL[this.clave] || [],
      seccionesPlegables: SUBMODULOS_PLEGABLES.includes(this.clave),
      iconosSecciones: ICONOS_SECCIONES[this.clave] || {},
      columnasResumen: COLUMNAS_RESUMEN[this.clave] || {},
      nombreEnCatalogo: (catalogo, codigo) => this.servicio.nombreEnCatalogo(catalogo, codigo),
      subirDocumento: (clave, archivo) => this.subirDocumento(clave, archivo),
      guardarAutomatico: () => this.pedirGuardadoAutomatico(),
    };
    if (this.nodo) {
      prepararEstructura(this.nodo.hijos, this.datos, this.contexto);
    }
    this.guardadoAutomatico = this.nuevoGuardadoAutomatico();
    this.actualizarEstadoEnResumen(vista);
  }

  private pedirGuardadoAutomatico(): void {
    if (this.guardando) {
      this.guardarTrasGuardar = true;
      return;
    }
    this.guardadoAutomatico.pedir();
  }

  /**
   * Cola de guardados sin aviso de los datos que se acaban de mostrar. Si el usuario pasa a otro
   * submódulo mientras se guarda, lo pendiente se guarda igual en el submódulo de antes (con la
   * versión que respondió el último guardado), pero ya no cambia la pantalla.
   */
  private nuevoGuardadoAutomatico(): GuardadoEnCola {
    const iniciativaId = this.iniciativaId;
    const clave = this.clave;
    const nombre = this.nodo ? this.nodo.nombre : clave;
    const datos = this.datos;
    let version = this.submodulo.version;
    const enPantalla = () => this.datos === datos;
    return new GuardadoEnCola(
      () => {
        // En pantalla manda la versión de this.submodulo: también la cambia el botón Guardar.
        const vigente = enPantalla() ? this.submodulo.version : version;
        return this.servicio.guardarSubmodulo(iniciativaId, clave, vigente, datos).pipe(
          tap((vista: SubmoduloVista) => {
            version = vista.version;
            if (enPantalla()) {
              this.aplicarGuardadoSinAviso(vista);
            }
          }),
        );
      },
      (error) => {
        if (enPantalla()) {
          this.manejarErrorDeEscritura(error);
          return;
        }
        Swal.fire({ icon: 'error', title: `No se guardó el último cambio de ${nombre}`, text: mensajeDeError(error) });
      },
    );
  }

  /**
   * Tras guardar sin aviso solo cambian la versión, el estado y los pendientes. Los datos de la
   * pantalla se conservan: ya tienen lo guardado y quizá algo más (otro archivo que terminó de
   * subir mientras tanto o un nombre que se está escribiendo).
   */
  private aplicarGuardadoSinAviso(vista: SubmoduloVista): void {
    this.submodulo = vista;
    this.contexto.errores = indexarPorRuta(vista.errores);
    this.actualizarEstadoEnResumen(vista);
  }

  /**
   * Tras publicar una observación solo cambian el historial y el estado: los datos del
   * formulario y la versión se conservan.
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

  /** Pasa el archivo a base64 y lo sube por el mid; responde la referencia. */
  private subirDocumento(clave: string, archivo: File): Observable<ReferenciaDocumento> {
    return from(this.gestor.fileToBase64(archivo)).pipe(
      switchMap((base64) =>
        this.servicio.subirDocumento(this.iniciativaId, this.clave, {
          clave,
          nombre: archivo.name,
          archivo: String(base64),
        }),
      ),
    );
  }

  private vecina(desplazamiento: number): ResumenSubmodulo | null {
    const submodulos = this.resumen ? submodulosDeResumen(this.resumen) : [];
    const posicion = submodulos.findIndex((s) => s.clave === this.clave);
    return posicion < 0 ? null : submodulos[posicion + desplazamiento] || null;
  }
}
