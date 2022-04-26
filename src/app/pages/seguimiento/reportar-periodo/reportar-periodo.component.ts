import { Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Location } from '@angular/common';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './reportar-periodo.component.html',
  styleUrls: ['./reportar-periodo.component.scss']
})
export class ReportarPeriodoComponent implements OnInit {
  displayedColumns: string[] = ['id', 'unidad', 'estado', 'vigencia', 'periodo', 'seguimiento', 'observaciones', 'enviar'];
  dataSource: MatTableDataSource<any>;
  rol: string;
  planId: string;
  indexActividad: string;
  formReportarPeriodo: FormGroup;
  dataActividad: any;
  indicadores: any[] = [{ index: 1, dato: '', activo: false }];
  metas: any[] = [{ index: 1, dato: '', activo: false }];
  trimestres: any[] = [];
  trimestreSelected: boolean;
  trimestre: any;
  listIndicadores: any = {};
  generalDatar: any = {};
  trimestreId: string;
  avanceAcumuladoResumen: any;
  avancePeriodoResumen: any;
  objetoPeriodoRes: any = [];
  objetoAcumuladoRes: any = [];
  periodoRes: any;
  acumuladoRes: any;

  constructor(
    private autenticationService: ImplicitAutenticationService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private router: Router,
    private _location: Location
  ) {
    this.activatedRoute.params.subscribe(prm => {
      this.planId = prm['plan_id'];
      this.indexActividad = prm['index'];
      // this.trimestreId = prm['trimestre_id'];
    });
    this.getRol();
    this.loadSeguimiento();
    this.trimestreSelected = false;
    if (this.rol == 'PLANEACION') {
      this.loadDataActividad();
    }
  }

  ngOnInit(): void {
    this.loadResumen()
    this.formReportarPeriodo = this.formBuilder.group({
      trimestre: ['', Validators.required],
      unidad: ['', Validators.required],
      estado: ['', Validators.required],
      plan: ['', Validators.required],
      actividad: ['', Validators.required],
      lineamiento: ['', Validators.required],
      meta_estrategica: ['', Validators.required],
      estrategia: ['', Validators.required],
      tarea: ['', Validators.required],
      avancePeriodo: ['', Validators.required],
      avanceAcumulado: ['', Validators.required]

    });

  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }


  generarTrimestre() {
    this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,plan_id:` + this.planId + `,periodo_id:` + this.trimestre.Id).subscribe((data: any) => {
      if (data.Data.length != 0) {
        let seguimiento = data.Data[0];
        let auxFecha = new Date();
        let auxFechaCol = auxFecha.toLocaleString('en-US', { timeZone: 'America/Mexico_City' })
        let strFechaHoy = new Date(auxFechaCol).toISOString();
        let fechaHoy = new Date(strFechaHoy);
        let fechaInicio = new Date(seguimiento["fecha_inicio"]);
        let fechaFin = new Date(seguimiento["fecha_fin"]);
        if (fechaHoy >= fechaInicio && fechaHoy <= fechaFin) {
          let auxTrimestre = this.trimestres[this.trimestres.length - 1];
          this.router.navigate(['pages/seguimiento/generar-trimestre/' + this.planId + '/' + this.indexActividad + '/' + this.trimestre.Id])
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

  backClicked() {
    this._location.back();
  }

  // trimestre(){
  //   window.location.href = '#/pages/seguimiento/generar-trimestre';
  // }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadSeguimiento() {
    this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,plan_id:` + this.planId).subscribe((data: any) => {
      if (data.Data.length != 0) {
        let seguimiento = data.Data[data.Data.length - 1]
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

  loadTrimestre(periodo_id) {
    this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=Id:` + periodo_id).subscribe((data: any) => {
      if (data) {
        this.trimestre = data.Data[data.Data.length - 1]
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


  loadResumen() {
    this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,plan_id:` + this.planId).subscribe((data: any) => {
      if (data.Data.length != 0) {
        let seguimientor = data.Data[data.Data.length - 1]
        this.trimestreId = seguimientor.periodo_id;

        this.request.get(environment.PLANES_MID, `seguimiento/get_indicadores/` + this.planId).subscribe((data: any) => {
          if (data) {
            this.listIndicadores = data.Data;
            this.avanceAcumuladoResumen = 0;
            this.avancePeriodoResumen = 0;
            // var pruebita;
            for (let indicador of this.listIndicadores) {
              let reg = / /g;
              let primerDatoAcumu = indicador.nombre;
              let datoIdentir = {
                "plan_id": this.planId,
                "periodo_id": this.trimestreId,
                "index": this.indexActividad,
                "Nombre_del_indicador": primerDatoAcumu.replace(reg, '_'),
                "avancePeriodo": "2"
              }
              this.request.post(environment.PLANES_MID, `seguimiento/get_avance/`, datoIdentir).subscribe((dataPr: any) => {
                if (dataPr) {
                  this.generalDatar = dataPr.Data;
                  this.avanceAcumuladoResumen = this.avanceAcumuladoResumen + parseFloat(this.generalDatar.avanceAcumuladoPrev);
                  this.avancePeriodoResumen = this.avancePeriodoResumen + parseFloat(this.generalDatar.avancePeriodoPrev);
                  if (this.generalDatar.nombrePeriodo == "T1") {
                    this.formReportarPeriodo.get('trimestre').setValue("Trimestre Uno");
                  }
                  if (this.generalDatar.nombrePeriodo == "T2") {
                    this.formReportarPeriodo.get('trimestre').setValue("Trimestre Dos");
                  }
                  if (this.generalDatar.nombrePeriodo == "T3") {
                    this.formReportarPeriodo.get('trimestre').setValue("Trimestre Tres");
                  }
                  if (this.generalDatar.nombrePeriodo == "T4") {
                    this.formReportarPeriodo.get('trimestre').setValue("Trimestre Cuatro");
                  }
                  if (this.listIndicadores.length == 1) {
                    this.formReportarPeriodo.get('avanceAcumulado').setValue(this.avanceAcumuladoResumen + "%");
                    this.formReportarPeriodo.get('avancePeriodo').setValue(this.avancePeriodoResumen + "%");
                  } else if (this.listIndicadores.length == 2) {
                    var objetoPeriodoResumen = [
                      this.avancePeriodoResumen
                    ]
                    this.objetoPeriodoRes.push(objetoPeriodoResumen);
                    this.periodoRes = (this.objetoPeriodoRes[1]) / 2;
                    var objetoAcumuladoResumen = [
                      this.avanceAcumuladoResumen
                    ]
                    this.objetoAcumuladoRes.push(objetoAcumuladoResumen);
                    this.acumuladoRes = (this.objetoAcumuladoRes[1]) / 2;
                    this.formReportarPeriodo.get('avancePeriodo').setValue(this.periodoRes + "%");
                    this.formReportarPeriodo.get('avanceAcumulado').setValue(this.acumuladoRes + "%");
                  } else {
                    Swal.fire({
                      title: 'Error al cargar el resumen avance. Intente de nuevo',
                      icon: 'warning',
                      showConfirmButton: false,
                      timer: 2500
                    })
                  }

                } else {
                  Swal.fire({
                    title: 'Error al crear identificación. Intente de nuevo',
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 2500
                  })
                }
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

  onChangeT(trimestre) {
    if (trimestre == undefined) {
      this.trimestreSelected = false;
      this.trimestre = undefined;
    } else {
      this.trimestreSelected = true;
    }
  }

  loadDataActividad() {
    this.request.get(environment.PLANES_MID, `seguimiento/get_data/` + this.planId + `/` + this.indexActividad).subscribe((data: any) => {
      if (data) {
        this.dataActividad = data.Data
        console.log(data.Data)
        this.formReportarPeriodo.get('actividad').setValue(this.dataActividad.actividad);
        this.formReportarPeriodo.get('lineamiento').setValue(this.dataActividad.lineamiento);
        this.formReportarPeriodo.get('meta_estrategica').setValue(this.dataActividad.meta_estrategica);
        this.formReportarPeriodo.get('estrategia').setValue(this.dataActividad.estrategia);
        this.indicadores = [];
        this.indicadores = this.dataActividad.indicador;
        this.metas = [];
        this.metas = this.dataActividad.meta;
        this.formReportarPeriodo.get('tarea').setValue(this.dataActividad.tarea);
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
