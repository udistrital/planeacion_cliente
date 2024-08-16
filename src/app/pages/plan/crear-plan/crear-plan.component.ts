import { Component, OnInit, SimpleChanges, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { UserService } from '../../services/userService';
import { UtilService } from '../../services/utilService';
import { RequestManager } from '../../services/requestManager';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment'
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { VisualizarDocumentoDialogComponent } from '../../seguimiento/generar-trimestre/visualizar-documento-dialog/visualizar-documento-dialog.component';
import { CodigosService } from 'src/app/@core/services/codigos.service';

@Component({
  selector: 'app-crear-plan',
  templateUrl: './crear-plan.component.html',
  styleUrls: ['./crear-plan.component.scss']
})
export class CrearPlanComponent implements OnInit {

  formCrearPlan: FormGroup;
  tipos: any[]
  tipoPlan: any;
  tipoPlanPAF: any;
  nombrePlan: string;
  banderaFormato: boolean = false;
  vigencias: any[];
  documento: any;
  auxDocumento: string;

  constructor(
    private request: RequestManager,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router,
    private formBuilder: FormBuilder,
    private diagog: MatDialog,
    private dialogRef: MatDialogRef<CrearPlanComponent>,
    private codigosService: CodigosService
  ) {
    this.loadTipos();

  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  createPlan() {
    this.mostrarMensajeCarga();
    let dataPlan;
    if (this.formCrearPlan.get('radioFormato').disabled) {
      this.cargarDocumento().then(() => {
        dataPlan = {
          nombre: this.formCrearPlan.get('nombre').value,
          descripcion: this.formCrearPlan.get('desc').value,
          tipo_plan_id: this.tipoPlan._id,
          aplicativo_id: "idPlaneacion", // Valor por revisar
          activo: JSON.parse(this.formCrearPlan.get('radioEstado').value),
          documento_id: this.auxDocumento,
          vigencia: (this.formCrearPlan.get('vigencia').value)["Id"]
        }

        this.request.post(environment.PLANES_CRUD, 'plan', dataPlan).subscribe(
          (data) => {
            if (data) {
              Swal.fire({
                title: 'Registro correcto',
                text: `Se ingresaron correctamente los datos`,
                icon: 'success',
              }).then((result) => {
                if (result.value) {
                  this.dialogRef.close();
                  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['pages/plan/construir-plan-proyecto']);
                  });
                }
              })
            }
          }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              showConfirmButton: false,
              timer: 2500
            })
          }
        )
      })
    } else {
      dataPlan = {
        nombre: this.formCrearPlan.get('nombre').value,
        descripcion: this.formCrearPlan.get('desc').value,
        tipo_plan_id: this.tipoPlan._id,
        aplicativo_id: "idPlaneacion", // Valor por revisar
        activo: JSON.parse(this.formCrearPlan.get('radioEstado').value),
        formato: JSON.parse(this.formCrearPlan.get('radioFormato').value)
      }
      if(this.tipoPlanPAF == this.tipoPlan._id) {
        this.request.post(environment.PLANES_MID, 'formulacion/clonar-formato-paf', dataPlan).subscribe(
          (data) => {
            if (data) {
              Swal.fire({
                title: 'Registro correcto',
                text: `Se ingresaron correctamente los datos`,
                icon: 'success',
              }).then((result) => {
                if (result.value) {
                  this.dialogRef.close();
                  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['pages/plan/construir-plan-proyecto']);
                  });
                }
              })
            }
          }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              showConfirmButton: false,
              timer: 2500
            })
          }
        )
      } else {
        let vigencia_aplica = this.formCrearPlan.get('vigencia_aplica').value;
        if (Array.isArray(vigencia_aplica)) {
          if (vigencia_aplica.length > 0) {
            dataPlan['vigencia_aplica'] = JSON.stringify(vigencia_aplica.map(vigencia => JSON.parse(vigencia)));
          }
        }
        this.request.post(environment.PLANES_CRUD, 'plan', dataPlan).subscribe(
          (data) => {
            if (data) {
              Swal.fire({
                title: 'Registro correcto',
                text: `Se ingresaron correctamente los datos`,
                icon: 'success',
              }).then((result) => {
                if (result.value) {
                  this.dialogRef.close();
                  this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                    this.router.navigate(['pages/plan/construir-plan-proyecto']);
                  });
                }
              })
            }
          }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              showConfirmButton: false,
              timer: 2500
            })
          }
        )
      }
    }
  }

  async select(tipo) {
    this.tipoPlan = tipo;
    if (tipo._id !== await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PR_SP') && tipo._id !== await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PUI_SP')) { // diferente de proyecto
      this.nombrePlan = tipo.nombre;
      this.banderaFormato = true;
      this.formCrearPlan.get('radioFormato').enable();
      this.formCrearPlan.get('vigencia').disable();
    } else {
      this.nombrePlan = tipo.nombre;
      this.banderaFormato = false;
      this.formCrearPlan.get('vigencia').enable();
      this.formCrearPlan.get('radioFormato').disable();
      this.loadPeriodos();
    }
  }



  loadTipos() {
    this.request.get(environment.PLANES_CRUD, `tipo-plan?query=activo:true`).subscribe((data: any) => {
      if (data) {
        this.tipos = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: 'No se encontraron datos registrados',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  loadPeriodos() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }


  onChangeDocumento(event) {
    if (event != undefined) {
      let aux = event.files[0];
      if (this.documento == undefined || this.documento.name != aux.name) {
        this.documento = aux;
        Swal.fire({
          title: 'Documento Cargado',
          text: `Revise el campo de soportes para visualizar o eliminar`,
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        })
      } else {
        Swal.fire({
          title: 'Error en la operación',
          text: `El documento ya se encuentra cargado`,
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

  eliminarDocumento() {
    this.documento = undefined;
  }

  cargarDocumento() {
    let message: string = '';
    let resolveRef;
    let rejectRef;
    let bodyPost;
    let dataPromise: Promise<string> = new Promise((resolve, reject) => {
      resolveRef = resolve;
      rejectRef = reject;
    });
    if (this.documento != undefined) {
      let header = "data:application/pdf;base64,";
      let documentoBase64: string;
      const file = this.documento;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {

        let aux = new String(reader.result);
        documentoBase64 = aux.replace(header, "")
        bodyPost = {
          IdTipoDocumento: 65,
          nombre: this.documento.name,
          metadatos: {
            dato_a: "Soporte Proyecto Universitario Institucional"
          },
          descripcion: "Documento de soporte para Proyecto Universitario Institucional",
          file: documentoBase64
        }

        let body: any[] = [];
        body.push(bodyPost);
        this.request.post(environment.GESTOR_DOCUMENTAL_MID, `document/upload`, body).subscribe((data: any) => {
          if (data) {

            this.auxDocumento = data.res.Enlace;
            resolveRef(message);
          } else {

            Swal.fire({
              title: 'Error al cargar documento. Intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
            rejectRef(message);

          }
        })
      };

    } else {
      this.auxDocumento = '';
      resolveRef(message);
    }
    return dataPromise;
  }


  async ngOnInit(){
    this.loadPeriodos();
    this.formCrearPlan = this.formBuilder.group({
      nombre: ['', Validators.required],
      desc: ['', Validators.required],
      vigencia_aplica: [[]],
      tipo: ['', Validators.required],
      radioEstado: ['', Validators.required],
      radioFormato: ['', Validators.required],
      vigencia: ['', Validators.required],
    });
    this.tipoPlanPAF = await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PAF_SP'); 
  }

  vigenciaToJson(vigencia: { Id: number, Nombre: string }): string {
    return JSON.stringify({ Id: vigencia.Id, Nombre: vigencia.Nombre });
  }

  onOpenedChangeVigencia(isOpened: boolean) {
    if (isOpened) {
      Swal.fire({
        title: 'Información',
        text: 'Una vez guardadas las vigencias a las que aplicará el plan NO está permitido desmarcarlas. Para más información comunicarse con computo@udistrital.edu.co',
        icon: 'info',
        confirmButtonText: 'OK'
      });
    }
  }

  mostrarMensajeCarga(): void {
    Swal.fire({
      title: 'Procesando petición...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }
}
