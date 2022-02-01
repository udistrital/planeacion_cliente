import { Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './gestion-seguimiento.component.html',
  styleUrls: ['./gestion-seguimiento.component.scss']
})
export class SeguimientoComponentGestion implements OnInit {
  displayedColumns: string[] = ['id', 'unidad', 'estado', 'vigencia', 'periodo', 'seguimiento', 'observaciones', 'enviar'];
  dataSource: MatTableDataSource<any>;
  plan_id: string;
  unidad: any;
  plan: any;
  estado : any;
  actividadesGenerales : any[];
  formGestionSeguimiento: FormGroup;



  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request : RequestManager

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
    });
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
    this.request.get(environment.PRUEBA, `seguimiento/get_actividades/`+ this.plan_id).subscribe((data: any) => {
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
    if(event != undefined){
      this.formGestionSeguimiento.get('actividad').setValue(event.dato);
    }else{
      this.formGestionSeguimiento.get('actividad').setValue("");
    }
  }
}
