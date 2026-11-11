import { ESTADO_SUBMODULO_SIN_FORMULAR } from './constantes';
import { Estado, Observacion, ResumenIniciativa } from './iniciativa.models';
import { delMasReciente, esDePlaneacion, nombreDeRol, rolParaComentar } from './observaciones.utils';

function observacion(texto: string, rol = 'PLANEACION'): Observacion {
  return { texto, rol, usuario: 'U' };
}

function resumen(editable: boolean, revisable: boolean): ResumenIniciativa {
  return { permite_editar: editable, permite_revisar: revisable } as ResumenIniciativa;
}

function estado(codigo: string): Estado {
  return { _id: codigo, nombre: codigo, codigo_abreviacion: codigo };
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

  it('distingue las observaciones de Planeación', () => {
    expect(esDePlaneacion(observacion('x', 'ASISTENTE_PLANEACION'))).toBe(true);
    expect(esDePlaneacion(observacion('x', 'JEFE_DEPENDENCIA'))).toBe(false);
  });

  it('comenta la dependencia al formular y Planeación al revisar un submódulo formulado', () => {
    const formulado = estado('FOR_SUB');
    const sinFormular = estado(ESTADO_SUBMODULO_SIN_FORMULAR);

    expect(rolParaComentar(resumen(true, false), sinFormular, ['PLANEACION', 'JEFE_DEPENDENCIA'])).toBe('JEFE_DEPENDENCIA');
    expect(rolParaComentar(resumen(true, false), sinFormular, ['PLANEACION'])).toBe('PLANEACION');
    expect(rolParaComentar(resumen(false, true), formulado, ['JEFE_DEPENDENCIA', 'PLANEACION'])).toBe('PLANEACION');
    expect(rolParaComentar(resumen(false, true), sinFormular, ['PLANEACION'])).toBeNull();
    expect(rolParaComentar(resumen(false, true), formulado, ['JEFE_DEPENDENCIA'])).toBeNull();
    expect(rolParaComentar(resumen(false, false), formulado, ['PLANEACION', 'JEFE_DEPENDENCIA'])).toBeNull();
    expect(rolParaComentar(null, formulado, ['PLANEACION'])).toBeNull();
  });
});
