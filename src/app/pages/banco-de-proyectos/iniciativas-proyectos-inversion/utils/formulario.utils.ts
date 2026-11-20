import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Observable } from 'rxjs';
import {
  ColumnaResumen,
  Datos,
  DatoCampo,
  Definicion,
  ErrorCampo,
  FilasAdicionales,
  NodoDefinicion,
  ReferenciaDocumento,
  ResumenIniciativa,
  ResumenSubmodulo,
} from './iniciativa.models';
import { VALOR_CASILLA_MARCADA } from './constantes';

/**
 * Funciones puras del formulario dinámico. Repiten las reglas de forma del mid
 * (rutas, espejos, referencias, calculados) para armar la vista; la validación
 * definitiva siempre la hace el servidor.
 */

export const PREFIJO_ORIGEN = 'origen.';

/** Contexto que comparten todos los niveles del formulario de un submódulo. */
export interface ContextoFormulario {
  claveSubmodulo: string;
  datosSubmodulo: Datos;
  relacionadas: { [submodulo: string]: Datos };
  soloLectura: boolean;
  errores: { [ruta: string]: string[] };
  /** Claves de las listas del nivel superior que se dibujan como tabla jerárquica (LISTAS_EN_TABLA). */
  listasEnTabla: string[];
  /** Grupos cuyos campos van en columnas (GRUPOS_EN_COLUMNAS). */
  gruposEnColumnas?: string[];
  /** Grupos de catálogos encadenados que se eligen en un árbol (GRUPOS_EN_ARBOL). */
  gruposEnArbol?: string[];
  /** Las secciones del nivel superior se pliegan y solo una queda abierta (SUBMODULOS_PLEGABLES). */
  seccionesPlegables?: boolean;
  /** Ícono de cada sección plegable, por clave (ICONOS_SECCIONES). */
  iconosSecciones?: { [seccion: string]: string };
  /** Columnas de la tabla resumen de las listas que se editan debajo de la tabla (COLUMNAS_RESUMEN). */
  columnasResumen?: { [lista: string]: ColumnaResumen[] };
  /** Devuelve el nombre de un elemento de catálogo ya cargado (o el código). */
  nombreEnCatalogo: (catalogo: string, codigo: string) => string;
  /**
   * Sube el archivo de un campo documento (ruta en la plantilla, sin ids de fila) y devuelve la
   * referencia, que queda en los datos y se guarda con el Guardar del submódulo.
   */
  subirDocumento?: (clave: string, archivo: File) => Observable<ReferenciaDocumento>;
}

export type ClaseNodo =
  | 'grupo'
  | 'repetible'
  | 'input'
  | 'numeric'
  | 'catalogo'
  | 'calculado'
  | 'referencia'
  | 'matriz'
  | 'casilla'
  | 'documento';

/** Cómo se dibuja un nodo: grupo (sin tipo) o el tipo del campo. */
export function claseDe(nodo: NodoDefinicion): ClaseNodo {
  return nodo.dato.type || 'grupo';
}

// ---------------------------------------------------------------------------
// Rutas (mismo formato que el mid: "a.b", "grupo[id].campo")
// ---------------------------------------------------------------------------

export function rutaCampo(base: string, clave: string): string {
  return base ? `${base}.${clave}` : clave;
}

export function rutaFila(rutaGrupo: string, id: string): string {
  return `${rutaGrupo}[${id}]`;
}

/** Ruta de un campo en la plantilla, sin los ids de fila: "otros_anexos[oa-1].archivo" -> "otros_anexos.archivo". */
export function rutaEnPlantilla(ruta: string): string {
  return (ruta || '').replace(/\[[^\]]*\]/g, '');
}

/** Agrupa los errores por ruta. */
export function indexarPorRuta(errores: ErrorCampo[]): { [ruta: string]: string[] } {
  const indice: { [ruta: string]: string[] } = {};
  for (const error of errores || []) {
    const ruta = error.ruta || '';
    (indice[ruta] = indice[ruta] || []).push(error.mensaje);
  }
  return indice;
}

// ---------------------------------------------------------------------------
// Filas
// ---------------------------------------------------------------------------

let contadorIds = 0;

/** Id estable para una fila nueva. Los espejos y referencias dependen de él. */
export function nuevoIdFila(prefijo = 'f'): string {
  contadorIds = (contadorIds + 1) % 1296;
  return `${prefijo}-${Date.now().toString(36)}${contadorIds.toString(36).padStart(2, '0')}`;
}

/** Prefijo legible para los ids de un grupo: "causas_directas" -> "cd". */
export function prefijoDeClave(clave: string): string {
  return clave
    .split('_')
    .filter((parte) => parte.length > 0)
    .map((parte) => parte[0])
    .join('')
    .slice(0, 4) || 'f';
}

export function filasDe(valor: any): Datos[] {
  return Array.isArray(valor) ? valor.filter((fila) => fila && typeof fila === 'object') : [];
}

/** Datos del submódulo actual o de uno relacionado. */
function datosDeSubmodulo(submodulo: string, contexto: ContextoFormulario): Datos | undefined {
  return submodulo === contexto.claveSubmodulo ? contexto.datosSubmodulo : contexto.relacionadas[submodulo];
}

