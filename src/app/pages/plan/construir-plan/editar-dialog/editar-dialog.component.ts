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
  formatoS: string;

  tipos: tipoDato[] = [
    {value: 'numeric', viewValue:'Numérico'},
    {value: 'input', viewValue:'Texto'},
    {value: 'select', viewValue:'Select'}
  ]
  visibleType = {
    value: this.data.subDetalle.type,
    disabled: false  
  };

  visibleRequired = {
    value: this.data.subDetalle.required,
    disabled: false  
  };
  visibleFormato = {
    value: String(this.data.sub.formato),
    disabled: false  
  };



  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.nombre = data.sub.nombre;
      this.descripcion = data.sub.descripcion;
      this.activoS = String(data.sub.activo);
      this.formatoS = String(data.sub.formato);
      this.tipoDato = data.subDetalle.type;
      this.required = data.subDetalle.required;
     }

  ngOnInit(): void {
 
    this.formEditar = this.formBuilder.group({
      descripcion: [this.descripcion, Validators.required],
      nombre: [this.nombre, Validators.required],
      activo: [this.activoS, Validators.required],
      radioFormato:[this.formatoS,this.visibleFormato, Validators.required],
      tipoDato:[this.tipoDato, this.visibleType , Validators.required],
      requerido:[this.required, this.visibleRequired ,Validators.required]
    });
    this.verificarDetalle();
    console.log(this.visibleRequired, this.visibleType)

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




  verificarDetalle(){
    if(this.data.subDetalle.type == "" && this.data.subDetalle.required == ""){
      this.visibleType = {
        value: "",
        disabled: true
      }
      this.visibleRequired = {
        value: "",
        disabled: true
      }
    }
    if(this.data.ban == "plan"){
      this.visibleType = {
        value:  this.visibleType.value,
        disabled: true
      }
      this.visibleRequired = {
        value:this.visibleRequired.value ,
        disabled: true
      }
    }
    if(this.formatoS == "undefined"){
      this.visibleFormato ={
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