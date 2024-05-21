import { Component, OnInit } from '@angular/core';
import { ControlContainer, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { CodigosService } from 'src/app/@core/services/codigos.service';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';

export interface Metas {
  Posicion: string;
  Meta: string;
  TipodeMeta: string;
  Presupuesto: number;
  //P0rogPresupuestal: string;
  //ProgActividades: string;
}
export interface Fuentes {
  codigo: string;
  nombre: string;
  iconSelected: string;
}

export interface PDD {
  niveles: string;
  iconSelected: string;
}

export interface PED {
  index: string;
  nombre: string;
  iconSelected: string;
}

export interface PLIN {
  index: string;
  nombre: string;
  iconSelected: string;
}

const TABLA: Metas[] =  [
  {Posicion: '1', Meta: 'Proyecto A', TipodeMeta: 'x', Presupuesto: 30000, },
  {Posicion: '2', Meta: 'Proyecto A', TipodeMeta: 'x', Presupuesto: 30000, },
]
const INFO: Fuentes[] =  [
  {codigo: '1', nombre: 'Proyecto A', iconSelected: 'done'},
  {codigo: '2', nombre:  'Proyecto B', iconSelected: 'done'},
]

const NIVELES: PDD[] =  [
  {niveles: 'Nivel 1', iconSelected: 'done'},
  {niveles:  'Nivel 2', iconSelected: 'done'},
]

const PLANI: PED[] =  [
  {index: '1', nombre: 'Lineamiento 1', iconSelected: 'done'},
  {index: '2', nombre:  'Meta', iconSelected: 'done'},
]

const PI: PLIN[] =  [
  {index: '1', nombre: 'Lineamiento 1', iconSelected: 'done'},
  {index: '2', nombre:  'Meta', iconSelected: 'done'},
]


@Component({
  selector: 'app-formulacion-plan-inversion',
  templateUrl: './formulacion-plan-inversion.component.html',
  styleUrls: ['./formulacion-plan-inversion.component.scss']
})
export class FormulacionPlanInversionComponent implements OnInit {
  vigencias: any[];
  vigencia: any;
  unidades: any[];
  unidad: any;
  planes: any[];
  plan: any;
  vigenciaSelected: boolean;
  unidadSelected: boolean;
  planSelected: boolean;
  guardarDisabled: boolean;
  dataSource: any;
  displayedColumns: string[] = ['Posicion', 'Meta', 'TipodeMeta', 'Presupuesto', 'Acciones', 'ProgPresupuestal', 'ProgActividades'];
  displayedProyects: string[] = ['codigo', 'nombre', 'actions'];
  displayedPDD: string[] = ['niveles', 'actions'];
  displayedPED: string[] = ['index','nombre', 'actions'];
  displayedPI: string[] = ['index','nombre', 'actions'];
  dataProyectos: any;
  dataProyects = new MatTableDataSource<Fuentes>(INFO);
  dataPlanDD: any;
  dataPDD = new MatTableDataSource<PDD>(NIVELES);
  dataPlanED: any;
  dataPED = new MatTableDataSource<PED>(PLANI);
  dataPlanI: any;
  dataPI = new MatTableDataSource<PLIN>(PI);
  dataMetasP: any;
  dataMetas = new MatTableDataSource<Metas>(TABLA);
  unidadesInteres: any;
  id_formato: string;
  newPlanId: string;
  totalPresupuesto: any;
  idPlanIndicativo: string;
  idProyectoInversion: string;
  tipoPlanId: string;
  idPadre: string;
  idPadreDD: string;
  tipoPlanIdDD: string;
  tipoProyectoInversion: string;
  tipoPlanIndicativo: string;
  proyectosInversion: any[];
  planesDesarrolloDistrital: any[];
  planesDesarrollo: any[];
  planesIndicativos: any[];
  planDDSelected: boolean;
  planDSelected: boolean;
  planISelected: boolean;
  proyectSelected: boolean;
  dataArmonizacionPED: string[] = [];
  dataArmonizacionPI: string[] = [];
  dataArmonizacionPDD: string[] = [];
  formArmonizacion: FormGroup;



  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private codigosService:CodigosService
  ) {
    activatedRoute.params.subscribe(prm => {

      this.id_formato = prm['id_formato'];
      this.newPlanId = prm['this.newPlanId'];

    });
    this.cargarPlanesDesarrolloDistrital();
    this.cargarProyectosInversion();
    this.cargarPlanesDesarrollo();
    this.cargarPlanesIndicativos();
  }

  async ngOnInit(){
    await this.codigosService.cargarIdentificadores();
    this.formArmonizacion = this.formBuilder.group({
      selectPDD: ['',],
      selectPED: ['',],
      selectPI: ['',],
      selectPrIn: ['',]
    });
    this.getTotalPresupuesto();
  }

  onChange(value) {
    console.log(value,"prueba")
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

  programarMetas() {
    //console.log(this.id_formato);
    this.router.navigate(['/pages/proyectos-macro/tipo-meta-indicador/' + this.id_formato + '/' + this.idProyectoInversion + '/' + this.newPlanId]);
    // if(this.vigenciaSelected == true && this.unidadSelected == true && this.planSelected == true){
    //   console.log("entró al if");
    //   this.router.navigate(['/pages/proyectos-macro/formulacion-plan-inversion']);
    // }else{
    //   Swal.fire({
    //     title: 'Debe seleccionar todos los criterios',
    //     icon: 'warning',
    //     showConfirmButton: false,
    //     timer: 2500
    //   })
    // };
  }
  getTotalPresupuesto() {
    return this.totalPresupuesto = TABLA.map(t => t.Presupuesto).reduce((acc, value) => acc + value, 0);

  }
  programarMagnitudes() {
    this.router.navigate(['/pages/proyectos-macro/magnitudes-presupuesto']);
  }
  programarIdentificacion() {
    this.router.navigate(['/pages/proyectos-macro/identificacion-actividades-recursos']);
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
      console.log(this.planDDSelected, 'idPlanEstrategicoDesarrollo');
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
      console.log(this.proyectSelected, 'idProyectoInversion');
      this.tipoProyectoInversion = proIn.tipo_plan_id;
    }
  }

  cargarPlanesDesarrolloDistrital() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:${this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PDD_SP')}`).subscribe((data: any) => {
      if (data) {
        this.planesDesarrolloDistrital = data.Data;
        //this.formArmonizacion.get('selectPDD').setValue(this.planesDesarrolloDistrital[0])
        //this.onChangePD(this.planesDesarrollo[0]);
      }
    })
  }
  cargarPlanesDesarrollo() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:${this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PD_SP')}`).subscribe((data: any) => {
      if (data) {
        this.planesDesarrollo = data.Data;
        //this.formArmonizacion.get('selectPED').setValue(this.planesDesarrollo[0])
        //this.onChangePD(this.planesDesarrollo[0]);
      }
    })
  }

  cargarProyectosInversion() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:${this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PRI_SP')}`).subscribe((data: any) => {
      if (data) {
        this.proyectosInversion = data.Data;
        console.log(this.proyectosInversion)
        //this.formArmonizacion.get('selectPrIn').setValue(this.proyectosInversion[0])
        //this.onChangePrIn(this.proyectosInversion);

      }
    })
  }
  cargarPlanesIndicativos() {
    this.request.get(environment.PLANES_CRUD, `plan?query=tipo_plan_id:${this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PLI_SP')}`).subscribe((data: any) => {
      if (data) {
        this.planesIndicativos = data.Data;
        //this.formArmonizacion.get('selectPI').setValue(this.planesIndicativos[0])
        //this.onChangePI(this.planesIndicativos[0]);

      }
    })
  }
  receiveMessage(event) {
    if (event.bandera === 'armonizar') {
      var uid_n = event.fila.level;
      var uid = event.fila.id; // id del nivel a editar
      if (uid != this.dataArmonizacionPED.find(id => id === uid)) {
        this.dataArmonizacionPED.push(uid)
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

}
