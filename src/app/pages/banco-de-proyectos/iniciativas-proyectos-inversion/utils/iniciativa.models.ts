/**
 * Modelos de las iniciativas de inversión. Siguen el contrato del API
 * /v1/iniciativa-inversion del mid (helpers/iniciativaInversionHelper/modelo.go).
 * El sobre de respuesta es DataRequest y la unidad es Dependencia (@core/models).
 */

/** Datos de un submódulo o de una fila: clave del campo -> valor. */
export type Datos = { [clave: string]: any };

export type TipoCampo =
  | 'input'
  | 'numeric'
  | 'catalogo'
  | 'calculado'
  | 'repetible'
  | 'referencia'
  | 'matriz'
  | 'casilla'
  | 'documento';

export interface ElementoClave {
  clave: string;
  nombre: string;
}

export interface GrupoColumnas {
  nombre: string;
  columnas: ElementoClave[];
}

/** Definición de un campo (subgrupo_detalle.dato de la plantilla). */
export interface DatoCampo {
  clave: string;
  /** Solo en el primer nivel: el nodo es un módulo (Identificación, Preparación...). */
  modulo?: boolean;
  type?: TipoCampo;
  required: boolean;
  multilinea?: boolean;
  maxlength?: number;
  min?: number;
  max?: number;
  decimales?: number;
  catalogo?: string;
  depende_de?: string;
  plantilla?: string;
  /**
   * Calculado numérico: 'resta' = el primer operando menos los demás (p. ej. oferta - demanda);
   * 'suma' = la suma de los operandos, con los vacíos en 0 (p. ej. el costo total de los periodos);
   * 'multiplicacion' = el producto (p. ej. el valor total: cantidad × valor unitario).
   */
  operacion?: 'resta' | 'suma' | 'multiplicacion';
  /**
   * Calculado que solo muestra "<submodulo>.<campo>" de otro submódulo (p. ej. el objetivo general) u
   * "origen.<campo>" de la fila de origen del espejo (p. ej. el costo de cada año en el Cronograma); no se guarda.
   */
  desde?: string;
  /** Claves de los campos hermanos que opera, en orden. */
  operandos?: string[];
  transformar?: string;
  /** Calculado editable: se propone el valor calculado y el usuario puede escribir otro. */
  editable?: boolean;
  etiqueta_fila?: string;
  /**
   * Grupo del que salen las filas: "<submodulo>.<grupo>" o "catalogo.<nombre>" (una fila por
   * elemento del catálogo; el mid manda los elementos en relacionadas.catalogo).
   */
  espejo_de?: string;
  /** Espejo cuyas filas se llenan solo si aplican: la vacía no se exige; `min` es cuántas, como mínimo, se llenan. */
  filas_opcionales?: boolean;
  /** Con filas_opcionales: ids de origen (códigos del catálogo) cuya fila sí se exige. */
  filas_obligatorias?: string[];
  mostrar?: string;
  /** Referencia: segundo texto de la opción, debajo del principal (p. ej. la descripción bajo el nombre de la alternativa). */
  mostrar_detalle?: string;
  opciones_desde?: string;
  /** Referencia que se llena sola con la fila marcada en esta casilla única del origen (p. ej. la alternativa que pasa a Preparación). */
  marcada_en?: string;
  /** Referencia o catálogo con varias opciones; el catálogo multiple se muestra como casillas (p. ej. las sedes). */
  multiple?: boolean;
  /** El campo se muestra, se exige y se guarda solo si el campo hermano vale (o incluye) el valor. */
  solo_si?: Condicion;
  /**
   * "origen.<campo>": el campo se exige solo si ese campo de la fila de origen del espejo tiene valor (un
   * número distinto de 0), p. ej. la programación física de un año en que la actividad tiene costo.
   */
  obligatorio_si?: string;
  /**
   * Lista cuyas filas se numeran n.m: n es la fila de este grupo (de su ruta o, si es espejo, de la de su
   * origen) que las contiene y m su consecutivo dentro de ella (1.3 = tercera actividad del objetivo 1).
   */
  numerar_por?: string;
  /** Casilla que se marca en una sola fila de su lista (marcar una desmarca las demás). */
  unica?: boolean;
  /** Documento: extensiones admitidas (p. ej. ["pdf", "docx"]) y tamaño máximo. */
  formatos?: string[];
  tamano_maximo_mb?: number;
  totales?: { filas: boolean; columnas: boolean };
  filas?: ElementoClave[];
  grupos_columnas?: GrupoColumnas[];
}

