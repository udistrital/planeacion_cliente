import { Datos, NodoDefinicion } from './iniciativa.models';
import {
  calcular,
  calcularNumero,
  campoResumenPorDefecto,
  ContextoFormulario,
  filaCompleta,
  textoResumen,
  esGrupoDeCasillas,
  esVisible,
  estructuraDeDocumentos,
  estructuraDeTabla,
  filasDeRuta,
  formatearNumero,
  indexarPorRuta,
  marcarCasilla,
  nuevoIdFila,
  opcionesDeReferencia,
  prefijoDeClave,
  prepararEstructura,
  rutaCampo,
  rutaEnPlantilla,
  rutaFila,
  seMuestraEnTabla,
  submodulosDeDefinicion,
  sincronizarEspejo,
  totalColumna,
  totalFila,
  valorDeRuta,
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
    apariencia: 'outline',
    listasEnTabla: [],
    gruposEnCasillas: [],
    nombreEnCatalogo: (catalogo, codigo) => (catalogo === 'procesos' && codigo === 'Implementación' ? 'Implementación' : codigo),
    ...parcial,
  };
}

describe('formulario.utils', () => {
  it('arma las rutas con el mismo formato que el mid', () => {
    expect(rutaCampo('', 'causas_directas')).toBe('causas_directas');
    expect(rutaCampo(rutaFila('causas_directas', 'cd-1'), 'linea_base')).toBe('causas_directas[cd-1].linea_base');
  });

  describe('tabla resumen de un grupo repetible', () => {
    const bienes = nodo('bienes_servicios', 'repetible', { min: 1 }, [
      nodo('bien_servicio', 'input', { required: true, multilinea: true }),
      nodo('unidad_medida', 'input', { required: true }),
      nodo('otra', 'input', { required: true, solo_si: { campo: 'unidad_medida', valor: 'Otra' } }),
      nodo('analisis_anual', 'repetible', { required: true, min: 1 }, [
        nodo('anio', 'numeric', { required: true }),
        nodo('demanda', 'numeric', { required: true }),
        nodo('deficit', 'calculado', { required: true, operacion: 'resta', operandos: ['demanda', 'anio'] }),
      ]),
    ]);

    it('una fila está completa con lo obligatorio que aplica y al menos el mínimo de su lista interna', () => {
      const fila: Datos = { bien_servicio: 'Parques', unidad_medida: 'm²', analisis_anual: [{ anio: 2025, demanda: 0 }] };
      expect(filaCompleta(bienes.hijos, fila, contexto())).toBeTrue();

      expect(filaCompleta(bienes.hijos, { ...fila, unidad_medida: '  ' }, contexto())).toBeFalse();
      expect(filaCompleta(bienes.hijos, { ...fila, analisis_anual: [] }, contexto())).toBeFalse();
      expect(filaCompleta(bienes.hijos, { ...fila, analisis_anual: [{ anio: 2025 }] }, contexto())).toBeFalse();
      // «otra» solo se exige si la unidad es «Otra».
      expect(filaCompleta(bienes.hijos, { ...fila, unidad_medida: 'Otra' }, contexto())).toBeFalse();
    });

    it('resume cada campo como texto: números con separadores, catálogos por nombre y listas internas por cantidad', () => {
      const tipo = nodo('tipo', 'catalogo', { catalogo: 'procesos' });
      const fila: Datos = { cantidad: 12000, tipo: 'Implementación', analisis_anual: [{ id: 'a' }, { id: 'b' }] };
      expect(textoResumen(nodo('cantidad', 'numeric'), fila, null, contexto())).toBe('12.000');
      expect(textoResumen(tipo, fila, null, contexto())).toBe('Implementación');
      expect(textoResumen(bienes.hijos[3], fila, null, contexto())).toBe('2');
      expect(textoResumen(bienes.hijos[1], fila, null, contexto())).toBe('');
    });

    it('sin columnas configuradas resume con el primer campo de texto, número u opciones', () => {
      expect(campoResumenPorDefecto(bienes).dato.clave).toBe('bien_servicio');
      expect(campoResumenPorDefecto(nodo('vacia', 'repetible', {}, [nodo('archivo', 'documento')]))).toBeNull();
    });
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

  it('resuelve rutas a grupos anidados juntando las filas internas en orden', () => {
    const cadena = {
      productos_por_objetivo: [
        { id: 'ppo-1', productos: [{ id: 'p-1', actividades: [{ id: 'a-1' }, { id: 'a-2' }] }, { id: 'p-2' }] },
        { id: 'ppo-2', productos: [{ id: 'p-3', actividades: [{ id: 'a-3' }] }] },
      ],
    };
    const ctx = contexto({ relacionadas: { cadena_valor: cadena } });

    expect(filasDeRuta('cadena_valor.productos_por_objetivo', ctx).map((f) => f.id)).toEqual(['ppo-1', 'ppo-2']);
    expect(filasDeRuta('cadena_valor.productos_por_objetivo.productos.actividades', ctx).map((f) => f.id)).toEqual(['a-1', 'a-2', 'a-3']);
  });

  it('dibuja como casillas solo los grupos indicados cuyos campos son todos Sí/No', () => {
    const siNo = { options: [{ valor: 'Sí' }, { valor: 'No' }] };
    const factores = nodo('factores', undefined, {}, [nodo('orden_publico', 'select', siNo), nodo('topografia', 'select', siNo)]);
    const mixto = nodo('factores', undefined, {}, [nodo('orden_publico', 'select', siNo), nodo('detalle', 'input')]);
    const ctx = contexto({ gruposEnCasillas: ['factores'] });

    expect(esGrupoDeCasillas(factores, ctx)).toBe(true);
    expect(esGrupoDeCasillas(factores, contexto())).toBe(false);
    expect(esGrupoDeCasillas(mixto, ctx)).toBe(false);
  });

  it('deja en «No» las casillas sin marcar y conserva las marcadas', () => {
    const siNo = { options: [{ valor: 'Sí' }, { valor: 'No' }] };
    const definicion = [nodo('factores', undefined, {}, [nodo('orden_publico', 'select', siNo), nodo('topografia', 'select', siNo)])];

    const datos = prepararEstructura(definicion, { factores: { orden_publico: 'Sí' } }, contexto({ gruposEnCasillas: ['factores'] }));
    const sinCasillas = prepararEstructura(definicion, {}, contexto());

    expect(datos.factores).toEqual({ orden_publico: 'Sí', topografia: 'No' });
    expect(sinCasillas.factores).toEqual({});
  });

  it('resuelve las opciones de una referencia "origen.*" con la fila de origen', () => {
    const referencia = nodo('causa_indirecta', 'referencia', { opciones_desde: 'origen.causas_indirectas', mostrar: 'descripcion' });
    const filaOrigen = { id: 'cd-1', causas_indirectas: [{ id: 'ci-1', descripcion: 'Falta de mantenimiento' }, { id: 'ci-2' }] };

    const opciones = opcionesDeReferencia(referencia.dato, filaOrigen, contexto());

    expect(opciones.map((o) => o.id)).toEqual(['ci-1', 'ci-2']);
    expect(opciones[0].etiqueta).toBe('Falta de mantenimiento');
    expect(opciones[1].etiqueta).toContain('sin descripción');
  });

  it('con marcada_en, la única opción es la fila marcada en la casilla del otro submódulo', () => {
    const referencia = nodo('alternativa_seleccionada', 'referencia', {
      opciones_desde: 'alternativas.alternativas_solucion', mostrar: 'descripcion_alternativa', marcada_en: 'pasa_preparacion',
    });
    const relacionadas = { alternativas: { alternativas_solucion: [
      { id: 'as-1', descripcion_alternativa: 'Modernizar', pasa_preparacion: false },
      { id: 'as-2', descripcion_alternativa: 'Contratar en la nube', pasa_preparacion: true },
      { id: 'as-3', descripcion_alternativa: 'No hacer nada' },
    ] } };

    expect(opcionesDeReferencia(referencia.dato, null, contexto({ relacionadas })))
      .toEqual([{ id: 'as-2', etiqueta: 'Contratar en la nube' }]);
    expect(opcionesDeReferencia(referencia.dato, null, contexto())).toEqual([]);
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

  it('reparte en columnas una lista de textos con su lista interna', () => {
    const efectos = nodo('efectos_directos', 'repetible', {}, [
      nodo('descripcion', 'input'),
      nodo('linea_base', 'input'),
      nodo('efectos_indirectos', 'repetible', {}, [nodo('descripcion', 'input'), nodo('linea_base', 'input')]),
    ]);

    const estructura = estructuraDeTabla(efectos);

    expect(estructura.campos.map((c) => c.dato.clave)).toEqual(['descripcion', 'linea_base']);
    expect(estructura.interna.dato.clave).toBe('efectos_indirectos');
    expect(estructura.camposInternos.map((c) => c.dato.clave)).toEqual(['descripcion', 'linea_base']);
  });

  it('arma tabla con campos de texto, número, opciones y catálogo, y con espejos sin lista interna', () => {
    const actores = nodo('actores', 'repetible', {}, [
      nodo('actor', 'select'), nodo('entidad', 'input'), nodo('valor', 'numeric'), nodo('fase', 'catalogo', { catalogo: 'niveles_riesgo' }),
    ]);
    const espejo = nodo('actividades', 'repetible', { espejo_de: 'objetivos.objetivos_especificos' }, [nodo('descripcion', 'input')]);

    expect(estructuraDeTabla(actores).campos.map((c) => c.dato.clave)).toEqual(['actor', 'entidad', 'valor', 'fase']);
    expect(estructuraDeTabla(espejo).interna).toBeNull();
  });

  it('arma tabla con casillas y calculados numéricos, pero no con calculados de texto', () => {
    const alternativas = nodo('alternativas_solucion', 'repetible', {}, [
      nodo('descripcion_alternativa', 'input'), nodo('pasa_preparacion', 'casilla', { unica: true }),
    ]);
    const anual = nodo('analisis_anual', 'repetible', {}, [
      nodo('demanda', 'numeric'), nodo('oferta', 'numeric'),
      nodo('deficit', 'calculado', { operacion: 'resta', operandos: ['oferta', 'demanda'] }),
    ]);

    expect(estructuraDeTabla(alternativas).campos.map((c) => c.dato.clave)).toEqual(['descripcion_alternativa', 'pasa_preparacion']);
    expect(estructuraDeTabla(anual).campos.map((c) => c.dato.clave)).toEqual(['demanda', 'oferta', 'deficit']);
    expect(estructuraDeTabla(nodo('nombre', 'repetible', {}, [nodo('nombre', 'calculado', { plantilla: '{a}' })]))).toBeNull();
  });

  it('solo_si: el campo aplica si el hermano vale el valor o, si es una lista, lo incluye', () => {
    const otra = nodo('otra', 'input', { solo_si: { campo: 'seleccionadas', valor: 'Otra' } });

    expect(esVisible(otra, { seleccionadas: ['Macarena A', 'Otra'] })).toBe(true);
    expect(esVisible(otra, { seleccionadas: ['Macarena A'] })).toBe(false);
    expect(esVisible(otra, { seleccionadas: 'Otra' })).toBe(true);
    expect(esVisible(otra, {})).toBe(false);
    expect(esVisible(nodo('sin_condicion', 'input'), {})).toBe(true);
  });

  it('no arma tabla con catálogos de varias opciones (casillas) ni con campos que dependen de otro (solo_si)', () => {
    const lista = (campo: NodoDefinicion) => nodo('lista', 'repetible', {}, [nodo('descripcion', 'input'), campo]);

    expect(estructuraDeTabla(lista(nodo('sedes', 'catalogo', { catalogo: 'sedes', multiple: true })))).toBeNull();
    expect(estructuraDeTabla(lista(nodo('otra', 'input', { solo_si: { campo: 'descripcion', valor: 'x' } })))).toBeNull();
    expect(estructuraDeTabla(lista(nodo('sede', 'catalogo', { catalogo: 'sedes' })))).not.toBeNull();
  });

  it('calcula el déficit como oferta menos demanda, sin ruido de decimales, y nada si falta un valor', () => {
    const deficit = nodo('deficit', 'calculado', { operacion: 'resta', operandos: ['oferta', 'demanda'] }).dato;

    expect(calcularNumero(deficit, { oferta: 40, demanda: 60 })).toBe(-20);
    expect(calcularNumero(deficit, { oferta: 0.3, demanda: 0.1 })).toBe(0.2);
    expect(calcularNumero(deficit, { oferta: 40 })).toBeNull();
    expect(calcularNumero(deficit, { oferta: 40, demanda: '' })).toBeNull();
    expect(calcularNumero({ ...deficit, operacion: undefined }, { oferta: 40, demanda: 60 })).toBeNull();
  });

  it('suma los periodos con los vacíos en 0, y nada si están todos vacíos', () => {
    const costo = nodo('costo_total', 'calculado', { operacion: 'suma', operandos: ['periodo_0', 'periodo_1', 'periodo_2'] }).dato;

    expect(calcularNumero(costo, { periodo_0: 1000.5, periodo_2: 0.25 })).toBe(1000.75);
    expect(calcularNumero(costo, { periodo_1: 0 })).toBe(0);
    expect(calcularNumero(costo, {})).toBeNull();
  });

  it('multiplica la cantidad por el valor unitario, sin ruido de decimales, y nada si falta un valor', () => {
    const operandos = ['cantidad', 'valor_unitario'];
    const total = nodo('valor_total', 'calculado', { operacion: 'multiplicacion', operandos, decimales: 2 }).dato;

    expect(calcularNumero(total, { cantidad: 1.1, valor_unitario: 3 })).toBe(3.3);
    expect(calcularNumero(total, { cantidad: 0, valor_unitario: 500 })).toBe(0);
    expect(calcularNumero(total, { cantidad: 3 })).toBeNull();
  });

  it('marcar una casilla única desmarca la de las demás filas; desmarcar no toca las otras', () => {
    const dato = nodo('pasa_preparacion', 'casilla', { unica: true }).dato;
    const filas: Datos[] = [{ id: 'a1', pasa_preparacion: true }, { id: 'a2' }, { id: 'a3', pasa_preparacion: false }];

    marcarCasilla(filas, filas[1], dato, true);
    expect(filas.map((f) => f.pasa_preparacion)).toEqual([false, true, false]);

    marcarCasilla(filas, filas[1], dato, false);
    expect(filas.map((f) => f.pasa_preparacion)).toEqual([false, false, false]);

    const multiple = { ...dato, unica: false };
    marcarCasilla(filas, filas[0], multiple, true);
    marcarCasilla(filas, filas[2], multiple, true);
    expect(filas.map((f) => f.pasa_preparacion)).toEqual([true, false, true]);
  });

  it('no arma tabla con campos que no caben en una celda, espejos con lista interna o más de una lista interna', () => {
    const texto = nodo('descripcion', 'input');
    const interna = () => nodo('medios', 'repetible', {}, [nodo('descripcion', 'input')]);

    expect(estructuraDeTabla(nodo('medios', 'repetible', {}, [texto, nodo('causa', 'referencia')]))).toBeNull();
    expect(estructuraDeTabla(nodo('objetivos', 'repetible', { espejo_de: 'problematica.causas_directas' }, [texto, interna()]))).toBeNull();
    expect(estructuraDeTabla(nodo('objetivos', 'repetible', {}, [texto, interna(), interna()]))).toBeNull();
    expect(estructuraDeTabla(nodo('objetivos', 'repetible', {}, [texto]))).not.toBeNull();
  });

  it('muestra en tabla las listas sin lista interna y las jerárquicas solo si el submódulo las pide arriba', () => {
    const plana = nodo('actores', 'repetible', {}, [nodo('actor', 'select'), nodo('entidad', 'input')]);
    const jerarquica = nodo('efectos_directos', 'repetible', {}, [
      nodo('descripcion', 'input'),
      nodo('efectos_indirectos', 'repetible', {}, [nodo('descripcion', 'input')]),
    ]);
    const conLista = contexto({ listasEnTabla: ['efectos_directos'] });

    expect(seMuestraEnTabla(plana, contexto(), true)).toBe(true);
    expect(seMuestraEnTabla(plana, contexto(), false)).toBe(true);
    expect(seMuestraEnTabla(jerarquica, contexto(), true)).toBe(false);
    expect(seMuestraEnTabla(jerarquica, conLista, true)).toBe(true);
    expect(seMuestraEnTabla(jerarquica, conLista, false)).toBe(false);
  });

  it('lee un valor de otro submódulo o del actual', () => {
    const ctx = contexto({
      claveSubmodulo: 'cadena_valor',
      datosSubmodulo: { justificacion: 'Porque sí' },
      relacionadas: { objetivos: { objetivo_central: 'Fortalecer los componentes tecnológicos' } },
    });

    expect(valorDeRuta('objetivos.objetivo_central', ctx)).toBe('Fortalecer los componentes tecnológicos');
    expect(valorDeRuta('cadena_valor.justificacion', ctx)).toBe('Porque sí');
    expect(valorDeRuta('plurianual.total', ctx)).toBeUndefined();
  });

  it('formatea los números con separadores de Colombia', () => {
    expect(formatearNumero(19528962455)).toBe('19.528.962.455');
    expect(formatearNumero(1234.5)).toBe('1.234,5');
    expect(formatearNumero(19528962455, true)).toMatch(/^\$\s19\.528\.962\.455$/);
  });

  it('reconoce un submódulo de solo documentos (Anexos): fijos y una lista de nombre y archivo', () => {
    const documento = (clave: string) => nodo(clave, 'documento', { formatos: ['pdf'] });
    const otros = nodo('otros_anexos', 'repetible', { max: 5 }, [nodo('nombre', 'input'), documento('archivo')]);

    const anexos = estructuraDeDocumentos([documento('carta_presentacion'), documento('presupuesto'), otros]);
    expect(anexos.fijos.map((campo) => campo.dato.clave)).toEqual(['carta_presentacion', 'presupuesto']);
    expect(anexos.lista.nodo).toBe(otros);
    expect([anexos.lista.nombre.dato.clave, anexos.lista.archivo.dato.clave]).toEqual(['nombre', 'archivo']);
    expect(estructuraDeDocumentos([documento('carta_presentacion')])).toEqual({ fijos: [documento('carta_presentacion')], lista: null });
  });

  it('no dibuja como tabla de documentos un submódulo con otros campos o listas de otra forma', () => {
    const documento = (clave: string) => nodo(clave, 'documento');

    expect(estructuraDeDocumentos([])).toBeNull();
    expect(estructuraDeDocumentos([documento('carta'), nodo('observacion', 'input')])).toBeNull();
    const lista = (...campos: NodoDefinicion[]) => nodo('lista', 'repetible', {}, campos);
    expect(estructuraDeDocumentos([lista(nodo('nombre', 'input'), documento('archivo'), nodo('fecha', 'input'))])).toBeNull();
    expect(estructuraDeDocumentos([lista(nodo('nombre', 'input'), nodo('valor', 'numeric'))])).toBeNull();
    expect(estructuraDeDocumentos([documento('carta'), nodo('otra', 'documento', { solo_si: { campo: 'x', valor: 'Sí' } })])).toBeNull();
  });

  it('quita los ids de fila de una ruta para ubicar el campo en la plantilla', () => {
    expect(rutaEnPlantilla('carta_presentacion')).toBe('carta_presentacion');
    expect(rutaEnPlantilla('otros_anexos[oa-1].archivo')).toBe('otros_anexos.archivo');
    expect(rutaEnPlantilla('a[x-1].b[y-2].c')).toBe('a.b.c');
  });
});
