import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DescripcionAccion, MAXIMO_TEXTO_OBSERVACION } from '../../utils';

/**
 * Pide el motivo del rechazo de la iniciativa. Se cierra con el motivo escrito, o sin nada si
 * se cancela.
 */
@Component({
  selector: 'app-rechazo-iniciativa-dialogo',
  templateUrl: './rechazo-iniciativa-dialogo.component.html',
  styleUrls: ['./rechazo-iniciativa-dialogo.component.scss'],
})
export class RechazoIniciativaDialogoComponent {
  readonly maximo = MAXIMO_TEXTO_OBSERVACION;
  motivo = '';

  constructor(@Inject(MAT_DIALOG_DATA) public accion: DescripcionAccion) {}

  get motivoLimpio(): string {
    return this.motivo.trim();
  }
}
