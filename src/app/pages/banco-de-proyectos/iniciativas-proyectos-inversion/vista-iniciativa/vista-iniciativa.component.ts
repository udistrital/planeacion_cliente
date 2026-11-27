import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { mensajeDeError, IniciativaService } from '../iniciativa.service';
import { NotificacionesIniciativaService } from '../notificaciones-iniciativa.service';
import {
  ACCIONES_INICIATIVA,
  ACCIONES_SUBMODULO,
  AccionDisponible,
  AccionIniciativa,
  DescripcionAccionSubmodulo,
  ESTADO_INICIATIVA_POR_CORREGIR,
  ResumenIniciativa,
  ResumenModulo,
  ResumenSubmodulo,
  RUTA_INICIATIVAS,
} from '../utils';
import { observacionesPorAtender } from '../utils/estados.utils';
import {
  DatosObservaciones,
  ObservacionesSubmoduloIniciativaComponent,
} from '../submodulo-iniciativa/observaciones-submodulo-iniciativa/observaciones-submodulo-iniciativa.component';
import { RechazoIniciativaDialogoComponent } from './rechazo-iniciativa-dialogo/rechazo-iniciativa-dialogo.component';

/**
 * Vista general de la iniciativa: el estado de cada submódulo, agrupados por módulo, y las
 * acciones sobre la iniciativa que el usuario puede ejecutar en su estado. Qué puede hacer lo
 * decide el mid (resumen.permisos); cada cambio de estado se notifica.
 */
@Component({
  selector: 'app-vista-iniciativa',
  templateUrl: './vista-iniciativa.component.html',
  styleUrls: ['./vista-iniciativa.component.scss'],
})
export class VistaIniciativaComponent implements OnInit {
  readonly acciones = ACCIONES_INICIATIVA;
  resumen: ResumenIniciativa | null = null;
  procesando = false;
  /** Clave del submódulo cuyas observaciones se están consultando, para no abrir el modal dos veces. */
  consultandoObservaciones: string | null = null;
  private iniciativaId: string;

  constructor(
    private ruta: ActivatedRoute,
    private router: Router,
    private servicio: IniciativaService,
    private notificaciones: NotificacionesIniciativaService,
    private dialogo: MatDialog,
  ) {}

  ngOnInit(): void {
    this.iniciativaId = this.ruta.snapshot.paramMap.get('id');
    this.cargar();
  }

  /** Acciones del carril del usuario en este estado, habilitadas o con su motivo. */
  get accionesDelUsuario(): AccionDisponible[] {
    return this.resumen ? this.resumen.permisos.acciones : [];
  }

  /** Por qué una acción no está habilitada; fuera de fechas se avisa una sola vez, arriba de los botones. */
  motivoVisible(accion: AccionDisponible): string {
    return !accion.habilitada && !this.resumen.fuera_de_fechas ? accion.motivo || '' : '';
  }

  /** En Por corregir, cuántos submódulos tienen observaciones por atender; 0 en los demás estados. */
  get porAtender(): number {
    const porCorregir = !!this.resumen && this.resumen.estado.codigo_abreviacion === ESTADO_INICIATIVA_POR_CORREGIR;
    return porCorregir ? observacionesPorAtender(this.resumen).length : 0;
  }

  get mensajePorAtender(): string {
    return this.porAtender === 1
      ? 'Hay 1 submódulo con observaciones por atender.'
      : `Hay ${this.porAtender} submódulos con observaciones por atender.`;
  }

  porClave(_: number, modulo: ResumenModulo): string {
    return modulo.clave;
  }

  /** Acción principal del submódulo: formular, revisar o consultar. */
  accionDe(submodulo: ResumenSubmodulo): DescripcionAccionSubmodulo {
    return ACCIONES_SUBMODULO[submodulo.accion] || ACCIONES_SUBMODULO.consultar;
  }

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
        this.servicio.actor().subscribe((actor) => {
          const datos: DatosObservaciones = {
            iniciativaId: this.iniciativaId,
            clave: submodulo.clave,
            nombreSubmodulo: submodulo.nombre,
            observaciones: respuesta.submodulo.observaciones,
            usuario: actor.usuario,
            puedePublicar: false,
          };
          this.dialogo.open(ObservacionesSubmoduloIniciativaComponent, { width: '760px', maxWidth: '95vw', data: datos });
        });
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

  /** Confirma (al rechazar, pide el motivo), ejecuta la acción y notifica el cambio de estado. */
  async ejecutar(accion: AccionIniciativa): Promise<void> {
    const descripcion = ACCIONES_INICIATIVA[accion];
    let motivo: string | undefined;
    if (descripcion.pideMotivo) {
      motivo = await this.dialogo
        .open(RechazoIniciativaDialogoComponent, { width: '600px', maxWidth: '95vw', data: descripcion })
        .afterClosed()
        .toPromise();
      if (!motivo) {
        return;
      }
    } else {
      const confirmacion = await Swal.fire({
        title: descripcion.titulo,
        text: descripcion.confirmacion,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: descripcion.confirmar,
        cancelButtonText: 'Cancelar',
      });
      if (!confirmacion.isConfirmed) {
        return;
      }
    }
    this.procesando = true;
    this.servicio.ejecutarAccion(this.iniciativaId, accion, motivo).subscribe(
      (resumen) => {
        this.resumen = resumen;
        this.procesando = false;
        this.notificaciones.notificar({
          iniciativaId: resumen.id,
          nombre: resumen.nombre,
          dependenciaId: resumen.dependencia_id,
          estado: resumen.estado.codigo_abreviacion,
          accion,
          motivo,
        });
        Swal.fire({ icon: 'success', title: descripcion.exito, timer: 2500, showConfirmButton: false });
      },
      (error) => {
        this.procesando = false;
        Swal.fire({ icon: 'error', title: 'No se pudo completar la acción', text: mensajeDeError(error) }).then(() => this.cargar());
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
