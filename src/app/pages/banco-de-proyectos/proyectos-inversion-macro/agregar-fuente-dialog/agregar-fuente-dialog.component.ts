import { Component, OnInit, Inject, AfterContentChecked, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-fuente-dialog',
  templateUrl: './agregar-fuente-dialog.component.html',
  styleUrls: ['./agregar-fuente-dialog.component.scss']
})
export class AgregarFuenteDialogComponent implements OnInit {
  formEditar: FormGroup;
  nombre: string;
  valor: number;
  required: boolean;
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AgregarFuenteDialogComponent>,
    private request: RequestManager,
  ) {
    // this.nombre = sub.nombre;
    // this.valor = sub.valor;
   }

  ngOnInit(): void {
    this.formEditar = this.formBuilder.group({
      valor: [this.valor, Validators.required],
      nombre: [this.nombre, Validators.required],      
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

}
