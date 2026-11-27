import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { Notificaciones } from '../../services/notificaciones';
import { RequestManager } from '../../services/requestManager';
import { IniciativaService } from './iniciativa.service';
import { ASUNTO_NOTIFICACION, CARGOS_NOTIFICACION, DEPENDENCIA_PLANEACION } from './utils';
import { CambioDeEstado, mensajeDeNotificacion } from './utils/notificaciones.utils';

/**
 * Notifica en el sistema cada cambio de estado de una iniciativa: a los cargos de
 * CARGOS_NOTIFICACION de la unidad de la iniciativa y de Planeación. Usa el mismo mecanismo que
 * Formulación y Seguimiento (Notificaciones: Parámetros, Terceros, notificaciones_crud y el
 * WebSocket de notificacion_mid), sin el correo, que espera las plantillas de OATI. Las
 * notificaciones son además el registro de quién cambió el estado y cuándo.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificacionesIniciativaService {
  private socket: WebSocketSubject<any> | null = null;

  constructor(private notificaciones: Notificaciones, private request: RequestManager, private iniciativas: IniciativaService) {}

  /**
   * Publica la notificación del cambio. El cambio ya quedó hecho: si la notificación falla, solo
   * queda en la consola y no se interrumpe al usuario.
   */
  async notificar(cambio: CambioDeEstado): Promise<void> {
    try {
      const [actor, nombreUnidad] = await Promise.all([this.iniciativas.actor().toPromise(), this.nombreUnidad(cambio.dependenciaId)]);
      const mensaje = mensajeDeNotificacion(cambio, nombreUnidad);
      if (!mensaje) {
        return;
      }
      const [destinatarios, sistemaId, tipoNotificacionId] = await Promise.all([
        this.destinatarios(cambio.dependenciaId),
        this.notificaciones.getIdSistema(this.notificaciones.NOTIFICACION.CODIGO_SISGPLAN),
        this.notificaciones.getIdTipoNotificacion(this.notificaciones.NOTIFICACION.CODIGO_NOTIFICACION_INFORMATIVA),
      ]);
      if (destinatarios.length === 0) {
        return;
      }
      const publicadas = await this.notificaciones.publicarNotificaciones({
        sistema_id: sistemaId,
        tipo_notificacion_id: tipoNotificacionId,
        destinatarios,
        remitente: actor.usuario,
        asunto: ASUNTO_NOTIFICACION,
        mensaje,
        metadatos: {
          modulo: 'iniciativas',
          iniciativa_id: cambio.iniciativaId,
          nombre_iniciativa: cambio.nombre,
          nombre_unidad: nombreUnidad,
          estado: cambio.estado,
        },
        activo: true,
      });
      this.avisarEnTiempoReal(actor.usuario, publicadas);
    } catch (error) {
      console.error('No se pudo notificar el cambio de estado de la iniciativa:', error);
    }
  }

  /** Documentos de quienes tienen los cargos de la notificación en la unidad o en Planeación. */
  private async destinatarios(dependenciaId: string): Promise<string[]> {
    const cargos = await this.notificaciones.getCargos(CARGOS_NOTIFICACION.join('|'));
    const idsCargos = (cargos || []).map((cargo: any) => cargo.Id).join('|');
    const vinculaciones = await this.notificaciones.getUsuariosDestino(`${dependenciaId}|${DEPENDENCIA_PLANEACION}`, idsCargos);
    const terceroDe = (vinculacion: any) => vinculacion && vinculacion.TerceroPrincipalId && vinculacion.TerceroPrincipalId.Id;
    const terceros = new Set<number>((vinculaciones || []).map(terceroDe).filter((id: number) => !!id));
    const datos = await Promise.all(Array.from(terceros).map((id) => this.notificaciones.getDatosIdentificacion(String(id))));
    return datos.filter((d: any) => d && typeof d.Numero === 'string' && d.Numero !== '').map((d: any) => d.Numero);
  }

  /** Nombre de la unidad en Oikos; vacío si no se obtiene (el texto dice entonces «la unidad»). */
  private async nombreUnidad(dependenciaId: string): Promise<string> {
    try {
      const dependencia: any = await this.request.get(environment.OIKOS_SERVICE, `dependencia/${dependenciaId}`).pipe(take(1)).toPromise();
      return (dependencia && dependencia.Nombre) || '';
    } catch (error) {
      return '';
    }
  }

  /**
   * Avisa por el WebSocket de notificacion_mid, como Formulación, para que llegue sin recargar. La
   * conexión se abre la primera vez (identificada con el documento de quien notifica) y se reutiliza;
   * si se cae, la siguiente notificación abre otra.
   */
  private avisarEnTiempoReal(documento: string, publicadas: any): void {
    if (!this.socket) {
      const socket = new WebSocketSubject<any>(environment.NOTIFICACION_MID_WS);
      socket.subscribe({
        error: (error) => {
          console.error('WebSocket de notificaciones:', error);
          this.socket = null;
        },
        complete: () => (this.socket = null),
      });
      socket.next(documento);
      this.socket = socket;
    }
    this.socket.next(publicadas);
  }
}
