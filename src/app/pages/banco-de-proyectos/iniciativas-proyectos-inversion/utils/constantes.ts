import { AccionIniciativa, AccionSubmodulo, DescripcionAccion, DescripcionAccionSubmodulo } from './iniciativa.models';

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
