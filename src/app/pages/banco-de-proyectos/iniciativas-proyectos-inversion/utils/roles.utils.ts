import { ESTADOS_SUBMODULO_POR_FORMULAR, ROLES_FORMULADORES, ROLES_REVISORES } from './constantes';
import { Estado, ResumenIniciativa } from './iniciativa.models';

/** Indica si el usuario tiene al menos uno de los roles permitidos. */
export function tieneAlgunRol(rolesUsuario: string[], rolesPermitidos: string[]): boolean {
  return (rolesUsuario || []).some((rol) => rolesPermitidos.includes(rol));
}

/**
 * La iniciativa está en un estado editable y el usuario tiene un rol formulador, sin mirar las
 * fechas de formulación (la dependencia comenta aunque estén cerradas).
 */
export function formulaPorEstado(resumen: ResumenIniciativa | null, roles: string[]): boolean {
  return !!resumen && resumen.permite_editar && tieneAlgunRol(roles, ROLES_FORMULADORES);
}

/** El usuario puede formular: estado editable, rol formulador y fechas de formulación habilitadas para la unidad de la iniciativa. */
export function puedeFormular(resumen: ResumenIniciativa | null, roles: string[]): boolean {
  return formulaPorEstado(resumen, roles) && !resumen.fuera_de_fechas;
}

/** El usuario formularía la iniciativa, pero hoy no hay fechas de formulación habilitadas para su unidad. */
export function fueraDeFechas(resumen: ResumenIniciativa | null, roles: string[]): boolean {
  return formulaPorEstado(resumen, roles) && resumen.fuera_de_fechas;
}

/** El usuario puede revisar el submódulo: la iniciativa está en revisión, es revisor y el submódulo ya se formuló. */
export function puedeRevisar(resumen: ResumenIniciativa | null, estadoSubmodulo: Estado, roles: string[]): boolean {
  return (
    !!resumen &&
    resumen.permite_revisar &&
    tieneAlgunRol(roles, ROLES_REVISORES) &&
    !ESTADOS_SUBMODULO_POR_FORMULAR.includes(estadoSubmodulo.codigo_abreviacion)
  );
}
