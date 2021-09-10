import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-agregar-dialog',
  templateUrl: './agregar-dialog.component.html',
  styleUrls: ['./agregar-dialog.component.scss']
})

export class AgregarDialogComponent implements OnInit {

  formAgregar: FormGroup;
  tipos: tipoDato[] = [
    {value: 'numeric', viewValue:'Numérico'},
    {value: 'input', viewValue:'Texto'},
    {value: 'select', viewValue:'Select'}
  ]
  visible = {
    value: '',
    disabled: false  
  };

 

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AgregarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.verificarNivel();
    this.formAgregar = this.formBuilder.group({
      descripcion: ['', Validators.required],
      nombre: ['', Validators.required],
      activo: ['', Validators.required],
      tipoDato: [this.visible, Validators.required],
      requerido: [this.visible, Validators.required]
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

  verificarNivel(){
    if(this.data.nivel === 1){
      this.visible = {
        value: '',
        disabled: true
      }
    }

  }

}

interface tipoDato{
  value: string;
  viewValue: string;
}