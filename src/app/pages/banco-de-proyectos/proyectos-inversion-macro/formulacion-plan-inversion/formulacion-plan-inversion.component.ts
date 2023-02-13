import { Component, OnInit } from '@angular/core';
import { ControlContainer, FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
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
  totalPresupuesto: any;
  idPlanIndicativo: string;
  idProyectoInversion: string;
  tipoPlanId: string;
  idPadre: string;
  tipoProyectoInversion: string;
  tipoPlanIndicativo: string;
  proyectosInversion: any[];
  planesDesarrollo: any[];
  planesIndicativos: any[];
  planDSelected: boolean;
  dataArmonizacionPED: string[] = [];
  dataArmonizacionPI: string[] = [];
  formArmonizacion: FormGroup;


  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request: RequestManager,
  ) { 
    activatedRoute.params.subscribe(prm => {

      this.id_formato = prm['id_formato'];  
      
    }); 
    this.cargarProyectosInversion();
    this.cargarPlanesDesarrollo();
    this.cargarPlanesIndicativos();   
  }

  ngOnInit(): void {
    this.formArmonizacion = this.formBuilder.group({
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
    this.router.navigate(['/pages/proyectos-macro/tipo-meta-indicador/' + this.id_formato]);
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

  onChangePrIn(proIn) {
    if (proIn == undefined) {
      this.idPlanIndicativo = undefined;
      this.tipoPlanIndicativo = undefined;
    } else {
      this.idProyectoInversion = proIn._id;
      this.tipoProyectoInversion = proIn.tipo_plan_id;
    }
  }

  cargarPlanesDesarrollo() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:616513b91634adfaffed52bf`).subscribe((data: any) => {
      if (data) {
        this.planesDesarrollo = data.Data;
        this.formArmonizacion.get('selectPED').setValue(this.planesDesarrollo[0])
        this.onChangePD(this.planesDesarrollo[0]);
      }
    })
  }
  
  cargarProyectosInversion() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:63ca86f1b6c0e5725a977dae`).subscribe((data: any) => {
      if (data) {
        this.proyectosInversion = data.Data;
        console.log(this.proyectosInversion)
        this.formArmonizacion.get('selectPrIn').setValue(this.proyectosInversion[0])
        this.onChangePrIn(this.proyectosInversion);

      }
    })
  }
  cargarPlanesIndicativos() {
    this.request.get(environment.PLANES_CRUD, `plan?query=tipo_plan_id:6239117116511e20405d408b`).subscribe((data: any) => {
      if (data) {
        this.planesIndicativos = data.Data;
        this.formArmonizacion.get('selectPI').setValue(this.planesIndicativos[0])
        this.onChangePI(this.planesIndicativos[0]);

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
  guardar() {
    console.log("función por hacer");
  }

}
