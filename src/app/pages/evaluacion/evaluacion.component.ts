import { Component, OnInit } from '@angular/core';
import { RequestManager } from '../services/requestManager';
import { environment } from 'src/environments/environment';
import {MatTableDataSource} from '@angular/material/table';
import {Location} from '@angular/common';
import Swal from 'sweetalert2';

import datosTest from 'src/assets/json/evaluacion.json';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import * as internal from 'stream';
import { runInThisContext } from 'vm';


@Component({
  selector: 'app-evaluacion',
  templateUrl: './evaluacion.component.html',
  styleUrls: ['./evaluacion.component.scss']
})
export class EvaluacionComponent implements OnInit {

  displayedColumns: string[] = ['id', 'unidad', 'estado', 'vigencia', 'periodo', 'seguimiento'];
  displayedColumnsSum: string[] = ['avance', 'sumaT1', 'sumaT2', 'sumaT3', 'sumaT4'];
  dataSource: MatTableDataSource<any>;
  tipoPlanId: string; // id tipo plan
  idPadre: string; // id padre del objeto
  planes: any[];
  bandera: boolean;
  sumaT1: number;
  sumaT2: number;
  sumaT3: number;
  sumaT4: number;
  ponderacion: number;


  testDatos: any = datosTest;
  rol: string;

  constructor(
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private _location: Location
  ) { 
    this.loadPlanes(); 
  }

  onChange(plan){
    this.bandera = false;
    if (plan == undefined){
      this.tipoPlanId = undefined;
    } else {
      this.tipoPlanId = plan.tipo_plan_id;
      let nombrePlan = document.getElementById('test');
      this.idPadre = plan._id; // id plan
    }
  }

  backClicked() {
    this._location.back();
  }

  getRol(){
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  ingresarEvaluacion(){
    this.bandera = true;
  }

  loadPlanes(){
    this.request.get(environment.PLANES_CRUD, `plan?query=formato:true`).subscribe((data: any) => {
      if (data){
        this.planes = data.Data;
        this.planes = this.filterActivos(this.planes);
      }
    },(error) => {
      Swal.fire({
        title: 'Error en la operación', 
        text: 'No se encontraron datos registrados',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  filterActivos(data) {
    return data.filter(e => e.activo == true);
  }

  sumPercent(){
    this.ponderacion = 0;
    for(let ponder of this.testDatos){
      let ponderacionunidad = parseFloat(ponder.ponderacion);
      this.ponderacion = this.ponderacion + ponderacionunidad;
    }
    this.sumaT1 = 0;
    this.sumaT2 = 0;
    this.sumaT3 = 0;
    this.sumaT4 = 0;

    for (let ponderacion of this.testDatos){
      let ponder = parseFloat(ponderacion.ponderacion);
      let T1 = parseFloat(ponderacion.trimestre1);
      let T2 = parseFloat(ponderacion.trimestre2);
      let T3 = parseFloat(ponderacion.trimestre3);
      let T4 = parseFloat(ponderacion.trimestre4);
      let suma1 = ((ponder*(T1))/this.ponderacion);
      let suma2 = ((ponder*(T2))/this.ponderacion);
      let suma3 = ((ponder*(T3))/this.ponderacion);
      let suma4 = ((ponder*(T4))/this.ponderacion);

      this.sumaT1 = this.sumaT1 + suma1;
      this.sumaT2 = this.sumaT2 + suma2;
      this.sumaT3 = this.sumaT3 + suma3;
      this.sumaT4 = this.sumaT4 + suma4;
    }
  }

  ngOnInit(): void {
    this.getRol();
    this.sumPercent();
  }

}
