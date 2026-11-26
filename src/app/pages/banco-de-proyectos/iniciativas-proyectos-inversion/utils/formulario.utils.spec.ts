import { Datos, NodoDefinicion } from './iniciativa.models';
import {
  cabeOtraAgregada,
  cadenaDeCatalogos,
  calcular,
  calcularNumero,
  campoResumenPorDefecto,
  ContextoFormulario,
  filaCompleta,
  textoResumen,
  esEspejoTraido,
  esExigido,
  esFilaAgregada,
  esGrupoFijo,
  esTextoFijo,
  esVisible,
  estructuraDeDesglose,
  estructuraDeDocumentos,
  estructuraDeSubfilas,
  estructuraDeTabla,
  filasDeRuta,
  formatearNumero,
  indexarPorRuta,
  marcarCasilla,
  nuevaFilaAgregada,
  nuevoIdFila,
  numeroDeFila,
  numerosDeLista,
  opcionesDeReferencia,
  prefijoDeClave,
  prepararEstructura,
  rutaCampo,
  rutaEnPlantilla,
  rutaFila,
  seMuestraEnTabla,
  submodulosDeDefinicion,
  sincronizarEspejo,
  textoDeTraido,
  textoTraido,
  totalColumna,
  totalFila,
  valorTraido,
  valorTraidoEnEspejo,
} from './formulario.utils';

function nodo(clave: string, tipo?: any, extra: any = {}, hijos: NodoDefinicion[] = []): NodoDefinicion {
  return { id: clave, nombre: clave, descripcion: '', dato: { clave, type: tipo, required: false, ...extra }, hijos };
}