/** Baja por los grupos anidados: las filas de claves[0] de cada fila, luego las de claves[1] de esas… */
function filasAnidadas(filas: Datos[], claves: string[]): Datos[] {
  return claves.reduce(
    (actuales, clave) => actuales.reduce((internas, fila) => internas.concat(filasDe(fila && fila[clave])), [] as Datos[]),
    filas,
  );
}

/**
 * Filas de "<submodulo>.<grupo>" en los datos del submódulo actual o de los relacionados.
 * La ruta puede seguir por grupos anidados ("<submodulo>.<grupo>.<subgrupo>"): entonces
 * devuelve, en orden, las filas de <subgrupo> de todas las filas de <grupo>.
 */
export function filasDeRuta(ruta: string, contexto: ContextoFormulario): Datos[] {
  const [submodulo, ...grupos] = (ruta || '').split('.');
  return grupos.length ? filasAnidadas([datosDeSubmodulo(submodulo, contexto) || {}], grupos) : [];
}

/**
 * Números de las filas de una lista con numerar_por, por id: n.m, con n la fila del grupo numerar_por
 * que la contiene y m su consecutivo dentro de ella (en Cadena de valor, 1.3 es la tercera actividad
 * del objetivo específico 1, aunque esté en otro producto). La lista se lee de `ruta` (la de un espejo
 * es su espejo_de: las claves son entonces los ids de origen). Vacío si la lista no tiene numerar_por.
 */
export function numerosDeLista(nodo: NodoDefinicion, ruta: string, contexto: ContextoFormulario): Map<string, string> {
  const numeros = new Map<string, string>();
  const numerarPor = nodo.dato.numerar_por;
  if (!numerarPor) {
    return numeros;
  }
  const [submodulo, ...grupos] = (nodo.dato.espejo_de || rutaCampo(contexto.claveSubmodulo, rutaEnPlantilla(ruta))).split('.');
  const nivel = grupos.indexOf(numerarPor);
  if (nivel < 0) {
    return numeros;
  }
  const contenedoras = filasAnidadas([datosDeSubmodulo(submodulo, contexto) || {}], grupos.slice(0, nivel + 1));
  contenedoras.forEach((contenedora, posicion) =>
    filasAnidadas([contenedora], grupos.slice(nivel + 1)).forEach((fila, consecutivo) =>
      numeros.set(fila.id, `${posicion + 1}.${consecutivo + 1}`),
    ),
  );
  return numeros;
}

/** Número de una fila: el de numerosDeLista (por su origen, si es espejo) o, si no tiene, su posición. */
export function numeroDeFila(nodo: NodoDefinicion, fila: Datos, posicion: number, numeros: Map<string, string>): string {
  return numeros.get(nodo.dato.espejo_de ? fila.origen : fila.id) || String(posicion + 1);
}

/**
 * Deja una fila de espejo por cada fila de origen, en el mismo orden: conserva
 * las existentes, crea las que faltan y descarta las de elementos que ya no existen.
 * Con filas_adicionales, al final quedan las que agregó el usuario (las de su origen).
 */
export function sincronizarEspejo(actuales: Datos[], origen: Datos[], prefijo: string, adicionales?: FilasAdicionales): Datos[] {
  const porOrigen = new Map<string, Datos>();
  for (const fila of actuales) {
    if (fila.origen && !porOrigen.has(fila.origen)) {
      porOrigen.set(fila.origen, fila);
    }
  }
  const agregadas = adicionales ? actuales.filter((fila) => fila.origen === adicionales.origen) : [];
  return origen
    .filter((filaOrigen) => filaOrigen.id)
    .map((filaOrigen) => porOrigen.get(filaOrigen.id) || { id: nuevoIdFila(prefijo), origen: filaOrigen.id })
    .concat(agregadas);
}

/** Si la fila la agregó el usuario en un espejo con filas_adicionales (p. ej. un «Otro: ¿Cuál?»). */
export function esFilaAgregada(nodo: NodoDefinicion, fila: Datos): boolean {
  const adicionales = nodo.dato.filas_adicionales;
  return !!adicionales && !!fila && fila.origen === adicionales.origen;
}

/** Si se puede agregar otra fila de filas_adicionales: sin max, siempre. */
export function cabeOtraAgregada(nodo: NodoDefinicion, filas: Datos[]): boolean {
  const adicionales = nodo.dato.filas_adicionales;
  if (!adicionales) {
    return false;
  }
  return !adicionales.max || (filas || []).filter((fila) => esFilaAgregada(nodo, fila)).length < adicionales.max;
}

/** Fila nueva de filas_adicionales, con el origen que la distingue y su estructura lista. */
export function nuevaFilaAgregada(nodo: NodoDefinicion, contexto: ContextoFormulario): Datos {
  const fila = { id: nuevoIdFila(prefijoDeClave(nodo.dato.clave)), origen: nodo.dato.filas_adicionales.origen };
  return prepararEstructura(nodo.hijos, fila, contexto);
}

export interface OpcionReferencia {
  id: string;
  etiqueta: string;
  /** Texto del campo mostrar_detalle de la fila, si la referencia lo pide; vacío si no. */
  detalle?: string;
}

/**
 * Opciones de un campo referencia: filas de "origen.<grupo>" o de "<submodulo>.<grupo>". Con
 * marcada_en, solo las que tienen marcada esa casilla (igual que el mid).
 */
