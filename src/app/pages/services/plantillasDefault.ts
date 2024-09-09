export const plantillasDefault: any = [
  {
    nombre: 'Notificación SISGPLAN - F',
    descripcion: 'Notificación SISGPLAN, modulo de Formulación',
    codigo_abreviacion: 'F',
    plantilla_mensaje:
      'El asistente de [NOMBRE UNIDAD] ha comenzado la formulación del plan [NOMBRE PLAN] para la vigencia [VIGENCIA]. El plan se encuentra en estado En Formulación.',
    metadatos: {
      destinatarios: ['jefe unidad'],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - FEF',
    descripcion: 'Notificación SISGPLAN, modulo de Formulación',
    codigo_abreviacion: 'FEF',
    plantilla_mensaje:
      'El asistente de [NOMBRE UNIDAD] ha finalizado la formulación del plan [NOMBRE PLAN] de la vigencia [VIGENCIA]. El plan se encuentra en estado Formulado.',
    metadatos: {
      destinatarios: ['jefe unidad'],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - FF',
    descripcion: 'Notificación SISGPLAN, modulo de Formulación',
    codigo_abreviacion: 'FF',
    plantilla_mensaje:
      'El asistente de planeación ha comenzado la revision del plan [NOMBRE PLAN] en la unidad [NOMBRE UNIDAD] para la vigencia [VIGENCIA]. El plan se encuentra en estado En Revisión.',
    metadatos: {
      destinatarios: ['asistente unidad', 'jefe unidad'],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - FER',
    descripcion: 'Notificación SISGPLAN, modulo de Formulación',
    codigo_abreviacion: 'FER',
    plantilla_mensaje:
      'El asistente de planeación ha finalizado la revisión del plan [NOMBRE PLAN] en la unidad [NOMBRE UNIDAD] para la vigencia [VIGENCIA]. El plan se encuentra en estado Revisado.',
    metadatos: {
      destinatarios: ['asistente unidad', 'jefe unidad'],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - FR1',
    descripcion: 'Notificación SISGPLAN, modulo de Formulación',
    codigo_abreviacion: 'FR1',
    plantilla_mensaje:
      'El jefe de unidad ha finalizado la revisión; rechazando y asignando observaciones en el proceso de formulación del plan [NOMBRE PLAN] en la unidad [NOMBRE UNIDAD] para la vigencia [VIGENCIA]. El plan se encuentra en estado En Formulación.',
    metadatos: {
      destinatarios: [
        'asistente unidad',
        'asistente planeacion',
        'jefe planeacion',
      ],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - FR2',
    descripcion: 'Notificación SISGPLAN, modulo de Formulación',
    codigo_abreviacion: 'FR2',
    plantilla_mensaje:
      'El jefe de [NOMBRE UNIDAD] ha realizado la verificación de la formulación para el plan [NOMBRE PLAN] en la vigencia [VIGENCIA]. El plan se encuentra en estado Revisión Verificada.',
    metadatos: {
      destinatarios: [
        'asistente unidad',
        'asistente planeacion',
        'jefe planeacion',
      ],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - FV',
    descripcion: 'Notificación SISGPLAN, modulo de Formulación',
    codigo_abreviacion: 'FV',
    plantilla_mensaje:
      'El jefe de planeación ha finalizado la revisión; aceptando la formulación y asignando pre aval para el plan [NOMBRE PLAN] de la unidad [NOMBRE UNIDAD] en la vigencia [VIGENCIA]. El plan se encuentra en estado Pre Aval.',
    metadatos: {
      destinatarios: ['asistente unidad', 'jefe unidad'],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - FPA1',
    descripcion: 'Notificación SISGPLAN, modulo de Formulación',
    codigo_abreviacion: 'FPA1',
    plantilla_mensaje:
      'El Jefe de planeación ha finalizado la revisión; rechazando y asignando observaciones en el proceso de formulación del plan [NOMBRE PLAN] de la unidad [NOMBRE UNIDAD] en la vigencia [VIGENCIA]. El plan se encuentra en estado En Formulación.',
    metadatos: {
      destinatarios: [
        'asistente unidad',
        'jefe unidad',
        'asistente planeacion',
      ],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - FPA2',
    descripcion: 'Notificación SISGPLAN, modulo de Formulación',
    codigo_abreviacion: 'FPA2',
    plantilla_mensaje:
      'El jefe de planeación ha finalizado la revisión; aceptando la formulación y asignando aval para el plan [NOMBRE PLAN] de la unidad [NOMBRE UNIDAD] en la vigencia [VIGENCIA]. El plan se encuentra en estado Avalado.',
    metadatos: {
      destinatarios: [
        'asistente unidad',
        'jefe unidad',
        'asistente planeacion',
      ],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - FS',
    descripcion: 'Notificación SISGPLAN, modulo de Formulación',
    codigo_abreviacion: 'FS',
    plantilla_mensaje:
      'El jefe de planeación ha finalizado la revisión; aceptando la formulación y asignando aval para el plan [NOMBRE PLAN] de la unidad [NOMBRE UNIDAD] en la vigencia [VIGENCIA]. El plan se encuentra en estado Habilitado.',
    metadatos: {
      destinatarios: [
        'asistente unidad',
        'jefe unidad',
        'asistente planeacion',
      ],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - SH',
    descripcion: 'Notificación SISGPLAN, modulo de Seguimiento',
    codigo_abreviacion: 'SH',
    plantilla_mensaje:
      'El asistente de [NOMBRE UNIDAD] ha generado el reporte de seguimiento del plan [NOMBRE PLAN] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado En reporte.',
    metadatos: {
      destinatarios: ['jefe unidad'],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - SER',
    descripcion: 'Notificación SISGPLAN, modulo de Seguimiento',
    codigo_abreviacion: 'SER',
    plantilla_mensaje:
      'El jefe de [NOMBRE UNIDAD] ha enviado a revisión el plan [NOMBRE PLAN] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado Enviado a revisión.',
    metadatos: {
      destinatarios: ['asistente unidad', 'asistente planeacion'],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - SEAR',
    descripcion: 'Notificación SISGPLAN, modulo de Seguimiento',
    codigo_abreviacion: 'SEAR',
    plantilla_mensaje:
      'El jefe de [NOMBRE UNIDAD] ha iniciado la revisión del plan [NOMBRE PLAN] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado En revisión JU.',
    metadatos: {
      destinatarios: ['asistente unidad', 'asistente planeacion'],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - SERJU1',
    descripcion: 'Notificación SISGPLAN, modulo de Seguimiento',
    codigo_abreviacion: 'SERJU1',
    plantilla_mensaje:
      'El jefe de [NOMBRE UNIDAD] ha finalizado la revisión rechazando el seguimiento del plan [NOMBRE PLAN] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado Revisión Verificada con Observaciones.',
    metadatos: {
      destinatarios: ['asistente unidad', 'asistente planeacion'],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - SERJU2',
    descripcion: 'Notificación SISGPLAN, modulo de Seguimiento',
    codigo_abreviacion: 'SERJU2',
    plantilla_mensaje:
      'El jefe de [NOMBRE UNIDAD] ha finalizado la revisión aceptando el seguimiento del plan [NOMBRE PLAN] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado Revisión Verificada.',
    metadatos: {
      destinatarios: [
        'asistente unidad',
        'asistente planeacion',
        'jefe planeacion',
      ],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - SRVCO',
    descripcion: 'Notificación SISGPLAN, modulo de Seguimiento',
    codigo_abreviacion: 'SRVCO',
    plantilla_mensaje:
      'El asistente de [NOMBRE UNIDAD] ha generado el reporte de seguimiento del plan [NOMBRE PLAN] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado En reporte.',
    metadatos: {
      destinatarios: ['jefe unidad', 'asistente planeacion'],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - SRV',
    descripcion: 'Notificación SISGPLAN, modulo de Seguimiento',
    codigo_abreviacion: 'SRV',
    plantilla_mensaje:
      'El asistente de planeación ha finalizado la verificación del plan [NOMBRE PLAN] en la unidad [NOMBRE UNIDAD] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado En Revisión OAPC.',
    metadatos: {
      destinatarios: [
        'asistente unidad',
        'asistente planeacion',
        'jefe planeacion',
      ],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - SEROAPC1',
    descripcion: 'Notificación SISGPLAN, modulo de Seguimiento',
    codigo_abreviacion: 'SEROAPC1',
    plantilla_mensaje:
      'El jefe de planeación ha finalizado la revisión; devolviendo y asignando observaciones al seguimiento del plan [NOMBRE PLAN] en la unidad [NOMBRE UNIDAD] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado Con observaciones.',
    metadatos: {
      destinatarios: [
        'asistente unidad',
        'asistente planeacion',
        'jefe planeacion',
      ],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - SEROAPC2',
    descripcion: 'Notificación SISGPLAN, modulo de Seguimiento',
    codigo_abreviacion: 'SEROAPC2',
    plantilla_mensaje:
      'El jefe de planeación ha finalizado la revisión; aceptando el seguimiento para el plan [NOMBRE PLAN] en la unidad [NOMBRE UNIDAD] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado Reporte Avalado.',
    metadatos: {
      destinatarios: [
        'asistente unidad',
        'asistente planeacion',
        'jefe planeacion',
      ],
    },
  },
  {
    nombre: 'Notificación SISGPLAN - SCO',
    descripcion: 'Notificación SISGPLAN, modulo de Seguimiento',
    codigo_abreviacion: 'SCO',
    plantilla_mensaje:
      'El asistente de [NOMBRE UNIDAD] ha generado el reporte de seguimiento del plan [NOMBRE PLAN] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado En reporte.',
    metadatos: {
      destinatarios: ['jefe unidad'],
    },
  },
];
