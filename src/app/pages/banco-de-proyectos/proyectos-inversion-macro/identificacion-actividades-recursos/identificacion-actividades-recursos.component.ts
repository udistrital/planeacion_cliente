import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

export interface Actividad {
  posicion: string;
  actividad: string;
  ponderacion: number;
  presupuesto: number;
  iconSelected: string;
}

const INFO: Actividad[] = [
  {posicion: '1', actividad: 'Actividad 1', ponderacion: 30000, presupuesto: 20000, iconSelected: 'done'},
  {posicion: '2', actividad: 'Actividad 2', ponderacion: 70000, presupuesto: 40000, iconSelected: 'done'},
]
@Component({
  selector: 'app-identificacion-actividades-recursos',
  templateUrl: './identificacion-actividades-recursos.component.html',
  styleUrls: ['./identificacion-actividades-recursos.component.scss']
})
export class IdentificacionActividadesRecursosComponent implements OnInit {
  displayedColumns: string[] = ['posicion','actividad', 'ponderacion', 'presupuesto', 'actions'];
  dataSource = new MatTableDataSource<Actividad>(INFO);
  activedStep = 0;
  form: FormGroup;
  steps: any[];
  json: any;
  estado: string;
  plantilla = false;
  actividades: any[];
  actividad: any;
  actividadId: string;
  actividadSelected: boolean;
  totalPresupuesto: any;

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private router: Router,
  ) { 
    this.loadActividades();
  }

  ngOnInit(): void {
    this.getTotalPonderacion();
    this.getTotalPresupuesto();
  }

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
  }

  onChangeA(actividad: any) {
    if (actividad == undefined) {
      this.actividadSelected = false;
    } else {
      this.actividadSelected = true;
      this.actividad = actividad; 
      this.actividadId = this.actividad._id;
      //console.log(this.actividadId, "valor actividad", this.actividadSelected);     
    }
  }

  cargaFormato() {
    this.plantilla = true;
    Swal.fire({
      title: 'Cargando formato',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `formato/` + this.actividadId).subscribe((data: any) => {
      if (data) {
        Swal.close();
        //this.estado = plan.estado_plan_id;
        this.steps = data[0]
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

  loadActividades() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:63e4f2bbccee4963a2841cb7,formato:true`).subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {
          this.actividades = data.Data;          
          //console.log(this.actividades, "actividades");
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
  getTotalPonderacion() {    
    return this.totalPresupuesto = INFO.map(t => t.ponderacion).reduce((acc, value) => acc + value, 0);
    
  }

  getTotalPresupuesto() {    
    return this.totalPresupuesto = INFO.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);
    
  }

  programacionPresupuestal() {
    this.router.navigate(['/pages/proyectos-macro/programacion-presupuestal']);    
  }

}
