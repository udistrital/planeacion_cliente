import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-editar-dialog',
  templateUrl: './editar-dialog.component.html',
  styleUrls: ['./editar-dialog.component.scss']
})
export class EditarDialogComponent implements OnInit {
  
  formEditar: FormGroup;
  nombre: string;
  descripcion: string;
  activoS: string;
  tipoDato: string;
  required: boolean;

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
    public dialogRef: MatDialogRef<EditarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.nombre = data.sub.nombre;
      this.descripcion = data.sub.descripcion;
      this.activoS = String(data.sub.activo);
      this.tipoDato = data.subDetalle.type;
      this.required = data.subDetalle.required;
      

      

     }

  ngOnInit(): void {
 
    this.formEditar = this.formBuilder.group({
      descripcion: [this.descripcion, Validators.required],
      nombre: [this.nombre, Validators.required],
      activo: [this.activoS, Validators.required],
      tipoDato:[this.tipoDato, this.visible , Validators.required],
      requerido:[this.required, this.visible,Validators.required]
    });
    this.verificarNivel();

  }

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