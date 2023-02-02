import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
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

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
  ) { }

  ngOnInit(): void {
  }

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
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
    this.request.get(environment.PLANES_MID, `formato/63d01facb6c0e55fc1981d73`).subscribe((data: any) => {
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

}
