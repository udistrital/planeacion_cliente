import { Component, Input, OnChanges } from '@angular/core';
import Swal from 'sweetalert2';
import { Datos, NodoDefinicion } from '../../utils';
import {
  claseDe,
  ContextoFormulario,
  esCampoNumerico,
  esVisible,
  EstructuraTabla,
  estructuraDeTabla,
  filasDeRuta,
  nuevoIdFila,
  numeroDeFila,
  numerosDeLista,
  prefijoDeClave,
  prepararEstructura,
  rutaCampo,
  rutaFila,
  textoDeFila,
} from '../../utils/formulario.utils';

const SIN_ESTRUCTURA: EstructuraTabla = { campos: [], interna: null, camposInternos: [] };

/** Anchos mínimos (px) para que la tabla se desplace en pantallas angostas en vez de apretar las columnas. */
const ANCHO = { numero: 76, columna: 160, numerica: 110, acciones: 96, accion: 56, minimo: 560 };

/**
 * Lista como tabla: una columna por campo, editado en su celda (CeldaIniciativa). Las filas de la
 * lista interna van debajo de su fila, numeradas 1.1, 1.2… Si es espejo, la primera columna muestra
 * el elemento de origen y no se agregan ni eliminan filas. Edita los mismos datos que el grupo repetible.
 * Con numerar_por, las filas se numeran n.m (las actividades de Cadena de valor, por objetivo específico).
 */
@Component({
  selector: 'app-tabla-jerarquica-iniciativa',
  templateUrl: './tabla-jerarquica-iniciativa.component.html',
  styleUrls: ['./tabla-jerarquica-iniciativa.component.scss'],
})
export class TablaJerarquicaIniciativaComponent implements OnChanges {
  @Input() nodo: NodoDefinicion;
  /** Lista de filas dentro de los datos (se modifica en el mismo arreglo). */
  @Input() filas: Datos[] = [];
  @Input() ruta = '';
  @Input() contexto: ContextoFormulario;
  /** Verdadero cuando la tabla va dentro de una fila: no hay recuadro de sección que la nombre. */
  @Input() conTitulo = false;

  estructura: EstructuraTabla = SIN_ESTRUCTURA;
  /** Posiciones de las columnas de campos (0, 1, ...). */
  columnas: number[] = [];
  encabezados: string[] = [];
  /** Descripción de los campos de cada columna, para la ayuda del encabezado. */
  ayudas: string[] = [];

  ngOnChanges(): void {
    this.estructura = estructuraDeTabla(this.nodo) || SIN_ESTRUCTURA;
    const { campos, camposInternos } = this.estructura;
    this.columnas = Array.from({ length: Math.max(campos.length, camposInternos.length) }, (_, posicion) => posicion);
    this.encabezados = this.columnas.map((posicion) => this.encabezado(posicion));
    this.ayudas = this.columnas.map((posicion) => this.ayuda(posicion));
  }

  /**
   * Número de la fila: su posición o, con numerar_por, n.m. Se calcula cada vez porque cambia al
   * agregar o eliminar filas aquí o en otra lista del mismo grupo (otro producto del objetivo).
   */
  numero(fila: Datos, posicion: number): string {
    return numeroDeFila(this.nodo, fila, posicion, numerosDeLista(this.nodo, this.ruta, this.contexto));
  }

  get etiqueta(): string {
    return this.nodo.dato.etiqueta_fila || this.nodo.nombre;
  }

  get etiquetaInterna(): string {
    const interna = this.estructura.interna;
    return interna ? interna.dato.etiqueta_fila || interna.nombre : '';
  }

  /** Las filas de un espejo salen del grupo de origen: no se agregan ni se eliminan aquí. */
  get esEspejo(): boolean {
    return !!this.nodo.dato.espejo_de;
  }

  get tieneInterna(): boolean {
    return !!this.estructura.interna;
  }

  get puedeModificar(): boolean {
    return !this.contexto.soloLectura && !this.esEspejo;
  }

  get puedeAgregar(): boolean {
    return this.puedeModificar && cabeOtra(this.filas, this.nodo);
  }

  get minimo(): number {
    return this.nodo.dato.min || 0;
  }

  /** Número, origen (espejo), columnas de campos y, si se puede editar, acciones. */
  get totalColumnas(): number {
    return this.columnas.length + (this.esEspejo ? 2 : 1) + (this.puedeModificar ? 1 : 0);
  }

  get anchoMinimo(): number {
    const campos = this.columnas.reduce((suma, posicion) => suma + (this.esNumerica(posicion) ? ANCHO.numerica : ANCHO.columna), 0);
    const acciones = this.puedeModificar ? (this.tieneInterna ? ANCHO.acciones : ANCHO.accion) : 0;
    return Math.max(ANCHO.minimo, ANCHO.numero + (this.esEspejo ? ANCHO.columna : 0) + campos + acciones);
  }

  /** Columna en la que todos los campos son números (escritos o calculados): va más angosta. */
  esNumerica(posicion: number): boolean {
    const { campos, camposInternos } = this.estructura;
    return [campos[posicion], camposInternos[posicion]].filter((campo) => !!campo).every(esCampoNumerico);
  }

  /** Columna en la que todos los campos son casillas: el título y la casilla van centrados. */
  esCasilla(posicion: number): boolean {
    const { campos, camposInternos } = this.estructura;
    return [campos[posicion], camposInternos[posicion]].filter((campo) => !!campo).every((campo) => claseDe(campo) === 'casilla');
  }

  puedeAgregarInterna(fila: Datos): boolean {
    const interna = this.estructura.interna;
    return this.puedeModificar && !!interna && cabeOtra(this.internas(fila), interna);
  }

  porId(_: number, fila: Datos): string {
    return fila.id;
  }

