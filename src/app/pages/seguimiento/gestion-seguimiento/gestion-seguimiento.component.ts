import { Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './gestion-seguimiento.component.html',
  styleUrls: ['./gestion-seguimiento.component.scss']
})
export class SeguimientoComponentGestion implements OnInit {
  displayedColumns: string[] = ['id', 'actividad', 'estado', 'fecha', 'gestion'];
  dataSource: MatTableDataSource<any>;
  plan_id: string;
  unidad: any;
  plan: any;
  estado : any;
  actividadesGenerales : any[];
  formGestionSeguimiento: FormGroup;
  dataActividad : any
  rol: string;
  indicadores : any[] = [{index: 1, dato:'', activo:false}];
  metas : any[] = [{index: 1, dato:'', activo:false}];
  indexActividad : string = '';

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request : RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private router: Router,

  ) {
    activatedRoute.params.subscribe(prm => {
      this.plan_id = prm['plan_id'];
    });
    this.loadDataPlan();
  }

  ngOnInit(): void {
    this.formGestionSeguimiento = this.formBuilder.group({
      unidad: ['', Validators.required],
      estado: ['', Validators.required],
      plan: ['', Validators.required],
      actividad: ['', Validators.required],
      lineamiento: ['', Validators.required],
      meta_estrategica: ['', Validators.required],
      estrategia: ['', Validators.required],
      tarea: ['', Validators.required],
    });
    this.getRol();
  }


  getRol(){
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadDataPlan(){
    this.request.get(environment.PLANES_CRUD, `plan?query=_id:`+ this.plan_id).subscribe((data: any) => {
      if (data) {
        this.plan = data.Data[0];
        this.loadEstado(this.plan.estado_plan_id);
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

  loadEstado(estado_id){
    this.request.get(environment.PLANES_CRUD, `estado-plan?query=_id:`+ estado_id).subscribe((data: any) => {
      if (data) {
        this.estado = data.Data[0];
        this.loadUnidad(this.plan.dependencia_id);
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

  loadUnidad(dependencia_id){
    this.request.get(environment.OIKOS_SERVICE, `dependencia?query=Id:`+ dependencia_id).subscribe((data: any) => {
      if (data) {
        this.unidad = data[0];
        this.formGestionSeguimiento.get('plan').setValue(this.plan.nombre);
        this.formGestionSeguimiento.get('unidad').setValue(this.unidad.Nombre);
        this.formGestionSeguimiento.get('estado').setValue(this.estado.nombre);
        this.loadActividades();
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

  loadActividades(){
    this.request.get(environment.PLANES_MID, `seguimiento/get_actividades/`+ this.plan_id).subscribe((data: any) => {
      if (data) {
        this.actividadesGenerales = data.Data;
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

  onChangeA(event){
    console.log(event)
    if(event != undefined){
      this.formGestionSeguimiento.get('actividad').setValue(event.dato);
      this.loadDataActividad(event.index);
    }else{
      this.formGestionSeguimiento.get('actividad').setValue("");
      this.formGestionSeguimiento.get('lineamiento').setValue("");
      this.formGestionSeguimiento.get('meta_estrategica').setValue("");
      this.formGestionSeguimiento.get('estrategia').setValue("");
      this.formGestionSeguimiento.get('tarea').setValue("");
      this.indicadores = [{index: 1, dato:'', activo:false}];
      this.metas = [{index: 1, dato:'', activo:false}];
      this.indexActividad = '';
    }
  }

  loadDataActividad(index){
    this.request.get(environment.PRUEBA, `seguimiento/get_data/`+ this.plan_id + `/`+ index ).subscribe((data: any) => {
      if (data) {
        this.dataActividad = data.Data
        this.formGestionSeguimiento.get('lineamiento').setValue(this.dataActividad.lineamiento);
        this.formGestionSeguimiento.get('meta_estrategica').setValue(this.dataActividad.meta_estrategica);
        this.formGestionSeguimiento.get('estrategia').setValue(this.dataActividad.estrategia);
        this.indicadores = [];
        this.indicadores = this.dataActividad.indicador;
        this.metas = [];
        this.metas = this.dataActividad.meta;
        this.formGestionSeguimiento.get('tarea').setValue(this.dataActividad.tarea);
        this.indexActividad = index;
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

  reportar(){
    console.log("reportar")
    this.router.navigate(['pages/seguimiento/reportar-periodo/' + this.plan_id + '/'+ this.indexActividad]);
  }
}
