import { Injectable } from '@angular/core';
import { take } from 'rxjs/operators';
import { WebSocketSubject } from 'rxjs/webSocket';
import { environment } from 'src/environments/environment';
import { Notificaciones } from '../../services/notificaciones';
import { RequestManager } from '../../services/requestManager';
import { IniciativaService } from './iniciativa.service';
import { ASUNTO_NOTIFICACION, CARGOS_NOTIFICACION, DEPENDENCIA_PLANEACION, MODULO_NOTIFICACION } from './utils';
import { CambioDeEstado, correosDestino, datosDeCorreo, documentosDestino, mensajeDeNotificacion, notificacionDe } from './utils/notificaciones.utils';

/** Quiénes reciben la notificación: su documento (en el sistema) y su correo institucional. */
interface Destinatarios {
  documentos: string[];
  correos: string[];
}

/**
 * Notifica cada cambio de estado de una iniciativa a los cargos de CARGOS_NOTIFICACION de la
 * unidad de la iniciativa y de Planeación, con el mismo mecanismo de Formulación y Seguimiento
 * (Notificaciones: Parámetros, Terceros, notificaciones_crud, el WebSocket de notificacion_mid y
 * el correo con plantillas de SES). La notificación en el sistema y el correo van por separado: si
 * uno falla, el otro sale igual. Las notificaciones son además el registro de quién cambió el
 * estado y cuándo.
 */
@Injectable({
  providedIn: 'root',
})
export class NotificacionesIniciativaService {
  private socket: WebSocketSubject<any> | null = null;

  constructor(private notificaciones: Notificaciones, private request: RequestManager, private iniciativas: IniciativaService) {}

  /**
   * Notifica el cambio. El cambio ya quedó hecho: si la notificación falla, solo queda en la
   * consola y no se interrumpe al usuario.
   */
  async notificar(cambio: CambioDeEstado): Promise<void> {
    const notificacion = notificacionDe(cambio);
    if (!notificacion) {
      return;
    }
    try {
      const [actor, nombreUnidad, destinatarios] = await Promise.all([
        this.iniciativas.actor().toPromise(),
        this.nombreUnidad(cambio.dependenciaId),
        this.destinatarios(cambio.dependenciaId),
      ]);
      await Promise.all([
        this.publicar(cambio, mensajeDeNotificacion(cambio, nombreUnidad), nombreUnidad, actor.usuario, destinatarios.documentos),
        this.enviarCorreo(cambio, notificacion.correo, nombreUnidad, destinatarios.correos),
      ]);
    } catch (error) {
      console.error('No se pudo notificar el cambio de estado de la iniciativa:', error);
    }
  }

  /**
   * Publica la notificación en el sistema (la campana) y avisa en tiempo real. Con CORREO_PRUEBAS
   * en el environment, y siempre en local, va solo a quien hizo el cambio.
   */
  private async publicar(
    cambio: CambioDeEstado,
    mensaje: string,
    nombreUnidad: string,
    remitente: string,
    destinatarios: string[],
  ): Promise<void> {
    const documentos = documentosDestino(destinatarios, remitente, environment.CORREO_PRUEBAS, environment.production);
    if (documentos.length === 0) {
      console.warn(`La notificación de la iniciativa no tiene destinatarios: nadie con los cargos ${CARGOS_NOTIFICACION.join(', ')} en la unidad ${cambio.dependenciaId} ni en Planeación.`);
      return;
    }
    try {
      const [sistemaId, tipoNotificacionId] = await Promise.all([
        this.notificaciones.getIdSistema(this.notificaciones.NOTIFICACION.CODIGO_SISGPLAN),
        this.notificaciones.getIdTipoNotificacion(this.notificaciones.NOTIFICACION.CODIGO_NOTIFICACION_INFORMATIVA),
      ]);
      const publicadas = await this.notificaciones.publicarNotificaciones({
        sistema_id: sistemaId,
        tipo_notificacion_id: tipoNotificacionId,
        destinatarios: documentos,
        remitente,
        asunto: ASUNTO_NOTIFICACION,
        mensaje,
        metadatos: {
          modulo: MODULO_NOTIFICACION,
          iniciativa_id: cambio.iniciativaId,
          nombre_iniciativa: cambio.nombre,
          nombre_unidad: nombreUnidad,
          estado: cambio.estado,
        },
        activo: true,
      });
      this.avisarEnTiempoReal(remitente, publicadas);
    } catch (error) {
      console.error('No se pudo publicar la notificación de la iniciativa:', error);
    }
  }

  /**
   * Manda el correo con la plantilla SISGPLAN_PLANTILLA_<código> de SES, como Formulación. Con
   * CORREO_PRUEBAS en el environment, va solo a ese correo; sin él, en local no se envía.
   */
  private async enviarCorreo(cambio: CambioDeEstado, codigo: string, nombreUnidad: string, correos: string[]): Promise<void> {
    const para = correosDestino(correos, environment.CORREO_PRUEBAS, environment.production);
    if (para.length === 0) {
      return;
    }
    const datos = datosDeCorreo(cambio, nombreUnidad);
    const plantilla = `${this.notificaciones.CORREO.INICIO_PLANTILLA}_${codigo}`;
    try {
      await this.notificaciones.enviarCorreos({
        Source: this.notificaciones.CORREO.CORREO_BASE,
        Template: plantilla,
        Destinations: [{ Destination: { ToAddresses: para }, ReplacementTemplateData: datos }],
        DefaultTemplateData: datos,
      });
    } catch (error) {
      console.error(`No se pudo enviar el correo de la iniciativa (plantilla ${plantilla}):`, error);
    }
  }

  /** Quienes tienen los cargos de la notificación en la unidad o en Planeación: su documento y su correo institucional. */
  private async destinatarios(dependenciaId: string): Promise<Destinatarios> {
    const cargos = await this.notificaciones.getCargos(CARGOS_NOTIFICACION.join('|'));
    const idsCargos = (cargos || []).map((cargo: any) => cargo.Id).join('|');
    const vinculaciones = await this.notificaciones.getUsuariosDestino(`${dependenciaId}|${DEPENDENCIA_PLANEACION}`, idsCargos);
    const terceros = new Map<number, any>();
    for (const vinculacion of vinculaciones || []) {
      const tercero = vinculacion && vinculacion.TerceroPrincipalId;
      if (tercero && tercero.Id) {
        terceros.set(tercero.Id, tercero);
      }
    }
    const datos = await Promise.all(Array.from(terceros.keys()).map((id) => this.notificaciones.getDatosIdentificacion(String(id))));
    const documentos = datos.filter((d: any) => d && typeof d.Numero === 'string' && d.Numero !== '').map((d: any) => d.Numero);
    const correos = Array.from(terceros.values())
      .map((tercero: any) => String(tercero.UsuarioWSO2 || '').trim())
      .filter((correo) => correo.endsWith(this.notificaciones.CORREO.TERMINACION_CORREO));
    return { documentos, correos: Array.from(new Set(correos)) };
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
