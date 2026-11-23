import { Component, Input, OnChanges } from '@angular/core';
import Swal from 'sweetalert2';
import { Datos, FilasAdicionales, NodoDefinicion } from '../../utils';
import {
  cabeOtraAgregada,
  ContextoFormulario,
  esCampoNumerico,
  esFilaAgregada,
  esVisible,
  EstructuraDesglose,
  estructuraDeDesglose,
  filasDe,
  filasDeRuta,
  nuevaFilaAgregada,
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
  /** Fila que agregó el usuario (filas_adicionales): no tiene elemento de origen y se puede eliminar. */
  agregada: boolean;
  partes: ParteDesglose[];
  /** Clave de la primera columna que reemplaza el desglose (muestra el elemento); '' si no se desglosa. */
  primeraReemplazada: string;
}

const SIN_ESTRUCTURA: EstructuraDesglose = { campos: [], desglose: null, campoEnOrigen: null };

/**
 * Anchos mínimos (px) para que la tabla se desplace en pantallas angostas en vez de apretar las columnas.
 * La columna Acciones mide lo de .col-acciones--una (un solo botón): cabe la palabra «Acciones» del encabezado.
 */
const ANCHO = { numero: 48, origen: 260, columna: 220, numerica: 130, acciones: 60, minimo: 560 };

/**
 * Espejo con desglose (estructuraDeDesglose): una fila por elemento de origen, con su nombre y su
 * ayuda (la descripción del catálogo), y sus campos en columnas, editados en su celda. En las filas
 * a las que aplica el desglose, las columnas de los campos que no aplican se parten en una subfila
 * por elemento del desglose: la primera muestra el elemento y las demás su campo con la misma clave.
 * En Trazadores presupuestales, Grupos Étnicos lleva una subfila por comunidad. Las filas del origen
 * no se agregan ni se eliminan aquí; con filas_adicionales, el botón «Agregar …» de debajo de la tabla
 * agrega filas más (hasta `max`, si lo tiene: los otros trazadores), que se nombran en la celda del
 * elemento y se eliminan con su caneca, en la columna Acciones.
 */
@Component({
  selector: 'app-tabla-desglose-iniciativa',
  templateUrl: './tabla-desglose-iniciativa.component.html',
  styleUrls: ['./tabla-desglose-iniciativa.component.scss'],
})
export class TablaDesgloseIniciativaComponent implements OnChanges {
  @Input() nodo: NodoDefinicion;
  /** Filas del espejo dentro de los datos (se editan en el mismo arreglo). */
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
   * se edita: la vista se arma cuando llegan los datos (al cargar y al guardar) y al agregar o
   * eliminar una fila. Los valores se editan en los mismos objetos de las filas.
   */
  ngOnChanges(): void {
    this.estructura = estructuraDeDesglose(this.nodo) || SIN_ESTRUCTURA;
    this.armarVista();
  }

  get etiqueta(): string {
    return this.nodo.dato.etiqueta_fila || this.nodo.nombre;
  }

  get adicionales(): FilasAdicionales | null {
    return this.nodo.dato.filas_adicionales || null;
  }

  /** Cómo se nombra una fila agregada en los botones: «Otro trazador». */
  get etiquetaAdicional(): string {
    return (this.adicionales && this.adicionales.etiqueta) || 'Fila';
  }

  /** Se edita y la lista admite filas agregadas (filas_adicionales). */
  get conAgregadas(): boolean {
    return !!this.adicionales && !this.contexto.soloLectura;
  }

  /** La columna Acciones (la caneca de cada fila agregada) solo existe si hay filas agregadas. */
  get conAcciones(): boolean {
    return this.conAgregadas && this.vista.some((vista) => vista.agregada);
  }

  /** El botón «Agregar …» de debajo de la tabla; desaparece al llegar al máximo. */
  get puedeAgregar(): boolean {
    return this.conAgregadas && cabeOtraAgregada(this.nodo, this.filas);
  }

  /** Número, origen, una columna por campo y, si hay, acciones. */
  get totalColumnas(): number {
    return this.estructura.campos.length + (this.conAcciones ? 3 : 2);
  }

  /** Todos los campos son numéricos: con el origen de ancho fijo, ellos se reparten el ancho (tabla--solo-numericas). */
  get soloNumericas(): boolean {
    return this.estructura.campos.length > 0 && this.estructura.campos.every(esCampoNumerico);
  }

  get anchoMinimo(): number {
    const campos = this.estructura.campos.reduce((suma, campo) => suma + (esCampoNumerico(campo) ? ANCHO.numerica : ANCHO.columna), 0);
    return Math.max(ANCHO.minimo, ANCHO.numero + ANCHO.origen + campos + (this.conAcciones ? ANCHO.acciones : 0));
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

  /** Nombre del elemento de origen o, en una fila agregada, el de filas_adicionales («Otro: ¿Cuál?»). */
  textoOrigen(vista: FilaDesglose): string {
    if (vista.agregada) {
      return this.adicionales.nombre || '';
    }
    return vista.origen ? textoDeFila(vista.origen, this.nodo.dato.mostrar, 0) : '';
  }

  /** Ayuda del elemento de origen (la descripción del catálogo, p. ej. la definición del trazador). */
  ayudaOrigen(vista: FilaDesglose): string {
    return vista.origen && typeof vista.origen.descripcion === 'string' ? vista.origen.descripcion : '';
  }

  /** Campo que se escribe en la celda del elemento de esta fila (el «¿Cuál?» de una fila agregada), o null. */
  campoEnOrigen(vista: FilaDesglose): NodoDefinicion | null {
    const campo = this.estructura.campoEnOrigen;
    return campo && esVisible(campo, vista.fila) ? campo : null;
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
  conError(rutaBase: string, campo: NodoDefinicion | null | undefined): boolean {
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

  /** Agrega al final una fila de filas_adicionales (p. ej. otro trazador), con el origen que la distingue. */
  agregar(): void {
    this.filas.push(nuevaFilaAgregada(this.nodo, this.contexto));
    this.armarVista();
  }

  async eliminar(vista: FilaDesglose): Promise<void> {
    const respuesta = await Swal.fire({
      title: `¿Eliminar ${this.etiquetaAdicional.toLowerCase()} ${vista.numero}?`,
      text: 'Los cambios se aplican al guardar.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
    const posicion = this.filas.indexOf(vista.fila);
    if (respuesta.isConfirmed && posicion >= 0) {
      this.filas.splice(posicion, 1);
      this.armarVista();
    }
  }

  private armarVista(): void {
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
        agregada: esFilaAgregada(this.nodo, fila),
        partes: hijas.length
          ? hijas.map((hija) => ({ hija, origenHija: origenesDesglose.get(hija.origen) || null }))
          : [{ hija: null, origenHija: null }],
        primeraReemplazada: reemplazada ? reemplazada.dato.clave : '',
      };
    });
  }

  private errores(ruta: string): string[] {
    return this.contexto.errores[ruta] || [];
  }
}

function porId(filas: Datos[]): Map<string, Datos> {
  return new Map(filas.map((fila) => [fila.id, fila] as [string, Datos]));
}
