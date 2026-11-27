/** Indica si el usuario tiene al menos uno de los roles permitidos. */
export function tieneAlgunRol(rolesUsuario: string[], rolesPermitidos: string[]): boolean {
  return (rolesUsuario || []).some((rol) => rolesPermitidos.includes(rol));
}
