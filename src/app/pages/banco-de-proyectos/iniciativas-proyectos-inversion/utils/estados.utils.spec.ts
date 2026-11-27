import { ResumenIniciativa, ResumenSubmodulo } from './iniciativa.models';
import { dependientesDe, estadoTrasVeredicto, observacionesPorAtender, veredictoDe } from './estados.utils';

function submodulo(clave: string, codigo: string, dependientes: string[] = []): ResumenSubmodulo {
  const estado = { nombre: codigo, codigo_abreviacion: codigo };
  return { clave, nombre: clave, accion: 'revisar', observaciones: 0, dependientes, estado };
}

function resumen(...submodulos: ResumenSubmodulo[]): ResumenIniciativa {
  return { modulos: [{ clave: 'identificacion', nombre: 'Identificación', submodulos }] } as ResumenIniciativa;
}

describe('estados.utils', () => {
  it('el veredicto sale del estado del submódulo', () => {
    expect(veredictoDe('APR_SUB')).toBe('aprobado');
    expect(veredictoDe('CO_SUB')).toBe('con_observaciones');
    expect(veredictoDe('FOR_SUB')).toBeNull();
  });

  it('avisa el estado al que pasa la iniciativa con el último veredicto, como el mid', () => {
    const revision = resumen(submodulo('nombre', 'APR_SUB'), submodulo('problematica', 'FOR_SUB'), submodulo('objetivos', 'CO_SUB'));
    const sinObservaciones = resumen(submodulo('nombre', 'APR_SUB'), submodulo('problematica', 'FOR_SUB'));

    expect(estadoTrasVeredicto(revision, 'problematica', 'aprobado')).toBe('PC_IPI');
    expect(estadoTrasVeredicto(sinObservaciones, 'problematica', 'aprobado')).toBe('APR_IPI');
    expect(estadoTrasVeredicto(sinObservaciones, 'problematica', 'con_observaciones')).toBe('PC_IPI');
    expect(estadoTrasVeredicto(sinObservaciones, 'nombre', 'aprobado')).toBeNull();
  });

  it('lista las observaciones por atender y los dependientes en el orden de la iniciativa', () => {
    const iniciativa = resumen(submodulo('cadena_valor', 'APR_SUB', ['cronograma']), submodulo('cronograma', 'CO_SUB'), submodulo('riesgos', 'CO_SUB'));

    expect(observacionesPorAtender(iniciativa).map((s) => s.clave)).toEqual(['cronograma', 'riesgos']);
    expect(observacionesPorAtender(null)).toEqual([]);
    expect(dependientesDe(iniciativa, 'cadena_valor').map((s) => s.clave)).toEqual(['cronograma']);
    expect(dependientesDe(iniciativa, 'riesgos')).toEqual([]);
  });
});
