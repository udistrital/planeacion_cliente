import { Component, Input, OnChanges } from '@angular/core';
import { Datos, NodoDefinicion } from '../../utils';
import {
  ContextoFormulario,
  esCampoNumerico,
  esVisible,
  EstructuraDesglose,
  estructuraDeDesglose,
  filasDe,
  filasDeRuta,
  rutaCampo,
  rutaFila,
  textoDeFila,
} from '../../utils/formulario.utils';

/** Una fila de la tabla: la del espejo o, si se desglosa, una por elemento del desglose. */
export interface ParteDesglose {
  /** Fila del desglose (p. ej. una comunidad); null si la fila no se desglosa. */
  hija: Datos | null;
  /** Elemento de origen de la fila del desglose (su nombre va en la primera columna reemplazada). */
  origenHija: Datos | null;
}

/** Cómo se dibuja cada fila del espejo. */
export interface FilaDesglose {
  fila: Datos;
  numero: string;
  origen: Datos | null;
  partes: ParteDesglose[];
  /** Clave de la primera columna que reemplaza el desglose (muestra el elemento); '' si no se desglosa. */
  primeraReemplazada: string;
}

const SIN_ESTRUCTURA: EstructuraDesglose = { campos: [], desglose: null };

/** Anchos mínimos (px) para que la tabla se desplace en pantallas angostas en vez de apretar las columnas. */
const ANCHO = { numero: 76, origen: 260, columna: 220, numerica: 130, minimo: 560 };

/**
 * Espejo con desglose (estructuraDeDesglose): una fila por elemento de origen, con su nombre y su
 * ayuda (la descripción del catálogo), y sus campos en columnas, editados en su celda. En las filas
 * a las que aplica el desglose, las columnas de los campos que no aplican se parten en una subfila
 * por elemento del desglose: la primera muestra el elemento y las demás su campo con la misma clave.
 * En Trazadores presupuestales, Grupos Étnicos lleva una subfila por comunidad. Las filas salen del
 * origen: no se agregan ni se eliminan aquí.
 */
@Component({
  selector: 'app-tabla-desglose-iniciativa',
  templateUrl: './tabla-desglose-iniciativa.component.html',
  styleUrls: ['./tabla-desglose-iniciativa.component.scss'],
})
export class TablaDesgloseIniciativaComponent implements OnChanges {
  @Input() nodo: NodoDefinicion;
  /** Filas del espejo dentro de los datos (se editan en el mismo objeto). */
  @Input() filas: Datos[] = [];
  @Input() ruta = '';
  @Input() contexto: ContextoFormulario;
  /** Verdadero cuando la tabla no tiene un recuadro de sección que la nombre. */
  @Input() conTitulo = false;

  readonly esCampoNumerico = esCampoNumerico;
  estructura: EstructuraDesglose = SIN_ESTRUCTURA;
  vista: FilaDesglose[] = [];

  /**
   * Las filas y su desglose salen del origen (un catálogo o otro submódulo), que no cambia mientras
   * se edita: la vista se arma cuando llegan los datos (al cargar y al guardar). Los valores se
   * editan en los mismos objetos de las filas.
   */
  ngOnChanges(): void {
    this.estructura = estructuraDeDesglose(this.nodo) || SIN_ESTRUCTURA;
    const desglose = this.estructura.desglose;
    if (!desglose) {
      this.vista = [];
      return;
    }
    const origenes = porId(filasDeRuta(this.nodo.dato.espejo_de, this.contexto));
    const origenesDesglose = porId(filasDeRuta(desglose.dato.espejo_de, this.contexto));
    this.vista = (this.filas || []).map((fila, posicion) => {
      const desglosada = esVisible(desglose, fila);
      const hijas = desglosada ? filasDe(fila[desglose.dato.clave]) : [];
      const reemplazada = desglosada ? this.estructura.campos.find((campo) => !esVisible(campo, fila)) : undefined;
      return {
        fila,
        numero: String(posicion + 1),
        origen: origenes.get(fila.origen) || null,
        partes: hijas.length
          ? hijas.map((hija) => ({ hija, origenHija: origenesDesglose.get(hija.origen) || null }))
          : [{ hija: null, origenHija: null }],
        primeraReemplazada: reemplazada ? reemplazada.dato.clave : '',
      };
    });
  }

