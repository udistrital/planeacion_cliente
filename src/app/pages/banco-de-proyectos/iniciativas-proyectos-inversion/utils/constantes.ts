import {
  AccionIniciativa,
  AccionSubmodulo,
  ColumnaResumen,
  DescripcionAccion,
  DescripcionAccionSubmodulo,
} from './iniciativa.models';

/** Roles que crean y formulan iniciativas (la dependencia y Planeación). */
export const ROLES_FORMULADORES = ['JEFE_DEPENDENCIA', 'ASISTENTE_DEPENDENCIA', 'PLANEACION'];

/** Roles que revisan las iniciativas (OAPC). */
export const ROLES_REVISORES = ['PLANEACION', 'ASISTENTE_PLANEACION'];

/** Submódulo sin información. */
export const ESTADO_SUBMODULO_SIN_FORMULAR = 'SF_SUB';

/** Submódulo con información, pero incompleto o con errores. */
export const ESTADO_SUBMODULO_FORMULANDO = 'FN_SUB';

/** Estados de submódulo que aún no están formulados: no cuentan como formulados ni se pueden revisar. */
export const ESTADOS_SUBMODULO_POR_FORMULAR = [ESTADO_SUBMODULO_SIN_FORMULAR, ESTADO_SUBMODULO_FORMULANDO];

/** Código del estado de submódulo con observaciones de Planeación por atender. */
export const ESTADO_SUBMODULO_CON_OBSERVACIONES = 'CO_SUB';

/**
 * Listas del nivel superior (clave) con lista interna que cada submódulo muestra como tabla
 * jerárquica. Las listas sin lista interna van siempre en tabla sin nombrarlas aquí
 * (seMuestraEnTabla); las que tienen lista interna y no están aquí van en recuadros.
 */
export const LISTAS_EN_TABLA: { [submodulo: string]: string[] } = {
  problematica: ['causas_directas', 'efectos_directos'],
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
    productos: [{ clave: 'producto' }, { clave: 'indicador_producto' }, { clave: 'actividades', nombre: 'Actividades' }],
  },
  ingresos_beneficios: {
    conceptos: [{ clave: 'tipo' }, { clave: 'descripcion' }, { clave: 'valores_anuales', nombre: 'Años' }],
  },
};

/** Texto de una casilla marcada en la tabla resumen. */
export const VALOR_CASILLA_MARCADA = 'Sí';

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

/** Ícono y texto de la acción principal de cada submódulo. */
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
};
