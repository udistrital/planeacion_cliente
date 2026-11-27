import { NOTIFICACIONES } from './constantes';
import { AccionIniciativa, DescripcionNotificacion } from './iniciativa.models';

/** Un cambio de estado de una iniciativa, para notificarlo. */
export interface CambioDeEstado {
  iniciativaId: string;
  nombre: string;
  dependenciaId: string;
  /** Código del estado al que llegó. */
  estado: string;
  /** Acción que lo produjo; sin ella, fue el último veredicto de la OAP. */
  accion?: AccionIniciativa;
  /** Motivo del rechazo. */
  motivo?: string;
}

/** Notificación del cambio: la de su acción si tiene una propia, si no la del estado al que llegó; null si no se notifica. */
export function notificacionDe(cambio: CambioDeEstado): DescripcionNotificacion | null {
  return (cambio.accion && NOTIFICACIONES[cambio.accion]) || NOTIFICACIONES[cambio.estado] || null;
}

/** Texto de la notificación del cambio en el sistema; null si no se notifica. */
export function mensajeDeNotificacion(cambio: CambioDeEstado, nombreUnidad: string): string | null {
  const notificacion = notificacionDe(cambio);
  if (!notificacion) {
    return null;
  }
  return notificacion.mensaje
    .replace('[INICIATIVA]', cambio.nombre)
    .replace('[UNIDAD]', nombreUnidad || 'la unidad')
    .replace('[MOTIVO]', (cambio.motivo || '').trim());
}

/** Datos con los que SES llena la plantilla de correo. */
export function datosDeCorreo(cambio: CambioDeEstado, nombreUnidad: string): { [campo: string]: string } {
  return {
    NOMBRE_INICIATIVA: cambio.nombre,
    NOMBRE_UNIDAD: nombreUnidad || 'la unidad',
    MOTIVO: (cambio.motivo || '').trim(),
  };
}

/**
 * A quién va el correo. Con un correo de pruebas, solo a él. Sin él, en un ambiente desplegado a
 * los destinatarios, y en local a nadie, para que una prueba no les escriba a personas reales.
 */
export function correosDestino(destinatarios: string[], correoPruebas: string, desplegado: boolean): string[] {
  const pruebas = (correoPruebas || '').trim();
  if (pruebas) {
    return [pruebas];
  }
  return desplegado ? destinatarios : [];
}

/**
 * A quién va la notificación en el sistema (por documento). Con un correo de pruebas, y siempre en
 * local, solo a quien hizo el cambio, para que una prueba no les llegue a personas reales. Sin él,
 * en un ambiente desplegado, a los destinatarios.
 */
export function documentosDestino(destinatarios: string[], actor: string, correoPruebas: string, desplegado: boolean): string[] {
  if ((correoPruebas || '').trim() || !desplegado) {
    const propio = (actor || '').trim();
    return propio ? [propio] : [];
  }
  return destinatarios;
}