  get etiqueta(): string {
    return this.nodo.dato.etiqueta_fila || this.nodo.nombre;
  }

  /** Número, origen y una columna por campo. */
  get totalColumnas(): number {
    return this.estructura.campos.length + 2;
  }

  get anchoMinimo(): number {
    const campos = this.estructura.campos.reduce((suma, campo) => suma + (esCampoNumerico(campo) ? ANCHO.numerica : ANCHO.columna), 0);
    return Math.max(ANCHO.minimo, ANCHO.numero + ANCHO.origen + campos);
  }

  porFila(_: number, vista: FilaDesglose): string {
    return vista.fila.id;
  }

  porParte(posicion: number, parte: ParteDesglose): string {
    return parte.hija ? parte.hija.id : String(posicion);
  }

  porClave(_: number, campo: NodoDefinicion): string {
    return campo.dato.clave;
  }

  /** Si el campo aplica a la fila; si no, su columna la ocupa el desglose (o dice N/A). */
  aplica(campo: NodoDefinicion, vista: FilaDesglose): boolean {
    return esVisible(campo, vista.fila);
  }

  textoOrigen(vista: FilaDesglose): string {
    return vista.origen ? textoDeFila(vista.origen, this.nodo.dato.mostrar, 0) : '';
  }

  /** Ayuda del elemento de origen (la descripción del catálogo, p. ej. la definición del trazador). */
  ayudaOrigen(vista: FilaDesglose): string {
    return vista.origen && typeof vista.origen.descripcion === 'string' ? vista.origen.descripcion : '';
  }

  textoElemento(parte: ParteDesglose): string {
    return parte.origenHija ? textoDeFila(parte.origenHija, this.estructura.desglose.dato.mostrar, 0) : '';
  }

  /** El campo del desglose que va en la columna de ese campo (misma clave), o undefined. */
  campoDelDesglose(campo: NodoDefinicion): NodoDefinicion | undefined {
    return (this.estructura.desglose.hijos || []).find((interno) => interno.dato.clave === campo.dato.clave);
  }

  hijasDe(vista: FilaDesglose): Datos[] {
    return filasDe(vista.fila[this.estructura.desglose.dato.clave]);
  }

  rutaDeFila(vista: FilaDesglose): string {
    return rutaFila(this.ruta, vista.fila.id);
  }

  rutaDeHija(vista: FilaDesglose, hija: Datos): string {
    return rutaFila(rutaCampo(this.rutaDeFila(vista), this.estructura.desglose.dato.clave), hija.id);
  }

  /** Texto de la celda vacía: en un espejo con filas opcionales, "Si aplica". */
  textoVacio(lista: NodoDefinicion): string {
    return lista.dato.filas_opcionales ? 'Si aplica' : '';
  }

  /** Para marcar la celda con error; el mensaje lo muestra la celda. */
  conError(rutaBase: string, campo: NodoDefinicion | undefined): boolean {
    return !!campo && this.errores(rutaCampo(rutaBase, campo.dato.clave)).length > 0;
  }

  /** Errores que no van en una celda: los de la fila, los del desglose (p. ej. el mínimo) y los de sus filas. */
  erroresDeFila(vista: FilaDesglose): string[] {
    const ruta = this.rutaDeFila(vista);
    const desglose = this.estructura.desglose;
    return this.hijasDe(vista).reduce(
      (todos, hija) => todos.concat(this.errores(this.rutaDeHija(vista, hija))),
      this.errores(ruta).concat(this.errores(rutaCampo(ruta, desglose.dato.clave))),
    );
  }

  private errores(ruta: string): string[] {
    return this.contexto.errores[ruta] || [];
  }
}

function porId(filas: Datos[]): Map<string, Datos> {
  return new Map(filas.map((fila) => [fila.id, fila] as [string, Datos]));
}
