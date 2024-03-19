import { CurrencyPipe, PercentPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import {FormBuilder, FormGroup, FormControl, Validators} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

export interface Tile {
  color: string;
  fuente: string;
  border: string
  cols: number;
  rows: number;
  text: string;  
}

@Component({
  selector: 'app-magnitudes-presupuesto',
  templateUrl: './magnitudes-presupuesto.component.html',
  styleUrls: ['./magnitudes-presupuesto.component.scss']
})
export class MagnitudesPresupuestoComponent implements OnInit {

  planId: string;
  indexMeta: string;
  idProyectoInversion: string;
  posicionMetaPro: string;
  codigoProyect: string;
  nombreProyect: string;
  name: string = "";
  codigo: string = "";
  valorFuentes: string = "";
  totalFuentes = 0;
  dataMeta: object = {};
  metaSelected: string = "";
  presupuestoProg_1: number = 0;
  presupuestoProg_2: number = 0;
  presupuestoProg_3: number = 0;
  presupuestoProg_4: number = 0;
  presupuestoProg_5: number = 0;
  presupuestoProg_T: number = 0;
  presupuesto_1: number = 0;
  presupuesto_2: number = 0;
  presupuesto_3: number = 0;
  presupuesto_4: number = 0;
  presupuesto_5: number = 0;
  presupuesto_T: number = 0;
  programacion_1: number = 0;
  programacion_2: number = 0;
  programacion_3: number = 0;
  programacion_4: number = 0;
  programacion_5: number = 0;
  programacion_T: number = 0;
  observacionMagnitudes: string;
  observacionPresupuestal: string;
  editar: any;
  //readOnlyAll: boolean;
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



  firstFormGroup: FormGroup;
  formProyect: FormGroup;
  secondFormGroup: FormGroup;
  // firstFormGroup = this._formBuilder.group({
  //   firstCtrl: ['', Validators.required],
  // });
  // secondFormGroup = this._formBuilder.group({
  //   secondCtrl: ['', Validators.required],
  // });
  isLinear = true;
  // tiles: Tile[] = [
  //   {text: 'Año 1', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: 'Año 2', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: 'Año 3', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: 'Año 4', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: 'Año 5', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: 'Formulación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Programación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Formulación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Programación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Formulación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Programación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Formulación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Programación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Formulación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Programación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Total', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: '$', cols: 2, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},

  // ];

  constructor( 
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
    private currencyPipe: CurrencyPipe,
    private percentagePipe: PercentPipe,
    private router: Router,
    private autenticationService: ImplicitAutenticationService,
    ) { 
    activatedRoute.params.subscribe(prm => {
      this.planId = prm['idPlan']; 
      this.indexMeta = prm['indexMeta'];  
      this.idProyectoInversion = prm['idProyectoInversion'];
      this.posicionMetaPro = prm['posicionMetaPro'];
      this.editar = prm['edit'];
      
    });  
    
    console.log(this.editar, "editar");
    // if (this.editar) {
    //   this.loadInfoProI();
    // } else if (this.editar){
    //   this.loadMagnitudesProg();
    // }
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'      
    } else if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
      //this.verificarFechas();
    }
    this.loadPlan();
    this.loadMagnitudesProg();
  }

  ngOnInit(): void {    
    this.formProyect = this.formBuilder.group({
      name: [this.name,],
      codigo: [this.codigo,],
      valorFuentes: [this.valorFuentes],
      meta: [this.metaSelected]
    });

    this.firstFormGroup = this.formBuilder.group({
      presupuesto_1: [this.presupuesto_1, Validators.required],
      presupuesto_2: [this.presupuesto_2, Validators.required],
      presupuesto_3: [this.presupuesto_3, Validators.required],
      presupuesto_4: [this.presupuesto_4, Validators.required], 
      presupuesto_5: [this.presupuesto_5, Validators.required],
      //presupuesto_T: [this.presupuestoT], 
      programacion_1: [this.programacion_1, Validators.required],
      programacion_2: [this.programacion_2, Validators.required],
      programacion_3: [this.programacion_3, Validators.required],
      programacion_4: [this.programacion_4, Validators.required],
      programacion_5: [this.programacion_5, Validators.required],    
      observacionMagnitudes: [this.observacionMagnitudes,],
    })

    this.secondFormGroup = this.formBuilder.group({
      presupuesto_1: [this.presupuesto_1, Validators.required],
      presupuesto_2: [this.presupuesto_2, Validators.required],
      presupuesto_3: [this.presupuesto_3, Validators.required],
      presupuesto_4: [this.presupuesto_4, Validators.required], 
      presupuesto_5: [this.presupuesto_5, Validators.required],
      presupuestoProg_1: [this.presupuestoProg_1, Validators.required],
      presupuestoProg_2: [this.presupuestoProg_2, Validators.required],
      presupuestoProg_3: [this.presupuestoProg_3, Validators.required],
      presupuestoProg_4: [this.presupuestoProg_4, Validators.required],
      presupuestoProg_5: [this.presupuestoProg_5, Validators.required],    
      observacionPresupuestos: [this.observacionPresupuestal,],
    })

    
    //this.loadInfoProI();

    this.firstFormGroup.setValue({
      programacion_1: this.percentagePipe.transform(this.firstFormGroup.get('programacion_1').value, '1.2-2'),
      programacion_2: this.percentagePipe.transform(this.firstFormGroup.get('programacion_2').value, '1.2-2'),
      programacion_3: this.percentagePipe.transform(this.firstFormGroup.get('programacion_3').value, '1.2-2'),
      programacion_4: this.percentagePipe.transform(this.firstFormGroup.get('programacion_4').value, '1.2-2'),
      programacion_5: this.percentagePipe.transform(this.firstFormGroup.get('programacion_5').value, '1.2-2'),
      presupuesto_1: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_1').value,),
      presupuesto_2: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_2').value,),
      presupuesto_3: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_3').value,),
      presupuesto_4: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_4').value,), 
      presupuesto_5: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_5').value,),      
      observacionMagnitudes: this.firstFormGroup.get('observacionMagnitudes').value,
    });

    this.secondFormGroup.setValue({
      presupuesto_1: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_1').value,),
      presupuesto_2: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_2').value,),
      presupuesto_3: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_3').value,),
      presupuesto_4: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_4').value,), 
      presupuesto_5: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_5').value,), 
      presupuestoProg_1: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_1').value,),
      presupuestoProg_2: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_2').value,),
      presupuestoProg_3: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_3').value,),
      presupuestoProg_4: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_4').value,), 
      presupuestoProg_5: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_5').value,), 
      observacionPresupuestal: this.secondFormGroup.get('observacionPresupuestal').value,
    });

    // if (this.id != undefined) {
    //   this.getDataProyect();
    //   this.editar = true;
    // }
    
  }

  loadPlan() {
    this.request.get(environment.PLANES_CRUD, `plan/` + this.planId).subscribe((data: any) => {
      if (data) {
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
          this.getVersiones();
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
        console.log(this.estadoPlan, "estado Plan");
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

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  focusMagnitud(element) {
    element.target.value = element.target.value.replaceAll("%", "");
  }

  blurMagnitud(element, index) {
    switch (index) {
      case 1:
        this.programacion_T -= this.programacion_1;
        if (element.target.value == "") {
          this.programacion_1 = 0;
        } else {
          this.programacion_1 = parseFloat(element.target.value) / 100;
          if (this.programacion_T + this.programacion_1 != 1) {
            Swal.fire({
              title: 'La magnitud total debe ser igual a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.programacion_1 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.programacion_1, '1.2-2');
        break;
      case 2:
        this.programacion_T -= this.programacion_2;
        if (element.target.value == "") {
          this.programacion_2 = 0;
        } else {
          this.programacion_2 = parseFloat(element.target.value) / 100;
          if (this.programacion_T + this.programacion_2 != 1) {
            Swal.fire({
              title: 'La magnitud total no puede ser mayor a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.programacion_2 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.programacion_2, '1.2-2');
        break;
      case 3:
        this.programacion_T -= this.programacion_3;
        if (element.target.value == "") {
          this.programacion_3 = 0;
        } else {
          this.programacion_3 = parseFloat(element.target.value) / 100;
          if (this.programacion_T + this.programacion_3 != 1) {
            Swal.fire({
              title: 'La magnitud total no puede ser mayor a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.programacion_3 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.programacion_3, '1.2-2');
        break;
      case 4:
        this.programacion_T -= this.programacion_4;
        if (element.target.value == "") {
          this.programacion_4 = 0;
        } else {
          this.programacion_4 = parseFloat(element.target.value) / 100;
          if (this.programacion_T + this.programacion_4 != 1) {
            Swal.fire({
              title: 'La magnitud total no puede ser mayor a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.programacion_4 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.programacion_4, '1.2-2');
        break;
      case 5:
        this.programacion_T -= this.programacion_5;
        if (element.target.value == "") {
          this.programacion_5 = 0;
        } else {
          this.programacion_5 = parseFloat(element.target.value) / 100;
          if (this.programacion_T + this.programacion_5 != 1) {
            Swal.fire({
              title: 'La magnitud total no puede ser mayor a 100%',
              text: "",
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            //this.programacion_5 = 0;
          }
        }
        element.target.value = this.percentagePipe.transform(this.programacion_5, '1.2-2');
        break;
    }
    this.programacion_T = this.programacion_1 + this.programacion_2 + this.programacion_3 + this.programacion_4 + this.programacion_5;
  }

  focusPresupuesto(element) {
    element.target.value = element.target.value.replaceAll("$", "").replaceAll(",", "").replace(".00", "");
  }

  blurPresupuesto(element, index) {
    switch (index) {
      case 1:
        if (element.target.value == "") {
          this.presupuesto_1 = 0;
        } else {
          this.presupuesto_1 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto_1);
        break;
      case 2:
        if (element.target.value == "") {
          this.presupuesto_2 = 0;
        } else {
          this.presupuesto_2 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto_2);
        break;
      case 3:
        if (element.target.value == "") {
          this.presupuesto_3 = 0;
        } else {
          this.presupuesto_3 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto_3);
        break;
      case 4:
        if (element.target.value == "") {
          this.presupuesto_4 = 0;
        } else {
          this.presupuesto_4 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto_4);
        break;
      case 5:
        if (element.target.value == "") {
          this.presupuesto_5 = 0;
        } else {
          this.presupuesto_5 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuesto_5);
        break;
    }
    this.presupuesto_T = this.presupuesto_1 + this.presupuesto_2 + this.presupuesto_3 + this.presupuesto_4 + this.presupuesto_5;
  }

  blurPresupuestoProg(element, index) {
    switch (index) {
      case 1:
        if (element.target.value == "") {
          this.presupuestoProg_1 = 0;
        } else {
          this.presupuestoProg_1 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuestoProg_1);
        break;
      case 2:
        if (element.target.value == "") {
          this.presupuestoProg_2 = 0;
        } else {
          this.presupuestoProg_2 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuestoProg_2);
        break;
      case 3:
        if (element.target.value == "") {
          this.presupuestoProg_3 = 0;
        } else {
          this.presupuestoProg_3 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuestoProg_3);
        break;
      case 4:
        if (element.target.value == "") {
          this.presupuestoProg_4 = 0;
        } else {
          this.presupuestoProg_4 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuestoProg_4);
        break;
      case 5:
        if (element.target.value == "") {
          this.presupuestoProg_5 = 0;
        } else {
          this.presupuestoProg_5 = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        }
        element.target.value = this.currencyPipe.transform(this.presupuestoProg_5);
        break;
    }
    this.presupuestoProg_T = this.presupuestoProg_1 + this.presupuestoProg_2 + this.presupuestoProg_3 + this.presupuestoProg_4 + this.presupuestoProg_5;
  }

  obsBlurEvent(element, index) {
    switch (index) {
      case 1:
        if (element.target.value == "") {
          this.observacionMagnitudes = "";
        } else {
          this.observacionMagnitudes = element.target.value;
        }
        element.target.value = this.observacionMagnitudes;
        break;
      case 2:
        if (element.target.value == "") {
          this.observacionPresupuestal = "";
        } else {
          this.observacionPresupuestal = element.target.value;
        }
        element.target.value = this.observacionPresupuestal;
        break;
    }
  }

  loadMagnitudesProg() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    if (this.editar == 'false') {
      this.readOnlyAll = true;
      this.request.get(environment.PLANES_MID, 'inversion/magnitudes/' + this.planId + '/' + this.indexMeta).subscribe((data: any) => {
        if (data) {
          Swal.close();    
          var magnitudes = data.Data.dato 
          this.nombreProyect = magnitudes["nombre_proyecto_inversion"];
          this.codigoProyect = magnitudes["codigo_proyecto_inversion"];
          this.totalFuentes = magnitudes["valor_fuentes"];
          this.metaSelected = magnitudes["nombre_meta"];
          this.programacion_1 = magnitudes["magnitud_1"] / 100;
          this.programacion_2 = magnitudes["magnitud_2"] / 100;
          this.programacion_3 = magnitudes["magnitud_3"] / 100;
          this.programacion_4 = magnitudes["magnitud_4"] / 100;
          this.programacion_5 = magnitudes["magnitud_5"] / 100;
          this.programacion_T = magnitudes["magnitud_T"] / 100;
          this.presupuesto_1 = magnitudes["presupuesto_1"];
          this.presupuesto_2 = magnitudes["presupuesto_2"];
          this.presupuesto_3 = magnitudes["presupuesto_3"];
          this.presupuesto_4 = magnitudes["presupuesto_4"]; 
          this.presupuesto_5 = magnitudes["presupuesto_5"];
          this.presupuesto_T = magnitudes["presupuesto_T"]; 
          this.presupuestoProg_1 = magnitudes["presupuestoProg_1"];
          this.presupuestoProg_2 = magnitudes["presupuestoProg_2"];
          this.presupuestoProg_3 = magnitudes["presupuestoProg_3"];
          this.presupuestoProg_4 = magnitudes["presupuestoProg_4"];
          this.presupuestoProg_5 = magnitudes["presupuestoProg_5"];   
          this.presupuestoProg_T = magnitudes["presupuestoProg_T"]; 
          this.observacionMagnitudes = magnitudes["observacionMagnitudes"];
          this.observacionPresupuestal = magnitudes["observacionPresupuestal"];
                    
            
          
          this.formProyect.setValue({
            name: this.nombreProyect,
            codigo: this.codigoProyect,
            valorFuentes: this.totalFuentes,
            meta: this.metaSelected
          });
  
          this.firstFormGroup.setValue({
            programacion_1: this.percentagePipe.transform(this.firstFormGroup.get('programacion_1').value, '1.2-2'),
            programacion_2: this.percentagePipe.transform(this.firstFormGroup.get('programacion_2').value, '1.2-2'),
            programacion_3: this.percentagePipe.transform(this.firstFormGroup.get('programacion_3').value, '1.2-2'),
            programacion_4: this.percentagePipe.transform(this.firstFormGroup.get('programacion_4').value, '1.2-2'),
            programacion_5: this.percentagePipe.transform(this.firstFormGroup.get('programacion_5').value, '1.2-2'),
            presupuesto_1: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_1').value,),
            presupuesto_2: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_2').value,),
            presupuesto_3: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_3').value,),
            presupuesto_4: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_4').value,), 
            presupuesto_5: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_5').value,),      
            observacionMagnitudes: this.firstFormGroup.get('observacionMagnitudes').value,
          });
          this.secondFormGroup.setValue({
            presupuesto_1: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_1').value,),
            presupuesto_2: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_2').value,),
            presupuesto_3: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_3').value,),
            presupuesto_4: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_4').value,), 
            presupuesto_5: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_5').value,), 
            presupuestoProg_1: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_1').value,),
            presupuestoProg_2: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_2').value,),
            presupuestoProg_3: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_3').value,),
            presupuestoProg_4: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_4').value,), 
            presupuestoProg_5: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_5').value,), 
            observacionPresupuestal: this.secondFormGroup.get('observacionPresupuestal').value,
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
    } else if (this.editar == 'true') {
      this.readOnlyAll = false;
      this.request.get(environment.PLANES_MID, 'inversion/proyecto/' + this.idProyectoInversion).subscribe((data: any) => {
        if (data) {
          Swal.close();     
          this.nombreProyect = data["Data"]["nombre_proyecto"];
          this.codigoProyect = data["Data"]["codigo_proyecto"];
          var fuentes = data["Data"]["fuentes"];
          //var fuentesTabla = []
          for (let i = 0; i < fuentes.length; i++) {
            const fuenteGEt = fuentes[i];          
            this.totalFuentes = this.totalFuentes + fuenteGEt["presupuestoProyecto"]
            console.log(this.totalFuentes, "totalFuentes");       
          }       
  
          var metas = data["Data"]["metas"];
          for (let i = 0; i < metas.length; i++) {
            const metaGEt = metas[i];
            if (this.posicionMetaPro == metaGEt["posicion"]) {
              this.metaSelected = metaGEt["descripcion"];
              this.programacion_1 = metaGEt["magnitud1"] / 100;
              this.programacion_2 = metaGEt["magnitud2"] / 100;
              this.programacion_3 = metaGEt["magnitud3"] / 100;
              this.programacion_4 = metaGEt["magnitud4"] / 100;
              this.programacion_5 = metaGEt["magnitud5"] / 100;
              this.programacion_T = metaGEt["magnitudT"] / 100;
              this.presupuesto_1 = metaGEt["presupuesto1"];
              this.presupuesto_2 = metaGEt["presupuesto2"];
              this.presupuesto_3 = metaGEt["presupuesto3"];
              this.presupuesto_4 = metaGEt["presupuesto4"]; 
              this.presupuesto_5 = metaGEt["presupuesto5"];
              this.presupuesto_T = metaGEt["presupuestoT"];    
              this.observacionMagnitudes = metaGEt["observacionMagnitudes"];
              this.observacionPresupuestal = metaGEt["observacionPresupuestal"];
            }
          }   
          
          this.formProyect.setValue({
            name: data["Data"]["nombre_proyecto"],
            codigo: data["Data"]["codigo_proyecto"],
            valorFuentes: this.totalFuentes,
            meta: this.metaSelected
          });
  
          this.firstFormGroup.setValue({
            programacion_1: this.percentagePipe.transform(this.firstFormGroup.get('programacion_1').value, '1.2-2'),
            programacion_2: this.percentagePipe.transform(this.firstFormGroup.get('programacion_2').value, '1.2-2'),
            programacion_3: this.percentagePipe.transform(this.firstFormGroup.get('programacion_3').value, '1.2-2'),
            programacion_4: this.percentagePipe.transform(this.firstFormGroup.get('programacion_4').value, '1.2-2'),
            programacion_5: this.percentagePipe.transform(this.firstFormGroup.get('programacion_5').value, '1.2-2'),
            presupuesto_1: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_1').value,),
            presupuesto_2: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_2').value,),
            presupuesto_3: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_3').value,),
            presupuesto_4: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_4').value,), 
            presupuesto_5: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_5').value,),      
            observacionMagnitudes: this.firstFormGroup.get('observacionMagnitudes').value,
          });
          this.secondFormGroup.setValue({
            presupuesto_1: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_1').value,),
            presupuesto_2: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_2').value,),
            presupuesto_3: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_3').value,),
            presupuesto_4: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_4').value,), 
            presupuesto_5: this.currencyPipe.transform(this.secondFormGroup.get('presupuesto_5').value,), 
            presupuestoProg_1: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_1').value,),
            presupuestoProg_2: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_2').value,),
            presupuestoProg_3: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_3').value,),
            presupuestoProg_4: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_4').value,), 
            presupuestoProg_5: this.currencyPipe.transform(this.secondFormGroup.get('presupuestoProg_5').value,),
            observacionPresupuestal: this.secondFormGroup.get('observacionPresupuestal').value, 
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
    }
    } 
    
    

  // loadInfoMeta() {
  //   Swal.fire({
  //     title: 'Cargando información',
  //     timerProgressBar: true,
  //     showConfirmButton: false,
  //     willOpen: () => {
  //       Swal.showLoading();
  //     },
  //   })
  //   this.request.get(environment.PLANES_MID, `formulacion/get_plan/` + this.planId + `/` + this.indexMeta).subscribe((data: any) => {
  //     if (data) {
  //       Swal.close();
  //       //this.onChangePD(this.planesDesarrollo[0]);
  //       //this.onChangePI(this.planesIndicativos[0]);
  //       //this.estado = this.plan.estado_plan_id;
  //       //this.steps = data.Data[0]
  //       //this.json = data.Data[1][0]
  //       //this.form = this.formBuilder.group(this.json);

  //       // let auxAmonizacion = data.Data[2][0]
  //       // let strArmonizacion = auxAmonizacion.armo
  //       // let len = (strArmonizacion.split(",").length)
  //       // this.dataArmonizacionPED = strArmonizacion.split(",", len).filter(((item) => item != ""))
  //       // let strArmonizacion2 = auxAmonizacion.armoPI
  //       // let len2 = (strArmonizacion2.split(",").length)
  //       // this.dataArmonizacionPI = strArmonizacion2.split(",", len2).filter(((item) => item != ""))
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
  // //}
  // }

  // loadInfoProI() {
  //   Swal.fire({
  //     title: 'Cargando información',
  //     timerProgressBar: true,
  //     showConfirmButton: false,
  //     willOpen: () => {
  //       Swal.showLoading();
  //     },
  //   })
  //   this.request.get(environment.PLANES_MID, 'inversion/proyecto/' + this.idProyectoInversion).subscribe((data: any) => {
  //     if (data) {
  //       Swal.close();     
  //       this.nombreProyect = data["Data"]["nombre_proyecto"];
  //       this.codigoProyect = data["Data"]["codigo_proyecto"];
  //       var fuentes = data["Data"]["fuentes"];
  //       //var fuentesTabla = []
  //       for (let i = 0; i < fuentes.length; i++) {
  //         const fuenteGEt = fuentes[i];          
  //         this.totalFuentes = this.totalFuentes + fuenteGEt["presupuestoProyecto"]
  //         console.log(this.totalFuentes, "totalFuentes");       
  //       }       

  //       var metas = data["Data"]["metas"];
  //       for (let i = 0; i < metas.length; i++) {
  //         const metaGEt = metas[i];
  //         if (this.posicionMetaPro == metaGEt["posicion"]) {
  //           this.metaSelected = metaGEt["descripcion"];
  //           this.programacion_1 = metaGEt["magnitud1"] / 100;
  //           this.programacion_2 = metaGEt["magnitud2"] / 100;
  //           this.programacion_3 = metaGEt["magnitud3"] / 100;
  //           this.programacion_4 = metaGEt["magnitud4"] / 100;
  //           this.programacion_5 = metaGEt["magnitud5"] / 100;
  //           this.programacion_T = metaGEt["magnitudT"] / 100;
  //           this.presupuesto_1 = metaGEt["presupuesto1"];
  //           this.presupuesto_2 = metaGEt["presupuesto2"];
  //           this.presupuesto_3 = metaGEt["presupuesto3"];
  //           this.presupuesto_4 = metaGEt["presupuesto4"]; 
  //           this.presupuesto_5 = metaGEt["presupuesto5"];
  //           this.presupuesto_T = metaGEt["presupuestoT"];       
  //         }
  //       }   
        
  //       this.formProyect.setValue({
  //         name: data["Data"]["nombre_proyecto"],
  //         codigo: data["Data"]["codigo_proyecto"],
  //         valorFuentes: this.totalFuentes,
  //         meta: this.metaSelected
  //       });

  //       this.firstFormGroup.setValue({
  //         programacion_1: this.percentagePipe.transform(this.firstFormGroup.get('programacion_1').value, '1.2-2'),
  //         programacion_2: this.percentagePipe.transform(this.firstFormGroup.get('programacion_2').value, '1.2-2'),
  //         programacion_3: this.percentagePipe.transform(this.firstFormGroup.get('programacion_3').value, '1.2-2'),
  //         programacion_4: this.percentagePipe.transform(this.firstFormGroup.get('programacion_4').value, '1.2-2'),
  //         programacion_5: this.percentagePipe.transform(this.firstFormGroup.get('programacion_5').value, '1.2-2'),
  //         presupuesto_1: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_1').value,),
  //         presupuesto_2: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_2').value,),
  //         presupuesto_3: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_3').value,),
  //         presupuesto_4: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_4').value,), 
  //         presupuesto_5: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_5').value,),      
          
  //       });
  //       this.secondFormGroup.setValue({
  //         presupuesto_1: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_1').value,),
  //         presupuesto_2: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_2').value,),
  //         presupuesto_3: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_3').value,),
  //         presupuesto_4: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_4').value,), 
  //         presupuesto_5: this.currencyPipe.transform(this.firstFormGroup.get('presupuesto_5').value,), 
  //         presupuestoProg_1: this.currencyPipe.transform(this.firstFormGroup.get('presupuestoProg_1').value,),
  //         presupuestoProg_2: this.currencyPipe.transform(this.firstFormGroup.get('presupuestoProg_2').value,),
  //         presupuestoProg_3: this.currencyPipe.transform(this.firstFormGroup.get('presupuestoProg_3').value,),
  //         presupuestoProg_4: this.currencyPipe.transform(this.firstFormGroup.get('presupuestoProg_4').value,), 
  //         presupuestoProg_5: this.currencyPipe.transform(this.firstFormGroup.get('presupuestoProg_5').value,), 
  //       });
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
  // //}
  // }
  
  progMagnitudes() {
    const progMagnitudes = {
      nombre_proyecto_inversion: this.nombreProyect,
      codigo_proyecto_inversion: this.codigoProyect,
      valor_fuentes: this.totalFuentes,
      indiceMetaProyecto: this.posicionMetaPro,
      nombre_meta: this.metaSelected,
      magnitud_1: this.programacion_1 * 100, 
      magnitud_2: this.programacion_2 * 100, 
      magnitud_3: this.programacion_3 * 100, 
      magnitud_4: this.programacion_4 * 100, 
      magnitud_5: this.programacion_5 * 100, 
      magnitud_T: this.programacion_T * 100, 
      presupuesto_1: this.presupuesto_1, 
      presupuesto_2: this.presupuesto_2, 
      presupuesto_3: this.presupuesto_3, 
      presupuesto_4: this.presupuesto_4, 
      presupuesto_5: this.presupuesto_5, 
      presupuesto_T: this.presupuesto_T,
      presupuestoProg_1: this.presupuestoProg_1, 
      presupuestoProg_2: this.presupuestoProg_2, 
      presupuestoProg_3: this.presupuestoProg_3, 
      presupuestoProg_4: this.presupuestoProg_4, 
      presupuestoProg_5: this.presupuestoProg_5, 
      presupuestoProg_T: this.presupuestoProg_T,
      observacionMagnitudes: this.observacionMagnitudes,
      observacionPresupuestal: this.observacionPresupuestal
    }
    this.request.put(environment.PLANES_MID, `inversion/magnitudes`, progMagnitudes, this.planId + `/` + this.indexMeta).subscribe((data: any) => {
      if (data) {
        console.log(data)
        Swal.fire({
          title: 'Programación de Magnitudes y Presupuestos Agregada',
          //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
          text: 'La programación de magnitudes y prespuesto se ha registrado satisfactoriamente',
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

  cancelar() {
    this.router.navigate(['pages/proyectos-macro/formular-proyecto']);
  }

  // blurPresupuesto(element, controlName) {
  //   if (element.target.value != "") {
  //     let presupuesto = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
  //     if (presupuesto > this.dataSource.data[rowIndex]["presupuestoDisponible"]) {
  //       Swal.fire('El valor no puede superar el presupuesto disponible', '', 'info');
  //       this.dataSource.data[rowIndex]["presupuestoProyecto"] = 0;
  //       element.target.value = this.currencyPipe.transform(this.dataSource.data[rowIndex]["presupuestoProyecto"]);
  //       this.dataSource.data[rowIndex]["presupuestoDisponible"] -= this.dataSource.data[rowIndex]["presupuestoProyecto"];
  //     } else {
  //       this.dataSource.data[rowIndex]["presupuestoProyecto"] = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
  //       this.dataSource.data[rowIndex]["presupuestoDisponible"] -= this.dataSource.data[rowIndex]["presupuestoProyecto"];
  //     }
  //   } else {
  //     this.dataSource.data[rowIndex]["presupuestoProyecto"] = this.totalPresupuestoTemp;
  //     element.target.value = this.currencyPipe.transform(this.dataSource.data[rowIndex]["presupuestoProyecto"]);
  //     this.dataSource.data[rowIndex]["presupuestoDisponible"] -= this.dataSource.data[rowIndex]["presupuestoProyecto"];
  //   }
  //   this.getTotalPresupuestoProyecto();
  // }

}
