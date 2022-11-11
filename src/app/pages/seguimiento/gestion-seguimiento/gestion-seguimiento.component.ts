import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { Location } from '@angular/common';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './gestion-seguimiento.component.html',
  styleUrls: ['./gestion-seguimiento.component.scss']
})
export class SeguimientoComponentGestion implements OnInit {
  displayedColumns: string[] = ['index', 'dato', 'activo', 'gestion'];
  dataSource: MatTableDataSource<any>;
  planId: string;
  trimestreId: string;
  unidad: any;
  estadoSeguimiento: any;
  formGestionSeguimiento: FormGroup;
  dataActividad: any;
  rol: string;
  indicadores: any[] = [{ index: 1, dato: '', activo: false }];
  metas: any[] = [{ index: 1, dato: '', activo: false }];
  indexActividad: string = '';
  fechaModificacion: string = '';
  seguimiento: any;
  trimestre: any;
  trimestres: any[] = [];

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private router: Router,
    private _location: Location
  ) {
    activatedRoute.params.subscribe(prm => {
      this.planId = prm['plan_id'];
      this.trimestreId = prm['trimestre'];
    });
    this.loadDataSeguimiento();
    this.dataSource = new MatTableDataSource<any>();
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

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  backClicked() {
    if (this._location.getState()["navigationId"] == 2) {
      this.router.navigate(['pages/seguimiento/listar-plan-accion-anual/'])
    } else {
      this._location.back();
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadDataSeguimiento() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `seguimiento/get_estado_trimestre/` + this.planId + `/` + this.trimestreId).subscribe(async (data: any) => {
      if (data) {
        this.estadoSeguimiento = data.Data;
        await this.loadUnidad(this.estadoSeguimiento.plan_id.dependencia_id);
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

  loadUnidad(dependencia_id) {
    this.request.get(environment.OIKOS_SERVICE, `dependencia?query=Id:` + dependencia_id).subscribe((data: any) => {
      if (data) {
        this.unidad = data[0];
        this.formGestionSeguimiento.get('plan').setValue(this.estadoSeguimiento.plan_id.nombre);
        this.formGestionSeguimiento.get('unidad').setValue(this.unidad.Nombre);
        this.formGestionSeguimiento.get('estado').setValue(this.estadoSeguimiento.estado_seguimiento_id.nombre);
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

  loadActividades() {
    this.request.get(environment.PLANES_MID, `seguimiento/get_actividades/` + this.estadoSeguimiento._id).subscribe((data: any) => {
      if (data) {
        this.dataSource.data = data.Data;
        Swal.close();
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

  reportar() {
    this.router.navigate(['pages/seguimiento/reportar-periodo/' + this.planId + '/' + this.indexActividad]);
  }

  revisar(row) {
    let auxFecha = new Date();
    let auxFechaCol = auxFecha.toLocaleString('en-US', { timeZone: 'America/Mexico_City' })
    let strFechaHoy = new Date(auxFechaCol).toISOString();
    let fechaHoy = new Date(strFechaHoy);
    let fechaInicio = new Date(this.estadoSeguimiento.periodo_seguimiento_id["fecha_inicio"]);
    let fechaFin = new Date(this.estadoSeguimiento.periodo_seguimiento_id["fecha_fin"]);

    if (fechaHoy >= fechaInicio && fechaHoy <= fechaFin) {
      this.router.navigate(['pages/seguimiento/generar-trimestre/' + this.planId + '/' + row.index + '/' + this.estadoSeguimiento.periodo_seguimiento_id["_id"]])
    } else {
      Swal.fire({
        title: 'Error en la operación',
        text: `Está intentando acceder al seguimiento por fuera de las fechas establecidas`,
        icon: 'warning',
        showConfirmButton: true,
        timer: 10000
      })
    }
  }

  loadTrimestre(periodo_id, row) {
    this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=Id:` + periodo_id).subscribe((data: any) => {
      if (data) {
        this.trimestre = data.Data[data.Data.length - 1]
        this.trimestres.push(this.trimestre.ParametroId);
        this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,plan_id:` + this.planId + `,periodo_seguimiento_id:` + this.trimestre.Id).subscribe((data: any) => {
          if (data.Data.length != 0) {
            let seguimiento = data.Data[0];
            let auxFecha = new Date();
            let auxFechaCol = auxFecha.toLocaleString('en-US', { timeZone: 'America/Mexico_City' })
            let strFechaHoy = new Date(auxFechaCol).toISOString();
            let fechaHoy = new Date(strFechaHoy);
            let fechaInicio = new Date(seguimiento["fecha_inicio"]);
            let fechaFin = new Date(seguimiento["fecha_fin"]);
            if (fechaHoy >= fechaInicio && fechaHoy <= fechaFin) {
              this.router.navigate(['pages/seguimiento/generar-trimestre/' + this.planId + '/' + row.index + '/' + this.trimestre.Id])
            } else {
              Swal.fire({
                title: 'Error en la operación',
                text: `Está intentando acceder al seguimiento por fuera de las fechas establecidas`,
                icon: 'warning',
                showConfirmButton: true,
                timer: 10000
              })
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
