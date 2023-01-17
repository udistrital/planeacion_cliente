import { Component, OnInit, Inject, AfterContentChecked, DoCheck, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatRadioChange } from '@angular/material/radio';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { FuentesDeApropiacionComponent } from '../fuentes-de-apropiacion/fuentes-de-apropiacion.component';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-agregar-fuente-dialog',
  templateUrl: './agregar-fuente-dialog.component.html',
  styleUrls: ['./agregar-fuente-dialog.component.scss']
})
export class AgregarFuenteDialogComponent implements OnInit {
  formEditar: FormGroup;
  nombre: string;
  descripcion: string;
  valor: number;
  required: boolean;
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<AgregarFuenteDialogComponent>,
    private request: RequestManager,
    private router: Router,
  ) {
    // this.nombre = sub.nombre;
    // this.valor = sub.valor;
   }

  ngOnInit(): void {
    this.formEditar = this.formBuilder.group({
      valor: [this.valor, Validators.required],
      nombre: [this.nombre, Validators.required],
      descripcion: [this.descripcion, Validators.required],      
    });

  }

  ngOnDestroy() {    
    
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

  addFuente(){
    let fuentesApropiacion = {      
      activo: true,
      nombre: this.formEditar.get('nombre').value,
      presupuesto: parseInt(this.formEditar.get('valor').value), 
      descripcion: this.formEditar.get('descripcion').value,
      codigo_abreviacion: ""     
    }
    
    this.request.post(environment.PLANES_CRUD, 'fuentes-apropiacion', fuentesApropiacion).subscribe((data: any) => {
      if (data) {
        Swal.fire({
          title: 'Fuente de apropiacion agregada',
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
    //FuentesDeApropiacionComponent.reloadFuentes()
  }

}
