import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service'

export interface DialogData {
  documentos: any[];
}

@Component({
  selector: 'app-cargar-soportes-dialog',
  templateUrl: './cargar-soportes-dialog.component.html',
  styleUrls: ['./cargar-soportes-dialog.component.scss']
})
export class CargarSoportesDialogComponent implements OnInit {
  formEditar: FormGroup;
  nombre: string;
  required: boolean;
  documentos: any[] = [];
  animal: string
  constructor(
    private formBuilder: FormBuilder,
    public dialogRef: MatDialogRef<CargarSoportesDialogComponent>,
    private request: RequestManager,
    private gestorDocumental: GestorDocumentalService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
  }

  ngOnInit(): void {
    this.formEditar = this.formBuilder.group({
      nombre: [this.nombre, Validators.required],
      documentos: ['',],
    });
  }

  ngOnDestroy() {
    this.close();
  }

  close(): void {
    this.dialogRef.close(this.documentos);
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  async onChangeDocumento(event) {
    if (event != undefined) {
      let aux = event.files[0];
      const found = this.documentos.find(element => element.nombre == aux.name && element.Activo);
      if (found == undefined) {

        Swal.fire({
          title: 'Guardando documento',
          timerProgressBar: true,
          showConfirmButton: false,
          allowOutsideClick: false, 
          willOpen: () => {
            Swal.showLoading();
          },
        })
        this.nombre = this.formEditar.get("nombre").value;
        let documento = {
          IdTipoDocumento: 66,
          nombre: this.nombre ? this.nombre : aux.name,
          metadatos: {
            dato_a: "Soportes planeacion"
          },
          descripcion: "Documento de soporte para proyectos de plan de acción de inversión",
          file: await this.gestorDocumental.fileToBase64(aux),
          Activo: true
        }
        this.documentos.push(documento);

        let documentoPorSubir = {
          documento: this.documentos,
        };

        this.request.post(environment.PLANES_MID, `inversion/guardar_documentos`, documentoPorSubir).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Documento Cargado',
              text: `Revise el campo de soportes para visualizar o eliminar`,
              icon: 'success',
              showConfirmButton: false,
              timer: 2000
            }).then(res => {
              this.documentos = data.Data;
            });
          }
        }, (error) => {
          this.documentos.pop();
          Swal.fire({
            title: 'Error en la operación',
            text: `No se pudo subir el documento`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        })
      } else {
        Swal.fire({
          title: 'Error en la operación',
          text: `Ya existe un documento con el mismo nombre`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2000
        })
      }
    } else {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se pudo subir el documento`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    }
  }
}
