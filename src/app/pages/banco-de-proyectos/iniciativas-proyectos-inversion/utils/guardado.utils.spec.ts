import { Subject, throwError } from 'rxjs';
import { GuardadoEnCola } from './guardado.utils';

describe('GuardadoEnCola', () => {
  let respuestas: Subject<void>[];
  let fallas: any[];
  let cola: GuardadoEnCola;

  /** Cada guardado queda abierto hasta que la prueba lo responde. */
  function responder(posicion: number): void {
    respuestas[posicion].next();
    respuestas[posicion].complete();
  }

  beforeEach(() => {
    respuestas = [];
    fallas = [];
    cola = new GuardadoEnCola(
      () => {
        const respuesta = new Subject<void>();
        respuestas.push(respuesta);
        return respuesta;
      },
      (error) => fallas.push(error),
    );
  });

  it('guarda de una vez y queda libre al responder', () => {
    cola.pedir();

    expect(respuestas.length).toBe(1);
    expect(cola.ocupado).toBeTrue();
    responder(0);
    expect(cola.ocupado).toBeFalse();
  });

  it('lo que se pide mientras guarda se junta en un solo guardado más, después del primero', () => {
    cola.pedir();
    cola.pedir();
    cola.pedir();

    expect(respuestas.length).toBe(1);
    responder(0);
    expect(respuestas.length).toBe(2);
    responder(1);
    expect(respuestas.length).toBe(2);
    expect(cola.ocupado).toBeFalse();
  });

  it('si falla, avisa y descarta el guardado que estaba pedido', () => {
    cola.pedir();
    cola.pedir();
    respuestas[0].error({ status: 409 });

    expect(fallas).toEqual([{ status: 409 }]);
    expect(respuestas.length).toBe(1);
    expect(cola.ocupado).toBeFalse();
  });

  it('un guardado que falla de inmediato también deja la cola libre', () => {
    const conFalla = new GuardadoEnCola(() => throwError({ status: 500 }), (error) => fallas.push(error));
    conFalla.pedir();

    expect(fallas).toEqual([{ status: 500 }]);
    expect(conFalla.ocupado).toBeFalse();
  });
});
