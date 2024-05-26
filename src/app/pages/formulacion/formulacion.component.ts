import { Component, ViewChild, OnInit, DoCheck, OnDestroy } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { RequestManager } from '../services/requestManager';
import { Notificaciones } from "../services/notificaciones";
import { environment } from '../../../environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { UserService } from '../services/userService';
import { ActivatedRoute } from '@angular/router';
import { VerificarFormulario } from '../services/verificarFormulario'
import { Subscription } from 'rxjs';
import { ResumenPlan } from 'src/app/@core/models/plan/resumen_plan';
import { DataRequest } from 'src/app/@core/models/interfaces/DataRequest.interface';
import { CodigosService } from 'src/app/@core/services/codigos.service';

@Component({
  selector: 'app-formulacion',
  templateUrl: './formulacion.component.html',
  styleUrls: ['./formulacion.component.scss']
})
export class FormulacionComponent implements OnInit, OnDestroy {
  ID_ESTADO_EN_FORMULACION: string;
  ID_ESTADO_FORMULADO: string;
  ID_ESTADO_EN_REVISION: string;
  ID_ESTADO_REVISADO: string;
  ID_ESTADO_PRE_AVAL:string;
  ID_ESTADO_AVAL:string;
  ID_ESTADO_AJUSTE_PRESUPUESTAL:string;
  ID_ESTADO_REVISION_VERIFICADA:string;

  activedStep = 0;
  planes: any[];
  unidades: any[] = [];
  auxUnidades: any[] = [];
  planesInteresArray: any[] = []
  vigencias: any[];
  planSelected: boolean;
  planAsignado: boolean;
  unidadSelected: boolean;
  vigenciaSelected: boolean;
  addActividad: boolean;
  identContratistas: boolean;
  plan: any;
  planAux: any;
  unidad: any;
  vigencia: any;
  versionDesdeTabla: number;
  steps: any[];
  json: any;
  estado: string;
  clonar: boolean;
  panelOpenState = true;
  dataT: boolean;
  banderaEdit: boolean;
  rowActividad: string;
  identRecursos: boolean;
  identDocentes: boolean;
  banderaIdentDocentes: boolean;
  banderaUltimaVersion: boolean;
  banderaEstadoDatos: boolean;
  tipoPlanId: string;
  idPadre: string;
  tipoPlanIndicativo: string;
  idPlanIndicativo: string;
  planesDesarrollo: any[];
  planesIndicativos: any[];
  planDSelected: boolean;
  dataArmonizacionPED: string[] = [];
  dataArmonizacionPI: string[] = [];
  estadoPlan: string;
  iconEstado: string;
  iconEditar: string;
  versionPlan: string;
  versiones: any[];
  controlVersion = new FormControl();
  readonlyObs: boolean;
  hiddenObs: boolean;
  readOnlyAll: boolean;
  ponderacionCompleta: boolean;
  ponderacionActividades: string;
  moduloVisible: boolean;
  rol: string;
  isChecked: boolean
  defaultFilterPredicate?: (data: any, filter: string) => boolean;