export function opcionesDeReferencia(dato: DatoCampo, filaOrigen: Datos | null, contexto: ContextoFormulario): OpcionReferencia[] {
  const desde = dato.opciones_desde || '';
  const filas = desde.startsWith(PREFIJO_ORIGEN)
    ? filasDe(filaOrigen && filaOrigen[desde.slice(PREFIJO_ORIGEN.length)])
    : filasDeRuta(desde, contexto);
  return filas
    .map((fila, posicion) => ({ fila, posicion }))
    .filter(({ fila }) => fila.id && (!dato.marcada_en || fila[dato.marcada_en] === true))
    .map(({ fila, posicion }) => ({
      id: fila.id,
      etiqueta: textoDeFila(fila, dato.mostrar, posicion),
      detalle: dato.mostrar_detalle ? String(fila[dato.mostrar_detalle] || '').trim() : '',
    }));
}

export function textoDeFila(fila: Datos, campo: string | undefined, posicion: number): string {
  const texto = campo ? String(fila[campo] || '').trim() : '';
  return texto || `Elemento ${posicion + 1} (sin descripción)`;
}

/** Cómo se reparte una lista en una tabla: una columna por campo. */
export interface EstructuraTabla {
  /** Campos del primer nivel, en orden de columna. */
  campos: NodoDefinicion[];
  /** Lista interna (segundo nivel) o null si no tiene. */
  interna: NodoDefinicion | null;
  /** Campos de la lista interna, en las mismas columnas. */
  camposInternos: NodoDefinicion[];
  /**
   * En un espejo, el campo que solo aplica a una fila de origen (solo_si sobre "origen"): no tiene
   * columna, se escribe en la celda del elemento de origen de esa fila (p. ej. el «¿Cuál?» de «Otro»).
   */
  campoEnOrigen?: NodoDefinicion | null;
  /**
   * En un espejo con columna_codigo.campo: el campo en el que las filas agregadas escriben su código
   * (solo_si sobre su origen). No tiene columna propia: va en la columna del código.
   */
  campoCodigo?: NodoDefinicion | null;
}

/** En solo_si de un campo de un espejo: la fila de origen (su id o, en un espejo de catálogo, su código). */
export const CAMPO_ORIGEN = 'origen';

/**
 * Tipos de campo que se editan dentro de una celda de tabla (además del calculado numérico, que solo
 * se muestra). La referencia, como lista de selección (p. ej. el objetivo específico de un impacto),
 * y el catálogo multiple, como lista con casillas; cabeEnCelda deja fuera algunas referencias.
 */
const TIPOS_EN_CELDA: ClaseNodo[] = ['input', 'numeric', 'catalogo', 'casilla', 'referencia'];

/**
 * Estructura de tabla de una lista, o null si no cabe en una: solo campos que se editan en una
 * celda (texto, número, catálogo, casilla, referencia o calculado numérico) y, como mucho, una lista
 * interna con campos de ese tipo. Un espejo cabe solo si no tiene lista interna; la interna no puede ser espejo.
 */
export function estructuraDeTabla(nodo: NodoDefinicion): EstructuraTabla | null {
  const hijos = nodo.hijos || [];
  const campos = hijos.filter(cabeEnCelda);
  const internas = hijos.filter((hijo) => claseDe(hijo) === 'repetible');
  const interna = internas[0] || null;
  const hijosInternos = interna ? interna.hijos || [] : [];
  const camposInternos = hijosInternos.filter(cabeEnCelda);
  const enOrigen = nodo.dato.espejo_de
    ? hijos.filter((hijo) => hijo.dato.solo_si && hijo.dato.solo_si.campo === CAMPO_ORIGEN && claseDe(hijo) === 'input')
    : [];
  const claveCodigo = nodo.dato.columna_codigo && nodo.dato.columna_codigo.campo;
  const campoCodigo = (claveCodigo && enOrigen.find((hijo) => hijo.dato.clave === claveCodigo)) || null;
  const enNombre = enOrigen.filter((hijo) => hijo !== campoCodigo);
  const campoEnOrigen = enNombre.length === 1 ? enNombre[0] : null;
  const valida =
    claseDe(nodo) === 'repetible' &&
    !(nodo.dato.espejo_de && interna) &&
    campos.length > 0 &&
    internas.length <= 1 &&
    campos.length + internas.length + (campoEnOrigen ? 1 : 0) + (campoCodigo ? 1 : 0) === hijos.length &&
    (!interna || (!interna.dato.espejo_de && camposInternos.length > 0 && camposInternos.length === hijosInternos.length));
  return valida ? { campos, interna, camposInternos, campoEnOrigen, campoCodigo } : null;
}

/**
 * Si una lista se dibuja como tabla. Las que caben en una tabla sin lista interna van siempre
 * en tabla, en cualquier nivel. Las que tienen lista interna (tabla jerárquica) solo cuando el
 * submódulo lo pide en LISTAS_EN_TABLA y están en el nivel superior; si no, van en recuadros.
 */
export function seMuestraEnTabla(nodo: NodoDefinicion, contexto: ContextoFormulario, enNivelSuperior: boolean): boolean {
  const estructura = estructuraDeTabla(nodo);
  return !!estructura && (!estructura.interna || (enNivelSuperior && contexto.listasEnTabla.includes(nodo.dato.clave)));
}

