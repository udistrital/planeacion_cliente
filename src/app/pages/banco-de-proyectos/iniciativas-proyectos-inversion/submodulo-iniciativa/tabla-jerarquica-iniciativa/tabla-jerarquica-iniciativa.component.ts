import { Component, Input, OnChanges } from '@angular/core';
import Swal from 'sweetalert2';
import { Datos, NodoDefinicion } from '../../utils';
import {
  cabeOtraAgregada,
  claseDe,
  ContextoFormulario,
  esCampoNumerico,
  esFilaAgregada,
  esVisible,
  EstructuraTabla,
  estructuraDeTabla,
  filasDeRuta,
  nuevaFilaAgregada,
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
const ANCHO = { numero: 48, codigo: 120, columna: 160, numerica: 110, acciones: 74, accion: 60, minimo: 560 };

/**
 * Lista como tabla: una columna por campo, editado en su celda (CeldaIniciativa). Las filas de la
 * lista interna van debajo de su fila, numeradas 1.1, 1.2… Si es espejo, la primera columna muestra
 * el elemento de origen (con columna_codigo, antes va su código) y sus filas no se agregan ni se
 * eliminan, salvo las de filas_adicionales: el botón «Agregar …» de debajo de la tabla las agrega y
 * cada una tiene su caneca (las otras fuentes de financiación). Edita los mismos datos que el grupo repetible.
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

  /** Las filas de un espejo salen del grupo de origen: no se agregan ni se eliminan aquí (salvo las de filas_adicionales). */
  get esEspejo(): boolean {
    return !!this.nodo.dato.espejo_de;
  }

  get tieneInterna(): boolean {
    return !!this.estructura.interna;
  }

  get puedeModificar(): boolean {
    return !this.contexto.soloLectura && !this.esEspejo;
  }

  /** Espejo editable con filas_adicionales: el usuario agrega y elimina las suyas. */
  get conAgregadas(): boolean {
    return this.esEspejo && !!this.nodo.dato.filas_adicionales && !this.contexto.soloLectura;
  }

  /** La columna Acciones: en una lista editable o, en un espejo, cuando ya hay filas agregadas (su caneca). */
  get conAcciones(): boolean {
    return this.puedeModificar || (this.conAgregadas && this.filas.some((fila) => this.esAgregada(fila)));
  }

  get puedeAgregar(): boolean {
    return this.puedeModificar && cabeOtra(this.filas, this.nodo);
  }

  /** En un espejo con filas_adicionales, si cabe otra (el botón «Agregar …» de debajo de la tabla). */
  get puedeAgregarOtra(): boolean {
    return this.conAgregadas && cabeOtraAgregada(this.nodo, this.filas);
  }

  /** Cómo se nombra una fila agregada en los botones: «Otra fuente». */
  get etiquetaAgregada(): string {
    const adicionales = this.nodo.dato.filas_adicionales;
    return (adicionales && adicionales.etiqueta) || this.etiqueta;
  }

  /** Con lista interna editable, la fila de primer nivel tiene dos botones: agregar a la interna y la caneca. */
  get dosAcciones(): boolean {
    return this.tieneInterna && this.puedeModificar;
  }

  /** Columna Acciones angosta (un solo botón, la caneca): siempre que no haya dos botones. */
  get accionAngosta(): boolean {
    return !this.dosAcciones;
  }

  /** Sin columna de ancho libre (ni origen ni texto): las numéricas se reparten el ancho (tabla--solo-numericas). */
  get soloNumericas(): boolean {
    return !this.esEspejo && this.columnas.length > 0 && this.columnas.every((posicion) => this.esNumerica(posicion));
  }

  /** Columna con el código del elemento de origen, antes de su nombre (columna_codigo). */
  get conCodigo(): boolean {
    return this.esEspejo && !!this.nodo.dato.columna_codigo;
  }

  get minimo(): number {
    return this.nodo.dato.min || 0;
  }

  /** Número, código y origen (espejo), columnas de campos y, si hay, acciones. */
  get totalColumnas(): number {
    return this.columnas.length + 1 + (this.esEspejo ? 1 : 0) + (this.conCodigo ? 1 : 0) + (this.conAcciones ? 1 : 0);
  }

  get anchoMinimo(): number {
    const campos = this.columnas.reduce((suma, posicion) => suma + (this.esNumerica(posicion) ? ANCHO.numerica : ANCHO.columna), 0);
    const acciones = this.conAcciones ? (this.accionAngosta ? ANCHO.accion : ANCHO.acciones) : 0;
    const origen = (this.esEspejo ? ANCHO.columna : 0) + (this.conCodigo ? ANCHO.codigo : 0);
    return Math.max(ANCHO.minimo, ANCHO.numero + origen + campos + acciones);
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

  /** Texto del elemento de origen de una fila de espejo; en una fila agregada, el de filas_adicionales («Otras, ¿cuáles?»). */
  textoOrigen(fila: Datos): string {
    if (this.esAgregada(fila)) {
      return this.nodo.dato.filas_adicionales.nombre || '';
    }
    const origen = filasDeRuta(this.nodo.dato.espejo_de, this.contexto).find((candidata) => candidata.id === fila.origen);
    return origen ? textoDeFila(origen, this.nodo.dato.mostrar, 0) : '';
  }

  /** Código del elemento de origen (en un espejo de catálogo, su id); una fila agregada lo escribe en campoCodigo. */
  codigoDe(fila: Datos): string {
    return this.esAgregada(fila) ? '' : fila.origen || '';
  }

  /** Campo que se escribe en la celda del elemento de origen de esta fila (p. ej. el «¿Cuál?» de «Otro»), o null. */
  campoEnOrigen(fila: Datos): NodoDefinicion | null {
    const campo = this.estructura.campoEnOrigen;
    return campo && esVisible(campo, fila) ? campo : null;
  }

  /** Campo en el que una fila agregada escribe su código (columna_codigo.campo), o null. */
  campoCodigo(fila: Datos): NodoDefinicion | null {
    const campo = this.estructura.campoCodigo;
    return campo && esVisible(campo, fila) ? campo : null;
  }

  esAgregada(fila: Datos): boolean {
    return esFilaAgregada(this.nodo, fila);
  }

  /** Se eliminan las filas de una lista editable y, en un espejo, solo las agregadas. */
  puedeEliminar(fila: Datos): boolean {
    return this.puedeModificar || (this.conAgregadas && this.esAgregada(fila));
  }

  /** Nombre de la fila en los botones: el de la lista o, si es agregada, el de filas_adicionales. */
  etiquetaDeFila(fila: Datos): string {
    return this.esAgregada(fila) ? this.etiquetaAgregada : this.etiqueta;
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

  /** Agrega al final una fila de filas_adicionales (p. ej. otra fuente de financiación). */
  agregarOtra(): void {
    this.filas.push(nuevaFilaAgregada(this.nodo, this.contexto));
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
    const fila = this.filas[posicion];
    const confirmado = await confirmarEliminacion(
      `¿Eliminar ${this.etiquetaDeFila(fila).toLowerCase()} ${this.numero(fila, posicion)}?`,
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
