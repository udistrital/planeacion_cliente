import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

export interface Actividad {
  numero: string;
  nombre: string;
  ponderacionV: number;
  presupuesto: number;
  descripcion: string;
}

const INFO: Actividad[] = [
  {numero: '1', nombre: 'Actividad 1', ponderacionV: 0.3, presupuesto: 20000, descripcion: ''},
  {numero: '2', nombre: 'Actividad 2', ponderacionV: 0.7, presupuesto: 40000, descripcion: ''},
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
  codigoProy: string;
  nombreProy: string;
  recursoTotalProy: string;
  meta: string;

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
    }
  }

  cargaFormato() {
    if (this.actividadId) {
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
    } else {
      Swal.fire({
        title: 'Debe seleccionar una plantilla de interés para las actividades',
        text: ``,
        icon: 'warning',
        showConfirmButton: true,
        timer: 3500
      })
    }
  }

  loadActividades() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:63e4f2bbccee4963a2841cb7,formato:true`).subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {
          this.actividades = data.Data;
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
    return this.totalPresupuesto = INFO.map(t => t.ponderacionV).reduce((acc, value) => acc + value, 0);

  }

  getTotalPresupuesto() {
    return this.totalPresupuesto = INFO.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);

  }

  programacionPresupuestal() {
    this.router.navigate(['/pages/proyectos-macro/programacion-presupuestal']);
  }

  inactivar(row){
    Swal.fire({
      title: 'Inactivar actividad',
      text: `¿Confirma que desea inactivar la actividad seleccionada?`,
      showCancelButton: true,
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        console.log(row)
        Swal.fire({
          title: 'Registro eliminado',
          icon: 'info',
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

  ocultar() {
    Swal.fire({
      title: 'Registro de la actividad',
      text: `¿Desea cancelar el registro de la actividad?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.plantilla = false;
        Swal.fire({
          title: 'Registro cancelado',
          icon: 'warning',
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
}
