import { Component, OnInit, Inject, AfterContentChecked, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-apropiacion-fuente-dialog',
  templateUrl: './editar-apropiacion-fuente-dialog.component.html',
  styleUrls: ['./editar-apropiacion-fuente-dialog.component.scss']
})
export class EditarApropiacionFuenteDialogComponent implements OnInit {
  formEditar: FormGroup;
  nombre: string;
  descripcion: string;
  valor: number;
  required: boolean;
  dataRow: any;
  fuenteId: any;
  apropiacionFuentes: any;

  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditarApropiacionFuenteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.nombre = data.row.nombre;
      this.descripcion = data.row.descripcion;
      this.valor = data.row.presupuesto;
      this.dataRow = data.row;
     }

  ngOnInit(): void {
    this.formEditar = this.formBuilder.group({
      valor: [this.valor, Validators.required],
      nombre: [this.nombre, Validators.required],
      descripcion: [this.descripcion, Validators.required],
    });
    this.loadInfoFuente();
  }

  close(): void {
    this.dialogRef.close(this.apropiacionFuentes);
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  loadInfoFuente() {
    this.formEditar.get('nombre').setValue(this.nombre);
    this.formEditar.get('descripcion').setValue(this.descripcion);
    this.formEditar.get('valor').setValue(this.valor);
  }

  editFuente(){
    this.apropiacionFuentes = {      
      activo: true,
      nombre: this.formEditar.get('nombre').value,
      presupuesto: parseInt(this.formEditar.get('valor').value),
      //descripcion: this.formEditar.get('descripcion').value,
      codigo_abreviacion: ""     
    }
    
  }

}
