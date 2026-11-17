import { Component, EventEmitter, Input, Output } from '@angular/core';
import { take } from 'rxjs/operators';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';
import { mensajeDeError } from '../../iniciativa.service';
import { NodoDefinicion, ReferenciaDocumento } from '../../utils';
import { ContextoFormulario, rutaEnPlantilla } from '../../utils/formulario.utils';

/**
 * Campo `documento` (Anexos): el archivo adjunto con su nombre, cuándo y quién lo subió, y las
 * acciones con los íconos del sistema: adjuntar o reemplazar (📎), ver el PDF o descargar el Word,
 * y quitar. Al elegir el archivo revisa el formato (`formatos`) y el tamaño (`tamano_maximo_mb`)
 * y lo sube de una vez (contexto.subirDocumento: el mid lo pasa al gestor documental); la
 * referencia que responde queda en los datos y se guarda con el Guardar del submódulo.
 * En solo lectura solo se ve o descarga. Los errores del servidor los muestra quien lo contiene.
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

  /** Nombre del archivo que se está subiendo; vacío si no hay ninguno. */
  subiendo = '';
  abriendo = false;
  error = '';

  constructor(private gestor: GestorDocumentalService) {}

  get soloLectura(): boolean {
    return !this.contexto || this.contexto.soloLectura;
  }

  get formatos(): string[] {
    return this.nodo.dato.formatos || [];
  }

  /** Para el atributo accept del input: ".pdf,.doc,.docx". */
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

  /** El PDF se abre en el navegador; el Word se descarga, porque el navegador no lo muestra. */
  get esPdf(): boolean {
    return extensionDe(this.valor && this.valor.nombre) === 'pdf';
  }

  /** "Subido el 15/11/2026 10:00 por 1020304050"; vacío si la referencia no trae fecha ni usuario. */
  get detalle(): string {
    if (!this.valor) {
      return '';
    }
    const fecha = this.valor.fecha ? new Date(this.valor.fecha) : null;
    const cuando = fecha && !isNaN(fecha.getTime())
      ? ` el ${fecha.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${fecha.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: false })}`
      : '';
    const quien = this.valor.usuario ? ` por ${this.valor.usuario}` : '';
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
      },
      (error) => {
        this.subiendo = '';
        this.error = `No se pudo subir «${archivo.name}». ${mensajeDeError(error)}`;
      },
    );
  }

  /** Quita la referencia de los datos; el archivo sigue en el gestor documental. */
  quitar(): void {
    this.error = '';
    this.cambiar(null);
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
        window.open(url, '_blank');
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
}

function extensionDe(nombre: string | undefined): string {
  const partes = (nombre || '').split('.');
  return partes.length > 1 ? partes.pop().toLowerCase() : '';
}
