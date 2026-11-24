import { ResumenIniciativa } from './iniciativa.models';
import { formulaPorEstado, fueraDeFechas, puedeFormular } from './roles.utils';

function resumen(editable: boolean, fueraDeFechasHoy: boolean): ResumenIniciativa {
  return { permite_editar: editable, permite_revisar: false, fuera_de_fechas: fueraDeFechasHoy } as ResumenIniciativa;
}

describe('roles.utils', () => {
  const dependencia = ['JEFE_DEPENDENCIA'];
  const revisor = ['ASISTENTE_PLANEACION'];

  it('formula quien tiene un rol formulador, con la iniciativa editable y dentro de las fechas', () => {
    expect(puedeFormular(resumen(true, false), dependencia)).toBe(true);
    expect(puedeFormular(resumen(true, true), dependencia)).toBe(false);
    expect(puedeFormular(resumen(false, false), dependencia)).toBe(false);
    expect(puedeFormular(resumen(true, false), revisor)).toBe(false);
    expect(puedeFormular(null, dependencia)).toBe(false);
  });

  it('fuera de fechas solo para quien la formularía', () => {
    expect(fueraDeFechas(resumen(true, true), dependencia)).toBe(true);
    expect(fueraDeFechas(resumen(true, false), dependencia)).toBe(false);
    expect(fueraDeFechas(resumen(true, true), revisor)).toBe(false);
    expect(fueraDeFechas(null, dependencia)).toBe(false);
  });

  it('el estado y el rol no dependen de las fechas', () => {
    expect(formulaPorEstado(resumen(true, true), dependencia)).toBe(true);
    expect(formulaPorEstado(resumen(false, false), dependencia)).toBe(false);
  });
});
