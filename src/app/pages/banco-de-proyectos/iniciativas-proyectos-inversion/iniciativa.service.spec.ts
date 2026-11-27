import { BehaviorSubject, forkJoin } from 'rxjs';
import { IniciativaService } from './iniciativa.service';

describe('IniciativaService', () => {
  // Igual que RequestManager: cada petición se monta sobre un BehaviorSubject,
  // así que emite la respuesta pero nunca se completa.
  const sinCompletar = (data: any) => new BehaviorSubject({ Success: true, Status: '200', Message: 'Successful', Data: data });
  const request = {
    get: (base: string, ruta: string) => sinCompletar({ ruta }),
    post: (base: string, ruta: string, cuerpo: any) => sinCompletar({ ruta, cuerpo }),
    put: (base: string, ruta: string, cuerpo: any, id: string) => sinCompletar({ ruta, id, cuerpo }),
  };
  const autenticacion = {
    getRole: () => Promise.resolve(['JEFE_DEPENDENCIA', 'ASISTENTE_PLANEACION']),
    getDocument: () => Promise.resolve('1020'),
  };
  const actor = { usuario: '1020', roles: ['JEFE_DEPENDENCIA', 'ASISTENTE_PLANEACION'] };
  let servicio: IniciativaService;

  beforeEach(() => {
    servicio = new IniciativaService(request as any, autenticacion as any);
  });

  it('completa cada petición para que forkJoin pueda combinarlas, con el actor en la consulta', async () => {
    const resultado = await forkJoin({ resumen: servicio.resumen('p1'), submodulo: servicio.submodulo('p1', 'nombre') }).toPromise();

    expect(resultado).toEqual({
      resumen: { ruta: 'iniciativa-inversion/iniciativas/p1?usuario=1020&roles=JEFE_DEPENDENCIA%2CASISTENTE_PLANEACION' },
      submodulo: { ruta: 'iniciativa-inversion/iniciativas/p1/submodulos/nombre' },
    } as any);
  });

  it('pide las unidades al mid con el documento del usuario', async () => {
    expect(await servicio.unidadesDelUsuario().toPromise()).toEqual({ ruta: 'iniciativa-inversion/unidades/1020' } as any);
  });

  it('manda el actor en el cuerpo de las escrituras y usa el último segmento de la ruta como id', async () => {
    const guardada: any = await servicio.guardarSubmodulo('p1', 'problematica', 3, {}).toPromise();

    expect(guardada).toEqual({
      ruta: 'iniciativa-inversion/iniciativas/p1/submodulos',
      id: 'problematica',
      cuerpo: { version: 3, datos: {}, ...actor },
    });
  });

  it('sube un documento en /submodulos/:clave/documentos con la ruta del campo, el nombre, el archivo y el actor', async () => {
    const solicitud = { clave: 'otros_anexos.archivo', nombre: 'cotizacion.pdf', archivo: 'JVBERi0=' };
    const referencia: any = await servicio.subirDocumento('p1', 'anexos', solicitud).toPromise();

    expect(referencia).toEqual({
      ruta: 'iniciativa-inversion/iniciativas/p1/submodulos/anexos/documentos',
      cuerpo: { ...solicitud, ...actor },
    });
  });

  it('aprueba el submódulo en /submodulos/:clave/revision', async () => {
    const aprobada: any = await servicio.aprobarSubmodulo('p1', 'nombre', 2).toPromise();

    expect(aprobada).toEqual({
      ruta: 'iniciativa-inversion/iniciativas/p1/submodulos/nombre',
      id: 'revision',
      cuerpo: { version: 2, ...actor },
    });
  });

  it('ejecuta una acción en /acciones/:accion, con el motivo solo si lo hay', async () => {
    const rechazo: any = await servicio.ejecutarAccion('p1', 'rechazar', 'No cumple.').toPromise();
    const retractacion: any = await servicio.ejecutarAccion('p1', 'retractar-rechazo').toPromise();

    expect(rechazo).toEqual({
      ruta: 'iniciativa-inversion/iniciativas/p1/acciones',
      id: 'rechazar',
      cuerpo: { motivo: 'No cumple.', ...actor },
    });
    expect(retractacion.cuerpo).toEqual(actor);
  });
});
