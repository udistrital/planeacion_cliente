import {
  AccionIniciativa,
  AccionSubmodulo,
  ColumnaResumen,
  DescripcionAccion,
  DescripcionAccionSubmodulo,
} from './iniciativa.models';

/**
 * Roles que crean y formulan iniciativas: la dependencia y también Planeación.
 * La iniciativa queda a nombre de la unidad del usuario. Para que solo formule
 * la dependencia, basta quitar 'PLANEACION' de esta lista.
 */
export const ROLES_FORMULADORES = ['JEFE_DEPENDENCIA', 'ASISTENTE_DEPENDENCIA', 'PLANEACION'];

/** Roles que revisan las iniciativas (OAPC). */
export const ROLES_REVISORES = ['PLANEACION', 'ASISTENTE_PLANEACION'];

/** Código del estado de submódulo que no se puede revisar. */
export const ESTADO_SUBMODULO_SIN_FORMULAR = 'SF_SUB';

/** Código del estado de submódulo con observaciones de Planeación por atender. */
export const ESTADO_SUBMODULO_CON_OBSERVACIONES = 'CO_SUB';

/**
 * Listas del nivel superior (clave) con lista interna que cada submódulo muestra como tabla
 * jerárquica: cada fila con su número y, debajo, con sangría y número 1.1, las de su lista
 * interna. Las listas sin lista interna van siempre en tabla, sin necesidad de nombrarlas aquí
 * (seMuestraEnTabla); las que tienen lista interna y no están aquí van en recuadros.
 */
export const LISTAS_EN_TABLA: { [submodulo: string]: string[] } = {
  problematica: ['causas_directas', 'efectos_directos'],
};

/**
 * Grupos (clave) que cada submódulo muestra como casillas, como la "X" del Excel: cada
 * campo del grupo es un select Sí/No y el usuario marca solo los que aplican. Marcar
 * una casilla guarda VALOR_CASILLA_MARCADA y dejarla sin marcar, VALOR_CASILLA_SIN_MARCAR.
 * Si el grupo tiene otro tipo de campos, se muestra como un grupo normal.
 */
export const GRUPOS_EN_CASILLAS: { [submodulo: string]: string[] } = {
  localizacion: ['factores'],
};

/**
 * Secciones (clave de un campo del nivel superior) que cada submódulo muestra una al lado de la
 * otra, a media pantalla, en lugar de una debajo de la otra. En pantallas angostas vuelven a
 * quedar una debajo de la otra.
 */
export const SECCIONES_LADO_A_LADO: { [submodulo: string]: string[] } = {
  localizacion: ['sedes', 'factores'],
};

/**
 * Grupos (clave) que cada submódulo muestra con sus campos en columnas, como una fila de
 * formulario, en lugar de uno debajo del otro (p. ej. la única ubicación de Localización).
 */
export const GRUPOS_EN_COLUMNAS: { [submodulo: string]: string[] } = {
  localizacion: ['ubicacion'],
};

/**
 * Columnas de la tabla resumen de las listas que no caben en una tabla (grupo repetible): cada
 * fila se resume en la tabla y se diligencia debajo de ella. Por submódulo y clave de la lista;
 * la que no está aquí muestra su primer campo de texto, número u opciones. Un espejo muestra
 * además su elemento de origen.
 */
export const COLUMNAS_RESUMEN: { [submodulo: string]: { [lista: string]: ColumnaResumen[] } } = {
  necesidades: {
    bienes_servicios: [{ clave: 'descripcion_bien' }, { clave: 'unidad_medida' }, { clave: 'analisis_anual', nombre: 'Años' }],
  },
  cadena_valor: {
    productos_por_objetivo: [{ clave: 'productos', nombre: 'Productos' }],
    productos: [{ clave: 'producto' }, { clave: 'meta' }, { clave: 'actividades', nombre: 'Actividades' }],
  },
  ingresos_beneficios: {
    conceptos: [{ clave: 'tipo' }, { clave: 'descripcion' }, { clave: 'valores_anuales', nombre: 'Años' }],
  },
};

export const VALOR_CASILLA_MARCADA = 'Sí';
export const VALOR_CASILLA_SIN_MARCAR = 'No';

/** Largo máximo de una observación (igual que en el mid y el crud). */
export const MAXIMO_TEXTO_OBSERVACION = 4000;

/** Rutas de las pantallas, relativas a la raíz de la aplicación. */
export const RUTA_INICIATIVAS = 'pages/iniciativas-inversion';

/** Cómo se muestra el autor de una observación según el rol con el que la escribió. */
export const NOMBRES_ROL: { [rol: string]: string } = {
  PLANEACION: 'Planeación',
  ASISTENTE_PLANEACION: 'Asistente de Planeación',
  JEFE_DEPENDENCIA: 'Jefe de dependencia',
  ASISTENTE_DEPENDENCIA: 'Asistente de dependencia',
};

/** Ícono y texto de la acción principal de cada submódulo (como el lápiz y la lupa del listado). */
export const ACCIONES_SUBMODULO: { [accion in AccionSubmodulo]: DescripcionAccionSubmodulo } = {
  formular: { etiqueta: 'Formular', icono: 'edit' },
  revisar: { etiqueta: 'Revisar', icono: 'rate_review' },
  consultar: { etiqueta: 'Consultar', icono: 'search' },
};

/** Cómo se presenta cada acción sobre el estado general y quién puede ejecutarla. */
export const ACCIONES_INICIATIVA: { [accion in AccionIniciativa]: DescripcionAccion } = {
  enviar: {
    etiqueta: 'Enviar a revisión',
    confirmacion: 'Una vez enviada no podrá editar la iniciativa hasta que sea devuelta.',
    roles: ROLES_FORMULADORES,
    color: 'primary',
  },
  devolver: {
    etiqueta: 'Devolver para corregir',
    confirmacion: 'La iniciativa volverá a la dependencia con las observaciones registradas.',
    roles: ROLES_REVISORES,
    color: 'accent',
  },
  avalar: {
    etiqueta: 'Avalar',
    confirmacion: 'La iniciativa quedará avalada y no se podrá editar.',
    roles: ROLES_REVISORES,
    color: 'primary',
  },
  'no-avalar': {
    etiqueta: 'No avalar',
    confirmacion: 'La iniciativa quedará como no avalada.',
    roles: ROLES_REVISORES,
    color: 'warn',
  },
};
