import { Component, OnInit, Inject, AfterContentChecked, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-agregar-meta-dialog',
  templateUrl: './agregar-meta-dialog.component.html',
  styleUrls: ['./agregar-meta-dialog.component.scss']
})
export class AgregarMetaDialogComponent implements OnInit {
  formEditar: FormGroup;
  nombre: string;
  valor: number;
  required: boolean;
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AgregarMetaDialogComponent>,
    private request: RequestManager,
  ) { }

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
