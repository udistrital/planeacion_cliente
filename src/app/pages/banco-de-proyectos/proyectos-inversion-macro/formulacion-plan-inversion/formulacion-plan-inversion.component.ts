import { Component, OnInit } from '@angular/core';
import { ControlContainer } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

export interface Metas {
  Index: string;
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
  {Index: '1', Meta: 'Proyecto A', TipodeMeta: 'x', Presupuesto: 30000, },
  {Index: '2', Meta: 'Proyecto A', TipodeMeta: 'x', Presupuesto: 30000, },
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
  displayedColumns: string[] = ['Index', 'Meta', 'TipodeMeta', 'Presupuesto', 'ProgPresupuestal', 'ProgActividades'];
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


  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
  ) { 
    activatedRoute.params.subscribe(prm => {

      this.id_formato = prm['id_formato'];  
      
    });
  }

  ngOnInit(): void {
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
  programarMagnitudes() {
    this.router.navigate(['/pages/proyectos-macro/magnitudes-presupuesto']);    
  }
  programarIdentificacion() {
    this.router.navigate(['/pages/proyectos-macro/identificacion-actividades-recursos']);    
  }
  guardar() {
    console.log("función por hacer");
  }

}
