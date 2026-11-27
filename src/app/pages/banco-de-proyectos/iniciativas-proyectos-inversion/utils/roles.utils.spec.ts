import { ROLES_FORMULADORES } from './constantes';
import { tieneAlgunRol } from './roles.utils';

describe('roles.utils', () => {
  it('reconoce al formulador por cualquiera de sus roles', () => {
    expect(tieneAlgunRol(['PLANEACION', 'ASISTENTE_PLANEACION'], ROLES_FORMULADORES)).toBe(true);
    expect(tieneAlgunRol(['PLANEACION'], ROLES_FORMULADORES)).toBe(false);
    expect(tieneAlgunRol(null, ROLES_FORMULADORES)).toBe(false);
  });
});
