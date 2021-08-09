import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Subgrupo } from '../construir-plan.component';
import { FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-agregar-dialog',
  templateUrl: './agregar-dialog.component.html',
  styleUrls: ['./agregar-dialog.component.scss']
})
export class AgregarDialogComponent implements OnInit {

  nivel: number;
  formAgregar: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AgregarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.formAgregar = this.formBuilder.group({
      descripcion: ['', Validators.required],
      nombre: ['', Validators.required],
      estado: ['', Validators.required],
    });
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required', )) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  deshacer(){
    this.formAgregar.reset();
  }

}
