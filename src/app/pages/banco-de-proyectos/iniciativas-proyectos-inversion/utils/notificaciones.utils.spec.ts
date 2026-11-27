import { CambioDeEstado, correosDestino, datosDeCorreo, documentosDestino, mensajeDeNotificacion, notificacionDe } from './notificaciones.utils';

describe('notificaciones.utils', () => {
  const cambio = (estado: string, extra: Partial<CambioDeEstado> = {}): CambioDeEstado => ({
    iniciativaId: 'p1',
    nombre: 'Laboratorio de datos',
    dependenciaId: '41',
    estado,
    ...extra,
  });

  it('arma el texto con la iniciativa y la unidad', () => {
    expect(mensajeDeNotificacion(cambio('PA_IPI'), 'BIENESTAR')).toBe(
      'La iniciativa «Laboratorio de datos» de BIENESTAR fue enviada al Jefe de la unidad para su aprobación.',
    );
  });

  it('el rechazo lleva el motivo y la retractación tiene su propio texto', () => {
    expect(mensajeDeNotificacion(cambio('RCH_IPI', { accion: 'rechazar', motivo: ' No es de inversión. ' }), 'BIENESTAR')).toContain(
      'Motivo: No es de inversión.',
    );
    expect(mensajeDeNotificacion(cambio('PC_IPI', { accion: 'retractar-rechazo' }), 'BIENESTAR')).toContain('se retractó del rechazo');
    expect(mensajeDeNotificacion(cambio('PC_IPI', { accion: 'devolver' }), 'BIENESTAR')).toContain('devuelta con observaciones');
  });

  it('sin nombre de unidad dice «la unidad», y los estados sin texto no se notifican', () => {
    expect(mensajeDeNotificacion(cambio('APR_IPI'), '')).toBe('La OAP aprobó la iniciativa «Laboratorio de datos» de la unidad.');
    expect(mensajeDeNotificacion(cambio('EF_IPI'), 'BIENESTAR')).toBeNull();
  });

  it('cada aviso tiene su plantilla de correo; la retractación, la suya aunque llegue a Por corregir', () => {
    expect(notificacionDe(cambio('PA_IPI')).correo).toBe('IPA');
    expect(notificacionDe(cambio('PC_IPI', { accion: 'devolver' })).correo).toBe('IPC');
    expect(notificacionDe(cambio('PC_IPI', { accion: 'retractar-rechazo' })).correo).toBe('IRR');
    expect(notificacionDe(cambio('EF_IPI'))).toBeNull();
  });

  it('el correo lleva la iniciativa, la unidad y el motivo', () => {
    expect(datosDeCorreo(cambio('RCH_IPI', { motivo: ' No es de inversión. ' }), '')).toEqual({
      NOMBRE_INICIATIVA: 'Laboratorio de datos',
      NOMBRE_UNIDAD: 'la unidad',
      MOTIVO: 'No es de inversión.',
    });
  });

  it('con correo de pruebas va solo a él; sin él, a los destinatarios desplegado y a nadie en local', () => {
    const destinatarios = ['jefe@udistrital.edu.co', 'asistente@udistrital.edu.co'];
    expect(correosDestino(destinatarios, ' pruebas@correo.com ', true)).toEqual(['pruebas@correo.com']);
    expect(correosDestino([], 'pruebas@correo.com', false)).toEqual(['pruebas@correo.com']);
    expect(correosDestino(destinatarios, '', true)).toEqual(destinatarios);
    expect(correosDestino(destinatarios, '', false)).toEqual([]);
  });

  it('la notificación en el sistema, con correo de pruebas o en local, va solo a quien hizo el cambio; desplegado sin él, a los destinatarios', () => {
    const destinatarios = ['1010', '2020'];
    expect(documentosDestino(destinatarios, ' 3030 ', 'pruebas@correo.com', true)).toEqual(['3030']);
    expect(documentosDestino(destinatarios, '3030', '', false)).toEqual(['3030']);
    expect(documentosDestino(destinatarios, '3030', '', true)).toEqual(destinatarios);
    expect(documentosDestino(destinatarios, '', 'pruebas@correo.com', true)).toEqual([]);
  });
});