/**
 * No caben en una celda la referencia multiple, la referencia a la fila marcada (se muestra traída),
 * la de "origen.*" (sus opciones salen de la fila de origen, que la tabla no tiene) ni los campos con
 * solo_si: la lista va en recuadros. El catálogo multiple sí: la celda lo despliega con casillas
 * (p. ej. las sedes de un resultado esperado).
 */
function cabeEnCelda(nodo: NodoDefinicion): boolean {
  const referencia = claseDe(nodo) === 'referencia';
  const referenciaQueNoCabe =
    referencia && (!!nodo.dato.multiple || !!nodo.dato.marcada_en || (nodo.dato.opciones_desde || '').startsWith(PREFIJO_ORIGEN));
  const enCelda = TIPOS_EN_CELDA.includes(claseDe(nodo)) && !referenciaQueNoCabe;
  return (enCelda || esCalculoNumerico(nodo) || esCalculoTraido(nodo)) && !nodo.dato.solo_si;
}

/** Columna de una tabla de subfilas: los campos con esa clave en las subfilas que la tienen. */
export interface ColumnaSubfilas {
  clave: string;
  /** Nombre del primer campo con esa clave (p. ej. «Año 0»). */
  nombre: string;
  /** Descripciones de los campos de la columna, para la ayuda del encabezado. */
  ayuda: string;
}

/** Espejo cuyas filas se dibujan en varias subfilas, una por grupo, con las columnas de todas. */
export interface EstructuraSubfilas {
  subfilas: NodoDefinicion[];
  columnas: ColumnaSubfilas[];
}

/**
 * Estructura de un espejo cuyos hijos son todos grupos con campos que caben en una celda, o null
 * si no lo es. Cada fila se dibuja en una subfila por grupo, y las columnas son las claves de los
 * campos en orden de aparición: en el Cronograma, la programación física (Año 0 a 4) y la financiera
 * (Año 0 a 4 y el valor total) de cada actividad. La subfila que no tiene una columna dice N/A.
 */
export function estructuraDeSubfilas(nodo: NodoDefinicion): EstructuraSubfilas | null {
  const subfilas = nodo.hijos || [];
  const grupoEnCeldas = (grupo: NodoDefinicion) =>
    claseDe(grupo) === 'grupo' && !grupo.dato.solo_si && (grupo.hijos || []).length > 0 && grupo.hijos.every(cabeEnCelda);
  const valida = claseDe(nodo) === 'repetible' && !!nodo.dato.espejo_de && subfilas.length > 0 && subfilas.every(grupoEnCeldas);
  if (!valida) {
    return null;
  }
  const campos = subfilas.reduce((todos, grupo) => todos.concat(grupo.hijos), [] as NodoDefinicion[]);
  const claves = Array.from(new Set(campos.map((campo) => campo.dato.clave)));
  const columnas = claves.map((clave) => {
    const deLaColumna = campos.filter((campo) => campo.dato.clave === clave);
    const ayudas = deLaColumna.map((campo) => campo.descripcion).filter((descripcion) => !!descripcion);
    return { clave, nombre: deLaColumna[0].nombre, ayuda: Array.from(new Set(ayudas)).join(' / ') };
  });
  return { subfilas, columnas };
}

/**
 * Si el campo aplica con los valores de su nivel: sin solo_si, siempre; con solo_si, si el hermano
 * vale el valor o, si es una lista (catálogo multiple), lo incluye; con distinto, si no. Igual que
 * el mid, que no exige ni guarda lo que no aplica.
 */
export function esVisible(nodo: NodoDefinicion, hermanos: Datos): boolean {
  const condicion = nodo.dato.solo_si;
  if (!condicion) {
    return true;
  }
  const valor = hermanos && hermanos[condicion.campo];
  const coincide = Array.isArray(valor) ? valor.includes(condicion.valor) : valor === condicion.valor;
  return coincide !== !!condicion.distinto;
}

/** Espejo con desglose: sus campos en columnas y una lista interna (espejo) que aplica solo a algunas filas. */
export interface EstructuraDesglose {
  campos: NodoDefinicion[];
  desglose: NodoDefinicion;
  /**
   * Campo de texto que solo aplica a un origen (solo_si sobre "origen", sin distinto): no tiene
   * columna, se escribe en la celda del elemento (el «¿Cuál?» de los otros trazadores presupuestales).
   */
  campoEnOrigen: NodoDefinicion | null;
}

/**
 * Estructura de un espejo con desglose, o null si no lo es: sus campos caben en una celda (pueden
 * tener solo_si) y tiene una sola lista interna, espejo, con solo_si y con campos que caben en una
 * celda. En las filas a las que aplica el desglose, las columnas de los campos que no aplican se
 * parten en una subfila por elemento del desglose: la primera muestra el elemento y las demás el
 * campo del desglose con la misma clave. En Trazadores presupuestales, Grupos Étnicos lleva una
 * subfila por comunidad (Discriminado = la comunidad, con su número de beneficiarios).
 */
