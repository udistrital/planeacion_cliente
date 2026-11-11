import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { mensajeDeError, IniciativaService } from '../iniciativa.service';
import {
  ACCIONES_INICIATIVA,
  ACCIONES_SUBMODULO,
  AccionIniciativa,
  DescripcionAccionSubmodulo,
  ResumenIniciativa,
  ResumenSubmodulo,
  RUTA_INICIATIVAS,
} from '../utils';
import { puedeFormular, puedeRevisar, tieneAlgunRol } from '../utils/roles.utils';
import {
  DatosObservaciones,
  ObservacionesSubmoduloIniciativaComponent,
} from '../submodulo-iniciativa/observaciones-submodulo-iniciativa/observaciones-submodulo-iniciativa.component';

/**
 * Componentes para la formulación de la iniciativa: estado general y una tabla con
 * los módulos y sus submódulos (hojas), cada uno con su estado (punto con el color
 * del semáforo y el nombre) y sus acciones: formular, revisar o consultar, y leer las
 * observaciones (se publican dentro del submódulo). Desde aquí se envía, devuelve o
 * avala la iniciativa.
 */
@Component({
  selector: 'app-vista-iniciativa',
  templateUrl: './vista-iniciativa.component.html',
  styleUrls: ['./vista-iniciativa.component.scss'],
})
export class VistaIniciativaComponent implements OnInit {
  readonly acciones = ACCIONES_INICIATIVA;
  resumen: ResumenIniciativa | null = null;
  roles: string[] = [];
  procesando = false;
  /** Clave del submódulo cuyas observaciones se están consultando, para no abrir el modal dos veces. */
  consultandoObservaciones: string | null = null;
  private usuario = '';
  private iniciativaId: string;

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private servicio: IniciativaService,
    private autenticacion: ImplicitAutenticationService,
    private dialogo: MatDialog,
  ) {}

  async ngOnInit(): Promise<void> {
    this.iniciativaId = this.ruta.snapshot.paramMap.get('id');
    this.roles = (await this.autenticacion.getRole()) as string[];
    this.usuario = String((await this.autenticacion.getDocument()) || '');
    this.cargar();
  }

  /** Acciones posibles según el estado que además puede ejecutar este usuario. */
  get accionesDisponibles(): AccionIniciativa[] {
    return (this.resumen ? this.resumen.acciones_posibles : []).filter((accion) =>
      tieneAlgunRol(this.roles, ACCIONES_INICIATIVA[accion].roles),
    );
  }

  /** El formulador aún no puede enviarla: el botón se muestra deshabilitado con el motivo. */
  get enviarPendiente(): boolean {
    return puedeFormular(this.resumen, this.roles) && !this.accionesDisponibles.includes('enviar');
  }

  /** Acción principal del submódulo: formular, revisar o consultar. */
  accionDe(submodulo: ResumenSubmodulo): DescripcionAccionSubmodulo {
    if (puedeFormular(this.resumen, this.roles)) {
      return ACCIONES_SUBMODULO.formular;
    }
    if (puedeRevisar(this.resumen, submodulo.estado, this.roles)) {
      return ACCIONES_SUBMODULO.revisar;
    }
    return ACCIONES_SUBMODULO.consultar;
  }

  /** Desde la tabla las observaciones solo se leen: el ícono se habilita si hay alguna. */
  puedeAbrirObservaciones(submodulo: ResumenSubmodulo): boolean {
    return submodulo.observaciones > 0;
  }

  textoObservaciones(submodulo: ResumenSubmodulo): string {
    return submodulo.observaciones > 0 ? `Ver observaciones (${submodulo.observaciones})` : 'Sin observaciones';
  }

  abrir(submodulo: ResumenSubmodulo): void {
    this.router.navigate([RUTA_INICIATIVAS, this.iniciativaId, 'submodulo', submodulo.clave]);
  }

  /**
   * Abre el modal de observaciones en solo lectura (se publican dentro del submódulo).
   * El resumen solo trae cuántas hay, así que primero se consulta el historial.
   */
  verObservaciones(submodulo: ResumenSubmodulo): void {
    this.consultandoObservaciones = submodulo.clave;
    this.servicio.submodulo(this.iniciativaId, submodulo.clave).subscribe(
      (respuesta) => {
        this.consultandoObservaciones = null;
        const datos: DatosObservaciones = {
          iniciativaId: this.iniciativaId,
          clave: submodulo.clave,
          nombreSubmodulo: submodulo.nombre,
          observaciones: respuesta.submodulo.observaciones,
          usuario: this.usuario,
          rol: null,
        };
        this.dialogo.open(ObservacionesSubmoduloIniciativaComponent, { width: '760px', maxWidth: '95vw', data: datos });
      },
      (error) => {
        this.consultandoObservaciones = null;
        Swal.fire({ icon: 'error', title: 'No se pudieron consultar las observaciones', text: mensajeDeError(error) });
      },
    );
  }

  volver(): void {
    this.router.navigate([RUTA_INICIATIVAS]);
  }

  async ejecutar(accion: AccionIniciativa): Promise<void> {
    const descripcion = ACCIONES_INICIATIVA[accion];
    const confirmacion = await Swal.fire({
      title: `${descripcion.etiqueta}?`,
      text: descripcion.confirmacion,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, continuar',
      cancelButtonText: 'Cancelar',
    });
    if (!confirmacion.isConfirmed) {
      return;
    }
    this.procesando = true;
    this.servicio.ejecutarAccion(this.iniciativaId, accion).subscribe(
      (resumen) => {
        this.resumen = resumen;
        this.procesando = false;
        Swal.fire({ icon: 'success', title: `Iniciativa «${resumen.estado.nombre}»`, timer: 2500, showConfirmButton: false });
      },
      (error) => {
        this.procesando = false;
        Swal.fire({ icon: 'error', title: 'No se pudo completar la acción', text: mensajeDeError(error) });
      },
    );
  }

  private cargar(): void {
    Swal.fire({ title: 'Cargando la iniciativa…', allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() });
    this.servicio.resumen(this.iniciativaId).subscribe(
      (resumen) => {
        this.resumen = resumen;
        Swal.close();
      },
      (error) => Swal.fire({ icon: 'error', title: 'Error', text: mensajeDeError(error) }),
    );
  }
}
