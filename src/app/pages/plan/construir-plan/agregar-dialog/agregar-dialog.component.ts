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
    visible: false
  };

 

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
      activo: ['', Validators.required],
      tipoDato: ['',this.control, Validators.required],
      requerido: ['',this.control, Validators.required],
      parametro: ['', Validators.required]
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

  verificarNivel(event: MatRadioChange){
    if(event.value == "false"){
      this.control = {
        value: '',
        disabled: true,
        visible: false
      }
    }else if (event.value == "true"){
      this.control = {
        value: '',
        disabled: false,
        visible: true
      }
    }

}
}

interface tipoDato{
  value: string;
  viewValue: string;
}