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
  | 'select'
  | 'catalogo'
  | 'calculado'
  | 'repetible'
  | 'referencia'
  | 'matriz'
  | 'casilla'
  | 'documento';

export interface Opcion {
  valor: string;
}

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
  options?: Opcion[];
  catalogo?: string;
  depende_de?: string;
  plantilla?: string;
  /**
   * Calculado numérico: 'resta' = el primer operando menos los demás (p. ej. oferta - demanda);
   * 'suma' = la suma de los operandos, con los vacíos en 0 (p. ej. el costo total de los periodos);
   * 'multiplicacion' = el producto (p. ej. el valor total: cantidad × valor unitario).
   */
  operacion?: 'resta' | 'suma' | 'multiplicacion';
  /** Calculado que solo muestra "<submodulo>.<campo>" de otro submódulo (p. ej. el objetivo general); no se guarda. */
  desde?: string;
  /** Claves de los campos hermanos que opera, en orden. */
  operandos?: string[];
  transformar?: string;
  /** Calculado editable: se propone el valor calculado y el usuario puede escribir otro. */
  editable?: boolean;
  nombre_plan?: boolean;
  etiqueta_fila?: string;
  espejo_de?: string;
  mostrar?: string;
  opciones_desde?: string;
  /** Referencia que se llena sola con la fila marcada en esta casilla única del origen (p. ej. la alternativa que pasa a Preparación). */
  marcada_en?: string;
  /** Referencia o catálogo con varias opciones; el catálogo multiple se muestra como casillas (p. ej. las sedes). */
  multiple?: boolean;
  /** El campo se muestra, se exige y se guarda solo si el campo hermano vale (o incluye) el valor. */
  solo_si?: Condicion;
  cubrir_todas?: boolean;
  /** Casilla que se marca en una sola fila de su lista (marcar una desmarca las demás). */
  unica?: boolean;
  /** Documento: extensiones admitidas (p. ej. ["pdf", "docx"]) y tamaño máximo. */
  formatos?: string[];
  tamano_maximo_mb?: number;
  tipo_celda?: string;
  totales?: { filas: boolean; columnas: boolean };
  filas?: ElementoClave[];
  grupos_columnas?: GrupoColumnas[];
}

/** Condición de solo_si: p. ej. «¿Cuál otra sede?» solo si en las sedes se marcó «Otra». */
export interface Condicion {
  campo: string;
  valor: string;
}

export interface NodoDefinicion {
  id: string;
  nombre: string;
  descripcion: string;
  bandera_tabla: boolean;
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
  plantilla_id: string;
  nombre: string;
  tipo_plan_id: string;
  modulos: NodoDefinicion[];
}

export interface Estado {
  _id: string;
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
  plantilla_id: string;
  /** Estado general de la iniciativa. */
  estado: Estado;
  permite_editar: boolean;
  fecha_creacion: string;
}

export interface ResumenSubmodulo {
  clave: string;
  nombre: string;
  descripcion: string;
  orden: number;
  estado: Estado;
  version: number;
  observaciones: number;
}

export interface ResumenModulo {
  clave: string;
  nombre: string;
  descripcion: string;
  submodulos: ResumenSubmodulo[];
}

export interface ResumenIniciativa {
  id: string;
  nombre: string;
  dependencia_id: string;
  plantilla_id: string;
  vigencia_aplica: string;
  estado: Estado;
  permite_editar: boolean;
  permite_revisar: boolean;
  acciones_posibles: AccionIniciativa[];
  modulos: ResumenModulo[];
}

export interface SubmoduloVista {
  id: string;
  clave: string;
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

export type AccionIniciativa = 'enviar' | 'devolver' | 'avalar' | 'no-avalar';

/** Acción principal sobre un submódulo en la vista de la iniciativa. */
export type AccionSubmodulo = 'formular' | 'revisar' | 'consultar';

export interface DescripcionAccionSubmodulo {
  etiqueta: string;
  icono: string;
}

/** La iniciativa se crea con la plantilla vigente; solo hace falta la unidad. */
export interface SolicitudCrearIniciativa {
  dependencia_id: string;
  responsable: string;
}

/** Cómo se presenta una acción sobre el estado general y quién puede ejecutarla. */
export interface DescripcionAccion {
  etiqueta: string;
  confirmacion: string;
  roles: string[];
  color: 'primary' | 'accent' | 'warn';
}
