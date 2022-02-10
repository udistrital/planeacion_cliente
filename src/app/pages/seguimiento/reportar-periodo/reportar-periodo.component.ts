import { Component, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import {Location} from '@angular/common';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './reportar-periodo.component.html',
  styleUrls: ['./reportar-periodo.component.scss']
})
export class ReportarPeriodoComponent implements OnInit {
  displayedColumns: string[] = ['id', 'unidad', 'estado', 'vigencia', 'periodo', 'seguimiento', 'observaciones', 'enviar'];
  dataSource: MatTableDataSource<any>;
  rol: string;
  plan_id: string;
  indexActividad : string;
  formReportarPeriodo: FormGroup;
  trimestres : any[]= [];

  constructor(
    private autenticationService: ImplicitAutenticationService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request : RequestManager,
    private _location: Location
  ) { 
    this.activatedRoute.params.subscribe(prm => {
      this.plan_id = prm['plan_id'];
      this.indexActividad = prm['index'];
    });
    this.activatedRoute.params.subscribe(prm => {
    });
    this.getRol();
    this.loadSeguimiento();
  }

  ngOnInit(): void {
 
  }

  getRol(){
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  backClicked() {
    this._location.back();
  }

  trimestre(){
    window.location.href = '#/pages/seguimiento/generar-trimestre';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadSeguimiento(){
    this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,plan_id:`+ this.plan_id).subscribe((data: any) => {
      if (data.Data.length != 0) {
        let seguimiento = data.Data[data.Data.length-1]
        this.loadTrimestre(seguimiento.periodo_id);
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

  loadTrimestre(periodo_id){
    this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=Id:`+ periodo_id).subscribe((data: any) => {
      if (data) {
        let trimestre = data.Data[data.Data.length-1]
        this.trimestres.push(trimestre.ParametroId)
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