/**
 * Condición de solo_si: p. ej. «¿Cuál otra sede?» solo si en las sedes se marcó «Otra». Con
 * distinto, al revés: aplica si el campo no vale (ni incluye) el valor.
 */
export interface Condicion {
  campo: string;
  valor: string;
  distinto?: boolean;
}

export interface NodoDefinicion {
  id: string;
  nombre: string;
  descripcion: string;
  dato: DatoCampo;
  hijos: NodoDefinicion[] | null;
}

/**
 * Columna de la tabla resumen de una lista que se edita debajo de la tabla (COLUMNAS_RESUMEN).
 * Si la clave es de una lista interna, la columna muestra cuántas filas tiene.
 */
export interface ColumnaResumen {
  clave: string;
  /** Encabezado; si falta, el nombre del campo. */
  nombre?: string;
}

/** Construcción: módulos (primer nivel) y, dentro de cada uno, sus submódulos u hojas. */
export interface Definicion {
  modulos: NodoDefinicion[];
}

export interface Estado {
  nombre: string;
  codigo_abreviacion: string;
  color?: string;
}

export interface ErrorCampo {
  ruta: string;
  mensaje: string;
}

/** Entrada del historial de comentarios de un submódulo (siempre sobre el submódulo completo), en orden de registro. */
export interface Observacion {
  _id?: string;
  texto: string;
  /** Rol con el que se escribió. */
  rol: string;
  /** Documento del usuario. */
  usuario: string;
  fecha?: string;
}

export interface SolicitudObservacion {
  texto: string;
  rol: string;
  usuario: string;
}

/** Fila del listado de iniciativas. */
export interface IniciativaListado {
  id: string;
  /** Consecutivo por orden de creación (1 = la primera). */
  numero: number;
  nombre: string;
  dependencia_id: string;
  /** Estado general de la iniciativa. */
  estado: Estado;
  permite_editar: boolean;
  fecha_creacion: string;
}

export interface ResumenSubmodulo {
  clave: string;
  nombre: string;
  estado: Estado;
  observaciones: number;
}

export interface ResumenModulo {
  clave: string;
  nombre: string;
  submodulos: ResumenSubmodulo[];
}

export interface ResumenIniciativa {
  id: string;
  nombre: string;
  estado: Estado;
  permite_editar: boolean;
  permite_revisar: boolean;
  acciones_posibles: AccionIniciativa[];
  modulos: ResumenModulo[];
}

export interface SubmoduloVista {
  estado: Estado;
  datos: Datos;
  observaciones: Observacion[];
  version: number;
  errores: ErrorCampo[];
}

export interface SubmoduloConRelacionadas {
  submodulo: SubmoduloVista;
  relacionadas: { [submodulo: string]: Datos };
}

export interface ItemCatalogo {
  codigo: string;
  nombre: string;
  padre?: string;
}

/**
 * Valor de un campo `documento` (Anexos): el archivo queda en el gestor documental de OAS y en
 * el submódulo solo se guarda esta referencia.
 */
export interface ReferenciaDocumento {
  id?: number | string;
  /** Identificador del archivo en el gestor documental, con el que se vuelve a pedir. */
  enlace?: string;
  nombre: string;
  /** Documento del usuario que lo subió. */
  usuario?: string;
  fecha?: string;
}

/** Cuerpo de POST /iniciativas/:id/documentos: el mid sube el archivo al gestor y responde la referencia. */
export interface SolicitudDocumento {
  /** Ruta del campo en la plantilla, sin ids de fila: "carta_presentacion" u "otros_anexos.archivo". */
  clave: string;
  nombre: string;
  /** Archivo en base64 (GestorDocumentalService.fileToBase64). */
  archivo: string;
  usuario: string;
}

export type AccionIniciativa = 'enviar' | 'devolver' | 'avalar';

/** Acción principal sobre un submódulo en la vista de la iniciativa. */
export type AccionSubmodulo = 'formular' | 'revisar' | 'consultar';

export interface DescripcionAccionSubmodulo {
  etiqueta: string;
  icono: string;
}

/** La iniciativa se crea con la plantilla vigente; solo hace falta la unidad. */
export interface SolicitudCrearIniciativa {
  dependencia_id: string;
}

/** Cómo se presenta una acción sobre el estado general y quién puede ejecutarla. */
export interface DescripcionAccion {
  etiqueta: string;
  confirmacion: string;
  roles: string[];
  color: 'primary' | 'accent' | 'warn';
}
