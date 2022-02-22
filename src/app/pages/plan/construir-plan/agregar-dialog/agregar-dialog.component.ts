import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { MatRadioChange } from '@angular/material/radio';
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
  control = {
    value: '',
    disabled: false,
    visible: false,
  };
  opt: boolean;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AgregarDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.opt = false;
    }

  close(): void {
    this.dialogRef.close();
  }

  ngOnInit(): void {
    this.formAgregar = this.formBuilder.group({
      descripcion: ['', Validators.required],
      nombre: ['', Validators.required],
      activo: ['', Validators.required],
      tipoDato: ['', this.control, Validators.required],
      requerido: ['', this.control, Validators.required],
      parametro: ['', Validators.required],
      bandera: ['', Validators.required],
      opciones: ['', Validators.required]
    });
  if (this.opt == false){
      this.formAgregar.get('opciones').disable();
    }
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

  onChange(event){
    if (event == 'select'){
      this.opt = true;
      this.formAgregar.get('opciones').enable();
    } else {
      this.opt = false;
      this.formAgregar.get('opciones').disable();
    }
  }

  verificarNivel(event: MatRadioChange){
    if(event.value == "false"){
      this.control = {
        value: '',
        disabled: true,
        visible: false,
      }
      this.formAgregar.get('tipoDato').disable();
      this.formAgregar.get('requerido').disable();
      this.formAgregar.get('opciones').disable();
    }else if (event.value == "true"){
      this.control = {
        value: '',
        disabled: false,
        visible: true,
      }
      this.formAgregar.get('tipoDato').enable();
      this.formAgregar.get('requerido').enable();
      if (this.opt){
        this.formAgregar.get('opciones').enable();
      }
    }
  }
}

interface tipoDato{
  value: string;
  viewValue: string;
}