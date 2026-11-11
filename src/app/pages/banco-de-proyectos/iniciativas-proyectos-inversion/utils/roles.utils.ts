import { ESTADO_SUBMODULO_SIN_FORMULAR, ROLES_FORMULADORES, ROLES_REVISORES } from './constantes';
import { Estado, ResumenIniciativa } from './iniciativa.models';

/** Indica si el usuario tiene al menos uno de los roles permitidos. */
export function tieneAlgunRol(rolesUsuario: string[], rolesPermitidos: string[]): boolean {
  return (rolesUsuario || []).some((rol) => rolesPermitidos.includes(rol));
}

/** El usuario puede formular: la iniciativa está en un estado editable y tiene un rol formulador. */
export function puedeFormular(resumen: ResumenIniciativa | null, roles: string[]): boolean {
  return !!resumen && resumen.permite_editar && tieneAlgunRol(roles, ROLES_FORMULADORES);
}

/** El usuario puede revisar el submódulo: la iniciativa está en revisión, es revisor y el submódulo ya se formuló. */
export function puedeRevisar(resumen: ResumenIniciativa | null, estadoSubmodulo: Estado, roles: string[]): boolean {
  return (
    !!resumen &&
    resumen.permite_revisar &&
    tieneAlgunRol(roles, ROLES_REVISORES) &&
    estadoSubmodulo.codigo_abreviacion !== ESTADO_SUBMODULO_SIN_FORMULAR
  );
}
