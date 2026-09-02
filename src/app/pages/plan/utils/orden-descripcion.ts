const PATRON_ORDEN = /\s*\[\[orden:(\d+)\]\]\s*$/i;

export function obtenerOrdenDescripcion(descripcion: string): number | undefined {
  const coincidencia = String(descripcion || '').match(PATRON_ORDEN);
  return coincidencia ? Number(coincidencia[1]) : undefined;
}

export function limpiarOrdenDescripcion(descripcion: string): string {
  return String(descripcion || '').replace(PATRON_ORDEN, '').trim();
}

export function asignarOrdenDescripcion(descripcion: string, orden: number): string {
  const texto = limpiarOrdenDescripcion(descripcion);
  const marcador = `[[orden:${String(orden).padStart(4, '0')}]]`;
  return texto ? `${texto} ${marcador}` : marcador;
}
