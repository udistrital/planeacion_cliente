import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, Input } from '@angular/core';
import { Datos, NodoDefinicion } from '../../utils';
import { calcularNumero, claseDe, ContextoFormulario, formatearNumero, marcarCasilla, rutaCampo } from '../../utils/formulario.utils';

/**
 * Un campo editado dentro de una celda de tabla, según su tipo: texto, número, opciones,
 * catálogo o casilla; el calculado numérico (p. ej. el déficit) solo se muestra. El error del
 * servidor queda debajo. La usan la tabla jerárquica y la de documentos.
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

  readonly claseDe = claseDe;
  /** El usuario dejó el texto abierto con «Ver todo». */
  abierta = false;

  get etiqueta(): string {
    return `${this.campo.nombre} ${this.numero}`.trim();
  }

  get errores(): string[] {
    return this.contexto.errores[rutaCampo(this.ruta, this.campo.dato.clave)] || [];
  }

  get esObligatorio(): boolean {
    return coerceBooleanProperty(this.campo.dato.required);
  }

  /** Texto de la celda vacía: el que se pidió o, si no, si el campo es obligatorio u opcional. */
  get marca(): string {
    return this.textoVacio || (this.esObligatorio ? 'Obligatorio' : 'Opcional');
  }

  /** Valor del calculado numérico con los campos de la fila; vacío si falta alguno. */
  get calculado(): string {
    const valor = calcularNumero(this.campo.dato, this.fila);
    return valor === null ? '' : formatearNumero(valor);
  }

  marcar(marcada: boolean): void {
    marcarCasilla(this.filas, this.fila, this.campo.dato, marcada);
  }

  /** El texto no cabe en las líneas que muestra la celda cerrada. */
  estaCortada(area: HTMLTextAreaElement): boolean {
    return area.scrollHeight > area.clientHeight + 1;
  }
}