export function estructuraDeDesglose(nodo: NodoDefinicion): EstructuraDesglose | null {
  const hijos = nodo.hijos || [];
  const listas = hijos.filter((hijo) => claseDe(hijo) === 'repetible');
  const enOrigen = hijos.filter(
    (hijo) => claseDe(hijo) === 'input' && hijo.dato.solo_si && hijo.dato.solo_si.campo === CAMPO_ORIGEN && !hijo.dato.solo_si.distinto,
  );
  const campoEnOrigen = enOrigen.length === 1 ? enOrigen[0] : null;
  const campos = hijos.filter((hijo) => claseDe(hijo) !== 'repetible' && hijo !== campoEnOrigen);
  const desglose = listas[0];
  const enCelda = (campo: NodoDefinicion) => cabeEnCelda({ ...campo, dato: { ...campo.dato, solo_si: undefined } });
  const valida =
    claseDe(nodo) === 'repetible' &&
    !!nodo.dato.espejo_de &&
    listas.length === 1 &&
    campos.length > 0 &&
    campos.every(enCelda) &&
    !!desglose.dato.espejo_de &&
    !!desglose.dato.solo_si &&
    (desglose.hijos || []).length > 0 &&
    desglose.hijos.every(cabeEnCelda);
  return valida ? { campos, desglose, campoEnOrigen } : null;
}

/** Calculado con operación (p. ej. el déficit): su valor es un número. */
export function esCalculoNumerico(nodo: NodoDefinicion): boolean {
  return claseDe(nodo) === 'calculado' && !!nodo.dato.operacion;
}

/** Calculado que solo muestra un valor de otro submódulo o de la fila de origen (desde). */
export function esCalculoTraido(nodo: NodoDefinicion): boolean {
  return claseDe(nodo) === 'calculado' && !!nodo.dato.desde;
}

/**
 * Si el campo se exige: required o, con obligatorio_si "origen.<campo>", si ese campo de la fila de
 * origen tiene valor (un número distinto de 0, un texto…), igual que el mid.
 */
export function esExigido(dato: DatoCampo, filaOrigen: Datos | null): boolean {
  if (!dato.obligatorio_si) {
    // La plantilla trae required como texto ("true"/"false") o booleano.
    return coerceBooleanProperty(dato.required);
  }
  const valor = valorTraido(dato.obligatorio_si, filaOrigen, null);
  return typeof valor === 'number' ? isFinite(valor) && valor !== 0 : tieneValor(valor);
}

/** Campo cuyo valor es un número: se escribe o se calcula. */
export function esCampoNumerico(nodo: NodoDefinicion): boolean {
  return claseDe(nodo) === 'numeric' || esCalculoNumerico(nodo);
}

/**
 * Marca o desmarca una casilla de una fila. Si es única en su lista, marcarla desmarca la de las
 * demás filas (p. ej. solo una alternativa pasa al módulo de Preparación).
 */
export function marcarCasilla(filas: Datos[], fila: Datos, dato: DatoCampo, marcada: boolean): void {
  if (marcada && dato.unica) {
    for (const otra of filas || []) {
      if (otra !== fila && otra[dato.clave] === true) {
        otra[dato.clave] = false;
      }
    }
  }
  fila[dato.clave] = marcada;
}

// ---------------------------------------------------------------------------
// Submódulo de documentos (Anexos): una sola tabla
// ---------------------------------------------------------------------------

/** Lista de documentos adicionales: cada fila con su nombre (texto) y su archivo (documento). */
export interface ListaDocumentos {
  nodo: NodoDefinicion;
  nombre: NodoDefinicion;
  archivo: NodoDefinicion;
}

/** Submódulo que solo tiene documentos: los fijos y, como mucho, una lista de adicionales. */
export interface EstructuraDocumentos {
  fijos: NodoDefinicion[];
  lista: ListaDocumentos | null;
}

/**
 * Estructura del submódulo si se dibuja como una sola tabla de documentos (p. ej. Anexos: la carta,
 * el presupuesto y los otros anexos), o null si no: todos sus campos son documentos, salvo como mucho
 * una lista (no espejo) cuyas filas tienen exactamente un texto (el nombre) y un documento (el archivo).
 * Sin solo_si, que la tabla no maneja.
 */
export function estructuraDeDocumentos(nodos: NodoDefinicion[]): EstructuraDocumentos | null {
  const campos = nodos || [];
  const fijos = campos.filter((nodo) => claseDe(nodo) === 'documento');
  const listas = campos.filter((nodo) => claseDe(nodo) === 'repetible');
  if (!campos.length || fijos.length + listas.length !== campos.length || listas.length > 1 || campos.some((nodo) => nodo.dato.solo_si)) {
    return null;
  }
  if (!listas.length) {
    return { fijos, lista: null };
  }
  const hijos = listas[0].hijos || [];
  const nombre = hijos.find((hijo) => claseDe(hijo) === 'input' && !hijo.dato.solo_si);
  const archivo = hijos.find((hijo) => claseDe(hijo) === 'documento' && !hijo.dato.solo_si);
  if (hijos.length !== 2 || !nombre || !archivo || listas[0].dato.espejo_de) {
    return null;
  }
  return { fijos, lista: { nodo: listas[0], nombre, archivo } };
}

// ---------------------------------------------------------------------------
// Grupo de catálogos encadenados que se elige en un árbol (Articulación)
// ---------------------------------------------------------------------------

