import { Component, Input, OnChanges } from '@angular/core';
import { Datos, ElementoClave, GrupoColumnas, NodoDefinicion } from '../../utils';
import { columnasDe, ContextoFormulario, rutaCampo, totalColumna, totalFila } from '../../utils/formulario.utils';

/** Matriz numérica (p. ej. población por grupo de edad y característica) con totales. */
@Component({
  selector: 'app-campo-matriz-iniciativa',
  templateUrl: './campo-matriz-iniciativa.component.html',
  styleUrls: ['./campo-matriz-iniciativa.component.scss'],
})
export class CampoMatrizIniciativaComponent implements OnChanges {
  @Input() nodo: NodoDefinicion;
  /** { fila: { columna: número } }, ya preparado con todas las filas. */
  @Input() matriz: Datos = {};
  @Input() ruta = '';
  @Input() contexto: ContextoFormulario;
  /** Falso cuando la matriz va sola en una sección cuyo título ya la nombra. */
  @Input() conTitulo = true;

  filas: ElementoClave[] = [];
  grupos: GrupoColumnas[] = [];
  columnas: ElementoClave[] = [];
  private clavesColumnas: string[] = [];

  ngOnChanges(): void {
    this.filas = this.nodo.dato.filas || [];
    this.grupos = this.nodo.dato.grupos_columnas || [];
    this.columnas = this.grupos.reduce((todas, grupo) => todas.concat(grupo.columnas), [] as ElementoClave[]);
    this.clavesColumnas = columnasDe(this.nodo.dato);
  }

  get conTotalesPorFila(): boolean {
    return !!(this.nodo.dato.totales && this.nodo.dato.totales.filas);
  }

  get conTotalesPorColumna(): boolean {
    return !!(this.nodo.dato.totales && this.nodo.dato.totales.columnas);
  }

  totalDeFila(fila: string): number {
    return totalFila(this.matriz, fila, this.clavesColumnas);
  }

  totalDeColumna(columna: string): number {
    return totalColumna(this.matriz, this.filas.map((fila) => fila.clave), columna);
  }

  totalGeneral(): number {
    return this.filas.reduce((suma, fila) => suma + this.totalDeFila(fila.clave), 0);
  }

  tieneError(fila: string, columna: string): boolean {
    return !!this.contexto.errores[rutaCampo(rutaCampo(this.ruta, fila), columna)];
  }

  /** Bloquea las teclas que el input number acepta pero que no caben en un entero no negativo. */
  bloquearTecla(evento: KeyboardEvent): void {
    if (['-', '+', 'e', 'E', '.', ','].includes(evento.key)) {
      evento.preventDefault();
    }
  }

  /**
   * Pega un entero no negativo en la celda y reemplaza lo que tenga; cualquier otro texto se ignora.
   * Quita los espacios y el salto de línea que Excel agrega al copiar una celda.
   */
  pegar(evento: ClipboardEvent, fila: string, columna: string): void {
    evento.preventDefault();
    const texto = (evento.clipboardData?.getData('text') ?? '').trim();
    if (/^\d+$/.test(texto)) {
      this.matriz[fila][columna] = Number(texto);
    }
  }
}
