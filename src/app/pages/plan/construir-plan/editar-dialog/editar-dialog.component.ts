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
  opciones: string;
  formatoS: string;
  banderaTablaS: string;
  nivel: number;
  opt: boolean;

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
  visibleOpciones = {
    value: this.data.subDetalle.options,
    disabled: false
  };
  visibleFormato = {
    value: String(this.data.sub.formato),
    disabled: false  
  };
  visibleBandera = {
    value: String(this.data.sub.banderaTabla),
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
      this.opciones = data.subDetalle.options;
      this.banderaTablaS = String(data.sub.banderaTabla);
      this.nivel = data.nivel;
      this.opt = false;
    }

  ngOnInit(): void {
    this.formEditar = this.formBuilder.group({
      descripcion: [this.descripcion, Validators.required],
      nombre: [this.nombre, Validators.required],
      activo: [this.activoS, Validators.required],
      formato: [this.formatoS, this.visibleFormato, Validators.required],
      tipoDato: [this.tipoDato, this.visibleType, Validators.required],
      requerido: [this.required, this.visibleRequired, Validators.required],
      banderaTabla: [this.banderaTablaS, this.visibleBandera, Validators.required],
      opciones: [this.opciones, Validators.required]
    });
    this.verificarDetalle();
    //console.log(this.visibleRequired, this.visibleType)
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

  onChange(event){
    if (event == 'select'){
      this.opt = true;
      this.formEditar.get('opciones').enable();
    } else {
      this.opt = false;
      this.formEditar.get('opciones').disable();
    }
  }

  verificarDetalle(){
    if(this.data.subDetalle.type == undefined && this.data.subDetalle.required == undefined){
      this.visibleType = {
        value: '',
        disabled: true
      }
      this.visibleRequired = {
        value: '',
        disabled: true
      }
      this.formEditar.get('tipoDato').disable();
      this.formEditar.get('requerido').disable();
    }
    if(this.data.ban == "plan"){
      this.visibleType = {
        value: this.visibleType.value,
        disabled: true
      }
      this.visibleRequired = {
        value: this.visibleRequired.value ,
        disabled: true
      }
    }
    if(this.formatoS == "undefined" || this.formatoS == undefined){
      this.visibleFormato = {
        value: '',
        disabled: true
      }
    }
    if (this.nivel == 1){
      this.visibleBandera = {
        value: this.visibleBandera.value,
        disabled: true
      }
      this.formEditar.get('banderaTabla').setValue(this.visibleBandera.value);
    }
    if (this.nivel > 1){
      this.visibleBandera = {
        value: this.visibleBandera.value,
        disabled: false
      }
    }
    if (this.nivel > 1 && (this.banderaTablaS == "undefined" || this.banderaTablaS == undefined)){
      this.visibleBandera = {
        value: '',
        disabled: true
      }
    }
    if (this.tipoDato == "select"){
      this.visibleOpciones = {
        value: this.visibleOpciones.value ,
        disabled: false
      }
      this.formEditar.get('opciones').enable();
      this.opt = true;
    }
  }
}

interface tipoDato{
  value: string;
  viewValue: string;
}