  internas(fila: Datos): Datos[] {
    const interna = this.estructura.interna;
    return interna && Array.isArray(fila[interna.dato.clave]) ? fila[interna.dato.clave] : [];
  }

  /** Texto del elemento de origen de una fila de espejo. */
  textoOrigen(fila: Datos): string {
    const origen = filasDeRuta(this.nodo.dato.espejo_de, this.contexto).find((candidata) => candidata.id === fila.origen);
    return origen ? textoDeFila(origen, this.nodo.dato.mostrar, 0) : '';
  }

  /** Campo que se escribe en la celda del elemento de origen de esta fila (p. ej. el «¿Cuál?» de «Otro»), o null. */
  campoEnOrigen(fila: Datos): NodoDefinicion | null {
    const campo = this.estructura.campoEnOrigen;
    return campo && esVisible(campo, fila) ? campo : null;
  }

  /** En un espejo con filas opcionales, la fila que sí se exige (filas_obligatorias). */
  esFilaObligatoria(fila: Datos): boolean {
    return !!this.nodo.dato.filas_opcionales && (this.nodo.dato.filas_obligatorias || []).includes(fila.origen);
  }

  /** Texto de la celda vacía: en un espejo con filas opcionales, "Si aplica" salvo en las obligatorias. */
  textoVacio(fila: Datos): string {
    return this.nodo.dato.filas_opcionales && !this.esFilaObligatoria(fila) ? 'Si aplica' : '';
  }

  rutaDeFila(fila: Datos): string {
    return rutaFila(this.ruta, fila.id);
  }

  rutaDeInterna(fila: Datos, hija: Datos): string {
    return rutaFila(rutaCampo(this.rutaDeFila(fila), this.estructura.interna.dato.clave), hija.id);
  }

  rutaDeCampo(rutaBase: string, campo: NodoDefinicion): string {
    return rutaCampo(rutaBase, campo.dato.clave);
  }

  /** Para marcar la celda con error; el mensaje lo muestra la celda. */
  erroresDeCampo(rutaBase: string, campo: NodoDefinicion | undefined): string[] {
    return campo ? this.errores(this.rutaDeCampo(rutaBase, campo)) : [];
  }

  /** Errores que no van en una celda: de la fila, de su lista interna (p. ej. el mínimo) y de cada fila interna. */
  erroresDeFila(fila: Datos): string[] {
    const ruta = this.rutaDeFila(fila);
    const interna = this.estructura.interna;
    if (!interna) {
      return this.errores(ruta);
    }
    return this.internas(fila).reduce(
      (todos, hija) => todos.concat(this.errores(this.rutaDeInterna(fila, hija))),
      this.errores(ruta).concat(this.errores(rutaCampo(ruta, interna.dato.clave))),
    );
  }

  agregar(): void {
    this.filas.push(prepararEstructura(this.nodo.hijos, { id: nuevoIdFila(prefijoDeClave(this.nodo.dato.clave)) }, this.contexto));
  }

  agregarInterna(fila: Datos): void {
    const interna = this.estructura.interna;
    const clave = interna.dato.clave;
    if (!Array.isArray(fila[clave])) {
      fila[clave] = [];
    }
    fila[clave].push(prepararEstructura(interna.hijos, { id: nuevoIdFila(prefijoDeClave(clave)) }, this.contexto));
  }

  async eliminar(posicion: number): Promise<void> {
    const aviso = 'Los cambios se aplican al guardar.';
    const confirmado = await confirmarEliminacion(
      `¿Eliminar ${this.etiqueta.toLowerCase()} ${this.numero(this.filas[posicion], posicion)}?`,
      this.tieneInterna ? `Se eliminará con todo lo que contiene. ${aviso}` : aviso,
    );
    if (confirmado) {
      this.filas.splice(posicion, 1);
    }
  }

  async eliminarInterna(fila: Datos, posicionFila: number, posicion: number): Promise<void> {
    const confirmado = await confirmarEliminacion(
      `¿Eliminar ${this.etiquetaInterna.toLowerCase()} ${this.numero(fila, posicionFila)}.${posicion + 1}?`,
      'Los cambios se aplican al guardar.',
    );
    if (confirmado) {
      this.internas(fila).splice(posicion, 1);
    }
  }

  /** Con lista interna, la primera columna nombra los dos niveles; las demás, el campo (o los dos si difieren). */
  private encabezado(posicion: number): string {
    const { campos, interna, camposInternos } = this.estructura;
    if (posicion === 0 && interna) {
      return `${this.etiqueta} / ${this.etiquetaInterna.toLowerCase()}`;
    }
    const primero = campos[posicion] ? campos[posicion].nombre : '';
    const segundo = camposInternos[posicion] ? camposInternos[posicion].nombre : '';
    return primero && segundo && primero !== segundo ? `${primero} / ${segundo}` : primero || segundo;
  }

  private ayuda(posicion: number): string {
    const { campos, camposInternos } = this.estructura;
    const descripciones = [campos[posicion], camposInternos[posicion]]
      .filter((campo) => !!campo && !!campo.descripcion)
      .map((campo) => campo.descripcion);
    return Array.from(new Set(descripciones)).join(' / ');
  }

  private errores(ruta: string): string[] {
    return this.contexto.errores[ruta] || [];
  }
}

function cabeOtra(filas: Datos[], nodo: NodoDefinicion): boolean {
  const maximo = nodo.dato.max;
  return maximo === undefined || maximo === null || filas.length < maximo;
}

async function confirmarEliminacion(titulo: string, texto: string): Promise<boolean> {
  const respuesta = await Swal.fire({
    title: titulo,
    text: texto,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonText: 'Eliminar',
    cancelButtonText: 'Cancelar',
  });
  return respuesta.isConfirmed;
}
