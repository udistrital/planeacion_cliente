import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-editar-dialog',
  templateUrl: './editar-dialog.component.html',
  styleUrls: ['./editar-dialog.component.scss']
})
export class EditarDialogComponent implements OnInit {

  nivel: number;
  formEditar: FormGroup;
  nombre: string;
  descripcion: string;
  estadoS: string;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.nombre = data.sub.nombre;
      this.descripcion = data.sub.descripcion;
      this.estadoS = String(data.sub.estado);
     }

  consulta(){
    this.formEditar.get('estado').setValue(this.estadoS);
    this.formEditar.get('nombre').setValue(this.nombre);
    this.formEditar.get('descripcion').setValue(this.descripcion);
  }

  ngOnInit(): void {
    this.formEditar = this.formBuilder.group({
      descripcion: [this.descripcion, Validators.required],
      nombre: [this.nombre, Validators.required],
      estado: [this.estadoS, Validators.required],
    });
  }

  // createEditFormGroup(): void {
  //   // Here you'll have the object already, so don't do this
  //   const thread = {
  //     nombre: this.nombre,
  //     descripcion: this.descripcion,
  //     estado: this.estado
  //   }

  //   // Now simply create the form, passing this object (in this
  //   // case, the object "thread")
  //   this.formEditar = this.formBuilder.group(thread);
  // }

  close(): void {
    this.dialogRef.close();
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required', )) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  deshacer(){
    this.formEditar.reset();
  }

}
