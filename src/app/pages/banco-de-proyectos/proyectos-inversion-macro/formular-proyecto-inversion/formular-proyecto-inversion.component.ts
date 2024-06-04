import { Component, OnInit, ViewChild } from '@angular/core';
import { ControlContainer, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { CodigosService } from 'src/app/@core/services/codigos.service';

export interface Metas {
  Posicion: string;
  Meta: string;
  TipodeMeta: string;
  presupuesto_programado: number;
  //P0rogPresupuestal: string;
  //ProgActividades: string;
}

// const TABLA: Metas[] =  [
//   {Posicion: '1', Meta: 'Proyecto A', TipodeMeta: 'x', Presupuesto: 30000, },
//   {Posicion: '2', Meta: 'Proyecto A', TipodeMeta: 'x', Presupuesto: 30000, },
// ]

@Component({
  selector: 'app-formular-proyecto-inversion',
  templateUrl: './formular-proyecto-inversion.component.html',
  styleUrls: ['./formular-proyecto-inversion.component.scss']
})
export class FormularProyectoInversionComponent implements OnInit {
  ID_ESTADO_EN_FORMULACION: string;
  ID_ESTADO_FORMULADO: string;
  ID_ESTADO_EN_REVISION: string;
  ID_ESTADO_REVISADO: string;
  ID_ESTADO_PRE_AVAL:string;
  ID_ESTADO_AVAL:string;
  ID_ESTADO_AJUSTE_PRESUPUESTAL:string;
  ID_ESTADO_REVISION_VERIFICADA:string;

  activedStep = 0;
  vigencias: any[];
  metas: any[];
  vigencia: any;
  unidades: any[];
  unidad: any;
  planes: any[];
  metaToSee: any[];
  dataTablaResumen = [];
  plan: any;
  planId: string;
  tipoActividadName: string;
  lengthMetas: number = 0;
  addActividad: boolean;
  clonar: boolean;
  moduloVisible: boolean;
  isChecked: boolean
  vigenciaSelected: boolean;
  unidadSelected: boolean;
  planSelected: boolean;
  guardarDisabled: boolean;
  actividadId: string;
  dataT: boolean;
  banderaEdit: boolean;
  formulacionState: boolean;
  displayedColumns: string[] = ['Posicion', 'Meta', 'TipodeMeta', 'Presupuesto', 'Acciones', 'ProgPresupuestal', 'ProgActividades'];
  numMeta: number = 0;
  dataMetas = new MatTableDataSource<Metas>();
  columnsToDisplay: string[]
  dataSource: MatTableDataSource<any>;
  unidadesInteres: any;
  meta: any;
  id_formato: string;
  totalPresupuesto: any;
  idPlanIndicativo: string;
  idProyectoInversion: string;
  tipoPlanId: string;
  rowActividad: string;
  idPadre: string;
  idPadreDD: string;
  tipoPlanIdDD: string;
  tipoProyectoInversion: string;
  tipoPlanIndicativo: string;
  proyectosInversion: any[];
  actividadesProg: any[];
  dataActividades: any[] = [];
  planesDesarrolloDistrital: any[];
  actividadGrupo = [];
  dataPlan = [];
  planesDesarrollo: any[];
  planesIndicativos: any[];
  planDDSelected: boolean;
  planDSelected: boolean;
  planISelected: boolean;
  planAsignado: boolean;
  proyectSelected: boolean;
  metaSelected: boolean;
  armoProInv: string;
  dataArmonizacionPED: string[] = [];
  dataArmonizacionPI: string[] = [];
  dataArmonizacionPDD: string[] = [];
  estado: string;
  estadoPlan: string;
  iconEstado: string;
  iconEditar: string;
  idSubDetMetasProI: string;
  versionPlan: string;
  banderaUltimaVersion: boolean;
  //readOnlyAll: boolean = false;
  planAux: any;
  indexMeta: any;
  versiones: any[];
  steps: any[];
  json: any;
  actividades: boolean = false;
  formular: boolean = false;
  enviarP: boolean = true;
  namePlan: string;
  vigenciaId: string;
  actividadP: any
  unidadId: string;
  planB: any;
  datoUnidad: any;
  datoVigencia: any;
  datoPlan: any;
  rol: string;
  readonlyObs: boolean;
  hiddenObs: boolean;
  readOnlyAll: boolean;
  planDD: any;
  proIn: any;
  planD: any;
  planI: any;
  metaProIn: any;
  rowIndex: string;
  formArmonizacion: FormGroup;
  formFormulacion: FormGroup;
  form: FormGroup;
  controlVersion = new FormControl();
  selectUnidad = new FormControl();
  selectVigencia = new FormControl();
  selectPlan = new FormControl();
  selectedPDD = new FormControl();
  selectedProI = new FormControl();
  selectedPED = new FormControl();
  selectedPI = new FormControl();
  selectedMetaProI = new FormControl();
  defaultFilterPredicate?: (data: any, filter: string) => boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private autenticationService: ImplicitAutenticationService,
    private codigosService: CodigosService
  ) {
    //this.loadVigencias();
    // this.unidadId = localStorage.getItem('dependencia_id');
    // this.vigenciaId = localStorage.getItem('vigenciaId');
    // this.namePlan = localStorage.getItem('namePlan');
    this.loadUnidades();
    //this.loadPlanes();
    // this.cargarPlanesDesarrolloDistrital();
    // this.cargarPlanesDesarrollo();
    // this.cargarPlanesIndicativos();
    // this.cargarProyectosInversion();
    //this.loadActividades();


    //this.vigenciaSelected = false;
    this.unidadSelected = false;
    this.guardarDisabled = false;
    this.addActividad = false;
    //this.planSelected = false;
    //this.unidadSelected = false;
    //this.vigenciaSelected = false;
    this.clonar = false;
    //this.identRecursos = false;
    //this.identContratistas = false;
    //this.identDocentes = false;
    this.dataT = false;
    this.moduloVisible = false;
    this.isChecked = true;
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
      this.loadUnidades();
    } else if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
      //this.verificarFechas();
    }
  }

  async ngOnInit(){
    this.ID_ESTADO_EN_FORMULACION = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'EF_SP');
    this.ID_ESTADO_FORMULADO = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'F_SP');
    this.ID_ESTADO_EN_REVISION = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'ER_SP');
    this.ID_ESTADO_REVISADO = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'R_SP');
    this.ID_ESTADO_PRE_AVAL = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'PA_SP');
    this.ID_ESTADO_AVAL = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'A_SP');
    this.ID_ESTADO_AJUSTE_PRESUPUESTAL = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'AP_SP');
    this.ID_ESTADO_REVISION_VERIFICADA = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'RV_SP');
    this.formArmonizacion = this.formBuilder.group({
      selectPDD: ['',],
      selectPED: ['',],
      selectPI: ['',],
      selectPrIn: ['',]
    });
    console.log(this.datoUnidad);
    console.log(this.datoVigencia);
    console.log(this.datoPlan);
    this.formFormulacion = this.formBuilder.group({
      datoUnidad: ['',],
      datoVigencia: ['',],
      datoPlan: ['',],
    })

    this.getTotalPresupuesto();
  }

  // onChange(value) {
  //   console.log(value,"prueba")
  // }

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
  }

  cargaFormato() {
    Swal.fire({
      title: 'Cargando formato',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })

    this.request.get(environment.PLANES_MID, `formato/` + this.planId).subscribe((data: any) => {
      if (data) {
        Swal.close();
        //this.estado = plan.estado_plan_id;
        this.steps = data[0]
        console.log(this.steps, "steps")
        this.json = data[1][0]
        this.form = this.formBuilder.group(this.json);
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



  verificarData() {
    this.datoUnidad = localStorage.getItem('dependencia_id');
    this.datoVigencia = localStorage.getItem('vigenciaId');
    this.datoPlan = localStorage.getItem('namePlan');
    // this.datoUnidad = JSON.parse(localStorage.getItem('dependencia'));
    // this.datoVigencia = JSON.parse(localStorage.getItem('vigencia'));
    // this.datoPlan = JSON.parse(localStorage.getItem('plan'));
    //this.busquedaPlanes(this.datoPlan);
  }

  loadUnidades() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) => {
      if (data) {
        Swal.close();
        if (data.Data.length != 0) {
          this.unidades = data.Data;
          //this.auxUnidades = data.Data;
          this.moduloVisible = true;
          if (this.unidadId != null) {
            console.log("ingresa");
            for (let i = 0; i < this.unidades.length; i++) {
              if (this.unidadId == this.unidades[i].Id) {
                this.unidad = this.unidades[i];
                this.selectUnidad = new FormControl(this.unidades[i]);
                console.log(this.selectUnidad);
              }
            }
          }

          //console.log(this.unidades, "unidades")
        }
        this.loadVigencias();
        //this.verificarData();
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

  onChangeU(unidad: any) {
    if (unidad == undefined) {
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.addActividad = false;
      this.unidad = unidad;
      this.estadoPlan = "";
      this.iconEstado = "";
      this.versionPlan = "";
      this.selectVigencia.setValue('--');
      this.selectPlan.setValue('--');
      localStorage.setItem('dependencia_id', this.unidad.Id);
      //localStorage.setItem('dependencia', JSON.stringify(this.unidad));
      if (this.vigenciaSelected && this.planSelected) {
        this.busquedaPlanes(this.planAux);
      }
      // console.log(this.unidad, "valor unidad",);
    }
  }

  loadVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data;
        //console.log(this.vigencias, "vigencias")
        if (this.vigenciaId != null) {
          console.log("ingresa vig");
          for (let i = 0; i < this.vigencias.length; i++) {
            if (this.vigenciaId == this.vigencias[i].Id) {
              this.vigencia = this.vigencias[i];
              this.selectVigencia = new FormControl(this.vigencias[i]);

            }
          }
        }
        this.loadPlanes();
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

  onChangeV(vigencia: any) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      this.addActividad = false;
      this.estadoPlan = "";
      this.iconEstado = "";
      this.versionPlan = "";
      localStorage.setItem('vigenciaId', this.vigencia.Id);
      //localStorage.setItem('vigencia', JSON.stringify(this.vigencia));
      if (this.unidadSelected && this.planSelected) {
        this.busquedaPlanes(this.planAux);
      }
      // console.log(this.vigencia, "valor vigencia", this.vigenciaSelected);
    }
  }

  async loadPlanes() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:${await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'MPAI_SP')},formato:true`).subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {
          this.planes = data.Data;
          //this.planes = this.filterPlanes(this.planes);
          console.log(this.planes, "planes");
          if (this.namePlan != null) {
            for (let i = 0; i < this.planes.length; i++) {
              if (this.namePlan == this.planes[i].nombre) {
                this.plan = this.planes[i];
                this.selectPlan = new FormControl(this.planes[i]);
                console.log(this.planes[i], "ingresa vig");
                this.busquedaPlanes(this.planes[i]);

              }
            }
          }
        }
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

  onChangeP(plan: any) {
    if (plan == undefined) {
      this.planSelected = false;
    } else {
      this.planSelected = true;
      this.addActividad = false;
      this.plan = plan;
      this.estadoPlan = "";
      this.iconEstado = "";
      this.versionPlan = "";
      this.namePlan = plan.nombre
      localStorage.setItem('namePlan', plan.nombre);
      //localStorage.setItem('plan', JSON.stringify(this.plan));
      this.busquedaPlanes(plan);
      // console.log(this.plan, "valor plan", this.planSelected);
    }
  }

  busquedaPlanes(planB) {
    if (planB != null) {
      this.namePlan = planB.nombre;
      console.log(this.namePlan, "nombre plan");
      //this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:` + this.unidad.Id + `,vigencia:` +
      this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:` + this.unidad.Id + `,vigencia:` +
        this.vigencia.Id + `,formato:false,nombre:` + this.namePlan).subscribe((data: any) => {
          if (data.Data.length > 0) {
            let i = data.Data.length - 1;
            console.log(data.Data, "info del plan");
            this.planId = data.Data[i]["_id"];
            this.cargarPlanesDesarrolloDistrital();
            this.cargarPlanesDesarrollo();
            this.cargarPlanesIndicativos();
            this.cargarProyectosInversion();
            this.getDataPlan();
            this.getVersiones(planB);
            this.formulacionState = true;
          } else if (data.Data.length == 0) {
            Swal.fire({
              title: 'Formulación nuevo plan',
              html: 'No existe plan <b>' + planB.nombre + '</b> <br>' +
                'para la dependencia <b>' + this.namePlan + '</b> y la <br>' +
                'vigencia <b>' + this.vigencia.Nombre + '</b><br></br>' +
                '<i>Deberá formular el plan</i>',
              // text: `No existe plan ${planB.nombre} para la dependencia ${this.unidad.Nombre} y la vigencia ${this.vigencia.Nombre}.
              // Deberá formular un nuevo plan`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 7000
            })
            this.clonar = true;
            this.plan = planB;
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
    } else {
      this.formulacionState = false;
    }
  }

  getDataPlan() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `inversion/get_infoPlan/` + this.planId).subscribe((data: any) => {
      if (data) {
        Swal.close();
        console.log(data, "getData");
        //this.onChangePDD(this.planesDesarrolloDistrital[0])
        //this.onChangePD(this.planesDesarrollo[0]);
        //this.onChangePI(this.planesIndicativos[0]);
        //this.formArmonizacion.get('selectPrIn').setValue(this.proyectosInversion[0])
        let auxAmonizacion = data.Data
        this.idPadreDD = auxAmonizacion.idPDD
        this.idPadre = auxAmonizacion.idPED
        this.idPlanIndicativo = auxAmonizacion.idPI
        this.idProyectoInversion = auxAmonizacion.armoProInv
        let strArmonizacionPDD = auxAmonizacion.armoPDD
        let lenPDD = (strArmonizacionPDD.split(",").length)
        this.dataArmonizacionPDD = strArmonizacionPDD.split(",", lenPDD).filter(((item) => item != ""))
        let strArmonizacion = auxAmonizacion.armoPED
        let len = (strArmonizacion.split(",").length)
        this.dataArmonizacionPED = strArmonizacion.split(",", len).filter(((item) => item != ""))
        let strArmonizacion2 = auxAmonizacion.armoPI
        let len2 = (strArmonizacion2.split(",").length)
        this.dataArmonizacionPI = strArmonizacion2.split(",", len2).filter(((item) => item != ""))
        this.cargarProyectosInversion();
      }
    }, (error) => {
      Swal.close();
    })
  }

  armonizar() {
    var armonizacion = {
      armoPDD: this.dataArmonizacionPDD.toString(),
      armoPED: this.dataArmonizacionPED.toString(),
      armoPI: this.dataArmonizacionPI.toString(),
      armoProInv: this.idProyectoInversion,
      idPDD: this.idPadreDD,
      idPED: this.idPadre,
      idPI: this.idPlanIndicativo
    }
    this.request.put(environment.PLANES_MID, `inversion/armonizar`, armonizacion, this.planId).subscribe((data: any) => {
      if (data) {
        console.log(data)
        Swal.fire({
          title: 'Armonización agregada',
          //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
          text: 'La actividad se ha registrado satisfactoriamente',
          icon: 'success'
        }).then((result) => {
          if (result.value) {
            //this.dataArmonizacionPDD = [];
            //this.dataArmonizacionPED = [];
            //this.dataArmonizacionPI = [];
            // this.idPadre = undefined;
            // this.tipoPlanId = undefined;
            // this.tipoPlanIndicativo = undefined;
            // this.idPlanIndicativo = undefined;
          }
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: 'No fue posible crear la armonización, por favor contactarse con el administrador del sistema',
        icon: 'error',
        showConfirmButton: false,
        timer: 2500
      })

      this.addActividad = false;
      //this.dataArmonizacionPED = [];
      //this.dataArmonizacionPI = [];
    })
  }



  getVersiones(planB) {
    let aux = planB.nombre.replace(/ /g, "%20");
    this.request.get(environment.PLANES_MID, `formulacion/get_plan_versiones/` + this.unidad.Id + `/` + this.vigencia.Id +
      //this.request.get(environment.PLANES_MID, `formulacion/get_plan_versiones/` + this.unidad + `/` + this.vigencia.Id +
      `/` + aux).subscribe((data: any) => {
        if (data) {
          this.versiones = data;
          console.log(this.versiones, "versiones");
          for (var i in this.versiones) {
            var obj = this.versiones[i];
            var num = +i + 1;
            obj["numero"] = num.toString();
          }
          var len = this.versiones.length;
          var pos = +len - 1;
          this.plan = this.versiones[pos];
          console.log(this.plan, "this.plan");
          this.planAsignado = true;
          this.clonar = false;
          this.banderaUltimaVersion = true;
          this.loadData();
          this.controlVersion = new FormControl(this.plan);
          this.versionPlan = this.plan.numero;
          this.getEstado();
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
  }
  visualizeObs() {
    console.log(this.rol, "rol");
    if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        if (this.versiones.length == 1) {
          this.hiddenObs = true;
        } else if (this.versiones.length > 1 && this.banderaEdit && this.addActividad) {
          this.hiddenObs = false;
        } else if (this.versiones.length > 1 && !this.banderaEdit && this.addActividad) {
          this.hiddenObs = true;
        }
        this.readonlyObs = true;
        this.readOnlyAll = false;
      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = true;
      }
    }
    if (this.rol == 'PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'En revisión') {
        this.readOnlyAll = true;
        this.readonlyObs = false;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readOnlyAll = true;
        this.readonlyObs = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = true;
      }
    }
  }
  getEstado() {
    this.request.get(environment.PLANES_CRUD, `estado-plan/` + this.plan.estado_plan_id).subscribe((data: any) => {
      if (data) {
        this.estadoPlan = data.Data.nombre;
        this.getIconEstado();
        // this.cargarPlanesDesarrolloDistrital();
        // this.cargarPlanesDesarrollo();
        // this.cargarPlanesIndicativos();
        // this.cargarProyectosInversion();

        this.visualizeObs();
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
  }

  async getIconEstado() {
    if (this.plan.estado_plan_id == await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'EF_SP')) {
      this.iconEstado = "create";
    } else if (this.plan.estado_plan_id == await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'F_SP')) {
      this.iconEstado = "assignment_turned_in";
    } else if (this.plan.estado_plan_id == await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'ER_SP')) {
      this.iconEstado = "pageview";
    } else if (this.plan.estado_plan_id == await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'R_SP')) {
      this.iconEstado = "assignment_return";
    } else if (this.plan.estado_plan_id == await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'PA_SP')) {
      this.iconEstado = "done";
    } else if (this.plan.estado_plan_id == await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'A_SP')) {
      this.iconEstado = "done_all"
    } else if (this.plan.estado_plan_id == await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'AP_SP')) {
      this.iconEstado = "build";
    }
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  changeIcon(row: { iconSelected: string; Id: any; Nombre: any; }) {
    if (row.iconSelected == 'compare_arrows') {
      row.iconSelected = 'done';
      let unidad = [];
      if (this.unidadesInteres[0].Id == undefined) {
        unidad = [...[{
          "Id": row.Id,
          "Nombre": row.Nombre,
        }]];
        this.unidadesInteres = unidad;
      } else {
        unidad = [...this.unidadesInteres, ...[{
          "Id": row.Id,
          "Nombre": row.Nombre,
        }]];
        this.unidadesInteres = unidad;
      }
    } else if (row.iconSelected == 'done') {
      row.iconSelected = 'compare_arrows';
      let unidadEliminar = row.Id;
      const index = this.unidadesInteres.findIndex((x: { Id: any; }) => x.Id == unidadEliminar);
      this.unidadesInteres.splice(index, 1);
    }
  }




  // formular() {
  //   if(this.vigenciaSelected == true && this.unidadSelected == true && this.planSelected == true){
  //     //console.log(this.plan, "plan");
  //     this.router.navigate(['/pages/proyectos-macro/formulacion-plan-inversion/' + this.plan._id + this.newPlanId]);
  //   }else{
  //     Swal.fire({
  //       title: 'Debe seleccionar todos los criterios',
  //       icon: 'warning',
  //       showConfirmButton: false,
  //       timer: 2500
  //     })
  //   };
  // }

  programarMetas() {
    this.actividades = true;
    this.request.get(environment.PLANES_MID, `inversion/metaspro/` + this.idProyectoInversion).subscribe((data: any) => {
      if (data.Data) {
        this.metas = data.Data.metas;
        this.idSubDetMetasProI = data.Data.id_detalle_meta;
        console.log(data.Data, "Metas");
        this.cargaFormato();
      }
    })
  }

  verMeta(row) {
    this.metaToSee = row;
    this.rowIndex = row.index
    this.editar(row);
    console.log(this.metaToSee, "meta seleccionada")

    //this.router.navigate(['/pages/proyectos-macro/tipo-meta-indicador/' + this.idProyectoInversion + '/' + this.planId + '/' + rowIndex + '/' + this.indexMeta]);
  }

  editar(fila): void {
    this.guardarDisabled = true;
    if (fila.activo == 'Inactivo') {
      Swal.fire({
        title: 'Actividad inactiva',
        text: `No puede editar una actividad en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 3500
      });
    } else {
      // if (this.planesDesarrollo == undefined) {
      //   this.cargarPlanesDesarrollo();
      // }
      // if (this.planesIndicativos == undefined) {
      //   this.cargarPlanesIndicativos();
      // }
      this.actividades = true;

      //this.addActividad = true;
      //this.banderaEdit = true;
      //this.visualizeObs();
      this.rowActividad = fila.index;
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
      this.request.get(environment.PLANES_MID, `inversion/metaspro/` + this.idProyectoInversion).subscribe((data: any) => {
        if (data.Data) {
          this.metas = data.Data.metas;
          this.idSubDetMetasProI = data.Data.id_detalle_meta;
          console.log(data.Data, "Metas");
        }
      })
      this.request.get(environment.PLANES_MID, `formulacion/get_plan/` + this.planId + `/` + fila.index).subscribe((data: any) => {
        if (data) {
          Swal.close();
          //this.onChangePD(this.planesDesarrollo[0]);
          //this.onChangePI(this.planesIndicativos[0]);
          //this.estado = this.plan.estado_plan_id;
          this.steps = data.Data[0]
          this.json = data.Data[1][0]
          this.form = this.formBuilder.group(this.json);
          this.indexMeta = data.Data[2][0].indexMetaSubProI
          for (let i = 0; i < this.metas.length; i++) {
            if (this.metas[i].posicion == this.indexMeta) {
              this.meta = this.metas[i];
              this.selectedMetaProI = new FormControl(this.metas[i]);
            }
          }

          this.onChangeM(this.meta);
          // let auxAmonizacion = data.Data[2][0]
          // let strArmonizacion = auxAmonizacion.armo
          // let len = (strArmonizacion.split(",").length)
          // this.dataArmonizacionPED = strArmonizacion.split(",", len).filter(((item) => item != ""))
          // let strArmonizacion2 = auxAmonizacion.armoPI
          // let len2 = (strArmonizacion2.split(",").length)
          // this.dataArmonizacionPI = strArmonizacion2.split(",", len2).filter(((item) => item != ""))
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

  ocultar() {

    this.actividades = false;
  }

  getTotalPresupuesto() {
    return this.totalPresupuesto = this.dataMetas.data.map(t => t.presupuesto_programado).reduce((acc, value) => acc + value, 0);

  }
  programarMagnitudes(row) {
    console.log(row, "fila");
    this.metaToSee = row;
    let rowIndex = row.index;
    let posicionMetaPro = row.posicion;
    this.router.navigate(['/pages/proyectos-macro/magnitudes-presupuesto/' + this.idProyectoInversion + '/' + this.planId + '/' + rowIndex + '/' + posicionMetaPro + '/' + true]);
    console.log("programarMagnitudes")
  }

  verMagnitudes(row) {
    console.log(row, "fila");
    this.metaToSee = row;
    let rowIndex = row.index;
    let posicionMetaPro = row.posicion;
    this.router.navigate(['/pages/proyectos-macro/magnitudes-presupuesto/' + this.idProyectoInversion + '/' + this.planId + '/' + rowIndex + '/' + posicionMetaPro + '/' + false]);
    console.log("programarMagnitudes")
  }
  programarActividades(row) {
    let rowIndex = row.index;
    let posicionMetaPro = row.posicion;
    this.router.navigate(['/pages/proyectos-macro/identificacion-actividades-recursos/' + this.idProyectoInversion + '/' + this.planId + '/' + rowIndex + '/' + posicionMetaPro + '/' + true]);
  }

  verActividades(row) {
    let rowIndex = row.index;
    let posicionMetaPro = row.posicion;
    this.router.navigate(['/pages/proyectos-macro/identificacion-actividades-recursos/' + this.idProyectoInversion + '/' + this.planId + '/' + rowIndex + '/' + posicionMetaPro + '/' + false]);
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
    this.planId = this.plan._id;
  }
  onChangePDD(planDD) {
    if (planDD == undefined) {
      this.planDDSelected = false;
      //this.idPadre = undefined;
      this.tipoPlanId = undefined;
    } else {
      this.planDDSelected = true;
      this.idPadreDD = planDD._id;
      this.tipoPlanIdDD = planDD.tipo_plan_id;
      console.log(this.planDDSelected, 'idPlanDesarrolloDistrital');
    }
  }

  onChangePD(planD) {
    if (planD == undefined) {
      this.planDSelected = false;
      this.idPadre = undefined;
      this.tipoPlanId = undefined;
    } else {
      this.planDSelected = true;
      this.idPadre = planD._id;
      this.tipoPlanId = planD.tipo_plan_id;
      console.log(this.planDSelected, 'idPlanEstrategicoDesarrollo');
    }
  }

  onChangePI(planI) {
    if (planI == undefined) {
      this.planISelected = false;
      this.idPlanIndicativo = undefined;
      this.tipoPlanIndicativo = undefined;
    } else {
      this.planISelected = true;
      this.idPlanIndicativo = planI._id;
      this.tipoPlanIndicativo = planI.tipo_plan_id;
      console.log(this.planISelected, 'idPlanIndicativo');
    }
  }

  onChangePrIn(proIn) {
    if (proIn == undefined) {
      this.proyectSelected = false;
      this.idProyectoInversion = undefined;
      this.tipoProyectoInversion = undefined;
    } else {
      this.proyectSelected = true;
      this.idProyectoInversion = proIn._id;
      console.log(this.idProyectoInversion, 'idProyectoInversion');
      this.tipoProyectoInversion = proIn.tipo_plan_id;
    }
  }

  onChangeM(meta) {
    if (meta == undefined) {
      this.metaSelected = false;
      this.idPadre = undefined;
      this.tipoPlanId = undefined;
    } else {
      this.metaSelected = true;
      this.meta = meta;
      this.indexMeta = this.meta.posicion;
      //this.tipoPlanId = meta.tipo_plan_id;
      console.log(this.indexMeta, 'metaSeleccionada');
    }
  }

  async cargarPlanesDesarrolloDistrital() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:${await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PDD_SP')}`).subscribe((data: any) => {
      if (data) {
        console.log(data, "planes DD");
        this.planesDesarrolloDistrital = data.Data;

        for (let i = 0; i < this.planesDesarrolloDistrital.length; i++) {
          if (this.idPadreDD == this.planesDesarrolloDistrital[i]._id) {
            this.planDD = this.planesDesarrolloDistrital[i];
            this.selectedPDD = new FormControl(this.planesDesarrolloDistrital[i]);

          }
        }

        this.cargarPlanesDesarrollo();
        //this.formArmonizacion.get('selectPDD').setValue(this.planesDesarrolloDistrital[0])
        this.onChangePDD(this.planDD);
      }
    })
  }
  async cargarPlanesDesarrollo() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:${await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PD_SP')}`).subscribe((data: any) => {
      if (data) {
        console.log(data, "planes estrategicos");
        this.planesDesarrollo = data.Data;

        for (let i = 0; i < this.planesDesarrollo.length; i++) {
          if (this.idPadre == this.planesDesarrollo[i]._id) {
            this.planD = this.planesDesarrollo[i];
            this.selectedPED = new FormControl(this.planesDesarrollo[i]);

          }
        }
        //this.formArmonizacion.get('selectPED').setValue(this.planesDesarrollo[0])

        this.cargarPlanesIndicativos();
        this.onChangePD(this.planD);
      }
    })
  }

  async cargarProyectosInversion() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:${await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PRI_SP')}`).subscribe((data: any) => {
      if (data) {
        this.proyectosInversion = data.Data;
        //console.log(this.proyectosInversion)

        for (let i = 0; i < this.proyectosInversion.length; i++) {
          if (this.idProyectoInversion == this.proyectosInversion[i]._id) {
            console.log("entra a for Inversion", this.proyectosInversion[i]._id);
            this.proIn = this.proyectosInversion[i];
            this.selectedProI = new FormControl(this.proyectosInversion[i]);

          }
        }

        this.cargarPlanesDesarrolloDistrital();
        //this.formArmonizacion.get('selectPrIn').setValue(this.proyectosInversion[0])
        this.onChangePrIn(this.proIn);

      }
    })
  }
  async cargarPlanesIndicativos() {
    this.request.get(environment.PLANES_CRUD, `plan?query=tipo_plan_id:${await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PLI_SP')}`).subscribe((data: any) => {
      if (data) {
        console.log(data, "planes indicativos");
        this.planesIndicativos = data.Data;

        for (let i = 0; i < this.planesIndicativos.length; i++) {
          if (this.idPlanIndicativo == this.planesIndicativos[i]._id) {
            this.planI = this.planesIndicativos[i];
            this.selectedPI = new FormControl(this.planesIndicativos[i]);

          }
        }
        //this.formArmonizacion.get('selectPI').setValue(this.planesIndicativos[0])
        this.onChangePI(this.planI);

      }
    })
  }
  receiveMessage(event) {
    if (event.bandera === 'armonizar') {
      var uid_n = event.fila.level;
      var uid = event.fila.id; // id del nivel a editar
      if (uid != this.dataArmonizacionPED.find(id => id === uid)) {
        this.dataArmonizacionPED.push(uid)
        console.log(this.dataArmonizacionPED, 'armo');
      } else {
        const index = this.dataArmonizacionPED.indexOf(uid, 0);
        if (index > -1) {
          this.dataArmonizacionPED.splice(index, 1);
        }
      }
    }
  }

  receiveMessagePI(event) {
    if (event.bandera === 'armonizar') {
      var uid_n = event.fila.level;
      var uid = event.fila.id; // id del nivel a editar
      if (uid != this.dataArmonizacionPI.find(id => id === uid)) {
        this.dataArmonizacionPI.push(uid)
        console.log(this.dataArmonizacionPI, 'armo');
      } else {
        const index = this.dataArmonizacionPI.indexOf(uid, 0);
        if (index > -1) {
          this.dataArmonizacionPI.splice(index, 1);
        }
      }
    }
  }

  receiveMessagePDD(event) {
    if (event.bandera === 'armonizar') {
      var uid_n = event.fila.level;
      var uid = event.fila.id; // id del nivel a editar
      if (uid != this.dataArmonizacionPDD.find(id => id === uid)) {
        this.dataArmonizacionPDD.push(uid)
        console.log(this.dataArmonizacionPDD, 'armo');
      } else {
        const index = this.dataArmonizacionPDD.indexOf(uid, 0);
        if (index > -1) {
          this.dataArmonizacionPDD.splice(index, 1);
        }
      }
    }
  }

  guardar() {
    console.log("Armonización");
  }

  formularPlan() {
    if (this.unidad != undefined && this.vigencia.Id != undefined && this.plan._id != undefined) {
      let parametros = {
        //"dependencia_id": String(this.unidad.Id),
        "dependencia_id": String(this.unidad.Id),
        "vigencia": String(this.vigencia.Id),
        "id": String(this.plan._id),

      }
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
      this.request.post(environment.PLANES_MID, `inversion/crearplan`, parametros).subscribe(async (data: any) => {
        if (data) {
          Swal.close();
          console.log(data);
          this.plan.estado_plan_id = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'EF_SP');
          this.request.put(environment.PLANES_CRUD, `plan`, this.plan, data.Data._id).subscribe((dataPut: any) => {
            if (dataPut) {
              this.plan = dataPut.Data;
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
              this.getVersiones(this.plan);

            }
          })
          //this.newPlanId = data.Data._id
          // this.cargarPlanesDesarrolloDistrital();
          // this.cargarPlanesDesarrollo();
          // this.cargarPlanesIndicativos();
          // this.cargarProyectosInversion();
          // this.formular = true;
          // console.log(this.planId, "id");
          //this.plan.estado_plan_id = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'EF_SP');
          //this.request.put(environment.PLANES_CRUD, `plan`, this.plan, data.Data._id).subscribe((dataPut: any) => {
          //if (dataPut) {
          //this.plan = dataPut.Data;
          Swal.fire({
            title: 'Formulación nuevo plan',
            text: `Plan creado satisfactoriamente`,
            icon: 'success',
            showConfirmButton: false,
            timer: 4000
          })
          //this.getVersiones(this.plan);
          //setTimeout(()=>(this.router.navigate(['/pages/proyectos-macro/formulacion-plan-inversion/' + this.plan._id + '/' + this.newPlanId])),50 );
        }
      }), (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
    } else {
      Swal.fire({
        title: 'Debe seleccionar todos los criterios',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    };


  }

  inhabilitar(row) {
    console.log(row, "Row")
    if (row.activo == false) {
      Swal.fire({
        title: 'Actividad ya inactiva',
        text: `La actividad ya se encuentra en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    } else {
      this.inactivar(row);
    }
  }

  inactivar(row) {
    Swal.fire({
      title: 'Inhabilitar Meta',
      text: `¿Está seguro de inhabilitar esta actividad?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `inversion/inactivar_meta`, `null`, this.plan._id + `/` + row.index).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Cambio realizado',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.ajustarData();
                //this.loadData()
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

  loadData() {
    this.ajustarData();

  }
  cambiarValor(valorABuscar, valorViejo, valorNuevo, dataS) {
    dataS.forEach(function(elemento) {
      elemento[valorABuscar] = elemento[valorABuscar] == valorViejo ? valorNuevo : elemento[valorABuscar]
    })
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

  ajustarData() {
    // if (this.rol == 'PLANEACION' || this.plan.estado_plan_id != await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'EF_SP')) {
    //   this.iconEditar = 'search'
    // } else if (this.rol == 'JEFE_DEPENDENCIA' || this.rol == 'JEFE_PLANEACION') {
    //   this.iconEditar = 'edit'
    // }
    this.request.get(environment.PLANES_MID, `inversion/all_metas/` + this.plan._id + `?order=asc&sortby=index`).subscribe((data: any) => {
      if (data.Data != null) {
        console.log(data.Data, "metas")
        this.dataTablaResumen = data.Data;
        this.lengthMetas = data.Data.length;
        //console.log(this.dataPlan, "dataPlan")
        this.dataMetas = new MatTableDataSource(data.Data);
        //console.log(this.dataMetas, "metas")
        this.defaultFilterPredicate = this.dataSource.filterPredicate;
        //this.cambiarValor("activo", true, "Activo", this.dataSource.data)
        //this.cambiarValor("activo", false, "Inactivo", this.dataSource.data)
        this.displayedColumns = data.Data.displayed_columns;
        this.columnsToDisplay = this.displayedColumns.slice();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataT = true;
        this.filterActive()


      } else if (data.Data == null) {
        //data.Data.data_source == null
        this.dataT = false;
        Swal.fire({
          title: 'Atención en la operación',
          text: `No hay actividades registradas para el plan`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 3500
        })
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

  verificarPlan() {
    // this.request.get(environment.PLANES_MID, `inversion/all_metas/` + actvidadId + `?order=asc&sortby=index`).subscribe((data: any) => {
    //   if (data.Data != null) {

    //     console.log(data.Data, "actividades")
    //     this.actividadesProg = data.Data;
    //     let presupuestoTotalActividad = 0;

    //     for(let j = 0; j < this.actividadesProg.length; j++) {

    //       presupuestoTotalActividad += this.actividadesProg[j]["presupuesto"];
    //       console.log(this.actividadesProg[j]["presupuesto"], "entra al For");

    //     }
    //     this.actividadP = {
    //       //posicion: this.actividadesProg[j]["index"],
    //       presupuesto: presupuestoTotalActividad
    //       }
    //     this.dataActividades.push(this.actividadP);
    //   }
    // }, (error) => {
    //   Swal.fire({
    //     title: 'Error en la operación',
    //     text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
    //     icon: 'warning',
    //     showConfirmButton: false,
    //     timer: 2500
    //   })
    // })
    Swal.fire({
      title: 'Terminar Formulación',
      text: `¿Está seguro de que toda la información del plan está diligenciada?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        for (let i = 0; i < this.lengthMetas; i++) {
          this.numMeta = i + 1;
          if (this.dataTablaResumen[i].presupuesto_programado == null || this.dataTablaResumen[i].presupuesto_programado == 0) {
            Swal.fire({
              title: 'Información Faltante',
              html: 'Revise y diligencie información faltante en las actividades de la Meta # ' + this.numMeta,
              //text: `Revisar información de las actividades datos registrados ${JSON.stringify(error)}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 3500
            })
            return
          }
        }
        this.request.get(environment.PLANES_MID, `inversion/verificar_magnitudes/` + this.planId).subscribe((data: any) => {
          if (data.Data != null) {
            if (this.lengthMetas != data.Data) {
              Swal.fire({
                title: 'Información Faltante',
                html: 'Revise y diligencie información faltante la programación de Magnitudes de Metas',
                //text: `Revisar información de las actividades datos registrados ${JSON.stringify(error)}`,
                icon: 'warning',
                showConfirmButton: false,
                timer: 3500
              })
              return
            }
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        }), Swal.fire({
          title: 'Plan culminado con éxito',
          //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
          text: 'Por favor dar click en el botón enviar para que sea revisado por la unidad de Planeación',
          icon: 'success'
        }).then((result) => {
          if (result.value) {
            //this.ajustarData()
            console.log("plan culminado");
            this.enviarP = false;
            this.banderaEdit = false;
            //this.form.reset();
            //this.addActividad = false;
            //this.dataArmonizacionPED = [];
            //this.dataArmonizacionPI = [];
            //this.idPadre = undefined;
            //this.tipoPlanId = undefined;
            //this.tipoPlanIndicativo = undefined;
            //this.idPlanIndicativo = undefined;
          }
        })


      }
    })
  }

  enviarPlan() {
    Swal.fire({
      title: 'Culminar Plan',
      text: `¿Está seguro de enviar este Plan Culminado?`,
      icon: 'warning',
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'F_SP');
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: any) => {
          if (data) {
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
    })
  }

  iniciarRevision() {
    Swal.fire({
      title: 'Iniciar Revisión',
      text: `Esta a punto de iniciar la revisión para este Plan`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'ER_SP');
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: any) => {
          if (data) {
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
  }

  enviarRevision() {
    Swal.fire({
      title: 'Terminar Revisión',
      text: `¿Desea enviar la revisión?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'R_SP');
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: any) => {
          if (data) {
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
        Swal.fire({
          title: 'Creando Nueva Versión del Plan',
          timerProgressBar: true,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        })
        this.request.post(environment.PLANES_MID, `inversion/versionar_plan/` + this.plan._id, this.plan).subscribe((data: any) => {
          if (data) {
            Swal.close();
            this.getVersiones(data.Data);
            Swal.fire({
              title: 'Nueva Versión',
              text: 'Nueva versión del plan creada, ya puede realizar los ajustes al plan.',
              icon: 'success',
              showConfirmButton: false,
              timer: 2500
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

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Revisión Cancelado',
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
  }

  preAval() {
    Swal.fire({
      title: 'Pre Aval',
      text: `¿Desea darle pre aval a este plan?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'PA_SP');
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: any) => {
          if (data) {
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
        Swal.fire({
          title: 'Revision Enviada (SIN CAMBIOS)',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Pre Aval Cancelado',
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
  }


  avalar() {
    Swal.fire({
      title: 'Pre Aval',
      text: `¿Desea darle Aval a este plan?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'A_SP');
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Plan Avalado',
              icon: 'success',
            }).then(async (result) => {
              if (result.value) {
                this.busquedaPlanes(data.Data);
                this.loadData();
                this.addActividad = false;
                let aux = {}
                this.request.post(environment.PLANES_MID, `seguimiento/crear_reportes/${this.plan._id}/${await this.codigosService.getId('PLANES_CRUD', 'tipo-seguimiento', 'S_SP')}
`, this.plan).subscribe((data: any) => {
                  if (!data) {
                    Swal.fire({
                      title: 'Error en la operación',
                      icon: 'error',
                      text: `Error creando reportes de seguimiento`,
                      showConfirmButton: false,
                      timer: 2500
                    })
                  }
                })
              }
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Aval Cancelado',
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
  }

  devolverAFormulacion() {
    Swal.fire({
      title: 'Volver a Formular',
      text: `¿Desea regresar el plan a Formulación?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then(async (result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'R_SP');
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data: any) => {
          if (data) {
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
  }

  // loadActividades() {
  //   this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:${await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'API_SP')},formato:true`).subscribe((data: any) => {
  //     if (data) {
  //       if (data.Data.length != 0) {
  //         this.actividadesProg = data.Data;
  //         this.tipoActividadName = this.actividadesProg[0].nombre;
  //         console.log(this.tipoActividadName, this.actividadesProg, "actividades")
  //         //console.log(this.actividades, "actividades");
  //       }
  //     }
  //   }, (error) => {
  //     Swal.fire({
  //       title: 'Error en la operación',
  //       text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
  //       icon: 'warning',
  //       showConfirmButton: false,
  //       timer: 2500
  //     })
  //   })
  // }
  actualizarMeta() {
    Swal.fire({
      title: 'Actualizando Meta',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    if (this.metaSelected == true) {
      console.log("entra if metaSelcted")
      var formValue = this.form.value;
      var actividad = {
        idSubDetalle: this.idSubDetMetasProI,
        indexMetaSubPro: this.indexMeta,
        entrada: formValue
      }
      this.request.put(environment.PLANES_MID, `inversion/actualizar_meta`, actividad, this.planId + `/` + this.rowIndex).subscribe((data: any) => {
        if (data) {
          Swal.close();
          Swal.fire({
            title: 'Información de actividad actualizada',
            //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
            text: 'La actividad se ha actualizado satisfactoriamente',
            icon: 'success'
          }).then((result) => {
            if (result.value) {
              this.actividades = false;
              //this.form.reset();
              //this.addActividad = false;
              //this.loadData();
              //this.idPadre = undefined;
              //this.tipoPlanId = undefined;
              //this.idPlanIndicativo = undefined;
              //this.tipoPlanIndicativo = undefined;
            }
          })
        }
      }), (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No fue posible actualizar la actividad, por favor contactarse con el administrador del sistema`,
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })

        //this.addActividad = false;
        //this.dataArmonizacionPED = [];
        //this.dataArmonizacionPI = [];
      }
    } //else {
    //   Swal.fire({
    //     title: 'Error en la operación',
    //     text: `Debe seleccionar una Meta del Proyecto de Inversión Vigente asociado`,
    //     icon: 'error',
    //     showConfirmButton: false,
    //     timer: 2500
    //   })
    // }

  }

  submit() {
    if (!this.banderaEdit) { // ADD NUEVA ACTIVIDAD
      if (this.dataArmonizacionPED.length != 0 && this.dataArmonizacionPI.length != 0 && this.dataArmonizacionPDD.length != 0) {

        if (this.metaSelected == true) {
          var formValue = this.form.value;
          var actividad = {
            idProI: this.idProyectoInversion,
            idSubDetalle: this.idSubDetMetasProI,
            indexMetaSubPro: this.indexMeta,
            entrada: formValue
          }
          Swal.fire({
            title: 'Cargando información',
            timerProgressBar: true,
            showConfirmButton: false,
            willOpen: () => {
              Swal.showLoading();
            },
          })
          this.request.put(environment.PLANES_MID, `inversion/guardar_meta`, actividad, this.plan._id).subscribe((data: any) => {
            if (data) {
              Swal.close();
              this.actividades = false;
              Swal.fire({
                title: 'Actividad agregada',
                //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
                text: 'La actividad se ha registrado satisfactoriamente',
                icon: 'success'
              }).then((result) => {
                if (result.value) {
                  this.ajustarData()
                  this.form.reset();
                  this.actividades = false;
                  this.addActividad = false;
                  //this.dataArmonizacionPED = [];
                  //this.dataArmonizacionPI = [];
                  //this.idPadre = undefined;
                  //this.tipoPlanId = undefined;
                  //this.tipoPlanIndicativo = undefined;
                  //this.idPlanIndicativo = undefined;
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

            //this.addActividad = false;
            //this.dataArmonizacionPED = [];
            //this.dataArmonizacionPI = [];
          })
        } else {
          Swal.fire({
            title: 'Error en la operación',
            text: `Debe seleccionar una Meta del Proyecto de Inversión Vigente asociado`,
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          })
        }

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
      if (this.dataArmonizacionPED.length != 0 && this.dataArmonizacionPI.length != 0 && this.dataArmonizacionPDD.length != 0) {
        var formValue = this.form.value;
        var actividad = {
          idProI: this.idProyectoInversion,
          idSubDetalle: this.idSubDetMetasProI,
          indexMetaSubPro: this.indexMeta,
          entrada: formValue
        }
        this.request.put(environment.PLANES_MID, `inversion/actualizar_actividad`, actividad, this.plan._id + `/` + this.rowActividad).subscribe((data: any) => {
          if (data) {
            this.actividades = false;
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
                //this.idPadre = undefined;
                //this.tipoPlanId = undefined;
                //this.idPlanIndicativo = undefined;
                //this.tipoPlanIndicativo = undefined;
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
          //this.dataArmonizacionPED = [];
          //this.dataArmonizacionPI = [];
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

}




