import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, Input } from '@angular/core';
import { Datos, NodoDefinicion } from '../../utils';
import {
  calcular,
  claseDe,
  ContextoFormulario,
  estructuraDeTabla,
  opcionesDeReferencia,
  OpcionReferencia,
  rutaCampo,
} from '../../utils/formulario.utils';

/**
 * Dibuja un nivel del formulario: cada nodo según su tipo. Es recursivo: los
 * grupos y las filas de los repetibles vuelven a usar este componente.
 *
 * Con `secciones` (nivel superior del submódulo) cada apartado va en un recuadro
 * con su nombre en el borde, como el resto de SISGPLAN; el título reemplaza la
 * etiqueta del campo. Los grupos van siempre en recuadro.
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
  /** Cada nodo en su sección con título (solo el nivel superior del submódulo). */
  @Input() secciones = false;

  readonly claseDe = claseDe;

  enSeccion(nodo: NodoDefinicion): boolean {
    return this.secciones || claseDe(nodo) === 'grupo';
  }

  /** Lista del nivel superior que el submódulo muestra como tabla jerárquica, si su forma cabe en una. */
  enTabla(nodo: NodoDefinicion): boolean {
    return !this.ruta && this.contexto.listasEnTabla.includes(nodo.dato.clave) && !!estructuraDeTabla(nodo);
  }

  /** La plantilla trae `required` como texto ("true"/"false") o booleano. */
  esObligatorio(nodo: NodoDefinicion): boolean {
    return coerceBooleanProperty(nodo.dato.required);
  }

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
