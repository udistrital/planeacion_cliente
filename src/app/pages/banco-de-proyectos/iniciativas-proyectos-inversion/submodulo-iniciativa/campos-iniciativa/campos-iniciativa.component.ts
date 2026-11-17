import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, HostBinding, Input } from '@angular/core';
import { Datos, NodoDefinicion, VALOR_CASILLA_MARCADA, VALOR_CASILLA_SIN_MARCAR } from '../../utils';
import {
  calcular,
  calcularNumero,
  claseDe,
  ContextoFormulario,
  esCalculoNumerico,
  esGrupoDeCasillas,
  esVisible,
  formatearNumero,
  marcarCasilla,
  opcionesDeReferencia,
  OpcionReferencia,
  rutaCampo,
  seMuestraEnTabla,
  valorDeRuta,
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

  /** Los campos de este nivel van en columnas (grupo de GRUPOS_EN_COLUMNAS). */
  @Input() enColumnas = false;

  /** Con secciones, el contenedor deja poner secciones lado a lado (SECCIONES_LADO_A_LADO). */
  @HostBinding('class.campos--secciones')
  get conSecciones(): boolean {
    return this.secciones;
  }

  @HostBinding('class.campos--columnas')
  get conColumnas(): boolean {
    return this.enColumnas;
  }
  /** Si `datos` es una fila, la lista a la que pertenece: marcar una casilla única desmarca la de las demás. */
  @Input() filasHermanas: Datos[] = [];

  readonly claseDe = claseDe;

  /** Si el campo aplica (solo_si) con los valores de este nivel. */
  visible(nodo: NodoDefinicion): boolean {
    return esVisible(nodo, this.datos);
  }

  /** Sección del nivel superior que va al lado de otra (SECCIONES_LADO_A_LADO), p. ej. Sedes y Factores. */
  ladoALado(nodo: NodoDefinicion): boolean {
    return this.secciones && (this.contexto.seccionesLadoALado || []).includes(nodo.dato.clave);
  }

  enSeccion(nodo: NodoDefinicion): boolean {
    return this.secciones || claseDe(nodo) === 'grupo';
  }

  /** Lista que se dibuja como tabla (seMuestraEnTabla); las demás van en recuadros. */
  enTabla(nodo: NodoDefinicion): boolean {
    return seMuestraEnTabla(nodo, this.contexto, !this.ruta);
  }

  /** Grupo de GRUPOS_EN_COLUMNAS: sus campos van en columnas. */
  grupoEnColumnas(grupo: NodoDefinicion): boolean {
    return (this.contexto.gruposEnColumnas || []).includes(grupo.dato.clave);
  }

  /** Grupo de GRUPOS_EN_CASILLAS: se marcan solo los campos que aplican. */
  enCasillas(grupo: NodoDefinicion): boolean {
    return esGrupoDeCasillas(grupo, this.contexto);
  }

  marcada(grupo: NodoDefinicion, campo: NodoDefinicion): boolean {
    return this.datos[grupo.dato.clave][campo.dato.clave] === VALOR_CASILLA_MARCADA;
  }

  marcar(grupo: NodoDefinicion, campo: NodoDefinicion, marcada: boolean): void {
    this.datos[grupo.dato.clave][campo.dato.clave] = marcada ? VALOR_CASILLA_MARCADA : VALOR_CASILLA_SIN_MARCAR;
  }

  /** Errores de los campos del grupo de casillas: el mensaje ya trae el nombre del campo. */
  erroresDeCasillas(grupo: NodoDefinicion): string[] {
    const rutaGrupo = this.rutaDe(grupo);
    return (grupo.hijos || []).reduce(
      (todos, campo) => todos.concat(this.contexto.errores[rutaCampo(rutaGrupo, campo.dato.clave)] || []),
      [] as string[],
    );
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
    if (nodo.dato.desde) {
      const valor = valorDeRuta(nodo.dato.desde, this.contexto);
      return valor === undefined || valor === null ? '' : String(valor);
    }
    if (esCalculoNumerico(nodo)) {
      const valor = calcularNumero(nodo.dato, this.datos);
      return valor === null ? '' : formatearNumero(valor);
    }
    return calcular(nodo, this.nodos, this.datos, this.contexto);
  }

  cambiarCasilla(nodo: NodoDefinicion, marcada: boolean): void {
    marcarCasilla(this.filasHermanas, this.datos, nodo.dato, marcada);
  }

  opcionesDe(nodo: NodoDefinicion): OpcionReferencia[] {
    return opcionesDeReferencia(nodo.dato, this.filaOrigen, this.contexto);
  }

  /** Texto de la fila marcada que trae una referencia con marcada_en; vacío si no hay ninguna. */
  textoMarcada(nodo: NodoDefinicion): string {
    const opcion = this.opcionesDe(nodo).find((candidata) => candidata.id === this.datos[nodo.dato.clave]);
    return opcion ? opcion.etiqueta : '';
  }
}
