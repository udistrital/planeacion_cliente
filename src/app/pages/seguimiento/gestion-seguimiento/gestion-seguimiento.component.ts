import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { Location } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { VerificarFormulario } from '../../services/verificarFormulario'
import { Subscription } from 'rxjs';

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
  seguimiento: any;
  formGestionSeguimiento: FormGroup;
  dataActividad: any;
  rol: string;
  indicadores: any[] = [{ index: 1, dato: '', activo: false }];
  metas: any[] = [{ index: 1, dato: '', activo: false }];
  indexActividad: string = '';
  fechaModificacion: string = '';
  trimestre: any;
  trimestres: any[] = [];
  allActividades: any[];
  estado: string;
  private miObservableSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private router: Router,
    private _location: Location,
    private verificarFormulario: VerificarFormulario
  ) {
    activatedRoute.params.subscribe(prm => {
      this.planId = prm['plan_id'];
      this.trimestreId = prm['trimestre'];
    });
    this.dataSource = new MatTableDataSource<any>();
    this.loadDataSeguimiento();
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

  ngAfterViewInit() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
  }

  ngOnDestroy() {
    if (this.verificarFormulario.estadoLista$) {
      this.verificarFormulario.setEstadoLista(false);
    }
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    } else if (roles.__zone_symbol__value.find(x => x == 'JEFE_UNIDAD_PLANEACION')) {
      this.rol = 'JEFE_UNIDAD_PLANEACION'
    }
  }

  backClicked() {
    this.miObservableSubscription = this.verificarFormulario.estadoLista$.subscribe(estadoLista => {
      if (estadoLista === true) {
        this.router.navigate(['pages/pendientes-seguimiento/'])
      } else {
        this.router.navigate(['pages/seguimiento/listar-plan-accion-anual/'])
      }
    });
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
        this.seguimiento = data.Data;
        this.estado = this.seguimiento.estado_seguimiento_id.nombre;
        await this.loadUnidad(this.seguimiento.plan_id.dependencia_id);
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
        this.formGestionSeguimiento.get('plan').setValue(this.seguimiento.plan_id.nombre);
        this.formGestionSeguimiento.get('unidad').setValue(this.unidad.Nombre);
        this.formGestionSeguimiento.get('estado').setValue(this.seguimiento.estado_seguimiento_id.nombre);
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
    this.request.get(environment.PLANES_MID, `seguimiento/get_actividades/` + this.seguimiento._id).subscribe((data: any) => {
      if (data) {

        for (let index = 0; index < data.Data.length; index++) {
          const actividad = data.Data[index];
          if (actividad.estado.nombre == "Con observaciones") {
            data.Data[index].estado.color = "conObservacion";
          }
          if (actividad.estado.nombre == "Actividad avalada") {
            data.Data[index].estado.color = "avalada";
          }
        }
        this.dataSource.data = data.Data;
        this.allActividades = this.dataSource.data;
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
    Swal.fire({
      title: 'Enviar Reporte',
      text: `¿Confirma que desea enviar el reporte de seguimiento al Plan de Acción para su etapa de revisión por parte de la Oficina Asesora de Planeación y Control?`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/reportar_seguimiento`, "{}", this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            if (data.Success) {
              Swal.fire({
                title: 'El reporte se ha enviado satisfactoriamente',
                icon: 'success',
              }).then((result) => {
                if (result.value) {
                  this.loadDataSeguimiento();
                }
              });
            } else {
              let message: string = '<b>ID - Actividad</b><br/>';
              let aux: object = data.Data.actividades
              let keys: string[];

              keys = Object.keys(aux)
              for (let key of keys) {
                message = message + key + ' - ' + aux[key] + "<br/>"
              }

              if (this.estado != 'Con observaciones') {
                Swal.fire({
                  title: 'Debe reportar las siguientes actividades:',
                  icon: 'error',
                  showConfirmButton: true,
                  html: message
                })
              } else {
                Swal.fire({
                  title: 'Debe revisar las observaciones de las siguientes actividades:',
                  icon: 'error',
                  showConfirmButton: true,
                  html: message
                })
              }
            }
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Generación de reporte cancelada',
          icon: 'error',
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

  finalizarRevision() {
    Swal.fire({
      title: 'Finalizar revisión',
      text: `¿Confirma que desea finalizar la revisión del seguimiento al Plan de Acción?`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/revision_seguimiento`, "{}", this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            if (data.Success) {
              Swal.fire({
                title: 'El reporte se ha enviado satisfactoriamente',
                icon: 'success',
              }).then((result) => {
                if (result.value) {
                  this.loadDataSeguimiento();
                }
              });
            } else {
              let message: string = '<b>ID - Actividad</b><br/>';
              let aux: object = data.Data.actividades
              let keys: string[];

              keys = Object.keys(aux)
              for (let key of keys) {
                message = message + key + ' - ' + aux[key] + "<br/>"
              }

              Swal.fire({
                title: 'Actividades sin revisar',
                icon: 'error',
                showConfirmButton: true,
                html: 'Debe avalar o realizar las observaciones a las siguientes actividades:<br/>' + message
              })
            }
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Finalizalización de revisión cancelada',
          icon: 'error',
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

  revisar(row) {
    let auxFecha = new Date();
    let auxFechaCol = auxFecha.toLocaleString('en-US', { timeZone: 'America/Mexico_City' })
    let strFechaHoy = new Date(auxFechaCol).toISOString();
    let fechaHoy = new Date(strFechaHoy);
    let fechaInicio = new Date(this.seguimiento.periodo_seguimiento_id["fecha_inicio"].replace("Z", ""));
    let fechaFin = new Date(this.seguimiento.periodo_seguimiento_id["fecha_fin"].replace("Z", ""));

    if ((fechaHoy >= fechaInicio && fechaHoy <= fechaFin) || row.estado.nombre == "Actividad avalada" || this.rol == 'PLANEACION') {
      this.router.navigate(['pages/seguimiento/generar-trimestre/' + this.planId + '/' + row.index + '/' + this.seguimiento.periodo_seguimiento_id["_id"]])
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
            let fechaInicio = new Date(seguimiento["fecha_inicio"].replace("Z", ""));
            let fechaFin = new Date(seguimiento["fecha_fin"].replace("Z", ""));
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

  OnPageChange(event: PageEvent) {
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.allActividades.length) {
      endIndex = this.allActividades.length;
    }
    this.dataSource.data = this.allActividades.slice(startIndex, endIndex);
    this.dataSource.data.length = this.allActividades.length;
  }

  iniciarRevision() {
    Swal.fire({
      title: 'Iniciar Revisión',
      text: `Esta a punto de iniciar la revisión para este Plan`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.seguimiento.estado_seguimiento_id = "622ba46d16511e32535c326b"
        this.request.put(environment.PLANES_CRUD, `seguimiento`, this.seguimiento, this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Seguimiento en revisión',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.loadDataSeguimiento();
              }
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Inicio de revisión cancelado',
          icon: 'error',
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

  verificarRevision() {
    Swal.fire({
      title: 'Verificar revisión',
      text: `¿Confirma que desea verificar la revisión del seguimiento al Plan de Acción?`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/verificar_seguimiento`, "{}", this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            if (data.Success) {
              Swal.fire({
                title: 'El reporte se ha enviado satisfactoriamente',
                icon: 'success',
              }).then((result) => {
                if (result.value) {
                  this.loadDataSeguimiento();
                }
              });
            } else {
              let message: string = '<b>ID - Actividad</b><br/>';
              let aux: object = data.Data.actividades
              let keys: string[];

              keys = Object.keys(aux)
              for (let key of keys) {
                message = message + key + ' - ' + aux[key] + "<br/>"
              }

              if (this.estado != 'Con observaciones') {
                Swal.fire({
                  title: 'Debe reportar las siguientes actividades:',
                  icon: 'error',
                  showConfirmButton: true,
                  html: message
                })
              } else {
                Swal.fire({
                  title: 'Debe revisar las observaciones de las siguientes actividades:',
                  icon: 'error',
                  showConfirmButton: true,
                  html: message
                })
              }
            }
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Verificación de revisión cancelada',
          icon: 'error',
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
