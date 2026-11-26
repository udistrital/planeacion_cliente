import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, HostBinding, Input } from '@angular/core';
import { Datos, NodoDefinicion } from '../../utils';
import {
  cadenaDeCatalogos,
  calcular,
  calcularNumero,
  claseDe,
  ContextoFormulario,
  esCalculoNumerico,
  esEspejoTraido,
  esGrupoFijo,
  estructuraDeDesglose,
  estructuraDeSubfilas,
  esVisible,
  formatearNumero,
  marcarCasilla,
  opcionesDeReferencia,
  OpcionReferencia,
  rutaCampo,
  seMuestraEnTabla,
  textoTraido,
} from '../../utils/formulario.utils';

/**
 * Dibuja un nivel del formulario: cada nodo según su tipo. Es recursivo: los
 * grupos y las filas de los repetibles vuelven a usar este componente.
 *
 * Con `secciones` (nivel superior del submódulo) cada apartado va en un recuadro con
 * título, que reemplaza la etiqueta del campo. Los grupos van siempre en recuadro. Si el
 * submódulo es de SUBMODULOS_PLEGABLES, los recuadros del nivel superior son paneles que se
 * pliegan: empiezan todos plegados y solo uno queda abierto.
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

  @HostBinding('class.campos--columnas')
  get conColumnas(): boolean {
    return this.enColumnas;
  }
  /** Si `datos` es una fila, la lista a la que pertenece: marcar una casilla única desmarca la de las demás. */
  @Input() filasHermanas: Datos[] = [];

  readonly claseDe = claseDe;

  /** Clave de la sección plegable abierta; null si están todas plegadas, como al entrar. */
  abierta: string | null = null;

  /** Las secciones del nivel superior se pliegan (SUBMODULOS_PLEGABLES). */
  get plegables(): boolean {
    return this.secciones && !!this.contexto && !!this.contexto.seccionesPlegables;
  }

  /**
   * Pliega la sección si es la abierta. Al abrir otra, el acordeón avisa el cierre de esta después
   * de la apertura de aquella, y `abierta` ya es la nueva.
   */
  alCerrar(nodo: NodoDefinicion): void {
    if (this.abierta === nodo.dato.clave) {
      this.abierta = null;
    }
  }

  /** La sección tiene errores en algún campo, para señalarla aunque esté plegada. */
  conErrores(nodo: NodoDefinicion): boolean {
    const ruta = this.rutaDe(nodo);
    return Object.keys(this.contexto.errores).some(
      (error) => error === ruta || error.startsWith(`${ruta}.`) || error.startsWith(`${ruta}[`),
    );
  }

  /** Ícono de la sección plegable (ICONOS_SECCIONES); vacío si no tiene. */
  iconoDe(nodo: NodoDefinicion): string {
    return (this.contexto.iconosSecciones || {})[nodo.dato.clave] || '';
  }

  /**
   * Lo último que se eligió en un grupo de catálogos (p. ej. los programas del plan), para verlo
   * con la sección plegada. Vacío si no se ha elegido nada. Mientras su catálogo carga, cuántos
   * hay seleccionados en lugar de los códigos internos (sin_codigo).
   */
  resumenDe(nodo: NodoDefinicion): string {
    const datos = this.datos[nodo.dato.clave];
    if (claseDe(nodo) !== 'grupo' || !datos) {
      return '';
    }
    const codigosDe = (campo: NodoDefinicion): string[] => [].concat(datos[campo.dato.clave] || []).filter((codigo) => !!codigo);
    const elegidos = (nodo.hijos || []).filter((campo) => claseDe(campo) === 'catalogo' && codigosDe(campo).length);
    const ultimo = elegidos[elegidos.length - 1];
    if (!ultimo) {
      return '';
    }
    const codigos = codigosDe(ultimo);
    const nombres = codigos.map((codigo) => this.contexto.nombreEnCatalogo(ultimo.dato.catalogo, codigo));
    if (ultimo.dato.sin_codigo && nombres.some((nombre, i) => nombre === codigos[i])) {
      return codigos.length === 1 ? '1 seleccionado' : `${codigos.length} seleccionados`;
    }
    return nombres.join('; ');
  }

  /** Si el campo aplica (solo_si) con los valores de este nivel. */
  visible(nodo: NodoDefinicion): boolean {
    return esVisible(nodo, this.datos);
  }

  enSeccion(nodo: NodoDefinicion): boolean {
    return this.secciones || claseDe(nodo) === 'grupo';
  }

  /**
   * Cómo se dibuja una lista:
   * - 'traida': espejo de solo lectura, todo traído de otro submódulo (el Presupuesto inicial).
   * - 'subfilas': espejo cuyos hijos son grupos, una subfila por grupo (el Cronograma).
   * - 'desglose': espejo con una lista interna que parte algunas filas en subfilas (Trazadores presupuestales).
   * - 'tabla': tabla editable, también jerárquica (seMuestraEnTabla).
   * - 'recuadros': tabla resumen y la fila seleccionada debajo (grupo repetible).
   */
  vistaDeLista(nodo: NodoDefinicion): 'traida' | 'subfilas' | 'desglose' | 'tabla' | 'recuadros' {
    if (esEspejoTraido(nodo)) {
      return 'traida';
    }
    if (estructuraDeSubfilas(nodo)) {
      return 'subfilas';
    }
    if (estructuraDeDesglose(nodo)) {
      return 'desglose';
    }
    return seMuestraEnTabla(nodo, this.contexto, !this.ruta) ? 'tabla' : 'recuadros';
  }

  /** Grupo de GRUPOS_EN_COLUMNAS: sus campos van en columnas. */
  grupoEnColumnas(grupo: NodoDefinicion): boolean {
    return (this.contexto.gruposEnColumnas || []).includes(grupo.dato.clave);
  }

  /** Grupo de textos fijos (el Plan Nacional de Desarrollo): va en una sola caja y no se pliega. */
  grupoFijo(grupo: NodoDefinicion): boolean {
    return esGrupoFijo(grupo);
  }

  /** Texto de un campo de un grupo fijo, p. ej. «22 - EDUCACIÓN». */
  textoFijo(campo: NodoDefinicion, grupo: NodoDefinicion): string {
    return calcular(campo, grupo.hijos, {}, this.contexto);
  }

  /** Grupo de GRUPOS_EN_ARBOL cuyos campos son catálogos encadenados: se elige en un árbol. */
  grupoEnArbol(grupo: NodoDefinicion): boolean {
    return (this.contexto.gruposEnArbol || []).includes(grupo.dato.clave) && !!cadenaDeCatalogos(grupo.hijos);
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
      return textoTraido(nodo.dato, this.filaOrigen, this.contexto);
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
    const opcion = this.opcionMarcada(nodo);
    return opcion ? opcion.etiqueta : '';
  }

  /** Segundo texto de la fila marcada (mostrar_detalle), p. ej. la descripción de la alternativa. */
  detalleMarcada(nodo: NodoDefinicion): string {
    const opcion = this.opcionMarcada(nodo);
    return (opcion && opcion.detalle) || '';
  }

  private opcionMarcada(nodo: NodoDefinicion): OpcionReferencia | undefined {
    return this.opcionesDe(nodo).find((candidata) => candidata.id === this.datos[nodo.dato.clave]);
  }
}
