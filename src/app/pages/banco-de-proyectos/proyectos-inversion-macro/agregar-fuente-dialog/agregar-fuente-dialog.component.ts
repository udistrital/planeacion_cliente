import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { CurrencyPipe } from '@angular/common';

@Component({
  selector: 'app-agregar-fuente-dialog',
  templateUrl: './agregar-fuente-dialog.component.html',
  styleUrls: ['./agregar-fuente-dialog.component.scss']
})
export class AgregarFuenteDialogComponent implements OnInit {
  formEditar: FormGroup;
  nombre: string;
  descripcion: string;
  valor: string;
  required: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private currencyPipe: CurrencyPipe,
    public dialogRef: MatDialogRef<AgregarFuenteDialogComponent>,
    private request: RequestManager,
  ) { }

  ngOnInit(): void {
    this.formEditar = this.formBuilder.group({
      valor: [this.valor, Validators.required],
      nombre: [this.nombre, Validators.required],
      descripcion: [this.descripcion, Validators.required],
    });

    this.formEditar.valueChanges.subscribe(form => {
      if (form.valor) {
        this.formEditar.patchValue({
          valor: this.currencyPipe.transform(form.valor.replace(/\D/g, '').replace(/^0+/, ''), 'USD', 'symbol', '1.0-0')
        }, { emitEvent: false });
      }
    });
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

  addFuente() {
    let fuentesApropiacion = {
      activo: true,
      nombre: this.formEditar.get('nombre').value,
      presupuesto: parseInt(this.formEditar.get('valor').value.replace("$", "").replaceAll(",", "")),
      presupuestoDisponible: parseInt(this.formEditar.get('valor').value.replace("$", "").replaceAll(",", "")),
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
  }
}
