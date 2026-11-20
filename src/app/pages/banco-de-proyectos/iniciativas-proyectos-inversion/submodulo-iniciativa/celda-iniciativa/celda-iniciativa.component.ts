import { Component, Input } from '@angular/core';
import { Datos, NodoDefinicion } from '../../utils';
import {
  calcularNumero,
  claseDe,
  ContextoFormulario,
  esExigido,
  formatearNumero,
  marcarCasilla,
  OpcionReferencia,
  opcionesDeReferencia,
  rutaCampo,
  textoTraido,
} from '../../utils/formulario.utils';

/**
 * Un campo editado dentro de una celda de tabla, según su tipo: texto, número, catálogo, casilla o
 * referencia; el calculado numérico (p. ej. el déficit) y el traído de la fila de origen (p. ej. el
 * costo de un año en el Cronograma) solo se muestran. El error del servidor queda debajo. La usan
 * la tabla jerárquica, la de subfilas y la de documentos.
 *
 * El texto cerrado muestra hasta cuatro líneas; al escribir se abre completo y «Ver todo» lo
 * deja abierto (también en solo lectura).
 */
@Component({
  selector: 'app-celda-iniciativa',
  templateUrl: './celda-iniciativa.component.html',
  styleUrls: ['./celda-iniciativa.component.scss'],
})
export class CeldaIniciativaComponent {
  @Input() fila: Datos;
  /** Lista a la que pertenece la fila: marcar una casilla única desmarca la de las demás. */
  @Input() filas: Datos[] = [];
  @Input() campo: NodoDefinicion;
  /** Ruta de la fila; la del campo se arma con su clave. */
  @Input() ruta = '';
  /** Número de la fila (1, 1.2…), para el nombre accesible del campo. */
  @Input() numero = '';
  @Input() contexto: ContextoFormulario;
  /** Texto en negrita, p. ej. el primer nivel de la tabla jerárquica. */
  @Input() resaltada = false;
  /** Texto de la celda vacía; si falta, si el campo es obligatorio u opcional. */
  @Input() textoVacio = '';
  /** Fila de origen del espejo: de ella salen los valores traídos ("origen.*") y obligatorio_si. */
  @Input() filaOrigen: Datos | null = null;

  readonly claseDe = claseDe;
  /** El usuario dejó el texto abierto con «Ver todo». */
  abierta = false;

  get etiqueta(): string {
    return `${this.campo.nombre} ${this.numero}`.trim();
  }

  get errores(): string[] {
    return this.contexto.errores[rutaCampo(this.ruta, this.campo.dato.clave)] || [];
  }

  /** Obligatorio por la plantilla o, con obligatorio_si, por la fila de origen (p. ej. un año con costo). */
  get esObligatorio(): boolean {
    return esExigido(this.campo.dato, this.filaOrigen);
  }

  /** Texto de la celda vacía: el que se pidió o, si no, si el campo es obligatorio u opcional. */
  get marca(): string {
    return this.textoVacio || (this.esObligatorio ? 'Obligatorio' : 'Opcional');
  }

  /** Valor del calculado: el traído (desde) o el numérico con los campos de la fila; vacío si falta. */
  get calculado(): string {
    if (this.campo.dato.desde) {
      return textoTraido(this.campo.dato, this.filaOrigen, this.contexto);
    }
    const valor = calcularNumero(this.campo.dato, this.fila);
    return valor === null ? '' : formatearNumero(valor);
  }

  /** Lo que muestra el calculado sin valor: el traído no tiene nada que calcular. */
  get calculadoVacio(): string {
    return this.campo.dato.desde ? '—' : 'Se calcula';
  }

  /** Opciones de una referencia (p. ej. los objetivos específicos), en el orden de su lista. */
  get opciones(): OpcionReferencia[] {
    return opcionesDeReferencia(this.campo.dato, this.filaOrigen, this.contexto);
  }

  /** Texto completo de la opción elegida en una referencia: la celda lo corta y la ayuda lo muestra. */
  get textoReferencia(): string {
    const elegida = this.opciones.find((opcion) => opcion.id === this.fila[this.campo.dato.clave]);
    return elegida ? elegida.etiqueta : '';
  }

  porId(_: number, opcion: OpcionReferencia): string {
    return opcion.id;
  }

  marcar(marcada: boolean): void {
    marcarCasilla(this.filas, this.fila, this.campo.dato, marcada);
  }

  /** El texto no cabe en las líneas que muestra la celda cerrada. */
  estaCortada(area: HTMLTextAreaElement): boolean {
    return area.scrollHeight > area.clientHeight + 1;
  }
}