/**
 * Campos de catálogo encadenados por depende_de (p. ej. plan → objetivo → estrategia → programa),
 * en el orden de la cadena: el primero (de una opción) no depende de ningún otro y cada uno depende
 * del anterior; los de abajo pueden ser multiple. Null si los nodos no son todos catálogos sin
 * solo_si encadenados así.
 */
export function cadenaDeCatalogos(nodos: NodoDefinicion[]): NodoDefinicion[] | null {
  const campos = nodos || [];
  if (campos.length < 2 || campos.some((nodo) => claseDe(nodo) !== 'catalogo' || nodo.dato.solo_si)) {
    return null;
  }
  const raices = campos.filter((nodo) => !nodo.dato.depende_de);
  if (raices.length !== 1 || raices[0].dato.multiple) {
    return null;
  }
  const cadena = [raices[0]];
  while (cadena.length < campos.length) {
    const anterior = cadena[cadena.length - 1].dato.clave;
    const siguientes = campos.filter((nodo) => nodo.dato.depende_de === anterior);
    if (siguientes.length !== 1) {
      return null;
    }
    cadena.push(siguientes[0]);
  }
  return cadena;
}

// ---------------------------------------------------------------------------
// Tabla resumen de las listas que se editan debajo de la tabla (grupo repetible)
// ---------------------------------------------------------------------------

/** Tipos de campo que el resumen muestra por defecto cuando la lista no tiene COLUMNAS_RESUMEN. */
const TIPOS_RESUMEN_POR_DEFECTO: ClaseNodo[] = ['input', 'numeric', 'catalogo'];

/** Campo que resume una fila cuando la lista no tiene columnas configuradas: el primero de texto, número o catálogo. */
export function campoResumenPorDefecto(nodo: NodoDefinicion): NodoDefinicion | null {
  return (nodo.hijos || []).find((hijo) => TIPOS_RESUMEN_POR_DEFECTO.includes(claseDe(hijo)) && !hijo.dato.solo_si) || null;
}

/**
 * Si una fila tiene diligenciado todo lo obligatorio que aplica, incluidas sus listas internas
 * (con su mínimo). Es solo una guía para la tabla resumen: la validación la hace el servidor.
 */
export function filaCompleta(nodos: NodoDefinicion[], datos: Datos, contexto: ContextoFormulario): boolean {
  return (nodos || []).every((nodo) => !nodo.dato.clave || !esVisible(nodo, datos) || campoCompleto(nodo, datos, contexto));
}

function campoCompleto(nodo: NodoDefinicion, datos: Datos, contexto: ContextoFormulario): boolean {
  const valor = datos ? datos[nodo.dato.clave] : undefined;
  switch (claseDe(nodo)) {
    case 'grupo':
      return filaCompleta(nodo.hijos, esObjeto(valor) ? valor : {}, contexto);
    case 'repetible': {
      const filas = filasDe(valor);
      // Las filas de un espejo salen del origen: aquí no se exige cuántas hay.
      const minimo = nodo.dato.espejo_de ? 0 : Math.max(nodo.dato.min || 0, nodo.dato.required ? 1 : 0);
      return filas.length >= minimo && filas.every((fila) => filaCompleta(nodo.hijos, fila, contexto));
    }
    case 'calculado':
    case 'casilla':
    case 'matriz':
      return true;
    default:
      return !nodo.dato.required || tieneValor(valor);
  }
}

function tieneValor(valor: any): boolean {
  if (valor === undefined || valor === null) {
    return false;
  }
  if (typeof valor === 'string') {
    return valor.trim() !== '';
  }
  if (typeof valor === 'number') {
    return isFinite(valor);
  }
  return Array.isArray(valor) ? valor.length > 0 : true;
}

/** Texto de un campo de la fila para la tabla resumen; vacío si no tiene valor. Una lista interna muestra cuántas filas tiene. */
export function textoResumen(campo: NodoDefinicion, fila: Datos, filaOrigen: Datos | null, contexto: ContextoFormulario): string {
  const dato = campo.dato;
  const valor = fila ? fila[dato.clave] : undefined;
  switch (claseDe(campo)) {
    case 'repetible':
      return String(filasDe(valor).length);
    case 'numeric':
      return typeof valor === 'number' && isFinite(valor) ? formatearNumero(valor) : '';
    case 'calculado': {
      const calculado = esCalculoNumerico(campo) ? calcularNumero(dato, fila) : null;
      return calculado === null ? '' : formatearNumero(calculado);
    }
    case 'catalogo':
      return (Array.isArray(valor) ? valor : [valor])
        .filter((codigo) => codigo !== undefined && codigo !== null && codigo !== '')
        .map((codigo) => contexto.nombreEnCatalogo(dato.catalogo, String(codigo)))
        .join(', ');
    case 'referencia': {
      const ids = Array.isArray(valor) ? valor : [valor];
      return opcionesDeReferencia(dato, filaOrigen, contexto)
        .filter((opcion) => ids.includes(opcion.id))
        .map((opcion) => opcion.etiqueta)
        .join(', ');
    }
    case 'casilla':
      return valor === true ? VALOR_CASILLA_MARCADA : '';
    case 'documento':
      return valor && typeof valor === 'object' ? String(valor.nombre || '') : String(valor || '');
    default:
      return valor === undefined || valor === null ? '' : String(valor).trim();
  }
}