  formArmonizacion: FormGroup;
  formSelect: FormGroup;
  form: FormGroup;
  private miObservableSubscription: Subscription;
  pendienteCheck: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private notificacionesService: Notificaciones,
    private userService: UserService,
    private activatedRoute: ActivatedRoute,
    private verificarFormulario: VerificarFormulario,
    private codigosService: CodigosService
  ) {
  this.loadPeriodos();
    this.formArmonizacion = this.formBuilder.group({
      selectPED: ['',],
      selectPI: ['',]
    });
    this.formSelect = this.formBuilder.group({
      selectUnidad: ['',],
      selectVigencia: ['',],
      selectPlan: ['',]
    });
    this.form = this.formBuilder.group({});
    this.addActividad = false;
    this.planSelected = false;
    this.unidadSelected = false;
    this.vigenciaSelected = false;
    this.clonar = false;
    this.identRecursos = false;
    this.identContratistas = false;
    this.identDocentes = false;
    this.dataT = false;
    this.moduloVisible = false;
    this.isChecked = true;
    this.pendienteCheck = false;
  }

  //displayedColumns: string[] = ['numero', 'nombre', 'rubro', 'valor', 'observacion', 'activo'];
  //columnsToDisplay: string[] = this.displayedColumns.slice();

  displayedColumns: string[];
  columnsToDisplay: string[]
  dataSource: MatTableDataSource<any>;

  async ngOnInit(){
    await this.codigosService.cargarIdentificadores();
    this.ID_ESTADO_EN_FORMULACION = this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'EF_SP');
    this.ID_ESTADO_FORMULADO = this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'F_SP');
    this.ID_ESTADO_EN_REVISION = this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'ER_SP');
    this.ID_ESTADO_REVISADO = this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'R_SP');
    this.ID_ESTADO_PRE_AVAL = this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'PA_SP');
    this.ID_ESTADO_AVAL = this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'A_SP');
    this.ID_ESTADO_AJUSTE_PRESUPUESTAL = this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'AP_SP');
    this.ID_ESTADO_REVISION_VERIFICADA = this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'RV_SP');let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find((x) => x == 'PLANEACION')) {
      this.rol = 'PLANEACION';
      await this.loadUnidades();
    } else if (roles.__zone_symbol__value.find((x) => x == 'ASISTENTE_PLANEACION')) {
      this.rol = 'ASISTENTE_PLANEACION';
      await this.loadUnidades();
    } else if (
      roles.__zone_symbol__value.find(
        (x) => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA'
      )
    ) {
      this.rol = 'JEFE_DEPENDENCIA';
      await this.validarUnidad()
    }

    this.miObservableSubscription = this.verificarFormulario.formData$.subscribe(formData => {
      if (formData.length !== 0) {
        this.pendienteCheck = true;
        this.onChangeU(formData[2]);
        this.onChangeV(formData[1]);
        this.onChangeP(formData[0])
      }
    });
    // dependencia_id, vigencia_id, nombre, version
    this.activatedRoute.params.subscribe(async (prm) => {
      let dependencia_id = prm['dependencia_id'];
      let vigencia_id = prm['vigencia_id'];
      let nombre = prm['nombre'];
      let version = prm['version'];
      if (
        dependencia_id != undefined &&
        vigencia_id != undefined &&
        nombre != undefined
      ) {
        await this.cargarPlan({
          dependencia_id,
          vigencia_id,
          nombre,
          version,
        } as ResumenPlan);
      }
    });
  }

  ngOnDestroy() {
    if (this.verificarFormulario.formData$) {
      this.verificarFormulario.cleanFormData();
      this.miObservableSubscription.unsubscribe();
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = this.defaultFilterPredicate;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  filterActive() {
    if (!this.isChecked) {
      this.dataSource.filterPredicate = function(data: any, filterValue: string) {
        return data.activo === filterValue
      };
      this.dataSource.filter = "Activo"
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    } else {
      this.dataSource.filter = ""
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
  }

  async verificarFechas(plan: any, bandera:boolean) {
    Swal.fire({
      title: 'Validando fechas de formulación para plan seleccionado...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    if(!bandera){
      this.moduloVisible = true;
      Swal.close()
    } else {
      var unidad_interes = {
        "Id": this.unidad.Id,
        "Nombre": this.unidad.Nombre
      }
      var plan_interes = {
        "_id": plan._id,
        "nombre": plan.nombre
      }
      var periodo_seguimiento: any = {
        unidades_interes: JSON.stringify([unidad_interes]),
        planes_interes: JSON.stringify([plan_interes]),
        periodo_id: this.vigencia.Id.toString(),
        tipo_seguimiento_id: this.codigosService.getId("PLANES_CRUD", "tipo-seguimiento", "F_SP")
      }
      return await new Promise((resolve, reject) => {
        this.request
          .post(environment.PLANES_CRUD,`periodo-seguimiento/buscar-unidad-planes/3`, periodo_seguimiento)
          .subscribe(
            async (data: DataRequest) => {
              if (data) {
                if (data.Data.length != 0) {
                  let seguimientoFormulacion = data.Data[0];
                  let auxFecha = new Date();
                  let auxFechaCol = auxFecha.toLocaleString('en-US', {
                    timeZone: 'America/Mexico_City',
                  });
                  let strFechaHoy = new Date(auxFechaCol).toISOString();
                  let fechaHoy = new Date(strFechaHoy);
                  let fechaInicio = new Date(
                    seguimientoFormulacion['fecha_inicio']
                  );
                  let fechaFin = new Date(seguimientoFormulacion['fecha_fin']);
                  if (fechaHoy >= fechaInicio && fechaHoy <= fechaFin) {
                    // await this.validarUnidad();
                    this.moduloVisible = true;
                    Swal.close()
                    resolve(true);
                  } else {
                    this.moduloVisible = false;
                    Swal.fire({
                      title: 'Error en la operación',
                      text: `Está intentando acceder a la formulación por fuera de las fechas establecidas`,
                      icon: 'warning',
                      showConfirmButton: true,
                      timer: 10000,
                    });
                    reject();
                  }
                } else {
                  this.moduloVisible = false;
                  Swal.fire({
                    title: 'Error en la operación',
                    text: `No se encontraron datos registrados`,
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 2500,
                  });
                }
              }
            }, (error) => {
              Swal.fire({
                title: 'Error en la operación',
                text: `No se encontraron datos registrados ${JSON.stringify(
                  error
                )}`,
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500,
              });
            }
          );
      });
    }
  }

  async validarUnidad() {
    return await new Promise((resolve, reject) => {
      this.userService.user$.subscribe((data) => {
        this.request
          .get(
            environment.TERCEROS_SERVICE,
            `datos_identificacion/?query=Numero:` +
              data['userService']['documento']
          )
          .subscribe((datosInfoTercero: any) => {
            this.request
              .get(
                environment.PLANES_MID,
                `formulacion/vinculacion_tercero/` +
                  datosInfoTercero[0].TerceroId.Id
              )
              .subscribe((vinculacion: any) => {
                if (vinculacion['Data'] != '') {
                  this.request
                    .get(
                      environment.OIKOS_SERVICE,
                      `dependencia_tipo_dependencia?query=DependenciaId:` +
                        vinculacion['Data']['DependenciaId']
                    )
                    .subscribe((dataUnidad: any) => {
                      if (dataUnidad) {
                        let unidad = dataUnidad[0]['DependenciaId'];
                        unidad['TipoDependencia'] =
                          dataUnidad[0]['TipoDependenciaId']['Id'];
                        for (let i = 0; i < dataUnidad.length; i++) {
                          if (dataUnidad[i]['TipoDependenciaId']['Id'] === 2) {
                            unidad['TipoDependencia'] =
                              dataUnidad[i]['TipoDependenciaId']['Id'];
                          }
                        }
                        this.unidades.push(unidad);
                        this.auxUnidades.push(unidad);
                        this.formSelect.get('selectUnidad').setValue(unidad);
                        this.onChangeU(unidad);
                        this.moduloVisible = true;
                        resolve(unidad);
                      }
                    });
                } else {
                  this.moduloVisible = false;
                  Swal.fire({
                    title: 'Error en la operación',
                    text: `No cuenta con los permisos requeridos para acceder a este módulo`,
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 4000,
                  });
                  reject();
                }
              });
          });
      });
    });
  }

  async loadUnidades() {
    return new Promise((resolve, reject) => {
      this.request
        .get(environment.PLANES_MID, `formulacion/get_unidades`)
        .subscribe(
          (data: any) => {
            if (data) {
              this.unidades = data.Data;
              this.auxUnidades = data.Data;
              this.moduloVisible = true;
              resolve(this.unidades);
            }
          },
          (error) => {
            Swal.fire({
              title: 'Error en la operación',
              text: `No se encontraron datos registrados ${JSON.stringify(
                error
              )}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500,
            });
            reject(error);
          }
        );
    });
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

  async loadPlanes() {
    Swal.fire({
      title: 'Cargando datos...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    return await new Promise((resolve,reject)=>{
      this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,dependencia_id:${this.unidad.Id},formato:false,vigencia:${this.vigencia.Id}`).subscribe(async (data: any) => {
        if ( data?.Data.length > 0 ) {
          let planes  = data.Data.filter(e => e.tipo_plan_id != this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PR_SP'));
          let planesSinRepetir = []
          planes.forEach(plan => {
            if (!this.existePlan(planesSinRepetir, plan.nombre)){
              planesSinRepetir = [...planesSinRepetir, plan]
            }
          });
          this.planes = planesSinRepetir;
        }
        await this.loadPlanesPeriodoSeguimiento();
        resolve(this.planes)
      }, (error) => {
        Swal.close()
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
        reject(error)
      })
    })
  }

  existePlan(arreglo: any[], nombre:string) :boolean {
    return arreglo.some((plan) => plan.nombre === nombre);
  }

  async loadPlanesPeriodoSeguimiento(){
    var unidad_interes = {
      "Id": this.unidad.Id,
      "Nombre": this.unidad.Nombre
    }
    var periodo_seguimiento: any = {
      unidades_interes: JSON.stringify([unidad_interes]),
      periodo_id: this.vigencia.Id.toString(),
      tipo_seguimiento_id: this.codigosService.getId("PLANES_CRUD", "tipo-seguimiento", "F_SP")
    }
    return await new Promise((resolve, reject) => {
      this.request
        .post(environment.PLANES_CRUD,`periodo-seguimiento/buscar-unidad-planes/3`,periodo_seguimiento)
        .subscribe((data: DataRequest) => {
          this.planesInteresArray = [];
          if (data?.Data !== null && data?.Data?.length != 0) {
            console.log(data.Data)
            for (const elemento of data.Data) {
              if (
                elemento.planes_interes &&
                typeof elemento.planes_interes === 'string'
              ) {
                try {
                  const planesInteresArray = JSON.parse(elemento.planes_interes);
                  // Recorre los planes en Interes y solo agrega los que no existian
                  planesInteresArray.forEach((plan) => {
                    if (
                      !this.existePlan(this.planesInteresArray, plan.nombre)
                    ) {
                      this.planesInteresArray = [
                        ...this.planesInteresArray,
                        plan,
                      ];
                    }
                    if (!this.existePlan(this.planes, plan.nombre)) {
                      this.planes = [...this.planes, plan];
                    }
                  });
                  Swal.close();
                  resolve(this.planes);
                } catch (error) {
                  console.error(
                    'Error al analizar JSON en planes_interes:',
                    error
                  );
                  reject(error);
                }
              } else {
                console.error(
                  'El elemento no tiene una cadena JSON en planes_interes:',
                  elemento
                );
                reject();
              }
            }
          }
          Swal.close();
          if (this.planes.length == 0) {
            Swal.fire({
              title: 'Planes no encontrados',
              html:
                'No tiene asignados planes/proyectos asociados para la dependencia <b>' +
                this.unidad.Nombre +
                '</b> y la <br> vigencia <b>' +
                this.vigencia.Nombre +
                '</b><br></br>',
              icon: 'warning',
              showConfirmButton: false,
              timer: 7000,
            });
          }
        });
    });
  }

  onKey(value) {
    if (value === "") {
      this.auxUnidades = this.unidades;
    } else {
      this.auxUnidades = this.search(value);
    }
  }

  search(value) {
    let filter = value.toLowerCase();
    if (this.unidades != undefined) {
      return this.unidades.filter(option => option.Nombre.toLowerCase().startsWith(filter));
    }
  }

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
  }

  submit() {
    if (!this.banderaEdit) { // ADD NUEVA ACTIVIDAD
      if (this.dataArmonizacionPED.length != 0 && this.dataArmonizacionPI.length != 0) {

        var formValue = this.form.value;
        var actividad = {
          armo: this.dataArmonizacionPED.toString(),
          armoPI: this.dataArmonizacionPI.toString(),
          entrada: formValue
        }
        this.request.put(environment.PLANES_MID, `formulacion/guardar_actividad`, actividad, this.plan._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Actividad agregada',
              //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
              text: 'La actividad se ha registrado satisfactoriamente',
              icon: 'success'
            }).then((result) => {
              if (result.value) {
                this.loadData()
                this.form.reset();
                this.addActividad = false;
                this.dataArmonizacionPED = [];
                this.dataArmonizacionPI = [];
                this.idPadre = undefined;
                this.tipoPlanId = undefined;
                this.tipoPlanIndicativo = undefined;
                this.idPlanIndicativo = undefined;
              }
            })
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: 'No fue posible crear la actividad, por favor contactarse con el administrador del sistema',
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          })

          this.addActividad = false;
          this.dataArmonizacionPED = [];
          this.dataArmonizacionPI = [];
        })
      } else {
        Swal.fire({
          title: 'Por favor complete la armonización para continuar',
          text: `No se encontraron datos registrados`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }

    } else { // EDIT ACTIVIDAD
      if (this.dataArmonizacionPED.length != 0 && this.dataArmonizacionPI.length != 0) {
        var aux = this.dataArmonizacionPED.toString();
        let aux2 = this.dataArmonizacionPI.toString();
        var formValue = this.form.value;
        var actividad = {
          armo: aux,
          armoPI: aux2,
          entrada: formValue
        }
        this.request.put(environment.PLANES_MID, `formulacion/actualizar_actividad`, actividad, this.plan._id + `/` + this.rowActividad).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Información de actividad actualizada',
              //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
              text: 'La actividad se ha actualizado satisfactoriamente',
              icon: 'success'
            }).then((result) => {
              if (result.value) {
                this.form.reset();
                this.addActividad = false;
                this.loadData();
                this.idPadre = undefined;
                this.tipoPlanId = undefined;
                this.idPlanIndicativo = undefined;
                this.tipoPlanIndicativo = undefined;
              }
            })
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No fue posible actualizar la actividad, por favor contactarse con el administrador del sistema`,
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          })

          this.addActividad = false;
          this.dataArmonizacionPED = [];
          this.dataArmonizacionPI = [];
        })
      } else {
        Swal.fire({
          title: 'Por favor complete la armonización para continuar',
          text: `No se encontraron datos registrados`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }

    }
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  async onChangeU(unidad) {
    if (unidad == undefined) {
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
      this.addActividad = false;
      this.identRecursos = false;
      this.identContratistas = false;
      this.banderaIdentDocentes = this.mostrarIdentDocente(unidad);
      this.estadoPlan = '';
      this.iconEstado = '';
      this.versionPlan = '';
      if (this.vigenciaSelected && this.planSelected) {
        await this.busquedaPlanes(this.planAux);
      }
    }
  }
  // this.mostrarIdentDocente(unidad.DependenciaTipoDependencia)
  mostrarIdentDocente(unidad: any): boolean {
    if (unidad.Id === 67 || unidad.TipoDependencia.Id === 2 || unidad.TipoDependencia === 2) {
      return true
    }
    else return false
  }

  async onChangeV(vigencia) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      this.addActividad = false;
      this.identRecursos = false;
      this.identContratistas = false;
      this.estadoPlan = "";
      this.iconEstado = "";
      this.versionPlan = "";
      await this.loadPlanes();
      this.banderaEstadoDatos = false;
      this.planSelected = false;
      this.plan = undefined;
      this.planAsignado = false;
      this.dataT = false;
      if (this.unidadSelected && this.planSelected) {
        await this.busquedaPlanes(this.planAux);
      }
    }
  }

  async onChangeP(plan) {
    if (plan == undefined) {
      this.planSelected = false;
    } else {
      this.planAux = plan;
      this.planSelected = true;
      this.addActividad = false;
      this.identRecursos = false;
      this.identContratistas = false;
      this.estadoPlan = "";
      this.iconEstado = "";
      this.versionPlan = "";
      this.banderaEstadoDatos = false;
      this.plan = plan;
      this.planAsignado = false;
      this.dataT = false;
      this.isChecked = true;
      let planEnArrayDePlantillas = this.existePlan(this.planesInteresArray, plan.nombre);
      await this.verificarFechas(plan, planEnArrayDePlantillas);
      await this.busquedaPlanes(plan, planEnArrayDePlantillas);
    }
  }

  onChangePD(planD) {
    if (planD == undefined) {
      this.idPadre = undefined;
      this.tipoPlanId = undefined;
    } else {
      this.idPadre = planD._id;
      this.tipoPlanId = planD.tipo_plan_id;
    }
  }

  onChangePI(planI) {
    if (planI == undefined) {
      this.idPlanIndicativo = undefined;
      this.tipoPlanIndicativo = undefined;
    } else {
      this.idPlanIndicativo = planI._id;
      this.tipoPlanIndicativo = planI.tipo_plan_id;
    }
  }

  onChangeVersion(version) {
    if (version._id == this.versiones[this.versiones.length - 1]._id) {
      this.banderaUltimaVersion = true;
    } else {
      this.banderaUltimaVersion = false;
    }
    this.plan = version;
    this.versionPlan = this.plan.numero;
    this.controlVersion = new FormControl(this.plan);
    this.getEstado();
    this.planAsignado = true;
    this.clonar = false;
    this.loadData();
    this.addActividad = false;
  }


  visualizeObs() {
    if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        if (this.versiones.length == 1) {
          this.hiddenObs = true;
        } else if (this.versiones.length > 1 && this.banderaEdit && this.addActividad) {
          this.hiddenObs = false;
        } else if (this.versiones.length > 1 && !this.banderaEdit && this.addActividad) {
          this.hiddenObs = true;
        }
        this.readOnlyAll = false;
        this.readonlyObs = true;
      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readOnlyAll = true;
        this.readonlyObs = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readOnlyAll = true;
        this.readonlyObs = true;
        this.hiddenObs = true;
      }
    }
    if (this.rol == 'PLANEACION' || this.rol == 'ASISTENTE_PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readOnlyAll = true;
        this.readonlyObs = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'En revisión') {
        this.readOnlyAll = true;
        this.readonlyObs = false;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal' || this.estadoPlan == 'Revisión Verificada') {
        this.readOnlyAll = true;
        this.readonlyObs = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readOnlyAll = true;
        this.readonlyObs = true;
        this.hiddenObs = true;
      }
    }
  }

  getEstado() {
    this.request.get(environment.PLANES_CRUD, `estado-plan/` + this.plan.estado_plan_id).subscribe(
      (data: any) => {
        if (data) {
          this.estadoPlan = data.Data.nombre;
          this.getIconEstado();
          this.visualizeObs();
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
    )
  }

  getIconEstado() {
    if (this.plan.estado_plan_id == this.ID_ESTADO_EN_FORMULACION) {
      this.iconEstado = "create";
    } else if (this.plan.estado_plan_id == this.ID_ESTADO_FORMULADO) {
      this.iconEstado = "assignment_turned_in";
    } else if (this.plan.estado_plan_id == this.ID_ESTADO_EN_REVISION) {
      this.iconEstado = "pageview";
    } else if (this.plan.estado_plan_id == this.ID_ESTADO_REVISADO) {
      this.iconEstado = "assignment_return";
    } else if (this.plan.estado_plan_id == this.ID_ESTADO_PRE_AVAL) {
      this.iconEstado = "done";
    } else if (this.plan.estado_plan_id == this.ID_ESTADO_AVAL) {
      this.iconEstado = "done_all"
    } else if (this.plan.estado_plan_id == this.ID_ESTADO_AJUSTE_PRESUPUESTAL) {
      this.iconEstado = "build";
    } else if (this.plan.estado_plan_id == this.ID_ESTADO_REVISION_VERIFICADA) {
      this.iconEstado = "spellcheck";
    }
  }

  getVersiones(planB, planRecienCreado: boolean = false) {
    let aux = planB.nombre.replace(/ /g, "%20");
    this.request.get(environment.PLANES_MID, `formulacion/get_plan_versiones/${this.unidad.Id}/${this.vigencia.Id}/${aux}`).subscribe(
      (data: any) => {
        if (data) {
          this.versiones = data;
          this.versiones.forEach((_, i) => {
            this.versiones[i]['numero'] = (i + 1).toString();
          });
          this.plan =
            this.versiones[
            this.versionDesdeTabla == undefined || this.versionDesdeTabla > this.versiones.length
              ? this.versiones.length - 1
              : this.versionDesdeTabla - 1
            ];
          this.planAsignado = true;
          this.clonar = false;
          this.banderaUltimaVersion = true;
          this.loadData(planRecienCreado);
          this.controlVersion = new FormControl(this.plan);
          this.versionPlan = this.plan.numero;
          this.getEstado();
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        });
      }
    )
  }

  async busquedaPlanes(planB, bandera: boolean = false) {
    try {
      // Antes de cargar algún plan, hago la búsqueda del formato si tiene datos y la bandera "banderaEstadoDatos" se vuelve true o false.
      await this.cargaFormato(planB, bandera);
      //validación con bandera para el estado de los datos de los planes.
      if (this.banderaEstadoDatos === true) {
        this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:` + this.unidad.Id + `,vigencia:` +
          this.vigencia.Id + `,formato:false,nombre:` + planB.nombre).subscribe(
            (data: any) => {
              if (data.Data.length > 0) {
                this.getVersiones(planB);
              } else if (data.Data.length == 0) {
                Swal.fire({
                  title: 'Formulación nuevo plan',
                  html: 'No existe plan <b>' + planB.nombre + '</b> <br>' +
                    'para la dependencia <b>' + this.unidad.Nombre + '</b> y la <br>' +
                    'vigencia <b>' + this.vigencia.Nombre + '</b><br></br>' +
                    '<i>Deberá formular el plan</i>',
                  icon: 'warning',
                  showConfirmButton: false,
                  timer: 7000
                })
                this.clonar = true;
                this.planAsignado = true;
              }
            }, (error) => {
              Swal.fire({
                title: 'Error en la operación',
                icon: 'error',
                text: `${JSON.stringify(error)}`,
                showConfirmButton: false,
                timer: 7000
              })
              this.clonar = true;
              this.plan = planB;
            })
      } else {
        this.dataT = false;
        Swal.fire({
          title: 'No hay datos',
          html: 'No existen datos para el plan <b>' + planB.nombre + '</b> <br>' +
            'para la dependencia <b>' + this.unidad.Nombre + '</b> y la <br>' +
            'vigencia <b>' + this.vigencia.Nombre + '</b><br></br>',
          icon: 'warning',
          showConfirmButton: false,
          timer: 7000
        });
      }
    } catch (error) {
      Swal.fire({
        title: 'Error en la operación',
        text: `error de busquedaPlanes catch No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    }
  }

  loadData(planRecienCreado: boolean = false) {
    this.ajustarData(planRecienCreado);
  }

  ajustarData(planRecienCreado: boolean) {
    if (this.rol == 'PLANEACION' || this.plan.estado_plan_id != this.ID_ESTADO_EN_FORMULACION) {
      this.iconEditar = 'search'
    } else if (this.rol == 'JEFE_DEPENDENCIA') {
      this.iconEditar = 'edit'
    }
    this.request.get(environment.PLANES_MID, `formulacion/get_all_actividades/` + this.plan._id + `?order=asc&sortby=index`).subscribe((data: any) => {
      if (data.Data.data_source != null) {
        this.dataSource = new MatTableDataSource(data.Data.data_source);
        this.defaultFilterPredicate = this.dataSource.filterPredicate;
        this.cambiarValor("activo", true, "Activo", this.dataSource.data)
        this.cambiarValor("activo", false, "Inactivo", this.dataSource.data)
        this.displayedColumns = data.Data.displayed_columns;
        this.columnsToDisplay = this.displayedColumns.slice();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataT = true;
        this.filterActive()
      } else if (!data.data_source && !data.displayed_columns) {
        this.dataT = false;
        Swal.fire({
          title: 'Atención en la operación',
          text: `No hay actividades registradas para el plan \n por favor agregue actividades`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 3500
        })
        if (!planRecienCreado) {
          Swal.fire({
            title: 'Atención en la operación',
            text: `No hay actividades registradas para el plan`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 3500
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


  cargaFormato(plan, bandera: boolean): Promise<void> {
    Swal.fire({
      title: 'Cargando formato',
      timerProgressBar: true,
      showConfirmButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    if(bandera) {
      this.banderaEstadoDatos = true;
      Swal.close();
    } else {
      return new Promise((resolve, reject) => {
        this.request.get(environment.PLANES_MID, `formato/` + plan._id).subscribe((data: any) => {
          if (Array.isArray(data) && data[0] === null && Array.isArray(data[1]) &&
            data[1].length > 0 && Object.keys(data[1][0]).length === 0) {
            this.banderaEstadoDatos = false;
            Swal.close()
            reject();
          } else {
            this.banderaEstadoDatos = true;//bandera validacion de la data
            this.estado = plan.estado_plan_id;
            this.steps = data[0];
            this.json = data[1][0];
            this.form = this.formBuilder.group(this.json);
            Swal.close()
            resolve(data);
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          });
          reject();
        })
      });
    }
  }

  async editar(fila): Promise<void> {
    if (fila.activo == 'Inactivo') {
      Swal.fire({
        title: 'Actividad inactiva',
        text: `No puede editar una actividad en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 3500
      });
    } else {
      await this.cleanBeforeLoad();
      if (this.planesDesarrollo == undefined) {
        await this.cargarPlanesDesarrollo();
      }
      if (this.planesIndicativos == undefined) {
        await this.cargarPlanesIndicativos();
      }
      this.addActividad = true;
      this.banderaEdit = true;
      this.visualizeObs();
      this.rowActividad = fila.index;
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
      this.request.get(environment.PLANES_MID, `formulacion/get_plan/` + this.plan._id + `/` + fila.index).subscribe((data: any) => {
        if (data) {
          Swal.close();
          this.onChangePD(this.planesDesarrollo[0]);
          this.onChangePI(this.planesIndicativos[0]);
          this.estado = this.plan.estado_plan_id;
          this.steps = data.Data[0]
          this.json = data.Data[1][0]
          this.form = this.formBuilder.group(this.json);

          let auxAmonizacion = data.Data[2][0]
          let strArmonizacion = auxAmonizacion.armo
          let len = (strArmonizacion.split(",").length)
          this.dataArmonizacionPED = strArmonizacion.split(",", len).filter(((item) => item != ""))
          let strArmonizacion2 = auxAmonizacion.armoPI
          let len2 = (strArmonizacion2.split(",").length)
          this.dataArmonizacionPI = strArmonizacion2.split(",", len2).filter(((item) => item != ""))
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
  }

  cleanBeforeLoad(): Promise<void> {
    this.addActividad = false;
    this.dataArmonizacionPED = [];
    this.dataArmonizacionPI = [];
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 100);
    });
  }

  inhabilitar(fila): void {
    if (fila.activo == 'Inactivo') {
      Swal.fire({
        title: 'Actividad ya inactiva',
        text: `La actividad ya se encuentra en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    } else {
      this.inactivar(fila);
    }
  }

  inactivar(fila): void {
    Swal.fire({
      title: 'Inhabilitar actividad',
      text: `¿Está seguro de inhabilitar esta actividad?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `formulacion/delete_actividad`, `null`, this.plan._id + `/` + fila.index).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Cambio realizado',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.loadData()
              }
            })
          }
        }),
          (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `${JSON.stringify(error)}`,
              showConfirmButton: false,
              timer: 2500
            })
          }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    })
  }

  agregarActividad() {
    if (this.tipoPlanId === undefined && this.idPadre === undefined) {
      this.cargarPlanesDesarrollo();
    }
    if (this.tipoPlanIndicativo === undefined && this.idPlanIndicativo === undefined) {
      this.cargarPlanesIndicativos();
    }
    this.cargaFormato(this.plan, false);
    this.addActividad = true;
    this.banderaEdit = false;
    this.visualizeObs();
    this.dataArmonizacionPED = [];
    this.dataArmonizacionPI = [];
  }

  identificarContratistas() {
    this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:${this.plan._id},tipo_identificacion_id:${this.codigosService.getId('PLANES_CRUD', 'tipo-identificacion', 'IC_SP')}`).subscribe((data: any) => {
      if (data.Data.length == 0) {
        var str1 = 'Identificación de Contratistas ' + this.plan.nombre
        var str2 = 'Identificación de Contratistas ' + this.plan.nombre + ' ' + this.unidad.Nombre
        let datoIdenti = {
          "nombre": String(str1),
          "descripcion": String(str2),
          "plan_id": String(this.plan._id),
          "dato": "{}",
          "tipo_identificacion_id": this.codigosService.getId('PLANES_CRUD', 'tipo-identificacion', 'IC_SP'),
          "activo": true
        }
        this.request.post(environment.PLANES_CRUD, `identificacion`, datoIdenti).subscribe((dataP: any) => {
          if (dataP) {
            this.identContratistas = true;
          } else {
            Swal.fire({
              title: 'Error al crear identificación. Intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        })
      } else {
        this.identContratistas = true;
      }
    })
  }

  identificarRecursos() {
    this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:${this.plan._id},tipo_identificacion_id:${this.codigosService.getId('PLANES_CRUD', 'tipo-identificacion', 'IR_SP')}`).subscribe((data: any) => {
      if (data.Data.length == 0) {
        var str1 = 'Identificación de Recursos ' + this.plan.nombre
        var str2 = 'Identificación de Recursos ' + this.plan.nombre + ' ' + this.unidad.Nombre
        let datoIdenti = {
          "nombre": String(str1),
          "descripcion": String(str2),
          "plan_id": String(this.plan._id),
          "dato": "{}",
          "tipo_identificacion_id": this.codigosService.getId('PLANES_CRUD', 'tipo-identificacion', 'IR_SP'),
          "activo": true
        }
        this.request.post(environment.PLANES_CRUD, `identificacion`, datoIdenti).subscribe((dataP: any) => {
          if (dataP) {
            this.identRecursos = true;
          } else {
            Swal.fire({
              title: 'Error al crear identificación. Intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        })
      } else {
        this.identRecursos = true;
      }
    })
  }

  identificarDocentes() {

    this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:${this.plan._id},tipo_identificacion_id:${this.codigosService.getId('PLANES_CRUD', 'tipo-identificacion', 'ID_SP')}`).subscribe((data: any) => {
      if (data.Data.length == 0) {
        var str1 = 'Identificación de Docentes ' + this.plan.nombre
        var str2 = 'Identificación de Docentes ' + this.plan.nombre + ' ' + this.unidad.Nombre
        let datoIdenti = {
          "nombre": String(str1),
          "descripcion": String(str2),
          "plan_id": String(this.plan._id),
          "dato": "{}",
          "tipo_identificacion_id": this.codigosService.getId('PLANES_CRUD', 'tipo-identificacion', 'ID_SP'),
          "activo": false
        }
        this.request.post(environment.PLANES_CRUD, `identificacion`, datoIdenti).subscribe((dataP: any) => {
          if (dataP) {
            this.identDocentes = true;
          } else {
            Swal.fire({
              title: 'Error al crear identificación. Intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        })
      } else {
        this.identDocentes = true;
      }
    })
  }

  cargarPlanesDesarrollo() {
    return new Promise((resolve)=>{
      this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:${this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PD_SP')}`).subscribe((data: any) => {
        if (data) {
          this.planesDesarrollo = data.Data;
          this.formArmonizacion.get('selectPED').setValue(this.planesDesarrollo[0])
          this.onChangePD(this.planesDesarrollo[0]);
          resolve(this.planesDesarrollo);
        }
      })
    })
  }

  cargarPlanesIndicativos() {
    return new Promise((resolve)=>{
      this.request.get(environment.PLANES_CRUD, `plan?query=tipo_plan_id:${this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PLI_SP')}`).subscribe((data: any) => {
        if (data) {
          this.planesIndicativos = data.Data;
          this.formArmonizacion.get('selectPI').setValue(this.planesIndicativos[0])
          this.onChangePI(this.planesIndicativos[0]);
          resolve(this.planesIndicativos);
        }
      })
    })
  }

  receiveMessage(event) {
    if (event.bandera === 'armonizar') {
      /* var uid_n = event.fila.level;
      var uid = event.fila.id; // id del nivel a editar
      if (uid != this.dataArmonizacionPED.find(id => id === uid)) {
        this.dataArmonizacionPED.push(uid)
      } else {
        const index = this.dataArmonizacionPED.indexOf(uid, 0);
        if (index > -1) {
          this.dataArmonizacionPED.splice(index, 1);
        }
      } */
      this.dataArmonizacionPED = event.armonizacionIds;
    }
  }

  receiveMessagePI(event) {
    if (event.bandera === 'armonizar') {
      /* var uid_n = event.fila.level;
      var uid = event.fila.id; // id del nivel a editar
      if (uid != this.dataArmonizacionPI.find(id => id === uid)) {
        this.dataArmonizacionPI.push(uid)
      } else {
        const index = this.dataArmonizacionPI.indexOf(uid, 0);
        if (index > -1) {
          this.dataArmonizacionPI.splice(index, 1);
        }
      } */
      this.dataArmonizacionPI = event.armonizacionIds;
    }
  }

  cambiarValor(valorABuscar, valorViejo, valorNuevo, dataS) {
    dataS.forEach(function(elemento) {
      elemento[valorABuscar] = elemento[valorABuscar] == valorViejo ? valorNuevo : elemento[valorABuscar]
    })
  }


  enviarNotificacion(itemMensaje:string){
    let datos = {
      codigo: itemMensaje,
      id_unidad: this.unidad.Id,
      nombre_unidad: this.unidad.Nombre,
      nombre_plan:this.plan.nombre,
      nombre_vigencia: this.vigencia.Nombre
    }
    this.notificacionesService.enviarNotificacion(datos)
  }

  formularPlan() {
    Swal.fire({
      title: 'Formulando plan...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
    let parametros = {
      "dependencia_id": String(this.unidad.Id),
      "vigencia": String(this.vigencia.Id)
    }
    this.request.post(environment.PLANES_MID, `formulacion/clonar_formato/` + this.plan._id, parametros).subscribe((data: any) => {
      if (data) {
        this.plan = data.Data;
        //NOTIFICACION(FA)
        this.enviarNotificacion("FA")
        Swal.fire({
          title: 'Formulación nuevo plan',
          text: `Plan creado satisfactoriamente`,
          icon: 'success',
          showConfirmButton: false,
          timer: 4000
        })
        // this.clonar = false;
        // this.planAsignado = true;
        // //CARGA TABLA
        // this.loadData();
        this.getVersiones(this.plan, true);

      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  ocultar() {
    Swal.fire({
      title: 'Registro de la actividad',
      text: `¿Desea cancelar el registro de la actividad?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.addActividad = false;
        this.dataArmonizacionPED = [];
        this.dataArmonizacionPI = [];
        Swal.fire({
          title: 'Registro cancelado',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {

      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  messageIdentificacion(event) {
    if (event.accion == 'ocultar') {
      Swal.fire({
        title: `Identificación de ${event.identi}`,
        text: `¿Desea cerrar la identificación de ${event.identi}?`,
        showCancelButton: true,
        confirmButtonText: `Si`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (event.identi == 'contratistas') {
            this.identContratistas = false;
          } else if (event.identi == 'recursos') {
            this.identRecursos = false;
          } else if (event.identi == 'docentes') {
            this.identDocentes = false;
          }
          Swal.fire({
            title: 'Cierre exitoso.',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        } else if (result.dismiss === Swal.DismissReason.cancel) {

        }
      }),
        (error) => {
          Swal.fire({
            title: 'Error en la operación',
            icon: 'error',
            text: `${JSON.stringify(error)}`,
            showConfirmButton: false,
            timer: 2500
          })
        }
    } else if (event.accion == 'guardar') {
      if (event.identi == 'contratistas') {
        this.identContratistas = false;
      } else if (event.identi == 'recursos') {
        this.identRecursos = false;
      } else if (event.identi == 'docentes') {
        this.identDocentes = false;
      }
    }
  }

  culminarPlan() {
    // Revisar si tiene actividades (!)
    this.getPoderacionActividades().then(() => {
      if (this.ponderacionCompleta != true) {
        Swal.fire({
          icon: 'error',
          title: 'Ponderación Incorrecta',
          html: this.ponderacionActividades
        })
      } else {
        this.request.get(environment.PLANES_MID, `formulacion/verificar_identificaciones/` + this.plan._id).subscribe((data: any) => {
          if (data) {
            if (data.Data == true) {
              Swal.fire({
                title: 'Culminar Plan',
                text: `¿Está seguro de enviar este Plan Culminado?`,
                icon: 'warning',
                confirmButtonText: `Si`,
                cancelButtonText: `No`,
                showCancelButton: true
              }).then((result) => {
                if (result.isConfirmed) {
                  this.plan.estado_plan_id = this.ID_ESTADO_FORMULADO;
                  this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: any) => {
                    if (data) {
                      //NOTIFICACION(FB)
                      this.enviarNotificacion("FB")
                      Swal.fire({
                        title: 'Plan enviado',
                        icon: 'success',
                      }).then((result) => {
                        if (result.value) {
                          this.busquedaPlanes(data.Data);
                          this.loadData();
                          this.addActividad = false;
                        }
                      })
                    }
                  })
                } else if (result.dismiss === Swal.DismissReason.cancel) {
                  Swal.fire({
                    title: 'Envío cancelado',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 2500
                  })
                }
              }, (error) => {
                Swal.fire({
                  title: 'Error en la operación',
                  icon: 'error',
                  text: `${JSON.stringify(error)}`,
                  showConfirmButton: false,
                  timer: 2500
                })
              })
            } else {
              Swal.fire({
                title: 'Error en la operación',
                icon: 'error',
                text: `Por favor complete las identificaciones de contratistas y/o docentes para continuar`,
                showConfirmButton: false,
                timer: 2500
              })
            }
          }
        })

      }
    })

  }

  getPoderacionActividades(): Promise<string> {
    let message: string = '';
    let resolveRef;
    let rejectRef;

    let dataPromise: Promise<string> = new Promise((resolve, reject) => {
      resolveRef = resolve;
      rejectRef = reject;
    });
    this.request.get(environment.PLANES_MID, `formulacion/ponderacion_actividades/` + this.plan._id).subscribe((data: any) => {
      if (data) {
        let aux: object = data.Data
        let keys: string[];

        keys = Object.keys(aux)
        for (let key of keys) {
          message = message + key + ' : ' + aux[key] + "<br/>"
        }
        if (parseInt(data.Data.Total) === 100) {
          this.ponderacionCompleta = true
        } else {
          this.ponderacionCompleta = false
        }
        this.ponderacionActividades = message
        resolveRef(message)
      } else {
        Swal.fire({
          title: 'Error en solicitud de cálculo de ponderación, por favor contactarse con el administrador del sistema.',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en solicitud de cálculo de ponderación, por favor contactarse con el administrador del sistema.',
        icon: 'error',
        showConfirmButton: false,
        timer: 2500
      })
    })
    return dataPromise
  }

  iniciarRevision() {
    Swal.fire({
      title: 'Iniciar Revisión',
      text: `Esta a punto de iniciar la revisión para este Plan`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = this.ID_ESTADO_EN_REVISION;
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: any) => {
          if (data) {
            //NOTIFICACION(FC)
            this.enviarNotificacion("FC")
            Swal.fire({
              title: 'Plan En Revisión',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.busquedaPlanes(data.Data);
                this.loadData();
                this.addActividad = false;
              }
            })
          }
        })
        Swal.fire({
          title: 'Estado actualizado (SIN CAMBIOS)',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Inicio de Revisión Cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  enviarRevision() {
    Swal.fire({
      title: 'Enviar Revisión',
      text: `¿Desea enviar la revisión?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = this.ID_ESTADO_REVISADO;
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: any) => {
          if (data) {
            //NOTIFICACION(FD)
            this.enviarNotificacion("FD")
            Swal.fire({
              title: 'Revisión Enviada',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.busquedaPlanes(data.Data);
                this.loadData();
                this.addActividad = false;
              }
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Revisión Cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  verificarRevision() {
    Swal.fire({
      title: 'Verificar Revisión',
      text: `Antes de verificar la revisión por favor revise las observaciones de las actividades e identificaciones del plan realizadas por Planeación para realizar los ajustes necesarios en caso de ser requerido`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO verificar si se puede enviar a verificar
        Swal.fire({
          title: 'Verificar Revisión',
          text: `¿Desea verificar la revisión?`,
          icon: 'warning',
          confirmButtonText: `Sí`,
          cancelButtonText: `No`,
          showCancelButton: true
        }).then((result) => {
          if (result.isConfirmed) {
            this.plan.estado_plan_id = this.ID_ESTADO_REVISION_VERIFICADA;
            this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: any) => {
              if (data) {
                Swal.fire({
                  title: 'Revisión Verficada Enviada',
                  icon: 'success',
                }).then((result) => {
                  if (result.value) {
                    this.busquedaPlanes(data.Data);
                    this.loadData();
                    this.addActividad = false;
                  }
                })
              }
            })
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: 'Envio de Revisión Verificada Cancelado',
              icon: 'error',
              showConfirmButton: false,
              timer: 2500
            })
          }
        }),
          (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `${JSON.stringify(error)}`,
              showConfirmButton: false,
              timer: 2500
            })
          }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Revisión Verificada Cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    })
  }

  realizarAjustes() {
    Swal.fire({
      title: 'Realizar Ajustes',
      text: `¿Desea realizar ajustes a el Plan?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        if(this.plan.estado_plan_id == "614d3b4401c7a222052fac05"){
          this.request.put(environment.PLANES_CRUD, `plan`, {...this.plan, estado_plan_id: "615335c501c7a213a12fb2a3"},this.plan._id).subscribe((data:any)=>{
            if(data){
              this.crearNuevaVersion();
            } else {
              Swal.fire({
                title: 'Error al modificar el plan actual. Por favor intente de nuevo',
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              })
            }
          })
        } else {
          this.crearNuevaVersion();
        }

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Ajustes Cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  crearNuevaVersion(){
    this.request.post(environment.PLANES_MID, `formulacion/versionar_plan/` + this.plan._id, this.plan).subscribe((data: any) => {
      if (data) {
        this.getVersiones(data.Data);
        Swal.fire({
          title: 'Nueva Versión',
          text: 'Nueva versión del plan creada, ya puede realizar los ajustes al plan.',
          icon: 'success',
        }).then(async (result) => {
          if (result.value) {
            await this.cleanBeforeLoad();
          }
        })
      } else {
        Swal.fire({
          title: 'Error al versionar el plan. Por favor intente de nuevo',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    })
  }

  preAval() {
    Swal.fire({
      title: 'Pre Aval',
      text: `¿Desea darle pre aval a este plan?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = this.ID_ESTADO_PRE_AVAL;
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: any) => {
          if (data) {
            //NOTIFICACION(FF)
            this.enviarNotificacion("FF")
            Swal.fire({
              title: 'Plan pre avalado',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.busquedaPlanes(data.Data);
                this.loadData();
                this.addActividad = false;
              }
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Pre Aval Cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    })
  }


  avalar() {
    Swal.fire({
      title: 'Aval',
      text: `¿Desea darle Aval a este plan?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.mostrarMensajeCarga();
        return new Promise((resolve, reject) => {
          this.request.post(environment.PLANES_MID, `seguimiento/avalar/` + this.plan._id, {}).subscribe((data: any) => {
            Swal.close();
            if (data.Success == true) {
              //NOTIFICACION(FH)
              this.enviarNotificacion("FH")
              Swal.fire({
                title: 'Plan Avalado',
                icon: 'success',
                showConfirmButton: false,
                timer: 2500
              }).then((result) => {
                this.plan.estado_plan_id = this.ID_ESTADO_AVAL;
                this.busquedaPlanes(this.plan, false);
                this.loadData();
                this.addActividad = false;
              })
              resolve(data);
            } else {
              Swal.fire({
                title: 'Error en la operación',
                icon: 'error',
                text: `Error creando reportes de seguimiento`,
                showConfirmButton: false,
                timer: 2500
              })
              reject();
            }
          }, (error) => {
            Swal.close();
            const mensaje = error.error.Data ? error.error.Data : error.message
            Swal.fire({
              title: 'Error en la operación',
              text: `${mensaje}, por favor diríjase al módulo de administración y diligencie las fechas correspondientes al periodo de seguimiento para la vigencia requerida.`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 4000
            });
            reject();
          })
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Aval Cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    })
  }
  /**
   * Obtiene el elemento filtrado por los valores dados y actualiza su campo respectivo
   * @param arreglo Lista de elementos en los cuales se va a buscar un elemento teniendo en cuenta un parametro de busqueda y el valor esperado
   * @param parametroFiltro parametro de busqueda por el cual se buscará
   * @param selectFormulario select relacionado al formulario de el elemento
   * @param valor valor por el cual se filtrará
   * @returns elemento que cumpla con los valores dados
   */
  obtenerElemento(arreglo: any[], parametroFiltro:string, selectFormulario:string, valor: string|number): any{
    let elementos = arreglo.filter((elemento) => elemento[parametroFiltro] == valor)
    if(elementos.length > 0){
      this.formSelect.get(selectFormulario).setValue(elementos[0]);
      return elementos[0]
    } else {
      console.error(
        'No se encontró un elemento con los valores dados, verifique que los datos esten bien'
      );
      return null;
    }
  }

  async cargarPlan(planACargar: ResumenPlan) {
    // Se obtiene la unidad especificada para cargarla en los desplegables
    await this.onChangeU(
      this.obtenerElemento(
        this.auxUnidades,
        'Id',
        'selectUnidad',
        Number(planACargar.dependencia_id)
      )
    );
    // Se obtiene la vigencia especificada para cargarla en los desplegables
    await this.onChangeV(
      this.obtenerElemento(
        this.vigencias,
        'Id',
        'selectVigencia',
        planACargar.vigencia_id
      )
    );
    // En este punto se deben haber cargado los planes por la función 'onChangeV'
    if (this.planes != undefined) {
      this.onChangeP(
        this.obtenerElemento(
          this.planes,
          'nombre',
          'selectPlan',
          planACargar.nombre
        )
      );
      if (planACargar.version) {
        this.versionDesdeTabla = planACargar.version
      }
    } else {
      console.error('No se han cargado los planes');
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
