import { Component, Input } from '@angular/core';
import Swal from 'sweetalert2';
import { Datos, NodoDefinicion } from '../../utils';
import {
  ContextoFormulario,
  filasDeRuta,
  nuevoIdFila,
  prefijoDeClave,
  prepararEstructura,
  rutaFila,
  textoDeFila,
} from '../../utils/formulario.utils';

/**
 * Lista de filas de un grupo repetible. Si el grupo es espejo de otro (p. ej.
 * objetivos específicos de las causas directas), las filas salen del grupo de
 * origen: no se agregan ni se eliminan aquí y cada una muestra su elemento de origen.
 */
@Component({
  selector: 'app-grupo-repetible-iniciativa',
  templateUrl: './grupo-repetible-iniciativa.component.html',
  styleUrls: ['./grupo-repetible-iniciativa.component.scss'],
})
export class GrupoRepetibleIniciativaComponent {
  @Input() nodo: NodoDefinicion;
  /** Lista de filas dentro de los datos (se modifica en el mismo arreglo). */
  @Input() filas: Datos[] = [];
  @Input() ruta = '';
  @Input() contexto: ContextoFormulario;
  @Input() filaOrigen: Datos | null = null;
  /** Falso cuando la lista va sola en una sección cuyo título ya la nombra. */
  @Input() conTitulo = true;

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

  porId(_: number, fila: Datos): string {
    return fila.id;
  }

  rutaDeFila(fila: Datos): string {
    return rutaFila(this.ruta, fila.id);
  }

  erroresDeFila(fila: Datos): string[] {
    return this.contexto.errores[this.rutaDeFila(fila)] || [];
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

  agregar(): void {
    const fila = prepararEstructura(this.nodo.hijos, { id: nuevoIdFila(prefijoDeClave(this.nodo.dato.clave)) }, this.contexto);
    this.filas.push(fila);
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
    if (respuesta.isConfirmed) {
      this.filas.splice(posicion, 1);
    }
  }
}
