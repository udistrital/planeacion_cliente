import { Observable } from 'rxjs';
import {
  ColumnaResumen,
  Datos,
  DatoCampo,
  Definicion,
  ErrorCampo,
  NodoDefinicion,
  ReferenciaDocumento,
  ResumenIniciativa,
  ResumenSubmodulo,
} from './iniciativa.models';
import { VALOR_CASILLA_MARCADA, VALOR_CASILLA_SIN_MARCAR } from './constantes';

/**
 * Funciones puras del formulario dinámico. Repiten las reglas de forma del mid
 * (rutas, espejos, referencias, calculados) para armar la vista; la validación
 * definitiva siempre la hace el servidor.
 */

export const PREFIJO_ORIGEN = 'origen.';

/** Apariencia de los mat-form-field del formulario. */
export type AparienciaCampo = 'fill' | 'outline';

/** Contexto que comparten todos los niveles del formulario de un submódulo. */
export interface ContextoFormulario {
  claveSubmodulo: string;
  datosSubmodulo: Datos;
  relacionadas: { [submodulo: string]: Datos };
  soloLectura: boolean;
  errores: { [ruta: string]: string[] };
  /** 'fill' en el formulario del submódulo (estilo de SISGPLAN). */
  apariencia: AparienciaCampo;
  /** Claves de las listas del nivel superior que se dibujan como tabla jerárquica (LISTAS_EN_TABLA). */
  listasEnTabla: string[];
  /** Claves de los grupos que se dibujan como casillas Sí/No (GRUPOS_EN_CASILLAS). */
  gruposEnCasillas: string[];
  /** Secciones del nivel superior que van una al lado de la otra (SECCIONES_LADO_A_LADO). */
  seccionesLadoALado?: string[];
  /** Grupos cuyos campos van en columnas (GRUPOS_EN_COLUMNAS). */
  gruposEnColumnas?: string[];
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
  | 'select'
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

/**
 * Filas de "<submodulo>.<grupo>" en los datos del submódulo actual o de los relacionados.
 * La ruta puede seguir por grupos anidados ("<submodulo>.<grupo>.<subgrupo>"): entonces
 * devuelve, en orden, las filas de <subgrupo> de todas las filas de <grupo>.
 */
export function filasDeRuta(ruta: string, contexto: ContextoFormulario): Datos[] {
  const [submodulo, grupo, ...anidados] = (ruta || '').split('.');
  const datos = submodulo === contexto.claveSubmodulo ? contexto.datosSubmodulo : contexto.relacionadas[submodulo];
  return anidados.reduce(
    (filas, clave) => filas.reduce((internas, fila) => internas.concat(filasDe(fila[clave])), [] as Datos[]),
    filasDe(datos && datos[grupo]),
  );
}

/**
 * Deja una fila de espejo por cada fila de origen, en el mismo orden: conserva
 * las existentes, crea las que faltan y descarta las de elementos que ya no existen.
 */
export function sincronizarEspejo(actuales: Datos[], origen: Datos[], prefijo: string): Datos[] {
  const porOrigen = new Map<string, Datos>();
  for (const fila of actuales) {
    if (fila.origen && !porOrigen.has(fila.origen)) {
      porOrigen.set(fila.origen, fila);
    }
  }
  return origen
    .filter((filaOrigen) => filaOrigen.id)
    .map((filaOrigen) => porOrigen.get(filaOrigen.id) || { id: nuevoIdFila(prefijo), origen: filaOrigen.id });
}

export interface OpcionReferencia {
  id: string;
  etiqueta: string;
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
    .map(({ fila, posicion }) => ({ id: fila.id, etiqueta: textoDeFila(fila, dato.mostrar, posicion) }));
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
}

/** Tipos de campo que se editan dentro de una celda de tabla (además del calculado numérico, que solo se muestra). */
const TIPOS_EN_CELDA: ClaseNodo[] = ['input', 'numeric', 'select', 'catalogo', 'casilla'];

/**
 * Estructura de tabla de una lista, o null si no cabe en una: solo campos que se editan
 * en una celda (texto, número, opciones, catálogo, casilla o calculado numérico) y, como mucho, una lista interna con
 * campos de ese tipo. Un espejo cabe solo si no tiene lista interna; la interna no puede ser espejo.
 */
export function estructuraDeTabla(nodo: NodoDefinicion): EstructuraTabla | null {
  const hijos = nodo.hijos || [];
  const campos = hijos.filter(cabeEnCelda);
  const internas = hijos.filter((hijo) => claseDe(hijo) === 'repetible');
  const interna = internas[0] || null;
  const hijosInternos = interna ? interna.hijos || [] : [];
  const camposInternos = hijosInternos.filter(cabeEnCelda);
  const valida =
    claseDe(nodo) === 'repetible' &&
    !(nodo.dato.espejo_de && interna) &&
    campos.length > 0 &&
    internas.length <= 1 &&
    campos.length + internas.length === hijos.length &&
    (!interna || (!interna.dato.espejo_de && camposInternos.length > 0 && camposInternos.length === hijosInternos.length));
  return valida ? { campos, interna, camposInternos } : null;
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

/** Ni el catálogo multiple (casillas) ni los campos con solo_si caben en una celda: la lista va en recuadros. */
function cabeEnCelda(nodo: NodoDefinicion): boolean {
  const enCelda = TIPOS_EN_CELDA.includes(claseDe(nodo)) && !(claseDe(nodo) === 'catalogo' && nodo.dato.multiple);
  return (enCelda || esCalculoNumerico(nodo)) && !nodo.dato.solo_si;
}

/**
 * Si el campo aplica con los valores de su nivel: sin solo_si, siempre; con solo_si, si el hermano
 * vale el valor o, si es una lista (catálogo multiple), lo incluye. Igual que el mid, que no
 * exige ni guarda lo que no aplica.
 */
export function esVisible(nodo: NodoDefinicion, hermanos: Datos): boolean {
  const condicion = nodo.dato.solo_si;
  if (!condicion) {
    return true;
  }
  const valor = hermanos && hermanos[condicion.campo];
  return Array.isArray(valor) ? valor.includes(condicion.valor) : valor === condicion.valor;
}

/** Calculado con operación (p. ej. el déficit): su valor es un número. */
export function esCalculoNumerico(nodo: NodoDefinicion): boolean {
  return claseDe(nodo) === 'calculado' && !!nodo.dato.operacion;
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
// Tabla resumen de las listas que se editan debajo de la tabla (grupo repetible)
// ---------------------------------------------------------------------------

/** Tipos de campo que el resumen muestra por defecto cuando la lista no tiene COLUMNAS_RESUMEN. */
const TIPOS_RESUMEN_POR_DEFECTO: ClaseNodo[] = ['input', 'numeric', 'select', 'catalogo'];

/** Campo que resume una fila cuando la lista no tiene columnas configuradas: el primero de texto, número u opciones. */
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
      return esGrupoDeCasillas(nodo, contexto) || filaCompleta(nodo.hijos, esObjeto(valor) ? valor : {}, contexto);
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

/** Valor de "<submodulo>.<campo>" en el submódulo actual o en los relacionados. */
export function valorDeRuta(ruta: string, contexto: ContextoFormulario): any {
  const [submodulo, campo] = (ruta || '').split('.');
  const datos = submodulo === contexto.claveSubmodulo ? contexto.datosSubmodulo : contexto.relacionadas[submodulo];
  return datos ? datos[campo] : undefined;
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

/**
 * Grupo que se dibuja como casillas: está en GRUPOS_EN_CASILLAS y todos sus campos
 * son selects con las opciones de marcada y sin marcar (Sí y No).
 */
export function esGrupoDeCasillas(nodo: NodoDefinicion, contexto: ContextoFormulario): boolean {
  const campos = nodo.hijos || [];
  return (
    claseDe(nodo) === 'grupo' &&
    contexto.gruposEnCasillas.includes(nodo.dato.clave) &&
    campos.length > 0 &&
    campos.every((campo) => claseDe(campo) === 'select' && tieneOpcionesDeCasilla(campo))
  );
}

function tieneOpcionesDeCasilla(nodo: NodoDefinicion): boolean {
  return tieneOpcion(nodo, VALOR_CASILLA_MARCADA) && tieneOpcion(nodo, VALOR_CASILLA_SIN_MARCAR);
}

function tieneOpcion(nodo: NodoDefinicion, valor: string): boolean {
  return (nodo.dato.options || []).some((opcion) => opcion.valor === valor);
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
        if (esGrupoDeCasillas(nodo, contexto)) {
          // Una casilla sin marcar es «No»: así el campo no queda vacío ni se reporta como pendiente.
          for (const campo of nodo.hijos) {
            const valor = datos[clave][campo.dato.clave];
            if (valor === undefined || valor === null || valor === '') {
              datos[clave][campo.dato.clave] = VALOR_CASILLA_SIN_MARCAR;
            }
          }
        }
        break;
      case 'repetible': {
        let filas = filasDe(datos[clave]);
        if (nodo.dato.espejo_de) {
          filas = sincronizarEspejo(filas, filasDeRuta(nodo.dato.espejo_de, contexto), prefijoDeClave(clave));
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

/** Submodulos de todos los módulos de la construcción, en orden. */
export function submodulosDeDefinicion(definicion: Definicion): NodoDefinicion[] {
  return (definicion.modulos || []).reduce((todas, modulo) => todas.concat(modulo.hijos || []), [] as NodoDefinicion[]);
}

/** Submodulos de todos los módulos de la vista general, en orden. */
export function submodulosDeResumen(resumen: ResumenIniciativa): ResumenSubmodulo[] {
  return (resumen.modulos || []).reduce((todas, modulo) => todas.concat(modulo.submodulos || []), [] as ResumenSubmodulo[]);
}

/** Copia profunda de datos JSON (para editar sin tocar lo recibido). */
export function copiar<T>(valor: T): T {
  return valor === undefined ? valor : JSON.parse(JSON.stringify(valor));
}
