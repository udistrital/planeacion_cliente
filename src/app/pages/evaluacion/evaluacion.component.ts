import { Component, OnInit, ViewChild } from '@angular/core';
import { RequestManager } from '../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { UserService } from '../services/userService';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { Router } from '@angular/router';
import { registerLocaleData } from '@angular/common';
import es from '@angular/common/locales/es';
import { EvaluacionPlanComponent } from './evaluacion-plan/evaluacion-plan.component';

@Component({
  selector: 'app-evaluacion',
  templateUrl: './evaluacion.component.html',
  styleUrls: ['./evaluacion.component.scss']
})
export class EvaluacionComponent implements OnInit {
  nombresPlanes: string[];
  auxNombresPlanes: string[];
  periodos: any[];
  bandera: boolean;
  vigencias: any[];
  unidades: any[];
  auxUnidades: any[];
  unidadSelected: boolean;
  unidad: any;
  vigenciaSelected: boolean;
  vigencia: any;
  periodoSelected: boolean;
  periodo: any;
  planSelected: boolean;
  rol: string;
  nombrePlanSeleccionado:string;
  idPlanSeleccionado:string;
  existenUnidades = false;

  @ViewChild(EvaluacionPlanComponent) seguimientoComponent: EvaluacionPlanComponent;

  constructor(
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private userService: UserService,
    private router: Router
  ) {
    this.loadPlanes();
    this.loadVigencias();
    this.unidadSelected = false;
    this.vigenciaSelected = false;
    this.planSelected = false;
    this.periodoSelected = false;
    this.nombrePlanSeleccionado = "";
  }

  onChangeP(plan :string) {
    this.bandera = false;
    if (plan == undefined) {
      this.planSelected = false;
    } else {
      this.planSelected = true;
      this.nombrePlanSeleccionado = plan;
      if (this.vigenciaSelected) {
        if( this.rol === 'PLANEACION' ) {
          this.unidadSelected = false;
          this.unidad = '';
          this.loadUnidades();
        } else {
          this.unidadSelected = true;
          this.onChangeU(this.unidades[0]);
        }
      }
      this.periodos = []
      this.periodoSelected = false
    }
  }