/**
 * Valor de "origen.<campo>" en la fila de origen del espejo o de "<submodulo>.<campo>" en el submódulo
 * actual o en los relacionados.
 */
export function valorTraido(ruta: string, filaOrigen: Datos | null, contexto: ContextoFormulario | null): any {
  if ((ruta || '').startsWith(PREFIJO_ORIGEN)) {
    return filaOrigen ? filaOrigen[ruta.slice(PREFIJO_ORIGEN.length)] : undefined;
  }
  const [submodulo, campo] = (ruta || '').split('.');
  const datos = contexto ? datosDeSubmodulo(submodulo, contexto) : undefined;
  return datos ? datos[campo] : undefined;
}

/**
 * Valor que trae un campo de un espejo (desde) para una de sus filas: además de "origen.<campo>" y
 * "<submodulo>.<campo>" (valorTraido), "<ruta de un grupo>.<campo>" lee la fila de ese grupo que
 * contiene la fila de origen, si su ruta empieza espejo_de (p. ej. el producto de cada actividad de
 * Cadena de valor en el Presupuesto inicial).
 */
export function valorTraidoEnEspejo(dato: DatoCampo, espejoDe: string, filaOrigen: Datos | null, contexto: ContextoFormulario): any {
  const desde = dato.desde || '';
  const grupo = desde.slice(0, desde.lastIndexOf('.'));
  if (desde.startsWith(PREFIJO_ORIGEN) || grupo.split('.').length < 2 || !(espejoDe || '').startsWith(`${grupo}.`)) {
    return valorTraido(desde, filaOrigen, contexto);
  }
  const internas = espejoDe.slice(grupo.length + 1).split('.');
  const contiene = (fila: Datos) => filasAnidadas([fila], internas).some((interna) => interna.id === filaOrigen.id);
  const contenedora = filaOrigen && filasDeRuta(grupo, contexto).find(contiene);
  return contenedora ? contenedora[desde.slice(grupo.length + 1)] : undefined;
}

/** Texto de lo que muestra un calculado con desde (textoDeTraido con valorTraido). */
export function textoTraido(dato: DatoCampo, filaOrigen: Datos | null, contexto: ContextoFormulario): string {
  return textoDeTraido(dato, valorTraido(dato.desde, filaOrigen, contexto), contexto);
}

/**
 * Texto de un valor traído: con catalogo, el nombre del elemento (si el catálogo ya se cargó); los
 * números con separadores; vacío si no hay valor.
 */
export function textoDeTraido(dato: DatoCampo, valor: any, contexto: ContextoFormulario): string {
  if (valor === undefined || valor === null || valor === '') {
    return '';
  }
  if (dato.catalogo) {
    return contexto.nombreEnCatalogo(dato.catalogo, String(valor));
  }
  if (typeof valor === 'number') {
    return isFinite(valor) ? formatearNumero(valor) : '';
  }
  return String(valor);
}

/**
 * Espejo de solo lectura: todos sus campos se traen (calculados con desde), así que no hay nada que
 * escribir y se muestra como un resumen (p. ej. el Presupuesto inicial con lo cargado en Cadena de valor).
 */
export function esEspejoTraido(nodo: NodoDefinicion): boolean {
  const campos = nodo.hijos || [];
  return claseDe(nodo) === 'repetible' && !!nodo.dato.espejo_de && campos.length > 0 && campos.every(esCalculoTraido);
}

