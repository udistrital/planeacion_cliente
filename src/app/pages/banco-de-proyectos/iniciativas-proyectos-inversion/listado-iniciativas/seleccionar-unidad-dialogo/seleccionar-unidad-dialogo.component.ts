import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Dependencia } from 'src/app/@core/models/dependencia';

export interface DatosSeleccionarUnidad {
  unidades: Dependencia[];
}

/**
 * Pregunta para cuál de sus unidades es la iniciativa nueva, cuando el usuario está
 * vinculado a varias. Se cierra con la unidad elegida, o sin nada si cancela.
 */
@Component({
  selector: 'app-seleccionar-unidad-dialogo',
  templateUrl: './seleccionar-unidad-dialogo.component.html',
  styleUrls: ['./seleccionar-unidad-dialogo.component.scss'],
})
export class SeleccionarUnidadDialogoComponent {
  unidad: Dependencia | null = null;

  constructor(@Inject(MAT_DIALOG_DATA) public datos: DatosSeleccionarUnidad) {}
}
