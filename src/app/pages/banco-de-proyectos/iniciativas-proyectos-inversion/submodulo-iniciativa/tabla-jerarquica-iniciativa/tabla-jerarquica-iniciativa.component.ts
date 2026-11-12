import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, Input, OnChanges } from '@angular/core';
import Swal from 'sweetalert2';
import { Datos, NodoDefinicion } from '../../utils';
import {
  ContextoFormulario,
  EstructuraTabla,
  estructuraDeTabla,
  nuevoIdFila,
  prefijoDeClave,
  prepararEstructura,
  rutaCampo,
  rutaFila,
} from '../../utils/formulario.utils';

const SIN_ESTRUCTURA: EstructuraTabla = { campos: [], interna: null, camposInternos: [] };

/**
 * Lista de dos niveles como tabla jerárquica (p. ej. efectos directos y sus efectos
 * indirectos): cada fila con su número y, debajo, con sangría y número 1.1, las filas de
 * su lista interna. Cada campo de texto es una columna y se escribe en la misma celda.
 * Edita los mismos datos que el grupo repetible; solo cambia la presentación.
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

  estructura: EstructuraTabla = SIN_ESTRUCTURA;
  /** Posiciones de las columnas de campos (0, 1, ...). */
  columnas: number[] = [];
  encabezados: string[] = [];
  /** Celdas que el usuario dejó abiertas con «Ver todo», por ruta del campo. */
  private readonly abiertas = new Set<string>();

  ngOnChanges(): void {
    this.estructura = estructuraDeTabla(this.nodo) || SIN_ESTRUCTURA;
    const { campos, camposInternos } = this.estructura;
    this.columnas = Array.from({ length: Math.max(campos.length, camposInternos.length) }, (_, posicion) => posicion);
    this.encabezados = this.columnas.map((posicion) => this.encabezado(posicion));
  }

  get etiqueta(): string {
    return this.nodo.dato.etiqueta_fila || this.nodo.nombre;
  }

  get etiquetaInterna(): string {
    const interna = this.estructura.interna;
    return interna ? interna.dato.etiqueta_fila || interna.nombre : '';
  }

  get puedeModificar(): boolean {
    return !this.contexto.soloLectura;
  }

  get puedeAgregar(): boolean {
    return this.puedeModificar && cabeOtra(this.filas, this.nodo);
  }

  get minimo(): number {
    return this.nodo.dato.min || 0;
  }

  /** Número, columnas de campos y, si se puede editar, acciones. */
  get totalColumnas(): number {
    return this.columnas.length + (this.puedeModificar ? 2 : 1);
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

  esObligatorio(campo: NodoDefinicion): boolean {
    return coerceBooleanProperty(campo.dato.required);
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

  erroresDeCampo(rutaBase: string, campo: NodoDefinicion | undefined): string[] {
    return campo ? this.errores(this.rutaDeCampo(rutaBase, campo)) : [];
  }

  estaAbierta(rutaDelCampo: string): boolean {
    return this.abiertas.has(rutaDelCampo);
  }

  alternarCelda(rutaDelCampo: string): void {
    if (this.abiertas.has(rutaDelCampo)) {
      this.abiertas.delete(rutaDelCampo);
    } else {
      this.abiertas.add(rutaDelCampo);
    }
  }

  /** El texto no cabe en las líneas que muestra la celda cerrada. */
  estaCortada(area: HTMLTextAreaElement): boolean {
    return area.scrollHeight > area.clientHeight + 1;
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
    const confirmado = await confirmarEliminacion(
      `¿Eliminar ${this.etiqueta.toLowerCase()} ${posicion + 1}?`,
      'Se eliminará con todo lo que contiene. Los cambios se aplican al guardar.',
    );
    if (confirmado) {
      this.filas.splice(posicion, 1);
    }
  }

  async eliminarInterna(fila: Datos, posicionFila: number, posicion: number): Promise<void> {
    const confirmado = await confirmarEliminacion(
      `¿Eliminar ${this.etiquetaInterna.toLowerCase()} ${posicionFila + 1}.${posicion + 1}?`,
      'Los cambios se aplican al guardar.',
    );
    if (confirmado) {
      this.internas(fila).splice(posicion, 1);
    }
  }

  /** La primera columna nombra los dos niveles; las demás, el campo (o los dos si difieren). */
  private encabezado(posicion: number): string {
    const { campos, interna, camposInternos } = this.estructura;
    if (posicion === 0 && interna) {
      return `${this.etiqueta} / ${this.etiquetaInterna.toLowerCase()}`;
    }
    const primero = campos[posicion] ? campos[posicion].nombre : '';
    const segundo = camposInternos[posicion] ? camposInternos[posicion].nombre : '';
    return primero && segundo && primero !== segundo ? `${primero} / ${segundo}` : primero || segundo;
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