/** Número con separadores de Colombia: 19.528.962.455 o $ 19.528.962.455. */
export function formatearNumero(valor: number, moneda = false): string {
  return new Intl.NumberFormat('es-CO', {
    style: moneda ? 'currency' : 'decimal',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(valor);
}

// ---------------------------------------------------------------------------
// Calculados y matrices
// ---------------------------------------------------------------------------

/** Vista previa del campo calculado; el valor definitivo lo calcula el servidor. */
export function calcular(nodo: NodoDefinicion, hermanos: NodoDefinicion[], valores: Datos, contexto: ContextoFormulario): string {
  const texto = (nodo.dato.plantilla || '').replace(/\{([a-z0-9_]+)\}/g, (_, clave: string) => {
    const valor = valores[clave];
    const hermano = hermanos.find((h) => h.dato.clave === clave);
    if (valor === undefined || valor === null || valor === '') {
      return '';
    }
    return hermano && hermano.dato.type === 'catalogo'
      ? contexto.nombreEnCatalogo(hermano.dato.catalogo, String(valor))
      : String(valor);
  });
  const limpio = texto.split(/\s+/).filter((parte) => parte).join(' ');
  return nodo.dato.transformar === 'mayusculas' ? limpio.toLocaleUpperCase('es-CO') : limpio;
}

/**
 * Vista previa de un calculado numérico con los valores de sus hermanos, igual que el mid y sin
 * ruido de punto flotante:
 * - 'resta': el primero menos los demás; null si falta alguno.
 * - 'suma': la suma, con los vacíos en 0; null si están todos vacíos.
 * - 'multiplicacion': el producto (p. ej. cantidad × valor unitario); null si falta alguno.
 */
export function calcularNumero(dato: DatoCampo, valores: Datos): number | null {
  const operandos = dato.operandos || [];
  if (!['resta', 'suma', 'multiplicacion'].includes(dato.operacion) || operandos.length < 2) {
    return null;
  }
  const esNumero = (valor: any) => typeof valor === 'number' && isFinite(valor);
  const numeros = operandos.map((clave) => valores && valores[clave]);
  let resultado: number;
  if (dato.operacion !== 'suma') {
    if (!numeros.every(esNumero)) {
      return null;
    }
    resultado = dato.operacion === 'resta'
      ? numeros.slice(1).reduce((resta, valor) => resta - valor, numeros[0])
      : numeros.slice(1).reduce((producto, valor) => producto * valor, numeros[0]);
  } else {
    const presentes = numeros.filter(esNumero);
    if (!presentes.length) {
      return null;
    }
    resultado = presentes.reduce((suma, valor) => suma + valor, 0);
  }
  const escala = Math.pow(10, typeof dato.decimales === 'number' ? dato.decimales : 9);
  return Math.round(resultado * escala) / escala;
}

/** Asegura la forma { fila: { columna: valor } } de una matriz. */
export function asegurarMatriz(dato: DatoCampo, valor: any): Datos {
  const matriz: Datos = valor && typeof valor === 'object' ? valor : {};
  for (const fila of dato.filas || []) {
    matriz[fila.clave] = matriz[fila.clave] && typeof matriz[fila.clave] === 'object' ? matriz[fila.clave] : {};
  }
  return matriz;
}

export function columnasDe(dato: DatoCampo): string[] {
  return (dato.grupos_columnas || []).reduce((todas, grupo) => todas.concat(grupo.columnas.map((c) => c.clave)), [] as string[]);
}

export function totalFila(matriz: Datos, fila: string, columnas: string[]): number {
  return columnas.reduce((suma, columna) => suma + numero(matriz[fila] && matriz[fila][columna]), 0);
}

export function totalColumna(matriz: Datos, filas: string[], columna: string): number {
  return filas.reduce((suma, fila) => suma + numero(matriz[fila] && matriz[fila][columna]), 0);
}

function numero(valor: any): number {
  return typeof valor === 'number' && isFinite(valor) ? valor : 0;
}

/**
 * Deja los datos con la forma de la definición antes de dibujar: objetos en los
 * grupos, listas en los repetibles (con las filas de espejo sincronizadas) y
 * matrices completas. Así las vistas solo leen y editan, sin crear estructura.
 */
export function prepararEstructura(nodos: NodoDefinicion[], datos: Datos, contexto: ContextoFormulario): Datos {
  for (const nodo of nodos || []) {
    const clave = nodo.dato.clave;
    if (!clave) {
      continue;
    }
    switch (claseDe(nodo)) {
      case 'grupo':
        datos[clave] = esObjeto(datos[clave]) ? datos[clave] : {};
        prepararEstructura(nodo.hijos, datos[clave], contexto);
        break;
      case 'repetible': {
        let filas = filasDe(datos[clave]);
        if (nodo.dato.espejo_de) {
          filas = sincronizarEspejo(filas, filasDeRuta(nodo.dato.espejo_de, contexto), prefijoDeClave(clave), nodo.dato.filas_adicionales);
        }
        filas.forEach((fila) => prepararEstructura(nodo.hijos, fila, contexto));
        datos[clave] = filas;
        break;
      }
      case 'matriz':
        datos[clave] = asegurarMatriz(nodo.dato, datos[clave]);
        break;
      case 'calculado':
        // Si lo guardado es el valor propuesto, el campo se deja vacío: así sigue el
        // propuesto (el servidor lo recalcula) y solo se conserva lo que el usuario escriba.
        if (nodo.dato.editable && datos[clave] === calcular(nodo, nodos, datos, contexto)) {
          datos[clave] = '';
        }
        break;
      case 'referencia':
        // La referencia a la fila marcada (p. ej. la alternativa que pasa a Preparación) se llena
        // sola con la que esté marcada, aunque lo guardado apunte a otra.
        if (nodo.dato.marcada_en) {
          const marcada = opcionesDeReferencia(nodo.dato, null, contexto)[0];
          datos[clave] = marcada ? marcada.id : '';
        }
        break;
    }
  }
  return datos;
}

function esObjeto(valor: any): boolean {
  return !!valor && typeof valor === 'object' && !Array.isArray(valor);
}

// ---------------------------------------------------------------------------
// Módulos: los submódulos (hojas) son los hijos de cada módulo
// ---------------------------------------------------------------------------

/** Submódulos de todos los módulos de la construcción, en orden. */
export function submodulosDeDefinicion(definicion: Definicion): NodoDefinicion[] {
  return (definicion.modulos || []).reduce((todas, modulo) => todas.concat(modulo.hijos || []), [] as NodoDefinicion[]);
}

/** Submódulos de todos los módulos de la vista general, en orden. */
export function submodulosDeResumen(resumen: ResumenIniciativa): ResumenSubmodulo[] {
  return (resumen.modulos || []).reduce((todas, modulo) => todas.concat(modulo.submodulos || []), [] as ResumenSubmodulo[]);
}

/** Copia profunda de datos JSON (para editar sin tocar lo recibido). */
export function copiar<T>(valor: T): T {
  return valor === undefined ? valor : JSON.parse(JSON.stringify(valor));
}
