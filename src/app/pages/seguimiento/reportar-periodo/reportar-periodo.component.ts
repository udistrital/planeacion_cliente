import { Component, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

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
  trimestreSelected: boolean;
  trimestre : any;

  constructor(
    private autenticationService: ImplicitAutenticationService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request : RequestManager,
    private router : Router
  ) { 
    this.activatedRoute.params.subscribe(prm => {
      this.plan_id = prm['plan_id'];
      this.indexActividad = prm['index'];
    });
    this.getRol();
    this.loadSeguimiento();
    this.trimestreSelected = false;
  }

  ngOnInit(): void {
    this.formReportarPeriodo = this.formBuilder.group({
      trimestre: ['', Validators.required]
    });
  }

  getRol(){
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  generarTrimestre(){
    let auxTrimestre = this.trimestres[this.trimestres.length -1];
    console.log(this.trimestre)
    this.router.navigate(['pages/seguimiento/generar-trimestre/' + this.plan_id +  '/'+ this.indexActividad + '/' + this.trimestre.Id])
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
        this.trimestre = data.Data[data.Data.length-1]
        console.log(data)
        this.trimestres.push(this.trimestre.ParametroId);
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

  onChangeT(trimestre){
    if(trimestre == undefined){
      this.trimestreSelected = false;
      this.trimestre = undefined;
    }else{
      this.trimestreSelected = true;
    }
  }
}
