import { MENSAJES_NOTIFICACION } from './constantes';
import { AccionIniciativa } from './iniciativa.models';

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

/** Texto de la notificación del cambio; null si ese estado no se notifica. */
export function mensajeDeNotificacion(cambio: CambioDeEstado, nombreUnidad: string): string | null {
  const plantilla = (cambio.accion && MENSAJES_NOTIFICACION[cambio.accion]) || MENSAJES_NOTIFICACION[cambio.estado];
  if (!plantilla) {
    return null;
  }
  return plantilla
    .replace('[INICIATIVA]', cambio.nombre)
    .replace('[UNIDAD]', nombreUnidad || 'la unidad')
    .replace('[MOTIVO]', (cambio.motivo || '').trim());
}
