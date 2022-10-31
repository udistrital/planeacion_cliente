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
import { Location } from '@angular/common';
import { DataSource } from '@angular/cdk/collections';

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
  plan: any;
  estado: any;
  actividadesGenerales: any[];
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
    this.loadDataPlan();
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
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  // getSeguimiento() {
  //   this.request.get(environment.PLANES_CRUD, `seguimiento?query=plan_id:` + this.planId + `,periodo_id:` + this.trimestreId).subscribe((data: any) => {
  //     if (data.Data) {
  //       this.seguimiento= data.Data[0];
  //     }
  //   }, (error) => {
  //     Swal.fire({
  //       title: 'Error en la operación',
  //       text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
  //       icon: 'warning',
  //       showConfirmButton: false,
  //       timer: 2500
  //     })
  //   })
  // }

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

  loadDataPlan() {
    this.request.get(environment.PLANES_CRUD, `plan?query=_id:` + this.planId).subscribe((data: any) => {
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

  loadEstado(estado_id) {
    this.request.get(environment.PLANES_CRUD, `estado-plan?query=_id:` + estado_id).subscribe((data: any) => {
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

  loadUnidad(dependencia_id) {
    this.request.get(environment.OIKOS_SERVICE, `dependencia?query=Id:` + dependencia_id).subscribe((data: any) => {
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

  loadActividades() {
    this.request.get(environment.PLANES_MID, `seguimiento/get_actividades/` + this.planId).subscribe((data: any) => {
      if (data) {
        if (this.rol == 'JEFE_DEPENDENCIA') {
          this.actividadesGenerales = data.Data;
          this.dataSource.data = data.Data;
        } else if (this.rol == 'PLANEACION') {
          this.dataSource.data = data.Data;
          this.cambiarValor("activo", true, "Activo", this.dataSource.data)
          this.cambiarValor("activo", false, "Inactivo", this.dataSource.data)
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

  cambiarValor(valorABuscar, valorViejo, valorNuevo, dataS) {
    dataS.forEach(function (elemento) {
      elemento[valorABuscar] = elemento[valorABuscar] == valorViejo ? valorNuevo : elemento[valorABuscar]
    })
  }

  onChangeA(event) {
    if (event != undefined) {
      this.formGestionSeguimiento.get('actividad').setValue(event.dato);
      this.loadDataActividad(event.index);
    } else {
      this.formGestionSeguimiento.get('actividad').setValue("");
      this.formGestionSeguimiento.get('lineamiento').setValue("");
      this.formGestionSeguimiento.get('meta_estrategica').setValue("");
      this.formGestionSeguimiento.get('estrategia').setValue("");
      this.formGestionSeguimiento.get('tarea').setValue("");
      this.indicadores = [{ index: 1, dato: '', activo: false }];
      this.metas = [{ index: 1, dato: '', activo: false }];
      this.indexActividad = '';
    }
  }

  loadDataActividad(index) {
    this.request.get(environment.PLANES_MID, `seguimiento/get_data/` + this.planId + `/` + index).subscribe((data: any) => {
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

  reportar() {
    this.router.navigate(['pages/seguimiento/reportar-periodo/' + this.planId + '/' + this.indexActividad]);
  }

  revisar(row) {
    this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,plan_id:` + this.planId).subscribe((data: any) => {
      if (data.Data.length != 0) {
        let seguimiento = data.Data[data.Data.length - 1]
        this.loadTrimestre(seguimiento.periodo_seguimiento_id, row);
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
    /* this.router.navigate(['pages/seguimiento/reportar-periodo/' + this.planId + '/'+ row.index]); */
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
