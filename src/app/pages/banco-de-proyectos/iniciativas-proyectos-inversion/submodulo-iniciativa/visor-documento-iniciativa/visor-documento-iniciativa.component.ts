import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

export interface DatosVisorDocumento {
  url: string;
  nombre: string;
}

/**
 * Modal para ver un documento (PDF) sin salir de la aplicación. El visor del navegador
 * dentro del iframe ya trae zoom, páginas y búsqueda. Se cierra con la X, con Esc o
 * haciendo clic fuera del modal.
 */
@Component({
  selector: 'app-visor-documento-iniciativa',
  templateUrl: './visor-documento-iniciativa.component.html',
  styleUrls: ['./visor-documento-iniciativa.component.scss'],
})
export class VisorDocumentoIniciativaComponent {
  urlSegura: SafeResourceUrl | null = null;

  constructor(
    @Inject(MAT_DIALOG_DATA) public datos: DatosVisorDocumento,
    private dialogRef: MatDialogRef<VisorDocumentoIniciativaComponent>,
    sanitizer: DomSanitizer,
  ) {
    const segura = sanitizer.bypassSecurityTrustResourceUrl(`${datos.url}#page=1&zoom=100`);
    // El PDF se carga cuando termina la animación de apertura, para que el visor mida el tamaño final.
    this.dialogRef.afterOpened().subscribe(() => (this.urlSegura = segura));
  }

  cerrar(): void {
    this.dialogRef.close();
  }
}
