import {
  Datos,
  DatoCampo,
  Definicion,
  ErrorCampo,
  NodoDefinicion,
  ResumenIniciativa,
  ResumenSubmodulo,
} from './iniciativa.models';

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
  /** Devuelve el nombre de un elemento de catálogo ya cargado (o el código). */
  nombreEnCatalogo: (catalogo: string, codigo: string) => string;
}

export type ClaseNodo = 'grupo' | 'repetible' | 'input' | 'numeric' | 'select' | 'catalogo' | 'calculado' | 'referencia' | 'matriz';

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

/** Filas de "<submodulo>.<grupo>" en los datos del submódulo actual o de los relacionados. */
export function filasDeRuta(ruta: string, contexto: ContextoFormulario): Datos[] {
  const [submodulo, grupo] = (ruta || '').split('.');
  const datos = submodulo === contexto.claveSubmodulo ? contexto.datosSubmodulo : contexto.relacionadas[submodulo];
  return filasDe(datos && datos[grupo]);
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

/** Opciones de un campo referencia: filas de "origen.<grupo>" o de "<submodulo>.<grupo>". */
export function opcionesDeReferencia(dato: DatoCampo, filaOrigen: Datos | null, contexto: ContextoFormulario): OpcionReferencia[] {
  const desde = dato.opciones_desde || '';
  const filas = desde.startsWith(PREFIJO_ORIGEN)
    ? filasDe(filaOrigen && filaOrigen[desde.slice(PREFIJO_ORIGEN.length)])
    : filasDeRuta(desde, contexto);
  return filas
    .filter((fila) => fila.id)
    .map((fila, posicion) => ({ id: fila.id, etiqueta: textoDeFila(fila, dato.mostrar, posicion) }));
}

export function textoDeFila(fila: Datos, campo: string | undefined, posicion: number): string {
  const texto = campo ? String(fila[campo] || '').trim() : '';
  return texto || `Elemento ${posicion + 1} (sin descripción)`;
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
