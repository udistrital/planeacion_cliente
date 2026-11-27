import { CambioDeEstado, mensajeDeNotificacion } from './notificaciones.utils';

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
});
