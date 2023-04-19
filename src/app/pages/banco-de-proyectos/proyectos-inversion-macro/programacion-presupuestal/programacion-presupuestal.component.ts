import { CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

export interface Fuentes {
  _id: string;
  posicion: string;
  nombre: string;
  presupuesto: number;
  presupuestoDisponible: number;
  presupuestoProyecto: number;
  iconSelected: string;
}

// const INFO: Fuentes[] = [
//    {index: 1, fuente: 'Fuente 1', valor: '$ Valor que se extrae del valor de la apropiación', disponible: 'valor apropiación global- Valor estimado', estimado: 0},
//    {index: 2, fuente: 'Fuente 2', valor: '$ Valor que se extrae del valor de la apropiación', disponible: 'valor apropiación global- Valor estimado', estimado: 0},
// ]

@Component({
  selector: 'app-programacion-presupuestal',
  templateUrl: './programacion-presupuestal.component.html',
  styleUrls: ['./programacion-presupuestal.component.scss']
})
export class ProgramacionPresupuestalComponent implements OnInit {
  displayedColumns: string[] = ['index', 'nombre', 'presupuestoGlobal', 'disponible', 'presupuesto'];
  dataSource = new MatTableDataSource<Fuentes>();
  dataFuentes = [];
  fuentesAct = []; 
  //fuentesProyect = [];
  idDetalleFuentesPro: string; 
  //ponderacionH = [];
  totalPresupuestoTemp: number = 0;
  totalPresupuestoActividad: number = 0;
  fuente: any;
  totalPresupuesto: any;
  idProyectoInversion: string;
  actividadId: string;
  rowIndex: string;
  indexMetaSubPro: string;
  fuentes: any;
  fuentesPro: any;
  //toppings = new FormControl('');
  valor: number;
  observacionUnidad: string;
  observacionOPAC: string;
  magnitud1: any = 0;
  magnitud2: any = 0;
  magnitud3: any = 0;
  magnitud4: any = 0;
  magnitud5: any = 0;
  magnitud6: any = 0;
  magnitud7: any = 0;
  magnitud8: any = 0;
  magnitud9: any = 0;
  magnitud10: any = 0;
  magnitud11: any = 0;
  magnitud12: any = 0;
  magnitudT: any = 0;

  presupuesto1: any = 0;
  presupuesto2: any = 0;
  presupuesto3: any = 0;
  presupuesto4: any = 0;
  presupuesto5: any = 0;
  presupuesto6: any = 0;
  presupuesto7: any = 0;
  presupuesto8: any = 0;
  presupuesto9: any = 0;
  presupuesto10: any = 0;
  presupuesto11: any = 0;
  presupuesto12: any = 0;
  presupuestoT: any = 0;
  selectedFuentes: any[] = [];
  steps: any[];
  json: any;
  namePlan: string;
  dependencia: string;
  vigencia: string;
  formulacionState: boolean;
  plan: any;
  versiones: any[];
  planAsignado: boolean;
  clonar: boolean;
  banderaUltimaVersion: boolean;
  rol: string;
  versionPlan: string;
  estadoPlan: string;
  readonlyObs: boolean;
  hiddenObs: boolean;
  readOnlyAll: boolean;
  addActividad: boolean;
  banderaEdit: boolean;
  planId: string;
  selectFuente = new FormControl();
  formProyect: FormGroup;
  formEditar: FormGroup;
  //toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  constructor(
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
    private currencyPipe: CurrencyPipe,
    private percentagePipe: PercentPipe,
    private router: Router,
    private formBuilder: FormBuilder,
    private autenticationService: ImplicitAutenticationService,
  ) { 
    activatedRoute.params.subscribe(prm => {
      this.idProyectoInversion = prm['idProyectoInversion'];
      this.actividadId = prm['idActividad'];
      this.planId = prm['idPlan'];
      this.rowIndex = prm['indexActividad'];
    });

    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'      
    } else if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
      //this.verificarFechas();
    }
    this.loadPlan();
    this.getDataProyect();
    this.editar();    
  }

  ngOnInit(): void {    
    
    valor: [this.valor, Validators.required]

    this.formEditar = this.formBuilder.group({
      magnitud1: [this.magnitud1, Validators.required],
      magnitud2: [this.magnitud2, Validators.required],
      magnitud3: [this.magnitud3, Validators.required],
      magnitud4: [this.magnitud4, Validators.required],
      magnitud5: [this.magnitud5, Validators.required],
      magnitud6: [this.magnitud6, Validators.required],
      magnitud7: [this.magnitud7, Validators.required],
      magnitud8: [this.magnitud8, Validators.required],
      magnitud9: [this.magnitud9, Validators.required],
      magnitud10: [this.magnitud10, Validators.required],
      magnitud11: [this.magnitud11, Validators.required],
      magnitud12: [this.magnitud12, Validators.required],
      presupuesto1: [this.presupuesto1, Validators.required],
      presupuesto2: [this.presupuesto2, Validators.required],
      presupuesto3: [this.presupuesto3, Validators.required],
      presupuesto4: [this.presupuesto4, Validators.required],
      presupuesto5: [this.presupuesto5, Validators.required],
      presupuesto6: [this.presupuesto6, Validators.required],
      presupuesto7: [this.presupuesto7, Validators.required],
      presupuesto8: [this.presupuesto8, Validators.required],
      presupuesto9: [this.presupuesto9, Validators.required],
      presupuesto10: [this.presupuesto10, Validators.required],
      presupuesto11: [this.presupuesto11, Validators.required],
      presupuesto12: [this.presupuesto12, Validators.required],
      observacionUnidad: [this.observacionUnidad,],
      observacionOPAC: [this.observacionOPAC,],
    });

    this.formEditar.setValue({
      magnitud1: this.percentagePipe.transform(this.formEditar.get('magnitud1').value, '1.2-2'),
      magnitud2: this.percentagePipe.transform(this.formEditar.get('magnitud2').value, '1.2-2'),
      magnitud3: this.percentagePipe.transform(this.formEditar.get('magnitud3').value, '1.2-2'),
      magnitud4: this.percentagePipe.transform(this.formEditar.get('magnitud4').value, '1.2-2'),
      magnitud5: this.percentagePipe.transform(this.formEditar.get('magnitud5').value, '1.2-2'),
      magnitud6: this.percentagePipe.transform(this.formEditar.get('magnitud6').value, '1.2-2'),
      magnitud7: this.percentagePipe.transform(this.formEditar.get('magnitud7').value, '1.2-2'),
      magnitud8: this.percentagePipe.transform(this.formEditar.get('magnitud8').value, '1.2-2'),
      magnitud9: this.percentagePipe.transform(this.formEditar.get('magnitud9').value, '1.2-2'),
      magnitud10: this.percentagePipe.transform(this.formEditar.get('magnitud10').value, '1.2-2'),
      magnitud11: this.percentagePipe.transform(this.formEditar.get('magnitud11').value, '1.2-2'),
      magnitud12: this.percentagePipe.transform(this.formEditar.get('magnitud12').value, '1.2-2'),
      presupuesto1: this.currencyPipe.transform(this.formEditar.get('presupuesto1').value),
      presupuesto2: this.currencyPipe.transform(this.formEditar.get('presupuesto2').value),
      presupuesto3: this.currencyPipe.transform(this.formEditar.get('presupuesto3').value),
      presupuesto4: this.currencyPipe.transform(this.formEditar.get('presupuesto4').value),
      presupuesto5: this.currencyPipe.transform(this.formEditar.get('presupuesto5').value),
      presupuesto6: this.currencyPipe.transform(this.formEditar.get('presupuesto6').value),
      presupuesto7: this.currencyPipe.transform(this.formEditar.get('presupuesto7').value),
      presupuesto8: this.currencyPipe.transform(this.formEditar.get('presupuesto8').value),
      presupuesto9: this.currencyPipe.transform(this.formEditar.get('presupuesto9').value),
      presupuesto10: this.currencyPipe.transform(this.formEditar.get('presupuesto10').value),
      presupuesto11: this.currencyPipe.transform(this.formEditar.get('presupuesto11').value),
      presupuesto12: this.currencyPipe.transform(this.formEditar.get('presupuesto12').value),
      observacionUnidad: this.formEditar.get('observacionUnidad').value,
      observacionOPAC: this.formEditar.get('observacionOPAC').value,
    })

  }

  loadPlan() {
    this.request.get(environment.PLANES_CRUD, `plan/` + this.planId).subscribe((data: any) => {
      if (data) {
        this.plan = data.Data;
        this.namePlan = data.Data.nombre;
        this.dependencia = data.Data.dependencia_id;
        this.vigencia = data.Data.vigencia;
        this.busquedaPlanes();
      }
    })
  }

  busquedaPlanes() {    
    console.log(this.namePlan, "nombre plan");    
    this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:` + this.dependencia + `,vigencia:` +
      this.vigencia + `,formato:false,nombre:` + this.namePlan).subscribe((data: any) => {
        if (data.Data.length > 0) {
          let i = data.Data.length - 1;
          console.log(data.Data, "info del plan");
          this.planId = data.Data[i]["_id"]; 
          this.getEstado();         
          //this.getVersiones();
          this.formulacionState = true;
        } else if (data.Data.length == 0) {
          Swal.fire({
            title: 'Información inconclusa',
            html: 'Falta inoformación del Plan y Meta a consultar',
            // text: `No existe plan ${planB.nombre} para la dependencia ${this.unidad.Nombre} y la vigencia ${this.vigencia.Nombre}.
            // Deberá formular un nuevo plan`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 7000
          })
          
          this.plan = data.Data;
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

  getVersiones() {
    let aux = this.namePlan.replace(/ /g, "%20");
    this.request.get(environment.PLANES_MID, `formulacion/get_plan_versiones/` + this.dependencia + `/` + this.vigencia +
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
          //this.loadData();
          //this.controlVersion = new FormControl(this.plan);
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
        console.log("estadoPlan", this.estadoPlan);
        // this.getIconEstado();
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
  
  guardar() {
    console.log("funciones por hacer");
  }

  onChangeF(fuentes) {
    this.dataSource = new MatTableDataSource<Fuentes>(fuentes);
    console.log(fuentes);
  }

  getTotalPresupuesto() {
    return this.dataSource.data.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);
  }

  getTotalPresupuestoDisponible() {
    return this.dataSource.data.map(t => t.presupuestoDisponible).reduce((acc, value) => acc + value, 0);
  }

  getTotalPresupuestoProyecto() {
    return this.totalPresupuestoActividad = this.dataSource.data.map(t => t.presupuestoProyecto).reduce((acc, value) => acc + value, 0);
  }

  blurPresupuesto(element, rowIndex) {
    if (element.target.value != "") {
      let presupuesto = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
      if (presupuesto > this.dataSource.data[rowIndex]["presupuesto"]) {
        Swal.fire('El valor no puede superar el presupuesto disponible', '', 'info');
        this.dataSource.data[rowIndex]["presupuestoProyecto"] = 0;
        element.target.value = this.currencyPipe.transform(this.dataSource.data[rowIndex]["presupuestoProyecto"]);
        this.dataSource.data[rowIndex]["presupuestoDisponible"] = this.dataSource.data[rowIndex]["presupuesto"] - this.dataSource.data[rowIndex]["presupuestoProyecto"];
      } else {
        this.dataSource.data[rowIndex]["presupuestoProyecto"] = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        this.dataSource.data[rowIndex]["presupuestoDisponible"] = this.dataSource.data[rowIndex]["presupuesto"] - this.dataSource.data[rowIndex]["presupuestoProyecto"];
      }
    } else {
      this.dataSource.data[rowIndex]["presupuestoProyecto"] = this.totalPresupuestoTemp;
      element.target.value = this.currencyPipe.transform(this.dataSource.data[rowIndex]["presupuestoProyecto"]);
      this.dataSource.data[rowIndex]["presupuestoDisponible"] = this.dataSource.data[rowIndex]["presupuesto"] - this.dataSource.data[rowIndex]["presupuestoProyecto"];
    }
    this.getTotalPresupuesto();
    this.getTotalPresupuestoDisponible();
    console.log(this.dataSource.data, "dataSource");
  }

  focusPresupuesto(element, rowIndex) {
    this.totalPresupuestoTemp = this.dataSource.data[rowIndex]["presupuestoProyecto"].toString() == "" ? 0 : this.dataSource.data[rowIndex]["presupuestoProyecto"];
    this.dataSource.data[rowIndex]["presupuestoDisponible"] += this.totalPresupuestoTemp;
    element.target.value = "";
  }

  getDataProyect() {
    Swal.fire({
      title: 'Cargando Proyectos',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, 'inversion/proyecto/' + this.idProyectoInversion).subscribe((data: any) => {
      if (data) {
        // this.formProyect.setValue({
        //   name: data["Data"]["nombre_proyecto"],
        //   codigo: data["Data"]["codigo_proyecto"],
        // });
        this.idDetalleFuentesPro = data.Data.id_detalle_fuentes;
        console.log(this.idDetalleFuentesPro, "detalleFuentes");
        this.fuentesPro = data.Data.fuentes;
        console.log(this.fuentesPro, "fuentes");
        for(let i = 0; i < this.fuentesPro.length; i++) {
          console.log(this.fuentesPro[i].presupuestoDisponiblePlanes, "ensayo");
          if(this.fuentesPro[i].presupuestoDisponiblePlanes == undefined) {
            let fuente = {
              _id: this.fuentesPro[i]._id,
              nombre: this.fuentesPro[i].nombre,
              presupuesto: this.fuentesPro[i].presupuestoProyecto,
              presupuestoDisponible: this.fuentesPro[i].presupuestoProyecto,
              presupuestoProyecto: 0
            }
            this.dataFuentes.push(fuente);
          } else {
            let fuente = {
              _id: this.fuentesPro[i]._id,
              nombre: this.fuentesPro[i].nombre,
              presupuesto: this.fuentesPro[i].presupuestoDisponiblePlanes,
              presupuestoDisponible: this.fuentesPro[i].presupuestoDisponiblePlanes,
              presupuestoProyecto: 0
            }
            this.dataFuentes.push(fuente);
          }
          
        }
        //this.dataFuentes = data.Data.fuentes;
        
        
      }
      Swal.close();
    })
  }  

  blurPresupuestoT(element, index) {
    switch (index) {
      case 1:
        if (element.target.value == "") {
          this.presupuesto1 = 0;
        } else {
          this.presupuesto1 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto1);
        break;
      case 2:
        if (element.target.value == "") {
          this.presupuesto2 = 0;
        } else {
          this.presupuesto2 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto2);
        break;
      case 3:
        if (element.target.value == "") {
          this.presupuesto3 = 0;
        } else {
          this.presupuesto3 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto3);
        break;
      case 4:
        if (element.target.value == "") {
          this.presupuesto4 = 0;
        } else {
          this.presupuesto4 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto4);
        break;
      case 5:
        if (element.target.value == "") {
          this.presupuesto5 = 0;
        } else {
          this.presupuesto5 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto5);
        break;
      case 6:
        if (element.target.value == "") {
            this.presupuesto6 = 0;
          } else {
            this.presupuesto6 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
          }
          element.target.value = this.currencyPipe.transform(this.presupuesto6);
        break;
      case 7:
        if (element.target.value == "") {
          this.presupuesto7 = 0;
        } else {
          this.presupuesto7 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto7);
        break;
      case 8:
        if (element.target.value == "") {
          this.presupuesto8 = 0;
        } else {
          this.presupuesto8 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto8);
        break;
      case 9:
        if (element.target.value == "") {
          this.presupuesto9 = 0;
        } else {
          this.presupuesto9 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto9);
        break;
      case 10:
        if (element.target.value == "") {
          this.presupuesto10 = 0;
        } else {
          this.presupuesto10 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto10);
        break;
      case 11:
        if (element.target.value == "") {
          this.presupuesto11 = 0;
        } else {
          this.presupuesto11 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto11);
        break;
      case 12:
        if (element.target.value == "") {
          this.presupuesto12 = 0;
        } else {
          this.presupuesto12 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto12);
        break;
    }
    this.presupuestoT = this.presupuesto1 + this.presupuesto2 + this.presupuesto3 + this.presupuesto4 + this.presupuesto5 + this.presupuesto6 + this.presupuesto7 + this.presupuesto8 + this.presupuesto9 + this.presupuesto10 + this.presupuesto11 + this.presupuesto12;
  }

  focusPresupuestoT(element) {
    element.target.value = element.target.value.replaceAll("$", "").replaceAll(",", "").replace(".00", "");
  }

  blurMagnitud(element, index) {
    switch (index) {
      case 1:
        this.magnitudT -= this.magnitud1;
        if (element.target.value == "") {
          this.magnitud1 = 0;
        } else {
          this.magnitud1 = parseFloat(element.target.value) / 100;
          if (this.magnitudT + this.magnitud1 != 1) {
            Swal.fire({
              title: 'La magnitud total debe ser igual a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.magnitud1 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.magnitud1, '1.2-2');
        break;
      case 2:
        this.magnitudT -= this.magnitud2;
        if (element.target.value == "") {
          this.magnitud2 = 0;
        } else {
          this.magnitud2 = parseFloat(element.target.value) / 100;
          if (this.magnitudT + this.magnitud2 != 1) {
            Swal.fire({
              title: 'La magnitud total debe ser igual a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.magnitud2 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.magnitud2, '1.2-2');
        break;
      case 3:
        this.magnitudT -= this.magnitud3;
        if (element.target.value == "") {
          this.magnitud3 = 0;
        } else {
          this.magnitud3 = parseFloat(element.target.value) / 100;
          if (this.magnitudT + this.magnitud3 != 1) {
            Swal.fire({
              title: 'La magnitud total debe ser igual a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.magnitud3 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.magnitud3, '1.2-2');
        break;
      case 4:
        this.magnitudT -= this.magnitud4;
        if (element.target.value == "") {
          this.magnitud4 = 0;
        } else {
          this.magnitud4 = parseFloat(element.target.value) / 100;
          if (this.magnitudT + this.magnitud4 != 1) {
            Swal.fire({
              title: 'La magnitud total debe ser igual a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.magnitud4 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.magnitud4, '1.2-2');
        break;
      case 5:
        this.magnitudT -= this.magnitud5;
        if (element.target.value == "") {
          this.magnitud5 = 0;
        } else {
          this.magnitud5 = parseFloat(element.target.value) / 100;
          if (this.magnitudT + this.magnitud5 != 1) {
            Swal.fire({
              title: 'La magnitud total debe ser igual a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.magnitud5 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.magnitud5, '1.2-2');
        break;
      case 6:
          this.magnitudT -= this.magnitud6;
          if (element.target.value == "") {
            this.magnitud6 = 0;
          } else {
            this.magnitud6 = parseFloat(element.target.value) / 100;
            if (this.magnitudT + this.magnitud6 != 1) {
              Swal.fire({
                title: 'La magnitud total debe ser igual a 100%',
                text: "",
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              });
              //this.magnitud6 = 0;
            }
          }
          element.target.value = this.percentagePipe.transform(this.magnitud6, '1.2-2');
          break;
      case 7:
          this.magnitudT -= this.magnitud7;
          if (element.target.value == "") {
            this.magnitud7 = 0;
          } else {
            this.magnitud7 = parseFloat(element.target.value) / 100;
            if (this.magnitudT + this.magnitud7 != 1) {
              Swal.fire({
                  title: 'La magnitud total debe ser igual a 100%',
                  text: "",
                  icon: 'warning',
                  showConfirmButton: false,
                  timer: 2500
                });
                //this.magnitud7 = 0;
              }
            }
            element.target.value = this.percentagePipe.transform(this.magnitud7, '1.2-2');
            break;
      case 8:
        this.magnitudT -= this.magnitud8;
          if (element.target.value == "") {
                this.magnitud8 = 0;
              } else {
                this.magnitud8 = parseFloat(element.target.value) / 100;
                if (this.magnitudT + this.magnitud8 != 1) {
                  Swal.fire({
                    title: 'La magnitud total debe ser igual a 100%',
                    text: "",
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 2500
                  });
                  //this.magnitud8 = 0;
                }
              }
              element.target.value = this.percentagePipe.transform(this.magnitud8, '1.2-2');
      break;
      case 9:
        this.magnitudT -= this.magnitud9;
        if (element.target.value == "") {
          this.magnitud9 = 0;
        } else {
          this.magnitud9 = parseFloat(element.target.value) / 100;
          if (this.magnitudT + this.magnitud9 != 1) {
            Swal.fire({
              title: 'La magnitud total debe ser igual a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.magnitud9 = 0;
          }
        }
      element.target.value = this.percentagePipe.transform(this.magnitud9, '1.2-2');
      break;
      case 10:
        this.magnitudT -= this.magnitud10;
        if (element.target.value == "") {
          this.magnitud10 = 0;
        } else {
          this.magnitud10 = parseFloat(element.target.value) / 100;
          if (this.magnitudT + this.magnitud10 != 1) {
            Swal.fire({
              title: 'La magnitud total debe ser igual a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.magnitud10 = 0;
          }
        }
      element.target.value = this.percentagePipe.transform(this.magnitud10, '1.2-2');
      break;
      case 11:
        this.magnitudT -= this.magnitud11;
        if (element.target.value == "") {
          this.magnitud11 = 0;
        } else {
          this.magnitud11 = parseFloat(element.target.value) / 100;
          if (this.magnitudT + this.magnitud11 < 1 || this.magnitudT + this.magnitud11 > 1) {
            Swal.fire({
              title: 'La magnitud total debe ser igual a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.magnitud11 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.magnitud11, '1.2-2');
      break;
      case 12:
        this.magnitudT -= this.magnitud12;
        if (element.target.value == "") {
          this.magnitud12 = 0;
        } else {
          this.magnitud12 = parseFloat(element.target.value) / 100;
          if (this.magnitudT + this.magnitud12 != 1) {
            Swal.fire({
              title: 'La magnitud total debe ser igual a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.magnitud12 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.magnitud12, '1.2-2');
        break;
    }
    this.magnitudT = this.magnitud1 + this.magnitud2 + this.magnitud3 + this.magnitud4 + this.magnitud5 + this.magnitud6 + this.magnitud7 + this.magnitud8 + this.magnitud9 + this.magnitud10 + this.magnitud11 +this.magnitud12;
  }

  focusMagnitud(element) {
    element.target.value = element.target.value.replaceAll("%", "");
  }

  obsBlurEvent(element, index) {
    switch (index) {
      case 1:
        if (element.target.value == "") {
          this.observacionUnidad = "";
        } else {
          this.observacionUnidad = element.target.value;
        }
        element.target.value = this.observacionUnidad;
        break;
      case 2:
        if (element.target.value == "") {
          this.observacionOPAC = "";
        } else {
          this.observacionOPAC = element.target.value;
        }
        element.target.value = this.observacionOPAC;
        break;
    }
  }

  progPresActividad() {
    //this.fuentesProyect = [];
    Swal.fire({
      title: 'Cargando formato',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    var fuentes = [];
    this.dataSource.data.forEach(fuente => {
      if (typeof fuente.presupuestoProyecto == "number") {
        fuentes.push({
          id: fuente._id,
          presupuestoProyecto: fuente.presupuestoProyecto,
          posicion: fuente.posicion,
          presupuestoDisponible: fuente.presupuestoDisponible          
        });
        console.log(fuente.presupuestoDisponible, "presupuestoDisponible");
        //for(let i = 0; i < this.fuentesPro.length; i++) {
          // if(this.fuentesPro[i]._id === fuente._id) {
          //   console.log(i, "entra al primer if");
          //   this.fuentesProyect.push({
          //     _id: this.fuentesPro[i]._id,
          //     activo: this.fuentesPro[i].activo,
          //     codigo_abreviacion: "",
          //     descripcion: this.fuentesPro[i].descripcion, 
          //     fecha_creacion: this.fuentesPro[i].fecha_creacion,
          //     nombre: this.fuentesPro[i].nombre,
          //     posicion: this.fuentesPro[i].posicion,
          //     presupuesto: this.fuentesPro[i].presupuesto,
          //     presupuestoDisponible: this.fuentesPro[i].presupuestoDisponible,
          //     presupuestoProyecto: this.fuentesPro[i].presupuestoProyecto,
          //     presupuestoDisponiblePlanes: fuente.presupuestoDisponible
          //   })
          // } //else if(this.fuentesPro[i]._id !== fuente._id){
          //   console.log(i, "entra al segundo if");
          //   this.fuentesProyect.push(this.fuentesPro[i]);
          // }
        //}
      }      
    });   


    // for(let i = 0; i < this.fuentesPro.length; i++) {
    //   for(let y = 0; y< fuentes.length; y++) {
    //     if(this.fuentesPro[i] == fuentes[y]) {
    //       console.log("operación fuentes");
    //       fuentesProyect.push({
    //         _id: this.fuentesPro[i]._id,
    //         activo: this.fuentesPro[i].activo,
    //         codigo_abreviacion: "",
    //         descripcion: this.fuentesPro[i].descripcion, 
    //         fecha_creacion: this.fuentesPro[i].fecha_creacion,
    //         nombre: this.fuentesPro[i].nombre,
    //         posicion: this.fuentesPro[i].posicion,
    //         presupuesto: this.fuentesPro[i].presupuesto,
    //         presupuestoDisponible: this.fuentesPro[i].presupuestoDisponible,
    //         presupuestoProyecto: this.fuentesPro[i].presupuestoProyecto,
    //         presupuestoDisponiblePlanes: fuentes[y].presupuestoDisponible,
    //       })
    //     } else {
    //       fuentesProyect.push(this.fuentesPro[i]);
    //     }
    //   }
    // }
    
    console.log(fuentes, "obj put");
    const progMagnitudes = {          
      //valor_fuentes: this.totalFuentes,     
      //nombre_meta: this.metaSelected,
      magnitud1: this.magnitud1 * 100, 
      magnitud2: this.magnitud2 * 100, 
      magnitud3: this.magnitud3 * 100, 
      magnitud4: this.magnitud4 * 100, 
      magnitud5: this.magnitud5 * 100,
      magnitud6: this.magnitud6 * 100,
      magnitud7: this.magnitud7 * 100,
      magnitud8: this.magnitud8 * 100,
      magnitud9: this.magnitud9 * 100,
      magnitud10: this.magnitud10 * 100,
      magnitud11: this.magnitud11 * 100,
      magnitud12: this.magnitud12 * 100,
      magnitudT: this.magnitudT * 100, 
      presupuesto1: this.presupuesto1, 
      presupuesto2: this.presupuesto2, 
      presupuesto3: this.presupuesto3, 
      presupuesto4: this.presupuesto4, 
      presupuesto5: this.presupuesto5, 
      presupuesto6: this.presupuesto6,
      presupuesto7: this.presupuesto7,
      presupuesto8: this.presupuesto8,
      presupuesto9: this.presupuesto9,
      presupuesto10: this.presupuesto10,
      presupuesto11: this.presupuesto11,
      presupuesto12: this.presupuesto12,
      presupuestoT: this.presupuestoT,      
      observacionUnidad: this.observacionUnidad, 
      observacionOPAC: this.observacionOPAC     
    }

    var actividad = {
      fuentesActividad: fuentes,
      presupuesto_programado: this.totalPresupuestoActividad,
      ponderacionH: progMagnitudes,
      indexMetaSubProI: this.indexMetaSubPro,
      idDetalleFuentesPro: this.idDetalleFuentesPro,
      fuentesPro: this.fuentesPro,
      entrada: this.json,
    }
    console.log(actividad, "actividad");
    this.request.put(environment.PLANES_MID, `inversion/actualizar_actividad`, actividad, this.actividadId + `/` + this.rowIndex).subscribe((data: any) => {
      if (data) {
        Swal.close();
        console.log(data)
        Swal.fire({
          title: 'Programación de Presupuestos  de Actividades Agregada',
          //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
          text: 'La programación de presupuestos  de actividades se ha registrado satisfactoriamente',
          icon: 'success'
        }).then((result) => {
          if (result.value) {  
            
          }
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: 'No fue posible crear la programacion de magnitudes y presupuesto',
        icon: 'error',
        showConfirmButton: false,
        timer: 2500
      })      
    })
  }

  editar() {    
    //this.plantillaActual = true;    
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
      this.request.get(environment.PLANES_MID, `formulacion/get_plan/` + this.actividadId + `/` + this.rowIndex).subscribe((data: any) => {
        if (data) {
          Swal.close();
          //this.onChangePD(this.planesDesarrollo[0]);
          //this.onChangePI(this.planesIndicativos[0]);
          //this.estado = this.plan.estado_plan_id;
          this.steps = data.Data[0]
          this.json = data.Data[1][0]
          //this.form = this.formBuilder.group(this.json);
          console.log(this.json, "data dinámica");
          let dataFuentes = data.Data[2][0];
          this.fuentesAct = dataFuentes.fuentesActividad;
          this.indexMetaSubPro = dataFuentes.indexMetaSubPro;
          var ponderacionH = dataFuentes.ponderacionH;  

          var fuentesTabla = []
        console.log(this.fuentesAct, "fuentes");
        for (let i = 0; i < this.fuentesAct.length; i++) {
          const fuenteGEt = this.fuentesAct[i];
          for (let index = 0; index < this.dataFuentes.length; index++) {
            if (this.dataFuentes[index]["_id"] == fuenteGEt["id"]) {
              this.selectedFuentes.push(this.dataFuentes[index]);
              fuentesTabla.push(this.dataFuentes[index]);
              fuentesTabla[fuentesTabla.length - 1]["presupuestoProyecto"] = fuenteGEt["presupuestoProyecto"];
              //fuentesTabla[fuentesTabla.length - 1]["presupuestoDisponible"] = fuenteGEt["presupuestoDisponible"];
              break
            }
          }
        }
        // for (let i = 0; i < fuentesPro.length; i++) {

        // }
        this.selectFuente = new FormControl(this.selectedFuentes);
        this.dataSource = new MatTableDataSource<Fuentes>(fuentesTabla);
        //this.blurMagnitud(element, index);
        //this.idFuentes = data["Data"]["id_detalle_fuentes"];

          this.magnitud1 = ponderacionH["magnitud1"] / 100; 
          this.magnitud2 = ponderacionH["magnitud2"] / 100; 
          this.magnitud3 = ponderacionH["magnitud3"] / 100; 
          this.magnitud4 = ponderacionH["magnitud4"] / 100;
          this.magnitud5 = ponderacionH["magnitud5"] / 100;
          this.magnitud6 = ponderacionH["magnitud6"] / 100;
          this.magnitud7 = ponderacionH["magnitud7"] / 100;
          this.magnitud8 = ponderacionH["magnitud8"] / 100;
          this.magnitud9 = ponderacionH["magnitud9"] / 100;
          this.magnitud10 = ponderacionH["magnitud10"] / 100;
          this.magnitud11 = ponderacionH["magnitud11"] / 100; 
          this.magnitud12 = ponderacionH["magnitud12"] / 100;  
          this.presupuesto1 = ponderacionH["presupuesto1"]; 
          this.presupuesto2 = ponderacionH["presupuesto2"];
          this.presupuesto3 = ponderacionH["presupuesto3"];
          this.presupuesto4 = ponderacionH["presupuesto4"];
          this.presupuesto5 = ponderacionH["presupuesto5"];
          this.presupuesto6 = ponderacionH["presupuesto6"];
          this.presupuesto7 = ponderacionH["presupuesto7"];
          this.presupuesto8 = ponderacionH["presupuesto8"];
          this.presupuesto9 = ponderacionH["presupuesto9"];
          this.presupuesto10 = ponderacionH["presupuesto10"];
          this.presupuesto11 = ponderacionH["presupuesto11"];
          this.presupuesto12 = ponderacionH["presupuesto12"];
          this.observacionUnidad = ponderacionH["observacionUnidad"];
          this.observacionOPAC = ponderacionH["observacionOPAC"];

          this.formEditar.setValue({
            magnitud1: this.percentagePipe.transform(this.formEditar.get('magnitud1').value, '1.2-2'),
            magnitud2: this.percentagePipe.transform(this.formEditar.get('magnitud2').value, '1.2-2'),
            magnitud3: this.percentagePipe.transform(this.formEditar.get('magnitud3').value, '1.2-2'),
            magnitud4: this.percentagePipe.transform(this.formEditar.get('magnitud4').value, '1.2-2'),
            magnitud5: this.percentagePipe.transform(this.formEditar.get('magnitud5').value, '1.2-2'),
            magnitud6: this.percentagePipe.transform(this.formEditar.get('magnitud6').value, '1.2-2'),
            magnitud7: this.percentagePipe.transform(this.formEditar.get('magnitud8').value, '1.2-2'),
            magnitud8: this.percentagePipe.transform(this.formEditar.get('magnitud8').value, '1.2-2'),
            magnitud9: this.percentagePipe.transform(this.formEditar.get('magnitud9').value, '1.2-2'),
            magnitud10: this.percentagePipe.transform(this.formEditar.get('magnitud10').value, '1.2-2'),
            magnitud11: this.percentagePipe.transform(this.formEditar.get('magnitud11').value, '1.2-2'),
            magnitud12: this.percentagePipe.transform(this.formEditar.get('magnitud12').value, '1.2-2'),
            presupuesto1: this.currencyPipe.transform(this.formEditar.get('presupuesto1').value,),
            presupuesto2: this.currencyPipe.transform(this.formEditar.get('presupuesto2').value,),
            presupuesto3: this.currencyPipe.transform(this.formEditar.get('presupuesto3').value,),
            presupuesto4: this.currencyPipe.transform(this.formEditar.get('presupuesto4').value,), 
            presupuesto5: this.currencyPipe.transform(this.formEditar.get('presupuesto5').value,), 
            presupuesto6: this.currencyPipe.transform(this.formEditar.get('presupuesto6').value,),
            presupuesto7: this.currencyPipe.transform(this.formEditar.get('presupuesto7').value,),
            presupuesto8: this.currencyPipe.transform(this.formEditar.get('presupuesto8').value,), 
            presupuesto9: this.currencyPipe.transform(this.formEditar.get('presupuesto9').value,), 
            presupuesto10: this.currencyPipe.transform(this.formEditar.get('presupuesto10').value,),
            presupuesto11: this.currencyPipe.transform(this.formEditar.get('presupuesto11').value,),
            presupuesto12: this.currencyPipe.transform(this.formEditar.get('presupuesto12').value,),
            observacionUnidad: this.formEditar.get('observacionUnidad').value,
            observacionOPAC: this.formEditar.get('observacionOPAC').value,
          });

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
    //}
  }

  cancelar() {
    this.router.navigate(['pages/proyectos-macro/formular-proyecto']);
  }

}
