import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { Component, Input } from '@angular/core';
import Swal from 'sweetalert2';
import { Datos, NodoDefinicion } from '../../utils';
import {
  ContextoFormulario,
  EstructuraDocumentos,
  ListaDocumentos,
  nuevoIdFila,
  prefijoDeClave,
  prepararEstructura,
  rutaCampo,
  rutaFila,
} from '../../utils/formulario.utils';

/**
 * Submódulo de solo documentos (Anexos) como una tabla: una fila por documento fijo y, debajo, los
 * adicionales de la lista, cada uno con su nombre editable. La estructura sale de estructuraDeDocumentos.
 */
@Component({
  selector: 'app-tabla-documentos-iniciativa',
  templateUrl: './tabla-documentos-iniciativa.component.html',
  styleUrls: ['./tabla-documentos-iniciativa.component.scss'],
})
export class TablaDocumentosIniciativaComponent {
  @Input() estructura: EstructuraDocumentos;
  /** Datos del submódulo (se modifican en el mismo objeto). */
  @Input() datos: Datos = {};
  @Input() contexto: ContextoFormulario;

  get lista(): ListaDocumentos | null {
    return this.estructura.lista;
  }

  /** Filas de la lista de adicionales (prepararEstructura ya dejó un arreglo). */
  get filas(): Datos[] {
    const valor = this.lista ? this.datos[this.lista.nodo.dato.clave] : null;
    return Array.isArray(valor) ? valor : [];
  }

  /** Cómo se nombra un adicional: "Documento". */
  get etiqueta(): string {
    return this.lista ? this.lista.nodo.dato.etiqueta_fila || this.lista.nodo.nombre : '';
  }

  /** Se agregan y eliminan adicionales si hay lista y se puede editar. */
  get puedeEliminar(): boolean {
    return !!this.lista && !this.contexto.soloLectura;
  }

  get puedeAgregar(): boolean {
    const maximo = this.lista ? this.lista.nodo.dato.max : null;
    return this.puedeEliminar && (maximo === undefined || maximo === null || this.filas.length < maximo);
  }

  /**
   * Acciones tiene un lugar fijo por botón (ver, adjuntar, caneca), para que cada uno quede en la misma
   * columna en todas las filas. En solo lectura solo está ver.
   */
  get conTresLugares(): boolean {
    return !this.contexto.soloLectura;
  }

  get totalColumnas(): number {
    return 4;
  }

  /** Errores de la lista (p. ej. el máximo) y de cada fila que no son de un campo. */
  get erroresDeLista(): string[] {
    if (!this.lista) {
      return [];
    }
    const ruta = this.lista.nodo.dato.clave;
    return this.filas.reduce((todos, fila) => todos.concat(this.errores(rutaFila(ruta, fila.id))), this.errores(ruta));
  }

  esObligatorio(campo: NodoDefinicion): boolean {
    return coerceBooleanProperty(campo.dato.required);
  }

  /** Número de un adicional: siguen a los fijos (3, 4…). */
  numero(posicion: number): number {
    return this.estructura.fijos.length + posicion + 1;
  }

  rutaDeFila(fila: Datos): string {
    return rutaFila(this.lista.nodo.dato.clave, fila.id);
  }

  rutaDeArchivo(fila: Datos): string {
    return rutaCampo(this.rutaDeFila(fila), this.lista.archivo.dato.clave);
  }

  /** Nombre del adicional para los botones del archivo: el escrito o "Documento 3". */
  nombreDe(fila: Datos, posicion: number): string {
    const escrito = String(fila[this.lista.nombre.dato.clave] || '').trim();
    return escrito || `${this.etiqueta} ${this.numero(posicion)}`;
  }

  errores(ruta: string): string[] {
    return this.contexto.errores[ruta] || [];
  }

  porClave(_: number, campo: NodoDefinicion): string {
    return campo.dato.clave;
  }

  porId(_: number, fila: Datos): string {
    return fila.id;
  }

  agregar(): void {
    const lista = this.lista;
    const nueva = prepararEstructura(lista.nodo.hijos, { id: nuevoIdFila(prefijoDeClave(lista.nodo.dato.clave)) }, this.contexto);
    if (!Array.isArray(this.datos[lista.nodo.dato.clave])) {
      this.datos[lista.nodo.dato.clave] = [];
    }
    this.datos[lista.nodo.dato.clave].push(nueva);
  }

  /** Quita el adicional de la iniciativa: se guarda de una vez (contexto.guardarAutomatico). */
  async eliminar(posicion: number): Promise<void> {
    const respuesta = await Swal.fire({
      title: `¿Eliminar ${this.etiqueta.toLowerCase()} ${this.numero(posicion)}?`,
      text: 'El documento y su archivo se quitan de la iniciativa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!respuesta.isConfirmed) {
      return;
    }
    this.filas.splice(posicion, 1);
    if (this.contexto.guardarAutomatico) {
      this.contexto.guardarAutomatico();
    }
  }
}
