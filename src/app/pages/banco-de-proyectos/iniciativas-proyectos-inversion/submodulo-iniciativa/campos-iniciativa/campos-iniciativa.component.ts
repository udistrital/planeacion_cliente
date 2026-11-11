import { Component, Input } from '@angular/core';
import { Datos, NodoDefinicion } from '../../utils';
import {
  calcular,
  claseDe,
  ContextoFormulario,
  opcionesDeReferencia,
  OpcionReferencia,
  rutaCampo,
} from '../../utils/formulario.utils';

/**
 * Dibuja un nivel del formulario: cada nodo según su tipo. Es recursivo: los
 * grupos y las filas de los repetibles vuelven a usar este componente.
 */
@Component({
  selector: 'app-campos-iniciativa',
  templateUrl: './campos-iniciativa.component.html',
  styleUrls: ['./campos-iniciativa.component.scss'],
})
export class CamposIniciativaComponent {
  @Input() nodos: NodoDefinicion[] = [];
  @Input() datos: Datos = {};
  @Input() ruta = '';
  @Input() contexto: ContextoFormulario;
  /** Fila de origen del espejo más cercano (para referencias "origen.*"). */
  @Input() filaOrigen: Datos | null = null;

  readonly claseDe = claseDe;

  porClave(_: number, nodo: NodoDefinicion): string {
    return nodo.dato.clave || nodo.id;
  }

  porId(_: number, opcion: OpcionReferencia): string {
    return opcion.id;
  }

  rutaDe(nodo: NodoDefinicion): string {
    return rutaCampo(this.ruta, nodo.dato.clave);
  }

  erroresDe(nodo: NodoDefinicion): string[] {
    return this.contexto.errores[this.rutaDe(nodo)] || [];
  }

  calculado(nodo: NodoDefinicion): string {
    return calcular(nodo, this.nodos, this.datos, this.contexto);
  }

  opcionesDe(nodo: NodoDefinicion): OpcionReferencia[] {
    return opcionesDeReferencia(nodo.dato, this.filaOrigen, this.contexto);
  }
}
