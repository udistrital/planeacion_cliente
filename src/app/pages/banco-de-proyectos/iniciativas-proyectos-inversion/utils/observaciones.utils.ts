import { NOMBRES_ROL, ROLES_FORMULADORES, ROLES_REVISORES } from './constantes';
import { Estado, Observacion, ResumenIniciativa } from './iniciativa.models';
import { puedeFormular, puedeRevisar } from './roles.utils';

/**
 * Funciones puras sobre las observaciones de un submódulo: un historial de
 * comentarios sobre el submódulo completo que solo crece.
 */

/** Del más reciente al más antiguo (el historial llega en orden de registro). */
export function delMasReciente(observaciones: Observacion[]): Observacion[] {
  return (observaciones || []).slice().reverse();
}

/** Nombre legible del rol con el que se escribió; el código si no se conoce. */
export function nombreDeRol(rol: string): string {
  return NOMBRES_ROL[rol] || rol || 'Sin rol';
}

/** Las observaciones de Planeación se distinguen de las de la dependencia. */
export function esDePlaneacion(observacion: Observacion): boolean {
  return ROLES_REVISORES.includes(observacion.rol);
}

/**
 * Rol con el que el usuario publica una observación ahora, o null si no puede:
 * Planeación mientras revisa un submódulo formulado, la dependencia mientras formula o
 * corrige. PLANEACION también formula; al formular se prefiere un rol de la dependencia.
 */
export function rolParaComentar(resumen: ResumenIniciativa | null, estadoSubmodulo: Estado, roles: string[]): string | null {
  const propios = (permitidos: string[]) => (roles || []).filter((rol) => permitidos.includes(rol));
  if (puedeRevisar(resumen, estadoSubmodulo, roles)) {
    return propios(ROLES_REVISORES)[0] || null;
  }
  if (puedeFormular(resumen, roles)) {
    const formuladores = propios(ROLES_FORMULADORES);
    return formuladores.find((rol) => !ROLES_REVISORES.includes(rol)) || formuladores[0] || null;
  }
  return null;
}
