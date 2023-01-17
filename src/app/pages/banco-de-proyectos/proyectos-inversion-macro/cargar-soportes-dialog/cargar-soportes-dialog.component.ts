import { Component, OnInit, Inject, AfterContentChecked, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-cargar-soportes-dialog',
  templateUrl: './cargar-soportes-dialog.component.html',
  styleUrls: ['./cargar-soportes-dialog.component.scss']
})
export class CargarSoportesDialogComponent implements OnInit {
  formEditar: FormGroup;
  nombre: string;  
  required: boolean;
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CargarSoportesDialogComponent>,
    private request: RequestManager,
  ) { }

  ngOnInit(): void {
    this.formEditar = this.formBuilder.group({
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
