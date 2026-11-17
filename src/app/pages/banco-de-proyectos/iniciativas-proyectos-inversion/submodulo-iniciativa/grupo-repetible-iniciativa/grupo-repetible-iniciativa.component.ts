import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import Swal from 'sweetalert2';
import { Datos, NodoDefinicion } from '../../utils';
import {
  campoResumenPorDefecto,
  ContextoFormulario,
  esCampoNumerico,
  filaCompleta,
  filasDeRuta,
  nuevoIdFila,
  prefijoDeClave,
  prepararEstructura,
  rutaFila,
  textoDeFila,
  textoResumen,
} from '../../utils/formulario.utils';

/** Columna de la tabla resumen: el campo de la fila que muestra y su encabezado. */
export interface ColumnaVista {
  campo: NodoDefinicion;
  nombre: string;
  numerica: boolean;
}

/**
 * Lista cuyas filas no caben en una tabla (p. ej. los bienes o servicios de Necesidades): arriba,
 * una tabla resumen con una fila por elemento y si tiene sus datos completos; debajo, los campos
 * de la fila seleccionada (con ✎). Las columnas del resumen salen de COLUMNAS_RESUMEN.
 * Si el grupo es espejo de otro (p. ej. productos por objetivo específico), las filas salen del
 * grupo de origen: no se agregan ni se eliminan aquí y cada una muestra su elemento de origen.
 */
@Component({
  selector: 'app-grupo-repetible-iniciativa',
  templateUrl: './grupo-repetible-iniciativa.component.html',
  styleUrls: ['./grupo-repetible-iniciativa.component.scss'],
})
export class GrupoRepetibleIniciativaComponent implements OnChanges {
  @Input() nodo: NodoDefinicion;
  /** Lista de filas dentro de los datos (se modifica en el mismo arreglo). */
  @Input() filas: Datos[] = [];
  @Input() ruta = '';
  @Input() contexto: ContextoFormulario;
  @Input() filaOrigen: Datos | null = null;
  /** Falso cuando la lista va sola en una sección cuyo título ya la nombra. */
  @Input() conTitulo = true;

  @ViewChild('formulario') formulario: ElementRef<HTMLElement>;

  columnas: ColumnaVista[] = [];
  /** Fila que se diligencia debajo de la tabla; null si el usuario cerró el formulario. */
  seleccionada: Datos | null = null;

  ngOnChanges(): void {
    this.columnas = this.columnasDeResumen();
    // Al recargar (p. ej. tras guardar) las filas son otros objetos: se conserva la seleccionada por su id.
    const anterior = this.seleccionada;
    this.seleccionada = anterior
      ? this.filas.find((fila) => fila.id === anterior.id) || this.filas[0] || null
      : this.filas[0] || null;
  }

  get esEspejo(): boolean {
    return !!this.nodo.dato.espejo_de;
  }

  get etiqueta(): string {
    return this.nodo.dato.etiqueta_fila || 'Elemento';
  }

  get puedeModificar(): boolean {
    return !this.contexto.soloLectura && !this.esEspejo;
  }

  get puedeAgregar(): boolean {
    const maximo = this.nodo.dato.max;
    return this.puedeModificar && (maximo === undefined || maximo === null || this.filas.length < maximo);
  }

  get minimo(): number {
    return this.nodo.dato.min || 0;
  }

  get posicionSeleccionada(): number {
    return this.seleccionada ? this.filas.indexOf(this.seleccionada) : -1;
  }

  /** Número, origen (espejo), columnas, datos y acciones. */
  get totalColumnas(): number {
    return this.columnas.length + (this.esEspejo ? 4 : 3);
  }

  get incompletas(): number {
    return this.filas.filter((fila) => !this.completa(fila)).length;
  }

  porId(_: number, fila: Datos): string {
    return fila.id;
  }

  rutaDeFila(fila: Datos): string {
    return rutaFila(this.ruta, fila.id);
  }