  onChangeV(vigencia) {
    this.bandera = false;
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      if (this.planSelected) {
        this.unidadSelected = false;
        this.unidad = ''
        if(this.rol === 'PLANEACION') {
          this.loadUnidades();
        } else {
          this.onChangeU(this.unidades[0]);
        }
      }
      this.periodos = [];
      this.periodoSelected = false;
    }
  }

  onChangeU(unidad) {
    this.bandera = false;
    this.periodos = [];
    this.periodoSelected = false;
    if (unidad == undefined) {
      this.unidadSelected = false;
      this.unidad = '';
    } else {
      this.unidadSelected = true;
      this.unidad = unidad
      this.periodos = []
      this.periodoSelected = false
      if (unidad === 'TODAS') {
        this.periodo = 'TODOS';
        this.periodoSelected = true;
        this.periodos = [
          { nombre: 'Trimestre uno'},
          { nombre: 'Trimestre dos'},
          { nombre: 'Trimestre tres'},
          { nombre: 'Trimestre cuatro'},
        ]
      } else {
        this.periodo = '';
        this.periodoSelected = false;
      }
      if(unidad !== 'TODAS' && this.planSelected && this.vigenciaSelected && this.unidadSelected) {
        this.loadPeriodos();
      }
    }
  }

  onChangePe(periodo) {
    this.bandera = false;
    if (periodo == undefined) {
      this.periodoSelected = false;
    } else {
      this.periodoSelected = true;
      this.periodo = periodo;
    }
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA';
      this.validarUnidad();
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION';
    }
  }

  validarUnidad() {
    this.unidades = [];
    this.auxUnidades = [];
    this.userService.user$.subscribe((data) => {
      this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion/?query=Numero:` + data['userService']['documento'])
        .subscribe((datosInfoTercero: any) => {
          this.request.get(environment.PLANES_MID, `formulacion/vinculacion_tercero/` + datosInfoTercero[0].TerceroId.Id)
            .subscribe((vinculacion: any) => {
              if (vinculacion["Data"] != "") {
                let vinculaciones: any[] = vinculacion['Data'];
                  vinculaciones.forEach(vinculacion => {
                    this.request.get(environment.OIKOS_SERVICE, `dependencia_tipo_dependencia?query=DependenciaId:` + vinculacion["DependenciaId"]).subscribe((dataUnidad: any) => {
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
                        this.existenUnidades = true;
                        Swal.close();
                      }
                    })
                  });
              } else {
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

  ingresarEvaluacion() {
    this.bandera = true;
  }

  loadVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron vigencias registradas`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }
  /**
   * Carga las unidades que le hacen seguimiento al plan y vigencia seleccionados
   */
  loadUnidades() {
    Swal.fire({
      title: 'Cargando Unidades',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request
      .get(
        environment.PLANES_MID,
        `evaluacion/unidades/${this.nombrePlanSeleccionado}/${this.vigencia.Id}`
      )
      .subscribe(
        (data: any) => {
          if (data) {
            if (this.rol === 'PLANEACION') {
              if (data.Data.length === 0) {
                Swal.close();
                this.unidades = [];
                this.auxUnidades = [];
                this.existenUnidades = false;
                Swal.fire({
                  title: 'Verifica las selecciones',
                  text: `No existen unidades con registros en fase de seguimiento asociados al plan de acción y vigencia seleccionados`,
                  icon: 'warning',
                  showConfirmButton: true,
                  allowOutsideClick: false,
                });
              } else {
                this.unidades = data.Data;
                this.auxUnidades = this.unidades;
                this.existenUnidades = true;
                Swal.close();
              }
            }
          }
        },
        (error) => {
          Swal.close();
          this.unidades = [];
          this.auxUnidades = [];
          this.vigenciaSelected = false;
          this.vigencia = '';
          Swal.fire({
            title: 'Verifica las selecciones',
            text: `No existen unidades con registros en fase de seguimiento asociados al plan de acción y vigencia seleccionados`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500,
          });
        }
      );
  }

  loadPlanes() {
    Swal.fire({
      title: 'Cargando planes',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request.get(environment.PLANES_MID, `evaluacion/planes/`).subscribe((data: any) => {
      if (data) {
        if (data.Data != null) {
          this.nombresPlanes = data.Data;
          Swal.close();
        } else {
          Swal.fire({
            title: 'No se lograron obtener planes avalados para seguimiento',
            icon: 'info',
            showConfirmButton: false,
            timer: 2500
          });
          this.nombresPlanes = [];
          this.nombrePlanSeleccionado = "";
        }
        this.auxNombresPlanes = this.nombresPlanes;
      }
    }, (error) => {
      this.nombresPlanes = [];
      this.auxNombresPlanes = [];
      this.nombrePlanSeleccionado = "";
      Swal.fire({
        title: 'No se lograron obtener planes avalados para seguimiento',
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }

  loadPeriodos(){
    Swal.fire({
      title: 'Cargando Periodos',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request.get(environment.PLANES_MID, `evaluacion/planes_periodo/${this.vigencia.Id}/${this.unidad.Id}`).subscribe((data: any) => {
      if (data) {
        if (data.Data != null) {
          let periodosCargados = false;
          for (let pos = 0; pos < data.Data.length; pos++) {
            const elemento = data.Data[pos];
            if(elemento["plan"] === this.nombrePlanSeleccionado) {
              this.idPlanSeleccionado = elemento["id"]
              this.periodos = elemento["periodos"]
              this.periodos.forEach((periodo)=>{
                periodo.nombre = periodo.nombre[0].toUpperCase() + periodo.nombre.substring(1).toLowerCase()
              })
              periodosCargados = true
            }
          }
          Swal.close();
          if(!periodosCargados){
            Swal.fire({
              title: 'El plan seleccionado no corresponde a la vigencia o unidad. Seleccione otro plan.',
              icon: 'info',
              showConfirmButton: false,
              timer: 2500
            });
          }
        } else {
          Swal.fire({
            title: 'La unidad no tiene planes con seguimientos avalados para la vigencia selecionada',
            icon: 'info',
            showConfirmButton: false,
            timer: 2500
          });
        }
      }
    }, (error) => {
      Swal.fire({
        title: 'La unidad no tiene planes con seguimientos avalados para la vigencia selecionada',
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }

  onKey(value: string, type: string) {
    if (value == undefined || value.trim() === '') {
      if (type === 'plan') {
        this.auxNombresPlanes = [...this.nombresPlanes];
      } else if (type === 'unidad') {
        this.auxUnidades = [...this.unidades];
      }
    } else {
      if (type === 'plan') {
        this.auxNombresPlanes = this.buscarPlanes(value);
      } else if (type === 'unidad') {
        this.auxUnidades = this.buscarUnidades(value);
      }
    }
  }
  
  buscarPlanes(value: string) {
    return this.nombresPlanes.filter(plan => 
      plan.toLowerCase().includes(value.toLowerCase()));
  }
  
  buscarUnidades(value: string) {
    return this.unidades.filter(unidad => 
      unidad.Nombre.toLowerCase().includes(value.toLowerCase()));
  }

  ngOnInit(): void {
    registerLocaleData(es);
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.getRol();
  }

  backClicked() {
    this.router.navigate(['#/pages/dashboard']);
  }
}