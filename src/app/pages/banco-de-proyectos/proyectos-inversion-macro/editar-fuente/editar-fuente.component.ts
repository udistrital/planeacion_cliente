import { Component, OnInit, Inject, AfterContentChecked, DoCheck, Output, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-editar-fuente',
  templateUrl: './editar-fuente.component.html',
  styleUrls: ['./editar-fuente.component.scss']
})
export class EditarFuenteComponent implements OnInit {

  formEditar: FormGroup;
  nombre: string;
  descripcion: string;
  valor: number;
  required: boolean;
  dataRow: any;
  fuenteId: any;

   

  constructor(private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<EditarFuenteComponent>,
    private request: RequestManager,
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

  ngOnDestroy(){

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

  loadInfoFuente() {
    this.formEditar.get('nombre').setValue(this.nombre);
    this.formEditar.get('descripcion').setValue(this.descripcion);
    this.formEditar.get('valor').setValue(this.valor);
  }

  editFuente() {
    this.fuenteId = this.dataRow._id;
    let fuentesApropiacion = {      
      activo: true,
      nombre: this.formEditar.get('nombre').value,
      presupuesto: parseInt(this.formEditar.get('valor').value), 
      descripcion: this.formEditar.get('descripcion').value,
      codigo_abreviacion: "" ,
      fecha_creacion: this.dataRow.fecha_creacion,

    }
    this.request.put(environment.PLANES_CRUD, 'fuentes-apropiacion', fuentesApropiacion, this.fuenteId).subscribe((data: any) => {
      if (data) {
        Swal.fire({
          title: 'Fuente de apropiacion editada',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `Por favor intente de nuevo`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

}