  erroresDeFila(fila: Datos): string[] {
    return this.contexto.errores[this.rutaDeFila(fila)] || [];
  }

  /** Datos obligatorios diligenciados y sin errores del servidor pendientes en la fila o lo que contiene. */
  completa(fila: Datos): boolean {
    const ruta = this.rutaDeFila(fila);
    const conErrores = Object.keys(this.contexto.errores).some(
      (clave) => clave === ruta || clave.startsWith(`${ruta}.`) || clave.startsWith(`${ruta}[`),
    );
    return !conErrores && filaCompleta(this.nodo.hijos, fila, this.contexto);
  }

  textoColumna(fila: Datos, columna: ColumnaVista): string {
    return textoResumen(columna.campo, fila, this.origenDe(fila), this.contexto);
  }

  /** Fila de origen: la del grupo espejado o, si no es espejo, la heredada del nivel superior. */
  origenDe(fila: Datos): Datos | null {
    if (!this.esEspejo) {
      return this.filaOrigen;
    }
    return filasDeRuta(this.nodo.dato.espejo_de, this.contexto).find((origen) => origen.id === fila.origen) || null;
  }

  textoOrigen(fila: Datos): string {
    const origen = this.origenDe(fila);
    return origen ? textoDeFila(origen, this.nodo.dato.mostrar, 0) : '';
  }

  /** Lo que nombra la fila en el título del formulario: su origen (espejo) o su primera columna. */
  resumenDe(fila: Datos): string {
    if (this.esEspejo) {
      return this.textoOrigen(fila);
    }
    const primera = this.columnas.find((columna) => columna.campo.dato.type !== 'repetible');
    return primera ? this.textoColumna(fila, primera) : '';
  }

  seleccionar(fila: Datos): void {
    this.seleccionada = fila;
    this.mostrarFormulario();
  }

  cerrar(): void {
    this.seleccionada = null;
  }

  agregar(): void {
    const fila = prepararEstructura(this.nodo.hijos, { id: nuevoIdFila(prefijoDeClave(this.nodo.dato.clave)) }, this.contexto);
    this.filas.push(fila);
    this.seleccionar(fila);
  }

  async eliminar(posicion: number): Promise<void> {
    const respuesta = await Swal.fire({
      title: `¿Eliminar ${this.etiqueta.toLowerCase()} ${posicion + 1}?`,
      text: 'Se eliminará con todo lo que contiene. Los cambios se aplican al guardar.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!respuesta.isConfirmed) {
      return;
    }
    const [eliminada] = this.filas.splice(posicion, 1);
    if (eliminada === this.seleccionada) {
      this.seleccionada = this.filas[Math.min(posicion, this.filas.length - 1)] || null;
    }
  }

  /** Lleva la vista al formulario de la fila, después de dibujarlo. */
  private mostrarFormulario(): void {
    setTimeout(() => {
      const elemento = this.formulario && this.formulario.nativeElement;
      if (elemento && elemento.scrollIntoView) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    });
  }

  /** Las de COLUMNAS_RESUMEN que existen en la lista o, si no tiene, su primer campo de texto, número u opciones. */
  private columnasDeResumen(): ColumnaVista[] {
    const hijos = this.nodo.hijos || [];
    const configuradas = (this.contexto.columnasResumen || {})[this.nodo.dato.clave];
    const campos = configuradas
      ? configuradas
          .map((columna) => ({ columna, campo: hijos.find((hijo) => hijo.dato.clave === columna.clave) }))
          .filter(({ campo }) => !!campo)
          .map(({ columna, campo }) => ({ campo, nombre: columna.nombre || campo.nombre }))
      : [campoResumenPorDefecto(this.nodo)].filter((campo) => !!campo).map((campo) => ({ campo, nombre: campo.nombre }));
    return campos.map(({ campo, nombre }) => ({
      campo,
      nombre,
      numerica: esCampoNumerico(campo) || campo.dato.type === 'repetible',
    }));
  }
}
