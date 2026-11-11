import { BehaviorSubject, forkJoin } from 'rxjs';
import { IniciativaService } from './iniciativa.service';

describe('IniciativaService', () => {
  // Igual que RequestManager: cada petición se monta sobre un BehaviorSubject,
  // así que emite la respuesta pero nunca se completa.
  const sinCompletar = (data: any) => new BehaviorSubject({ Success: true, Status: '200', Message: 'Successful', Data: data });
  const request = {
    get: (base: string, ruta: string) => sinCompletar({ ruta }),
    post: () => sinCompletar({ id: 'creado' }),
    put: (base: string, ruta: string, cuerpo: any, id: string) => sinCompletar({ ruta, id }),
  };
  const usuario = { user$: new BehaviorSubject({ userService: { documento: '1020' } }) };
  const servicio = new IniciativaService(request as any, usuario as any);

  it('completa cada petición para que forkJoin pueda combinarlas', () => {
    let resultado: any;
    forkJoin({ resumen: servicio.resumen('p1'), submodulo: servicio.submodulo('p1', 'nombre') }).subscribe((r) => (resultado = r));

    expect(resultado).toEqual({
      resumen: { ruta: 'iniciativa-inversion/iniciativas/p1' },
      submodulo: { ruta: 'iniciativa-inversion/iniciativas/p1/submodulos/nombre' },
    });
  });

  it('pide las unidades al mid con el documento del usuario', () => {
    let unidades: any;
    servicio.unidadesDelUsuario().subscribe((r) => (unidades = r));

    expect(unidades).toEqual({ ruta: 'iniciativa-inversion/unidades/1020' });
  });

  it('devuelve el Data del sobre en las escrituras y usa la clave como último segmento', () => {
    let guardada: any;
    servicio.guardarSubmodulo('p1', 'problematica', 3, {}).subscribe((r) => (guardada = r));

    expect(guardada).toEqual({ ruta: 'iniciativa-inversion/iniciativas/p1/submodulos', id: 'problematica' });
  });

  it('marca el submódulo como revisado en /submodulos/:clave/revision', () => {
    let revisada: any;
    servicio.marcarSinObservaciones('p1', 'nombre', 2).subscribe((r) => (revisada = r));

    expect(revisada).toEqual({ ruta: 'iniciativa-inversion/iniciativas/p1/submodulos/nombre', id: 'revision' });
  });
});
