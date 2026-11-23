import { Component, Input, OnChanges } from '@angular/core';
import { Datos, NodoDefinicion } from '../../utils';
import {
  ColumnaSubfilas,
  ContextoFormulario,
  EstructuraSubfilas,
  estructuraDeSubfilas,
  filasDeRuta,
  numeroDeFila,
  numerosDeLista,
  rutaCampo,
  rutaFila,
  textoDeFila,
} from '../../utils/formulario.utils';

const SIN_ESTRUCTURA: EstructuraSubfilas = { subfilas: [], columnas: [] };

/** Anchos mínimos (px) para que la tabla se desplace en pantallas angostas en vez de apretar las columnas. */
const ANCHO = { numero: 48, origen: 220, subfila: 130, columna: 120, minimo: 560 };

/**
 * Espejo cuyos hijos son grupos (estructuraDeSubfilas): cada fila ocupa una subfila por grupo, con
 * su número y su elemento de origen a la izquierda, y las columnas son los campos de los grupos. En
 * el Cronograma, cada actividad de la Cadena de valor (con su número n.m) tiene la programación
 * física (se escribe) y la financiera (se trae de la Cadena de valor) por año. La subfila que no
 * tiene una columna dice N/A. Las filas salen del origen: aquí no se agregan ni se eliminan.
 */
@Component({
  selector: 'app-tabla-subfilas-iniciativa',
  templateUrl: './tabla-subfilas-iniciativa.component.html',
  styleUrls: ['./tabla-subfilas-iniciativa.component.scss'],
})
export class TablaSubfilasIniciativaComponent implements OnChanges {
  @Input() nodo: NodoDefinicion;
  /** Lista de filas dentro de los datos (se modifica en el mismo arreglo). */
  @Input() filas: Datos[] = [];
  @Input() ruta = '';
  @Input() contexto: ContextoFormulario;
  /** Verdadero cuando la tabla no tiene un recuadro de sección que la nombre. */
  @Input() conTitulo = false;

  estructura: EstructuraSubfilas = SIN_ESTRUCTURA;
  /** Con numerar_por, el número n.m de cada fila por su origen. */
  private numeros = new Map<string, string>();
  /** Filas de origen, por id. */
  private origenes = new Map<string, Datos>();

  /**
   * Las filas de origen vienen de otro submódulo (relacionadas) y no cambian mientras se edita este:
   * los números y los orígenes se arman cuando llegan los datos (al cargar y al guardar).
   */
  ngOnChanges(): void {
    this.estructura = estructuraDeSubfilas(this.nodo) || SIN_ESTRUCTURA;
    this.numeros = numerosDeLista(this.nodo, this.ruta, this.contexto);
    const origenes = filasDeRuta(this.nodo.dato.espejo_de, this.contexto);
    this.origenes = new Map(origenes.map((origen) => [origen.id, origen] as [string, Datos]));
  }

  get etiqueta(): string {
    return this.nodo.dato.etiqueta_fila || this.nodo.nombre;
  }

  /** Número, origen, nombre de la subfila y columnas de campos. */
  get totalColumnas(): number {
    return this.estructura.columnas.length + 3;
  }

  get anchoMinimo(): number {
    return Math.max(ANCHO.minimo, ANCHO.numero + ANCHO.origen + ANCHO.subfila + this.estructura.columnas.length * ANCHO.columna);
  }

  porId(_: number, fila: Datos): string {
    return fila.id;
  }

  porSubfila(_: number, subfila: NodoDefinicion): string {
    return subfila.dato.clave;
  }

  porColumna(_: number, columna: ColumnaSubfilas): string {
    return columna.clave;
  }

  numero(fila: Datos, posicion: number): string {
    return numeroDeFila(this.nodo, fila, posicion, this.numeros);
  }

  /** Fila de origen (de ella salen los valores traídos y obligatorio_si). */
  origenDe(fila: Datos): Datos | null {
    return this.origenes.get(fila.origen) || null;
  }

  textoOrigen(fila: Datos): string {
    const origen = this.origenDe(fila);
    return origen ? textoDeFila(origen, this.nodo.dato.mostrar, 0) : '';
  }

  /** Campo de la subfila en esa columna, o undefined si la subfila no la tiene (N/A). */
  campoDe(subfila: NodoDefinicion, columna: ColumnaSubfilas): NodoDefinicion | undefined {
    return (subfila.hijos || []).find((campo) => campo.dato.clave === columna.clave);
  }

  /** Datos del grupo de la subfila dentro de la fila (prepararEstructura ya los dejó como objeto). */
  datosDe(fila: Datos, subfila: NodoDefinicion): Datos {
    return fila[subfila.dato.clave];
  }

  rutaDeSubfila(fila: Datos, subfila: NodoDefinicion): string {
    return rutaCampo(rutaFila(this.ruta, fila.id), subfila.dato.clave);
  }

  /** Para marcar la celda con error; el mensaje lo muestra la celda. */
  conError(fila: Datos, subfila: NodoDefinicion, campo: NodoDefinicion | undefined): boolean {
    return !!campo && this.errores(rutaCampo(this.rutaDeSubfila(fila, subfila), campo.dato.clave)).length > 0;
  }

  /** Errores que no van en una celda: los de la fila y los de sus grupos. */
  erroresDeFila(fila: Datos): string[] {
    return this.estructura.subfilas.reduce(
      (todos, subfila) => todos.concat(this.errores(this.rutaDeSubfila(fila, subfila))),
      this.errores(rutaFila(this.ruta, fila.id)),
    );
  }

  private errores(ruta: string): string[] {
    return this.contexto.errores[ruta] || [];
  }
}