function contexto(parcial: Partial<ContextoFormulario> = {}): ContextoFormulario {
  return {
    claveSubmodulo: 'objetivos',
    datosSubmodulo: {},
    relacionadas: {},
    soloLectura: false,
    errores: {},
    listasEnTabla: [],
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

  it('arma un espejo de catálogo con una fila por elemento que manda el mid en relacionadas.catalogo', () => {
    const ctx = contexto({
      relacionadas: { catalogo: { resultados_esperados: [{ id: 'est', nombre: 'Estudiantes' }, { id: 'doc', nombre: 'Docentes' }] } },
    });
    const origen = filasDeRuta('catalogo.resultados_esperados', ctx);
    const actuales = [{ id: 're-1', origen: 'doc', cantidad: 12 }];

    const resultado = sincronizarEspejo(actuales, origen, 're');

    expect(resultado.map((fila) => fila.origen)).toEqual(['est', 'doc']);
    expect(resultado[1]).toBe(actuales[0]);
    expect(filasDeRuta('catalogo.sedes', ctx)).toEqual([]);
  });

  it('con filas_adicionales, el espejo conserva al final las filas que agregó el usuario', () => {
    const actuales = [
      { id: 'tp-9', origen: 'Otro', cual: 'Trazador de Paz' },
      { id: 'tp-1', origen: 'cul', descripcion: 'Talleres' },
    ];
    const origen = [{ id: 'cul' }, { id: 'juv' }];

    const resultado = sincronizarEspejo(actuales, origen, 'tp', { origen: 'Otro', max: 2 });

    expect(resultado.map((fila) => fila.origen)).toEqual(['cul', 'juv', 'Otro']);
    expect(resultado[2]).toBe(actuales[0]);
    expect(sincronizarEspejo(actuales, origen, 'tp').map((fila) => fila.origen)).toEqual(['cul', 'juv']);
  });

  it('reconoce las filas agregadas de un espejo y si cabe otra, con máximo (trazadores) o sin él (fuentes)', () => {
    const trazadores = nodo('trazadores', 'repetible', { espejo_de: 'catalogo.t', filas_adicionales: { origen: 'Otro', max: 2 } }, [nodo('cual', 'input')]);
    const fuentes = nodo('fuentes', 'repetible', { espejo_de: 'catalogo.f', filas_adicionales: { origen: 'Otra' } }, [nodo('cual', 'input')]);
    const filas = [{ id: 'a', origen: 'Otro' }, { id: 'b', origen: 'Otro' }, { id: 'c', origen: 'cul' }];
    const otras = ['x', 'y', 'z'].map((id) => ({ id, origen: 'Otra' }));

    expect(filas.map((fila) => esFilaAgregada(trazadores, fila))).toEqual([true, true, false]);
    expect(cabeOtraAgregada(trazadores, filas.slice(1))).toBeTrue();
    expect(cabeOtraAgregada(trazadores, filas)).toBeFalse();
    expect(cabeOtraAgregada(fuentes, otras)).toBeTrue();
    expect(cabeOtraAgregada(nodo('lista', 'repetible', {}, []), [])).toBeFalse();
    const nueva = nuevaFilaAgregada(fuentes, contexto());
    expect(nueva.origen).toBe('Otra');
    expect(nueva.id).toMatch(/^f-/);
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
      .toEqual([{ id: 'as-2', etiqueta: 'Contratar en la nube', detalle: '' }]);
    expect(opcionesDeReferencia(referencia.dato, null, contexto())).toEqual([]);
  });

  it('con mostrar_detalle, la opción trae también ese texto (nombre y descripción de la alternativa)', () => {
    const referencia = nodo('alternativa_seleccionada', 'referencia', {
      opciones_desde: 'alternativas.alternativas_solucion', mostrar: 'nombre_alternativa', mostrar_detalle: 'descripcion_alternativa',
      marcada_en: 'pasa_preparacion',
    });
    const relacionadas = { alternativas: { alternativas_solucion: [
      { id: 'as-1', nombre_alternativa: 'Nube', descripcion_alternativa: '  Migrar los servicios a la nube. ', pasa_preparacion: true },
    ] } };

    expect(opcionesDeReferencia(referencia.dato, null, contexto({ relacionadas })))
      .toEqual([{ id: 'as-1', etiqueta: 'Nube', detalle: 'Migrar los servicios a la nube.' }]);
  });

  it('calcula la vista previa del nombre en mayúsculas', () => {
    const hermanos = [
      nodo('proceso', 'catalogo', { catalogo: 'procesos' }),
      nodo('objeto', 'input'),
      nodo('localizacion', 'catalogo', { catalogo: 'localizaciones_proyecto' }),
      nodo('nombre_proyecto', 'calculado', { plantilla: '{proceso} {objeto} {localizacion}', transformar: 'mayusculas' }),
    ];
    const valores = { proceso: 'Implementación', objeto: ' de la política ', localizacion: 'Bogotá D.C.' };

    expect(calcular(hermanos[3], hermanos, valores, contexto())).toBe('IMPLEMENTACIÓN DE LA POLÍTICA BOGOTÁ D.C.');
  });

  it('reconoce el grupo de textos fijos (el Plan Nacional de Desarrollo), pero no uno con algo que calcular o elegir', () => {
    const sector = nodo('sector', 'calculado', { plantilla: '22 - EDUCACIÓN' });
    const programa = nodo('programa', 'calculado', { plantilla: '2202 - Calidad y fomento de la educación superior' });
    const nombre = nodo('nombre_proyecto', 'calculado', { plantilla: '{proceso} {objeto}' });

    expect(esTextoFijo(sector)).toBeTrue();
    expect(esTextoFijo(nombre)).toBeFalse();
    expect(esTextoFijo(nodo('deficit', 'calculado', { operacion: 'resta', operandos: ['oferta', 'demanda'] }))).toBeFalse();
    expect(esTextoFijo(nodo('objetivo', 'calculado', { desde: 'objetivos.objetivo_central' }))).toBeFalse();
    expect(esGrupoFijo(nodo('pnd', undefined, {}, [sector, programa]))).toBeTrue();
    expect(esGrupoFijo(nodo('pnd', undefined, {}, [sector, nodo('plan', 'catalogo', { catalogo: 'planes_pdd' })]))).toBeFalse();
    expect(esGrupoFijo(nodo('vacio', undefined, {}, []))).toBeFalse();
    expect(calcular(programa, [sector, programa], {}, contexto())).toBe('2202 - Calidad y fomento de la educación superior');
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

  it('arma tabla con campos de texto, número y catálogo, y con espejos sin lista interna', () => {
    const actores = nodo('actores', 'repetible', {}, [
      nodo('actor', 'catalogo', { catalogo: 'niveles_actor' }), nodo('entidad', 'input'), nodo('valor', 'numeric'), nodo('fase', 'catalogo', { catalogo: 'niveles_riesgo' }),
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

  it('solo_si con distinto: el campo aplica si el hermano no vale el valor', () => {
    const discriminado = nodo('discriminado', 'input', { solo_si: { campo: 'origen', valor: 'Grupos Étnicos', distinto: true } });

    expect(esVisible(discriminado, { origen: 'Juventud' })).toBe(true);
    expect(esVisible(discriminado, { origen: 'Grupos Étnicos' })).toBe(false);
  });

  it('reconoce un espejo con desglose: campos en celdas y una lista espejo que aplica solo a algunas filas', () => {
    const noEtnicos = { solo_si: { campo: 'origen', valor: 'etn', distinto: true } };
    const comunidades = nodo('grupos_etnicos', 'repetible', {
      espejo_de: 'catalogo.grupos_etnicos_trazador', solo_si: { campo: 'origen', valor: 'etn' },
    }, [nodo('numero_beneficiarios', 'numeric')]);
    const campos = [
      nodo('descripcion', 'input'),
      nodo('discriminado', 'input', noEtnicos),
      nodo('numero_beneficiarios', 'numeric', noEtnicos),
    ];
    // El «¿Cuál?» de los otros trazadores (filas agregadas) no tiene columna: va en la celda del trazador.
    const cual = nodo('cual', 'input', { solo_si: { campo: 'origen', valor: 'Otro' } });
    const trazadores = nodo('trazadores', 'repetible', { espejo_de: 'catalogo.trazadores_presupuestales' }, [cual, ...campos, comunidades]);

    const estructura = estructuraDeDesglose(trazadores);

    expect(estructura.campos.map((campo) => campo.dato.clave)).toEqual(['descripcion', 'discriminado', 'numero_beneficiarios']);
    expect(estructura.campoEnOrigen).toBe(cual);
    expect(estructura.desglose.dato.clave).toBe('grupos_etnicos');
    const sinCondicion = nodo('grupos_etnicos', 'repetible', { espejo_de: 'catalogo.grupos_etnicos_trazador' }, comunidades.hijos);
    expect(estructuraDeDesglose(nodo('trazadores', 'repetible', trazadores.dato, [...campos, sinCondicion]))).toBeNull();
    expect(estructuraDeDesglose(nodo('trazadores', 'repetible', {}, trazadores.hijos))).toBeNull();
  });

  it('con columna de código, el código de las filas agregadas va en esa columna y el «¿Cuál?» en la del nombre', () => {
    const otra = { solo_si: { campo: 'origen', valor: 'Otra' } };
    const codigo = nodo('codigo', 'input', otra);
    const cual = nodo('cual', 'input', otra);
    const fuentes = nodo('fuentes', 'repetible', {
      espejo_de: 'catalogo.fuentes_financiacion', filas_adicionales: { origen: 'Otra' }, columna_codigo: { nombre: 'Código', campo: 'codigo' },
    }, [codigo, cual, nodo('anio_0', 'numeric')]);

    const estructura = estructuraDeTabla(fuentes);

    expect(estructura.campos.map((campo) => campo.dato.clave)).toEqual(['anio_0']);
    expect(estructura.campoCodigo).toBe(codigo);
    expect(estructura.campoEnOrigen).toBe(cual);
  });

  it('la referencia cabe en una celda, salvo la de la fila marcada, la de varias opciones y la de la fila de origen', () => {
    const lista = (campo: NodoDefinicion) => nodo('impactos', 'repetible', {}, [nodo('descripcion', 'input'), campo]);

    expect(estructuraDeTabla(lista(nodo('objetivo_especifico', 'referencia', { opciones_desde: 'objetivos.objetivos_especificos' })))).not.toBeNull();
    expect(estructuraDeTabla(lista(nodo('alternativa', 'referencia', { opciones_desde: 'a.b', marcada_en: 'pasa' })))).toBeNull();
    expect(estructuraDeTabla(lista(nodo('varias', 'referencia', { opciones_desde: 'a.b', multiple: true })))).toBeNull();
    expect(estructuraDeTabla(lista(nodo('causa', 'referencia', { opciones_desde: 'origen.causas_indirectas' })))).toBeNull();
  });

  it('arma tabla con catálogos de varias opciones (casillas en la celda), pero no con campos que dependen de otro (solo_si)', () => {
    const lista = (campo: NodoDefinicion) => nodo('lista', 'repetible', {}, [nodo('descripcion', 'input'), campo]);

    expect(estructuraDeTabla(lista(nodo('sedes', 'catalogo', { catalogo: 'sedes', multiple: true })))).not.toBeNull();
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

    expect(estructuraDeTabla(nodo('medios', 'repetible', {}, [texto, nodo('soporte', 'documento')]))).toBeNull();
    expect(estructuraDeTabla(nodo('objetivos', 'repetible', { espejo_de: 'problematica.causas_directas' }, [texto, interna()]))).toBeNull();
    expect(estructuraDeTabla(nodo('objetivos', 'repetible', {}, [texto, interna(), interna()]))).toBeNull();
    expect(estructuraDeTabla(nodo('objetivos', 'repetible', {}, [texto]))).not.toBeNull();
  });

  it('muestra en tabla las listas sin lista interna y las jerárquicas solo si el submódulo las pide arriba', () => {
    const plana = nodo('actores', 'repetible', {}, [nodo('actor', 'catalogo', { catalogo: 'niveles_actor' }), nodo('entidad', 'input')]);
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

  it('lee un valor de otro submódulo, del actual o de la fila de origen', () => {
    const ctx = contexto({
      claveSubmodulo: 'cadena_valor',
      datosSubmodulo: { justificacion: 'Porque sí' },
      relacionadas: { objetivos: { objetivo_central: 'Fortalecer los componentes tecnológicos' } },
    });
    const origen = { id: 'a-1', periodo_0: 500000000 };

    expect(valorTraido('objetivos.objetivo_central', null, ctx)).toBe('Fortalecer los componentes tecnológicos');
    expect(valorTraido('cadena_valor.justificacion', null, ctx)).toBe('Porque sí');
    expect(valorTraido('riesgos.total', null, ctx)).toBeUndefined();
    expect(valorTraido('origen.periodo_0', origen, ctx)).toBe(500000000);
    expect(valorTraido('origen.periodo_0', null, ctx)).toBeUndefined();
    expect(textoTraido({ clave: 'anio_0', required: false, desde: 'origen.periodo_0' }, origen, ctx)).toBe('500.000.000');
    expect(textoTraido({ clave: 'anio_1', required: false, desde: 'origen.periodo_1' }, origen, ctx)).toBe('');
  });

  describe('Cronograma: actividades de la Cadena de valor', () => {
    const cadena = {
      productos_por_objetivo: [
        { id: 'ppo-1', productos: [
          { id: 'p-1', actividades: [{ id: 'a-1' }, { id: 'a-2' }] },
          { id: 'p-2', actividades: [{ id: 'a-3' }] },
        ] },
        { id: 'ppo-2', productos: [{ id: 'p-3', actividades: [{ id: 'a-4' }] }] },
      ],
    };

    it('numera las actividades n.m por objetivo específico, también a través de los productos', () => {
      const actividades = nodo('actividades', 'repetible', { numerar_por: 'productos_por_objetivo' }, [nodo('actividad', 'input')]);
      const ctx = contexto({ claveSubmodulo: 'cadena_valor', datosSubmodulo: cadena });

      const numeros = numerosDeLista(actividades, 'productos_por_objetivo[ppo-1].productos[p-2].actividades', ctx);

      expect(Array.from(numeros.entries())).toEqual([['a-1', '1.1'], ['a-2', '1.2'], ['a-3', '1.3'], ['a-4', '2.1']]);
      expect(numeroDeFila(actividades, { id: 'a-3' }, 0, numeros)).toBe('1.3');
      expect(numeroDeFila(actividades, { id: 'nueva' }, 4, numeros)).toBe('5');
    });

    it('el espejo muestra el número de su actividad de origen; sin numerar_por, la posición', () => {
      const espejo = nodo('actividades', 'repetible', {
        espejo_de: 'cadena_valor.productos_por_objetivo.productos.actividades',
        numerar_por: 'productos_por_objetivo',
      }, [nodo('fisica', undefined, {}, [nodo('anio_0', 'input')])]);
      const ctx = contexto({ claveSubmodulo: 'cronograma', relacionadas: { cadena_valor: cadena } });

      const numeros = numerosDeLista(espejo, 'actividades', ctx);

      expect(numeroDeFila(espejo, { id: 'cr-9', origen: 'a-4' }, 0, numeros)).toBe('2.1');
      const sinNumeracion = nodo('actividades', 'repetible', {}, [nodo('actividad', 'input')]);
      expect(numerosDeLista(sinNumeracion, 'actividades', ctx).size).toBe(0);
    });

    it('dibuja cada actividad en una subfila por grupo, con las columnas de todos los grupos', () => {
      const anio = (clave: string, extra: any) => nodo(clave, extra.desde ? 'calculado' : 'input', extra);
      const cronograma = nodo('actividades', 'repetible', { espejo_de: 'cadena_valor.productos_por_objetivo.productos.actividades' }, [
        nodo('programacion_fisica', undefined, {}, [anio('anio_0', { obligatorio_si: 'origen.periodo_0' }), anio('anio_1', {})]),
        nodo('programacion_financiera', undefined, {}, [
          anio('anio_0', { desde: 'origen.periodo_0' }),
          anio('anio_1', { desde: 'origen.periodo_1' }),
          anio('valor_total', { desde: 'origen.costo_total' }),
        ]),
      ]);

      const estructura = estructuraDeSubfilas(cronograma);

      expect(estructura.subfilas.map((grupo) => grupo.dato.clave)).toEqual(['programacion_fisica', 'programacion_financiera']);
      expect(estructura.columnas.map((columna) => columna.clave)).toEqual(['anio_0', 'anio_1', 'valor_total']);
      const espejo = { espejo_de: 'cadena_valor.productos_por_objetivo.productos.actividades' };
      const sinCelda = nodo('grupo', undefined, {}, [nodo('soporte', 'documento')]);
      expect(estructuraDeSubfilas(nodo('lista', 'repetible', espejo, [nodo('texto', 'input')]))).toBeNull();
      expect(estructuraDeSubfilas(nodo('lista', 'repetible', espejo, [sinCelda]))).toBeNull();
      // Solo espejos: la tabla de subfilas no agrega ni elimina filas.
      expect(estructuraDeSubfilas(nodo('lista', 'repetible', {}, cronograma.hijos))).toBeNull();
    });

    it('el Presupuesto inicial trae el producto de la fila que contiene cada actividad y los costos de la actividad', () => {
      const espejoDe = 'cadena_valor.productos_por_objetivo.productos.actividades';
      const conProducto = {
        productos_por_objetivo: [{ id: 'ppo-1', productos: [
          { id: 'p-1', producto: '2201001', actividades: [{ id: 'a-1', periodo_0: 500 }] },
          { id: 'p-2', producto: '2201002', actividades: [{ id: 'a-2' }] },
        ] }],
      };
      const ctx = contexto({
        claveSubmodulo: 'presupuesto_inicial',
        relacionadas: { cadena_valor: conProducto },
        nombreEnCatalogo: (catalogo, codigo) => (catalogo === 'productos' ? `Producto ${codigo}` : codigo),
      });
      const [a1, a2] = filasDeRuta(espejoDe, ctx);
      const producto = { clave: 'producto', required: false, desde: 'cadena_valor.productos_por_objetivo.productos.producto', catalogo: 'productos' };

      expect(valorTraidoEnEspejo(producto, espejoDe, a1, ctx)).toBe('2201001');
      expect(valorTraidoEnEspejo(producto, espejoDe, a2, ctx)).toBe('2201002');
      expect(valorTraidoEnEspejo({ clave: 'anio_0', required: false, desde: 'origen.periodo_0' }, espejoDe, a1, ctx)).toBe(500);
      expect(textoDeTraido(producto, '2201002', ctx)).toBe('Producto 2201002');
      expect(textoDeTraido(producto, undefined, ctx)).toBe('');
    });

    it('reconoce un espejo de solo lectura: todos sus campos se traen', () => {
      const espejo = { espejo_de: 'cadena_valor.productos_por_objetivo.productos.actividades' };
      const traido = (clave: string) => nodo(clave, 'calculado', { desde: `origen.${clave}` });

      expect(esEspejoTraido(nodo('actividades', 'repetible', espejo, [traido('actividad'), traido('costo_total')]))).toBeTrue();
      expect(esEspejoTraido(nodo('actividades', 'repetible', espejo, [traido('actividad'), nodo('meses', 'input')]))).toBeFalse();
      expect(esEspejoTraido(nodo('actividades', 'repetible', {}, [traido('actividad')]))).toBeFalse();
    });

    it('con obligatorio_si, el año se exige solo si la actividad tiene costo en ese periodo', () => {
      const anio0 = { clave: 'anio_0', required: false, obligatorio_si: 'origen.periodo_0' };
      expect(esExigido(anio0, { periodo_0: 500 })).toBeTrue();
      expect(esExigido(anio0, { periodo_0: 0 })).toBeFalse();
      expect(esExigido(anio0, {})).toBeFalse();
      expect(esExigido({ clave: 'texto', required: true }, null)).toBeTrue();
    });
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

  describe('catálogos encadenados (Articulación)', () => {
    const catalogo = (clave: string, extra: any = {}) => nodo(clave, 'catalogo', { catalogo: `${clave}s`, ...extra });

    it('ordena los campos siguiendo depende_de, desde el que no depende de ninguno; los de abajo pueden ser múltiples', () => {
      const plan = catalogo('plan');
      const objetivo = catalogo('objetivo', { depende_de: 'plan', multiple: true });
      const estrategia = catalogo('estrategia', { depende_de: 'objetivo', multiple: true });
      expect(cadenaDeCatalogos([estrategia, plan, objetivo])).toEqual([plan, objetivo, estrategia]);
    });

    it('no arma la cadena si un campo no es catálogo, tiene solo_si, se ramifica o el primero es múltiple', () => {
      const plan = catalogo('plan');
      expect(cadenaDeCatalogos([plan])).toBeNull();
      expect(cadenaDeCatalogos([plan, nodo('nota', 'input', { depende_de: 'plan' })])).toBeNull();
      expect(cadenaDeCatalogos([catalogo('planes', { multiple: true }), catalogo('objetivo', { depende_de: 'planes' })])).toBeNull();
      expect(cadenaDeCatalogos([plan, catalogo('otro', { depende_de: 'plan', solo_si: { campo: 'plan', valor: 'x' } })])).toBeNull();
      expect(cadenaDeCatalogos([plan, catalogo('a', { depende_de: 'plan' }), catalogo('b', { depende_de: 'plan' })])).toBeNull();
      expect(cadenaDeCatalogos([plan, catalogo('suelto')])).toBeNull();
    });
  });
});
