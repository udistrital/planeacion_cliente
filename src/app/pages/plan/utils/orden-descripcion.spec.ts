import { asignarOrdenDescripcion, limpiarOrdenDescripcion, obtenerOrdenDescripcion } from './orden-descripcion';

describe('orden en descripción', () => {
  it('agrega un marcador sin modificar el texto visible', () => {
    const descripcion = asignarOrdenDescripcion('Descripción visible', 3);
    expect(descripcion).toBe('Descripción visible [[orden:0003]]');
    expect(limpiarOrdenDescripcion(descripcion)).toBe('Descripción visible');
    expect(obtenerOrdenDescripcion(descripcion)).toBe(3);
  });

  it('reemplaza el marcador existente', () => {
    const descripcion = asignarOrdenDescripcion('Texto [[orden:0008]]', 1);
    expect(descripcion).toBe('Texto [[orden:0001]]');
  });
});
