import { Observacion } from './iniciativa.models';
import { delMasReciente, esDeLaOAP, nombreDeRol } from './observaciones.utils';

function observacion(texto: string, rol = 'PLANEACION'): Observacion {
  return { texto, rol, usuario: 'U' };
}

describe('observaciones.utils', () => {
  it('ordena del más reciente al más antiguo sin cambiar el historial', () => {
    const historial = [observacion('Primera'), observacion('Segunda')];

    expect(delMasReciente(historial).map((o) => o.texto)).toEqual(['Segunda', 'Primera']);
    expect(historial[0].texto).toBe('Primera');
    expect(delMasReciente(null)).toEqual([]);
  });

  it('muestra el rol con un nombre legible', () => {
    expect(nombreDeRol('JEFE_DEPENDENCIA')).toBe('Jefe de dependencia');
    expect(nombreDeRol('OTRO_ROL')).toBe('OTRO_ROL');
    expect(nombreDeRol('')).toBe('Sin rol');
  });

  it('distingue las observaciones de la OAP', () => {
    expect(esDeLaOAP(observacion('x', 'ASISTENTE_PLANEACION'))).toBe(true);
    expect(esDeLaOAP(observacion('x', 'JEFE_DEPENDENCIA'))).toBe(false);
  });
});
