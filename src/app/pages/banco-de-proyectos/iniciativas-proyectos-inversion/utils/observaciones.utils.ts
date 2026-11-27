import { NOMBRES_ROL, ROLES_OAP } from './constantes';
import { Observacion } from './iniciativa.models';

/**
 * Funciones puras sobre las observaciones de un submódulo: un historial de
 * observaciones sobre el submódulo completo que solo crece.
 */

/** Del más reciente al más antiguo (el historial llega en orden de registro). */
export function delMasReciente(observaciones: Observacion[]): Observacion[] {
  return (observaciones || []).slice().reverse();
}

/** Nombre legible del rol con el que se escribió; el código si no se conoce. */
export function nombreDeRol(rol: string): string {
  return NOMBRES_ROL[rol] || rol || 'Sin rol';
}

/** Las observaciones de la OAP se distinguen de las de la unidad. */
export function esDeLaOAP(observacion: Observacion): boolean {
  return ROLES_OAP.includes(observacion.rol);
}
