import {
  AccionIniciativa,
  AccionSubmodulo,
  ColumnaResumen,
  DescripcionAccion,
  DescripcionAccionSubmodulo,
  Veredicto,
} from './iniciativa.models';

/**
 * Roles del carril del formulador: crean y formulan las iniciativas de sus unidades. Solo deciden si
 * se muestra el botón «Nueva iniciativa»; lo demás lo decide el mid (ResumenIniciativa.permisos).
 */
export const ROLES_FORMULADORES = ['JEFE_DEPENDENCIA', 'ASISTENTE_DEPENDENCIA', 'ASISTENTE_PLANEACION'];

/** Roles de la OAP: sus observaciones se distinguen en el historial. */
export const ROLES_OAP = ['PLANEACION', 'ASISTENTE_PLANEACION'];

/** Estados de la iniciativa a los que lleva el último veredicto de la revisión de la OAP. */
export const ESTADO_INICIATIVA_POR_CORREGIR = 'PC_IPI';
export const ESTADO_INICIATIVA_APROBADA = 'APR_IPI';

/** Estados de submódulo que aún no están formulados (Sin formular y Formulando): no cuentan como formulados ni se revisan. */
export const ESTADOS_SUBMODULO_POR_FORMULAR = ['SF_SUB', 'FN_SUB'];

/** Submódulo con observaciones por atender. */
export const ESTADO_SUBMODULO_CON_OBSERVACIONES = 'CO_SUB';

/** Submódulo aprobado por la OAP: nadie lo edita. */
export const ESTADO_SUBMODULO_APROBADO = 'APR_SUB';

/**
 * Código HTTP con el que el mid rechaza lo que el estado actual no permite: otra persona cambió
 * el submódulo o el estado de la iniciativa, el submódulo está aprobado o la unidad está fuera de
 * sus fechas de formulación.
 */
export const HTTP_CONFLICTO = 409;

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
 * Grupos (clave) de catálogos encadenados con depende_de que cada submódulo muestra como un
 * árbol, igual que la armonización de Formulación: el primer campo (el plan) se elige en su
 * lista y los demás, en una tabla que se despliega nivel por nivel, donde se seleccionan varios
 * elementos de cualquier nivel (al seleccionar uno quedan seleccionados los de arriba). Cada
 * nivel se guarda en su campo del grupo.
 */
export const GRUPOS_EN_ARBOL: { [submodulo: string]: string[] } = {
  articulacion_pnd: ['pdd', 'ped', 'pi'],
};

/**
 * Submódulos cuyas secciones (los recuadros del nivel superior) se pliegan: al abrir una se
 * cierran las demás, para trabajar solo en la que se edita.
 */
export const SUBMODULOS_PLEGABLES: string[] = ['articulacion_pnd'];

/** Ícono (Material Icons) de cada sección plegable, por submódulo y clave de la sección. */
export const ICONOS_SECCIONES: { [submodulo: string]: { [seccion: string]: string } } = {
  articulacion_pnd: { pdd: 'apartment', ped: 'bar_chart', pi: 'assignment' },
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
    productos_por_objetivo: [{ clave: 'producto' }, { clave: 'actividades', nombre: 'Actividades' }],
  },
  ingresos_beneficios: {
    conceptos: [{ clave: 'tipo' }, { clave: 'descripcion' }, { clave: 'valores_anuales', nombre: 'Años' }],
  },
};

/** Ancho (px) de las listas que se abren desde una celda de tabla: más que la columna, para que se lean las opciones largas. */
export const ANCHO_LISTA_EN_CELDA = 420;

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

/** Ícono y texto de la acción principal de cada submódulo (y de cada iniciativa en el listado). */
export const ACCIONES_SUBMODULO: { [accion in AccionSubmodulo]: DescripcionAccionSubmodulo } = {
  formular: { etiqueta: 'Formular', icono: 'edit' },
  revisar: { etiqueta: 'Revisar', icono: 'rate_review' },
  consultar: { etiqueta: 'Consultar', icono: 'search' },
};

