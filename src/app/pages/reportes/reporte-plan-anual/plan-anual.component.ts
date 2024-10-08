import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';
import { UserService } from '../../services/userService';
import { CodigosService } from 'src/app/@core/services/codigos.service';

@Component({
  selector: 'app-plan-anual',
  templateUrl: './plan-anual.component.html',
  styleUrls: ['./plan-anual.component.scss']
})
export class PlanAnualComponent implements OnInit {

  form: FormGroup;
  vigencias: any[];
  unidades: any[];
  auxUnidades: any[];
  unidadVisible: boolean;
  tablaVisible: boolean;
  reporte: any;
  reporte_archivo: any;
  dataSource: MatTableDataSource<any>;
  displayedColumns: string[];
  rol: string;
  moduloVisible: boolean;
  estados: any[];
  planes: any[];
  auxPlanes: any[];
  evaluacion: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private userService: UserService,
    private codigosService: CodigosService
  ) {
    this.loadVigencias();
    this.loadPlanes();
    this.unidadVisible = true;
    this.tablaVisible = false;
    this.estados = [];
    this.dataSource = new MatTableDataSource<any>();
    let roles: any = this.autenticationService.getRole();
    this.displayedColumns = ['vigencia', 'unidad', 'tipoPlan', 'estado'];
    if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
      this.loadUnidades();
    }
    else if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA';
      this.validarUnidad();
    }
    this.form = this.formBuilder.group({
      vigencia: ['', Validators.required],
      tipoReporte: ['', Validators.required],
      categoria: ['', Validators.required],
      unidad: ['', Validators.required],
      estado: ['', Validators.required],
      plan: ['', Validators.required],
    });
  }

  async ngOnInit(){
    this.loadEstados();
  }

  validarUnidad() {
    this.userService.user$.subscribe((data) => {
      this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion/?query=Numero:` + data['userService']['documento'])
        .subscribe((datosInfoTercero: any) => {
          this.request.get(environment.PLANES_MID, `formulacion/vinculacion_tercero/` + datosInfoTercero[0].TerceroId.Id)
            .subscribe((vinculaciones: any) => {
              if (vinculaciones["Data"] != "") {
                const vinculacion = vinculaciones.Data;
                this.unidades = [];
                this.auxUnidades = [];
                for (let i = 0; i < vinculaciones.Data.length; i++) {
                  this.request.get(environment.OIKOS_SERVICE, `dependencia_tipo_dependencia?query=DependenciaId:` + vinculacion[i].DependenciaId).subscribe((dataUnidad: any) => {
                    if (dataUnidad) {
                      let unidad = dataUnidad[0]["DependenciaId"]
                      unidad["TipoDependencia"] = dataUnidad[0]["TipoDependenciaId"]["Id"]
                      for (let i = 0; i < dataUnidad.length; i++) {
                        if (dataUnidad[i]["TipoDependenciaId"]["Id"] === 2) {
                          unidad["TipoDependencia"] = dataUnidad[i]["TipoDependenciaId"]["Id"]
                        }
                      }
                      this.unidades.push(unidad);
                      this.auxUnidades.push(unidad);
                    }
                  })
                }
                this.form.get('unidad').setValue(this.unidades[0]);
                this.moduloVisible = true;
                this.form.get('categoria').setValue("planAccion");
                this.form.get('tipoReporte').setValue("unidad");
                this.form.get('tipoReporte').disable();
              } else {
                this.moduloVisible = false;
                Swal.fire({
                  title: 'Error en la operación',
                  text: `No cuenta con los permisos requeridos para acceder a este módulo`,
                  icon: 'warning',
                  showConfirmButton: false,
                  timer: 4000
                })
              }
            })
        })

    })
  }

  loadVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
      if (data) {
        data.Data.sort((a, b) => a.Nombre - b.Nombre);
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

  loadUnidades() {
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) => {
      if (data) {
        this.unidades = data.Data;
        this.auxUnidades = data.Data;
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

  async loadEstados() {
    // Carga estado Formulado
    this.request.get(environment.PLANES_CRUD, `estado-plan/${await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'F_SP')}`).subscribe((data: any) => {
      if (data) {
        this.estados.push(data.Data)
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
    // Carga estado Pre aval
    this.request.get(environment.PLANES_CRUD, `estado-plan/${await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'PA_SP')}`).subscribe((data: any) => {
      if (data) {
        this.estados.push(data.Data)
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
    // Carga estado  aval
    this.request.get(environment.PLANES_CRUD, `estado-plan/${await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'A_SP')}`).subscribe((data: any) => {
      if (data) {
        this.estados.push(data.Data)
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

  loadPlanes() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,formato:true`).subscribe((data: any) => {
      if (data) {
        this.planes = data.Data;
        this.auxPlanes = this.planes;
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


  onKey(value: string, type: string) {
    if (value == undefined || value.trim() === '') {
      if (type === 'plan') {
        this.auxPlanes = [...this.planes];
      } else if (type === 'unidad') {
        this.auxUnidades = [...this.unidades];
      }
    } else {
      if (type === 'plan') {
        this.auxPlanes = this.buscarPlanes(value);
      } else if (type === 'unidad') {
        this.auxUnidades = this.buscarUnidades(value);
      }
    }
  }
  
  buscarPlanes(value: string) {
    return this.planes.filter(plan => 
      plan.nombre.toLowerCase().includes(value.toLowerCase()));
  }
  
  buscarUnidades(value: string) {
    return this.unidades.filter(unidad => 
      unidad.Nombre.toLowerCase().includes(value.toLowerCase()));
  }

  onChangeT(tipo) {
    if (tipo === 'unidad') {
      this.form.get('unidad').enable();
      this.unidadVisible = true;
    } else if (tipo === 'general') {
      this.form.get('unidad').setValue(null);
      this.form.get('unidad').disable();
      this.unidadVisible = false;
    }
  }

  onChangeC(categoria) {
    this.evaluacion = false;
    if (categoria == 'necesidades') {
      this.form.get('tipoReporte').setValue('general');
      this.form.get('tipoReporte').setValue(null);
      this.form.get('tipoReporte').disable();
      this.form.get('unidad').setValue(null);
      this.form.get('unidad').disable();
      this.form.get('estado').enable();
      this.unidadVisible = false;
    } else if (categoria == 'evaluacion') {
      if (this.rol == 'PLANEACION') {
        this.form.get('tipoReporte').setValue(null);
        this.form.get('tipoReporte').disable();
      }
      this.form.get('estado').setValue(null);
      this.form.get('estado').disable();
      this.form.get('unidad').enable();
      this.form.get('unidad').setValue(null);
      this.evaluacion = true;
    } else {
      if (this.rol == 'PLANEACION') {
        this.form.get('tipoReporte').enable();
      }
      this.form.get('unidad').enable();
      this.form.get('estado').enable();
      this.unidadVisible = true;
    }
  }

  async verificar() {
    let unidad = this.form.get('unidad').value;
    let vigencia = this.form.get('vigencia').value;
    let tipoReporte = this.form.get('tipoReporte').value;
    let categoria = this.form.get('categoria').value;
    let estado = this.form.get('estado').value;
    let plan = this.form.get('plan').value;
    let body = {
      plan_id: plan._id,
      tipo_plan_id: await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PAF_SP'),
      vigencia: (vigencia.Id).toString(),
      nombre: plan.nombre
    };
    Swal.fire({
      title: 'Validando reporte',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    if (categoria === 'planAccion') {
      if (tipoReporte === 'unidad') {
        body["unidad_id"] = (unidad.Id).toString();
        body["estado_plan_id"] = estado;
        body["categoria"] = "Plan_Accion_Unidad";
      } else if (tipoReporte === 'general') {
        body["estado_plan_id"] = estado;
        body["categoria"] = "Plan_Accion_General";
      }
    } else if (categoria === 'necesidades') {
      body["estado_plan_id"] = estado;
      body["categoria"] = "Necesidades";
    } else if (categoria === 'evaluacion') {
      body["unidad_id"] = (unidad.Id).toString();
      body["categoria"] = "Evaluacion";
    }

    this.request.post(environment.PLANES_MID, `reportes/validar_reporte`, body).subscribe((res: any) => {
      if (res) {
        if (res.Data.reporte) {
          this.generar();
        } else {
          Swal.fire({
            title: 'No es posible generar un reporte',
            text: res.Data.mensaje,
            icon: 'info',
            showConfirmButton: false,
            timer: 3500
          })
        }
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No es posible generar el reporte`,
        icon: 'error',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  async generar() {
    let unidad = this.form.get('unidad').value;
    let vigencia = this.form.get('vigencia').value;
    let tipoReporte = this.form.get('tipoReporte').value;
    let categoria = this.form.get('categoria').value;
    let estado = this.form.get('estado').value;
    let plan = this.form.get('plan').value;

    Swal.fire({
      title: 'Generando Reporte',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    if (categoria === 'planAccion') {
      if (tipoReporte === 'unidad') {
        let body = {
          unidad_id: (unidad.Id).toString(),
          tipo_plan_id: await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PAF_SP'),
          estado_plan_id: estado,
          vigencia: (vigencia.Id).toString(),
        }

        this.request.post(environment.PLANES_MID, `reportes/plan_anual/` + plan.nombre.replace(/ /g, "%20"), body).subscribe((data: any) => {
          if (data) {
            if (data.Data.generalData) {
              this.dataSource.data = [];
              let auxEstado = this.estados.find(element => element._id === estado);
              this.reporte = body;
              this.reporte_archivo = data.Data.excelB64;
              this.reporte["nombre_unidad"] = data.Data.generalData[0].nombreUnidad;
              this.reporte["vigencia"] = vigencia.Nombre
              this.reporte["tipo_plan"] = "Plan de acción de funcionamiento"
              this.reporte["estado_plan"] = auxEstado.nombre
              this.tablaVisible = true;
              let auxDataSource = this.dataSource.data;
              auxDataSource.push(this.reporte)
              this.dataSource.data = auxDataSource;
              Swal.close();
            } else {
              Swal.close();
              Swal.fire({
                title: 'Error en la operación',
                text: `No se encontraron datos registrados para este reporte`,
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              })
            }

          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        })
      } else if (tipoReporte === 'general') {
        let body = {
          tipo_plan_id: await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PAF_SP'),
          estado_plan_id: estado,
          vigencia: (vigencia.Id).toString(),
        }


        this.request.post(environment.PLANES_MID, `reportes/plan_anual_general/`+ plan.nombre, body).subscribe((data: any) => {
          if (data) {
            let infoReportes: any[] = data.Data.generalData;
            this.dataSource.data = [];
            this.reporte_archivo = data.Data["excelB64"];
            for (let i = 0; i < infoReportes.length; i++) {
              infoReportes[i]["vigencia"] = vigencia["Nombre"]
              if (i == infoReportes.length - 1) {
                let auxDataSource = this.dataSource.data;
                this.dataSource.data = auxDataSource.concat(infoReportes);
                this.tablaVisible = true
                Swal.close();
              }
            }
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        })
      }
    } else if (categoria === 'necesidades') {
      let body = {
        tipo_plan_id: await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PAF_SP'),
        estado_plan_id: estado,
        vigencia: (vigencia.Id).toString(),
      }

      this.request.post(environment.PLANES_MID, `reportes/necesidades/` + plan.nombre.replace(/ /g, "%20"), body).subscribe((data: any) => {
        if (data) {
          this.dataSource.data = [];
          let auxEstado = this.estados.find(element => element._id === estado);
          this.reporte = body;
          this.reporte_archivo = data.Data["excelB64"];
          this.reporte["nombre_unidad"] = "General";
          this.reporte["vigencia"] = vigencia.Nombre;
          this.reporte["tipo_plan"] = "Necesidades";
          this.reporte["estado_plan"] = auxEstado.nombre;
          this.reporte["unidad_id"] = "";
          let auxDataSource = this.dataSource.data;
          auxDataSource.push(this.reporte)
          this.dataSource.data = auxDataSource;
          this.tablaVisible = true;
          Swal.close()
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados para realizar el reporte`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
    } else if (categoria === 'evaluacion') {
      let body = {
        unidad_id: (unidad.Id).toString(),
        tipo_plan_id: await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PAF_SP'),
        vigencia: (vigencia.Id).toString(),
      }

      this.request.post(environment.PLANES_MID, `reportes/plan_anual_evaluacion/` + plan.nombre.replace(/ /g, "%20"), body).subscribe((data: any) => {
        if (data) {
          if (data.Data.generalData) {
            this.dataSource.data = [];
            this.reporte = body;
            this.reporte_archivo = data.Data.excelB64;
            this.reporte["nombre_unidad"] = data.Data.generalData[0].nombreUnidad;
            this.reporte["vigencia"] = vigencia.Nombre
            this.reporte["tipo_plan"] = "Evaluación plan de acción"
            this.reporte["estado_plan"] = plan.nombre;
            this.tablaVisible = true;
            let auxDataSource = this.dataSource.data;
            auxDataSource.push(this.reporte)
            this.dataSource.data = auxDataSource;
            Swal.close();
          } else {
            Swal.close();
            Swal.fire({
              title: 'Error en la operación',
              text: `No se encontraron datos registrados para este reporte`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }

        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
    }
  }

  descargarReporte() {
    let blob = this.base64ToBlob(this.reporte_archivo);
    let url = window.URL.createObjectURL(blob);
    var anchor = document.createElement("a");
    let categoria = this.form.get('categoria').value;
    let vigencia = this.form.get('vigencia').value;
    let plan = this.form.get('plan').value;
    if(categoria === 'planAccion'){
      let tipoReporte = this.form.get('tipoReporte').value;
      if (tipoReporte === 'unidad') {
        let unidad = this.form.get('unidad').value;
        anchor.download = "Reporte_Plan_Accion_" + unidad.Nombre + ".xlsx";
      } else if (tipoReporte === 'general') {
        anchor.download = "Reporte_General_" + vigencia.Nombre + ".xlsx";
      }
    } else if(categoria === 'necesidades'){
      anchor.download = "Reporte_Necesidades_" + vigencia.Nombre + ".xlsx";
    } else if(categoria === 'evaluacion'){
      let unidad = this.form.get('unidad').value;
      anchor.download = "Reporte_Evaluacion_" + unidad.Nombre + ".xlsx";
    }
    anchor.href = url;
    anchor.click();
  }

  public base64ToBlob(b64Data, sliceSize = 512) {
    let byteCharacters = atob(b64Data); //data.file there
    let byteArrays = [];
    for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
      let slice = byteCharacters.slice(offset, offset + sliceSize);

      let byteNumbers = new Array(slice.length);
      for (var i = 0; i < slice.length; i++) {
        byteNumbers[i] = slice.charCodeAt(i);
      }
      let byteArray = new Uint8Array(byteNumbers);
      byteArrays.push(byteArray);
    }
    return new Blob(byteArrays, { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  }

  consultarVigencia(infoReportes: any[]) {
    for (let i = 0; i < infoReportes.length; i++) {
      this.request.get(environment.PARAMETROS_SERVICE, `periodo/` + infoReportes[i]["vigencia"]).subscribe((data: any) => {
        if (data) {
          let vigencia: any = data.Data;
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
  }
}
