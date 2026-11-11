import { NodoDefinicion } from './iniciativa.models';
import {
  calcular,
  ContextoFormulario,
  indexarPorRuta,
  nuevoIdFila,
  opcionesDeReferencia,
  prefijoDeClave,
  prepararEstructura,
  rutaCampo,
  rutaFila,
  submodulosDeDefinicion,
  sincronizarEspejo,
  totalColumna,
  totalFila,
} from './formulario.utils';

function nodo(clave: string, tipo?: any, extra: any = {}, hijos: NodoDefinicion[] = []): NodoDefinicion {
  return { id: clave, nombre: clave, descripcion: '', bandera_tabla: false, dato: { clave, type: tipo, required: false, ...extra }, hijos };
}

function contexto(parcial: Partial<ContextoFormulario> = {}): ContextoFormulario {
  return {
    claveSubmodulo: 'objetivos',
    datosSubmodulo: {},
    relacionadas: {},
    soloLectura: false,
    errores: {},
    nombreEnCatalogo: (catalogo, codigo) => (catalogo === 'procesos' && codigo === 'Implementación' ? 'Implementación' : codigo),
    ...parcial,
  };
}

describe('formulario.utils', () => {
  it('arma las rutas con el mismo formato que el mid', () => {
    expect(rutaCampo('', 'causas_directas')).toBe('causas_directas');
    expect(rutaCampo(rutaFila('causas_directas', 'cd-1'), 'linea_base')).toBe('causas_directas[cd-1].linea_base');
  });

  it('agrupa los errores por ruta', () => {
    const indice = indexarPorRuta([
      { ruta: 'a', mensaje: 'uno' },
      { ruta: 'a', mensaje: 'dos' },
      { ruta: '', mensaje: 'general' },
    ]);
    expect(indice.a).toEqual(['uno', 'dos']);
    expect(indice['']).toEqual(['general']);
  });

  it('genera ids de fila distintos y legibles', () => {
    const ids = new Set(Array.from({ length: 200 }, () => nuevoIdFila('cd')));
    expect(ids.size).toBe(200);
    expect(prefijoDeClave('causas_directas')).toBe('cd');
  });

  it('sincroniza el espejo: conserva, crea y descarta filas según el origen', () => {
    const actuales = [
      { id: 'oe-1', origen: 'cd-1', objetivo_especifico: 'conservado' },
      { id: 'oe-9', origen: 'cd-9', objetivo_especifico: 'huérfano' },
    ];
    const origen = [{ id: 'cd-1' }, { id: 'cd-2' }];

    const resultado = sincronizarEspejo(actuales, origen, 'oe');

    expect(resultado.length).toBe(2);
    expect(resultado[0]).toBe(actuales[0]);
    expect(resultado[1].origen).toBe('cd-2');
    expect(resultado[1].id).toMatch(/^oe-/);
  });

  it('resuelve las opciones de una referencia "origen.*" con la fila de origen', () => {
    const referencia = nodo('causa_indirecta', 'referencia', { opciones_desde: 'origen.causas_indirectas', mostrar: 'descripcion' });
    const filaOrigen = { id: 'cd-1', causas_indirectas: [{ id: 'ci-1', descripcion: 'Falta de mantenimiento' }, { id: 'ci-2' }] };

    const opciones = opcionesDeReferencia(referencia.dato, filaOrigen, contexto());

    expect(opciones.map((o) => o.id)).toEqual(['ci-1', 'ci-2']);
    expect(opciones[0].etiqueta).toBe('Falta de mantenimiento');
    expect(opciones[1].etiqueta).toContain('sin descripción');
  });

  it('calcula la vista previa del nombre en mayúsculas', () => {
    const hermanos = [
      nodo('proceso', 'catalogo', { catalogo: 'procesos' }),
      nodo('objeto', 'input'),
      nodo('localizacion', 'select'),
      nodo('nombre_proyecto', 'calculado', { plantilla: '{proceso} {objeto} {localizacion}', transformar: 'mayusculas' }),
    ];
    const valores = { proceso: 'Implementación', objeto: ' de la política ', localizacion: 'Bogotá D.C.' };

    expect(calcular(hermanos[3], hermanos, valores, contexto())).toBe('IMPLEMENTACIÓN DE LA POLÍTICA BOGOTÁ D.C.');
  });

  it('prepara la estructura: grupos, filas, espejos y matrices', () => {
    const definicion = [
      nodo('resumen', undefined, {}, [nodo('total', 'numeric')]),
      nodo('objetivos_especificos', 'repetible', { espejo_de: 'problematica.causas_directas' }, [
        nodo('medios', 'repetible', {}, [nodo('descripcion', 'input')]),
      ]),
      nodo('afectada', 'matriz', { filas: [{ clave: 'infancia', nombre: 'Infancia' }] }),
    ];
    const ctx = contexto({ relacionadas: { problematica: { causas_directas: [{ id: 'cd-1' }, { id: 'cd-2' }] } } });

    const datos = prepararEstructura(definicion, {}, ctx);

    expect(datos.resumen).toEqual({});
    expect(datos.objetivos_especificos.map((f: any) => f.origen)).toEqual(['cd-1', 'cd-2']);
    expect(datos.objetivos_especificos[0].medios).toEqual([]);
    expect(datos.afectada).toEqual({ infancia: {} });
  });

  it('deja vacío el nombre editable si es el propuesto y conserva el escrito por el usuario', () => {
    const hermanos = [
      nodo('proceso', 'input'),
      nodo('objeto', 'input'),
      nodo('nombre_proyecto', 'calculado', { plantilla: '{proceso} {objeto}', transformar: 'mayusculas', editable: true }),
    ];

    const base = { proceso: 'Ampliación', objeto: 'de redes' };

    const propuesto = prepararEstructura(hermanos, { ...base, nombre_proyecto: 'AMPLIACIÓN DE REDES' }, contexto());
    const escrito = prepararEstructura(hermanos, { ...base, nombre_proyecto: 'MI NOMBRE' }, contexto());

    expect(propuesto.nombre_proyecto).toBe('');
    expect(escrito.nombre_proyecto).toBe('MI NOMBRE');
  });

  it('toma los submódulos de todos los módulos, en orden', () => {
    const definicion = {
      plantilla_id: 'p', nombre: 'Iniciativa', tipo_plan_id: 't',
      modulos: [
        nodo('identificacion', undefined, { modulo: true }, [nodo('nombre'), nodo('problematica')]),
        nodo('preparacion', undefined, { modulo: true }, [nodo('necesidades')]),
      ],
    };
    expect(submodulosDeDefinicion(definicion).map((s) => s.dato.clave)).toEqual(['nombre', 'problematica', 'necesidades']);
  });

  it('suma los totales de una matriz ignorando celdas vacías', () => {
    const matriz = { a: { x: 1, y: 2 }, b: { x: 3, y: null } };
    expect(totalFila(matriz, 'a', ['x', 'y'])).toBe(3);
    expect(totalFila(matriz, 'b', ['x', 'y'])).toBe(3);
    expect(totalColumna(matriz, ['a', 'b'], 'x')).toBe(4);
  });
});