/** Cómo se presenta cada acción sobre el estado general. Las que puede ejecutar el usuario las da el mid. */
export const ACCIONES_INICIATIVA: { [accion in AccionIniciativa]: DescripcionAccion } = {
  enviar: {
    etiqueta: 'Enviar a revisión',
    titulo: '¿Enviar al Jefe de la unidad?',
    confirmacion: 'El Jefe revisará la iniciativa. Mientras tanto no podrá editarla.',
    confirmar: 'Sí, enviar',
    exito: 'Iniciativa enviada al Jefe de la unidad',
  },
  devolver: {
    etiqueta: 'Devolver',
    titulo: '¿Devolver a la unidad?',
    confirmacion: 'La unidad corregirá los submódulos con observaciones y la enviará de nuevo.',
    confirmar: 'Sí, devolver',
    exito: 'Iniciativa devuelta a la unidad',
  },
  aprobar: {
    etiqueta: 'Aprobar',
    titulo: '¿Aprobar y enviar a la OAP?',
    confirmacion: 'La OAP revisará la iniciativa.',
    confirmar: 'Sí, aprobar',
    exito: 'Iniciativa enviada a la OAP',
  },
  'iniciar-revision': {
    etiqueta: 'Iniciar revisión',
    titulo: '¿Iniciar la revisión?',
    confirmacion: 'Podrá aprobar u observar cada submódulo de la iniciativa.',
    confirmar: 'Sí, iniciar',
    exito: 'Revisión iniciada',
  },
  rechazar: {
    etiqueta: 'Rechazar',
    titulo: '¿Rechazar la iniciativa?',
    confirmacion: 'El motivo le llegará a la unidad en la notificación.',
    confirmar: 'Rechazar',
    exito: 'Iniciativa rechazada',
    pideMotivo: true,
  },
  'retractar-rechazo': {
    etiqueta: 'Retractar rechazo',
    titulo: '¿Retractar el rechazo?',
    confirmacion: 'La iniciativa vuelve a la unidad para corregirla. Lo aprobado sigue aprobado, pero el Jefe y la OAP pueden volver a observarlo.',
    confirmar: 'Sí, retractar',
    exito: 'Iniciativa devuelta a la unidad',
  },
};

/**
 * Texto de la notificación de cada cambio de estado, por el código del estado al que llega la
 * iniciativa (la retractación del rechazo tiene el suyo). [INICIATIVA], [UNIDAD] y [MOTIVO] se
 * reemplazan al notificar.
 */
export const MENSAJES_NOTIFICACION: { [estadoOAccion: string]: string } = {
  PA_IPI: 'La iniciativa «[INICIATIVA]» de [UNIDAD] fue enviada al Jefe de la unidad para su aprobación.',
  PR_IPI: 'El Jefe de [UNIDAD] aprobó la iniciativa «[INICIATIVA]» y la radicó ante la OAP.',
  ER_IPI: 'La OAP inició la revisión de la iniciativa «[INICIATIVA]» de [UNIDAD].',
  PC_IPI: 'La iniciativa «[INICIATIVA]» de [UNIDAD] fue devuelta con observaciones para corregir.',
  APR_IPI: 'La OAP aprobó la iniciativa «[INICIATIVA]» de [UNIDAD].',
  RCH_IPI: 'La OAP rechazó la iniciativa «[INICIATIVA]» de [UNIDAD]. Motivo: [MOTIVO]',
  'retractar-rechazo':
    'La OAP se retractó del rechazo de la iniciativa «[INICIATIVA]» de [UNIDAD]: vuelve a la unidad para corregirla y pasará otra vez por el Jefe y la OAP.',
};

/** Asunto de las notificaciones de iniciativas. */
export const ASUNTO_NOTIFICACION = 'Iniciativas de inversión';

/** Destinatarios de las notificaciones: cargos (Parámetros) de la unidad de la iniciativa y de Planeación, como en Formulación. */
export const CARGOS_NOTIFICACION = ['JO', 'AS_D', 'NR'];

/** Dependencia (Oikos) de Planeación, que recibe todas las notificaciones (la misma de Formulación y Seguimiento). */
export const DEPENDENCIA_PLANEACION = '11';

/** Veredictos de la OAP sobre un submódulo, con el texto del seleccionable. */
export const VEREDICTOS: { valor: Veredicto; etiqueta: string }[] = [
  { valor: 'aprobado', etiqueta: 'Aprobado' },
  { valor: 'con_observaciones', etiqueta: 'Con observaciones' },
];
