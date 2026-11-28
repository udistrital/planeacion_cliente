import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { take } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';
import { mensajeDeError } from '../../iniciativa.service';
import { NodoDefinicion, ReferenciaDocumento } from '../../utils';
import { ContextoFormulario, rutaEnPlantilla } from '../../utils/formulario.utils';
import { VisorDocumentoIniciativaComponent } from '../visor-documento-iniciativa/visor-documento-iniciativa.component';

/**
 * Campo `documento` (Anexos). Al elegir el archivo revisa `formatos` y `tamano_maximo_mb` y lo sube
 * de una vez (contexto.subirDocumento: el mid lo pasa al gestor documental); la referencia que
 * responde queda en los datos y el submódulo se guarda solo (contexto.guardarAutomatico), igual que
 * al quitar el archivo. Los errores del servidor los muestra el componente que lo contiene.
 */
@Component({
  selector: 'app-campo-documento-iniciativa',
  templateUrl: './campo-documento-iniciativa.component.html',
  styleUrls: ['./campo-documento-iniciativa.component.scss'],
})
export class CampoDocumentoIniciativaComponent {
  @Input() nodo: NodoDefinicion;
  /** Referencia guardada en el submódulo (o null si aún no hay documento). */
  @Input() valor: ReferenciaDocumento | null = null;
  @Output() valorChange = new EventEmitter<ReferenciaDocumento | null>();
  /** Ruta del campo en los datos; al mid se envía sin los ids de fila. */
  @Input() ruta = '';
  @Input() contexto: ContextoFormulario;
  /** Nombre del documento para los botones (p. ej. el que se escribió en la fila); si falta, el del campo. */
  @Input() etiqueta = '';
  /** Los botones del archivo no van aquí: los pone el contenedor con `botones` (la columna Acciones de Anexos). */
  @Input() botonesAparte = false;
  /** Sin la caneca del archivo: el contenedor pone la suya (en los adicionales de Anexos, la que elimina la fila). */
  @Input() eliminarAparte = false;

  /** Los botones (ver, adjuntar, eliminar), para el contenedor cuando botonesAparte. */
  @ViewChild('botones', { static: true }) botones: TemplateRef<unknown>;

  /** Nombre del archivo que se está subiendo; vacío si no hay ninguno. */
  subiendo = '';
  abriendo = false;
  error = '';

  constructor(private gestor: GestorDocumentalService, private dialogo: MatDialog) {}

  get soloLectura(): boolean {
    return !this.contexto || this.contexto.soloLectura;
  }

  get formatos(): string[] {
    return this.nodo.dato.formatos || [];
  }

  /** Para el atributo accept del input, p. ej. ".pdf,.doc,.docx,.xls,.xlsx,.txt" (los formatos salen de la plantilla). */
  get aceptados(): string {
    return this.formatos.map((formato) => `.${formato}`).join(',');
  }

  get nombre(): string {
    return this.etiqueta || this.nodo.nombre;
  }

  /** Solo con la referencia del gestor se puede ver o descargar. */
  get puedeVer(): boolean {
    return !!(this.valor && this.valor.enlace);
  }

  /** El PDF se abre en el navegador; los demás formatos (Word, Excel, texto) se descargan. */
  get esPdf(): boolean {
    return extensionDe(this.valor && this.valor.nombre) === 'pdf';
  }

  /**
   * "Subido el 15/11/2026 10:00 por LAURA GOMEZ RIOS" (el nombre, como está en Terceros). Sin él dice solo la
   * fecha (el documento de identidad no se muestra); vacío si no hay fecha ni nombre.
   */
  get detalle(): string {
    if (!this.valor) {
      return '';
    }
    const fecha = this.valor.fecha ? new Date(this.valor.fecha) : null;
    const cuando = fecha && !isNaN(fecha.getTime())
      ? ` el ${fecha.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}`
      : '';
    const nombre = (this.valor.usuario_nombre || '').trim();
    const quien = nombre ? ` por ${nombre}` : '';
    return cuando || quien ? `Subido${cuando}${quien}` : '';
  }

  elegir(entrada: HTMLInputElement): void {
    const archivo = entrada.files && entrada.files[0];
    entrada.value = '';
    if (!archivo) {
      return;
    }
    const problema = this.problemaDe(archivo);
    if (problema) {
      this.error = problema;
      return;
    }
    if (!this.contexto.subirDocumento) {
      this.error = 'Desde aquí no se pueden subir archivos.';
      return;
    }
    this.error = '';
    this.subiendo = archivo.name;
    this.contexto.subirDocumento(rutaEnPlantilla(this.ruta), archivo).subscribe(
      (referencia) => {
        this.subiendo = '';
        this.cambiar(referencia);
        this.guardarCambio();
      },
      (error) => {
        this.subiendo = '';
        this.error = `No se pudo subir «${archivo.name}». ${mensajeDeError(error)}`;
      },
    );
  }

  /**
   * Quita la referencia de la iniciativa. Pide confirmación porque se guarda de una vez. El archivo
   * sigue en el gestor documental.
   */
  async quitar(): Promise<void> {
    const respuesta = await Swal.fire({
      title: `¿Eliminar el archivo de «${this.nombre}»?`,
      text: 'El archivo se quita de la iniciativa.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
    });
    if (!respuesta.isConfirmed) {
      return;
    }
    this.error = '';
    this.cambiar(null);
    this.guardarCambio();
  }

  ver(): void {
    const referencia = this.valor;
    this.abriendo = true;
    this.error = '';
    this.gestor.getByUUID(referencia.enlace).pipe(take(1)).subscribe((url: any) => {
      this.abriendo = false;
      // getByUUID emite la URL local del archivo o, si falla, el error.
      if (typeof url !== 'string') {
        this.error = 'No se pudo abrir el documento. Intente de nuevo.';
        return;
      }
      if (this.esPdf) {
        this.dialogo.open(VisorDocumentoIniciativaComponent, {
          data: { url, nombre: referencia.nombre },
          width: '68vw',
          maxWidth: '95vw',
          height: '90vh',
          autoFocus: false,
          panelClass: 'visor-documento-panel',
        });
        return;
      }
      const enlace = document.createElement('a');
      enlace.href = url;
      enlace.download = referencia.nombre;
      enlace.click();
    });
  }

  private problemaDe(archivo: File): string {
    const maximo = this.nodo.dato.tamano_maximo_mb;
    if (this.formatos.length && !this.formatos.includes(extensionDe(archivo.name))) {
      return `«${archivo.name}» no es un formato permitido. Use: ${this.formatos.join(', ')}.`;
    }
    if (maximo && archivo.size > maximo * 1024 * 1024) {
      return `«${archivo.name}» pasa de ${maximo} MB.`;
    }
    return '';
  }

  private cambiar(valor: ReferenciaDocumento | null): void {
    this.valor = valor;
    this.valorChange.emit(valor);
  }

  /** Va después de cambiar: el valor ya está en los datos del submódulo cuando se guardan. */
  private guardarCambio(): void {
    if (this.contexto.guardarAutomatico) {
      this.contexto.guardarAutomatico();
    }
  }
}

function extensionDe(nombre: string | undefined): string {
  const partes = (nombre || '').split('.');
  return partes.length > 1 ? partes.pop().toLowerCase() : '';
}
