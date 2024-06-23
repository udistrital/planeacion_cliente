import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import { Notificaciones } from "../../services/notificaciones";
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { Location } from '@angular/common';
import { PageEvent } from '@angular/material/paginator';
import { VerificarFormulario } from '../../services/verificarFormulario'
import { Subscription } from 'rxjs';
import * as bigInt from 'big-integer';
@Component({
  selector: 'app-seguimiento',
  templateUrl: './gestion-seguimiento.component.html',
  styleUrls: ['./gestion-seguimiento.component.scss']
})
export class SeguimientoComponentGestion implements OnInit {
  displayedColumns: string[] = ['idactividad', 'index', 'dato', 'activo', 'gestion'];
  dataSource: MatTableDataSource<any>;
  planId: string;
  trimestreId: string;
  unidad: any;
  vigencia: any;
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
  codigoNotificacion: string = '';
  private miObservableSubscription: Subscription;

  constructor(
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private notificacionesService: Notificaciones,
    private autenticationService: ImplicitAutenticationService,
    private router: Router,
    private _location: Location,
    private verificarFormulario: VerificarFormulario
  ) {}

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
    this.activatedRoute.params.subscribe(prm => {
      this.planId = prm['plan_id'];
      this.trimestreId = prm['trimestre'];
      this.loadDataSeguimiento();
    });
    this.dataSource = new MatTableDataSource<any>();
  }
  ngAfterViewInit() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
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
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'ASISTENTE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    } else if (roles.__zone_symbol__value.find(x => x == 'ASISTENTE_PLANEACION')) {
      this.rol = 'ASISTENTE_PLANEACION'
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

  enviarNotificacion(){
    if (this.codigoNotificacion != "") {
      // Bifurcación en estado En revisión JU
      if (this.codigoNotificacion === 'SERJU') {
        const estadoPlanMap = {'Revisión Verificada con Observaciones': "SERJU1", 'Revisión Verificada': "SERJU2"};
        this.codigoNotificacion = estadoPlanMap[this.estado];
      }

      // Bifurcación en estado 'En revisión OAPC'
      if (this.codigoNotificacion === "SEROAPC") {
        const estadoPlanMap = {'Con observaciones': "SEROAPC1", 'Reporte Avalado': "SEROAPC2"};
        this.codigoNotificacion = estadoPlanMap[this.estado];
      }

      let datos = {
        codigo: this.codigoNotificacion,
        id_unidad: this.unidad.Id,
        nombre_unidad: this.unidad.Nombre,
        nombre_plan: this.seguimiento.plan_id.nombre,
        nombre_vigencia: this.vigencia.Nombre,
        trimestre: this.trimestreId
      }
      this.codigoNotificacion = "";
      this.notificacionesService.enviarNotificacion(datos)
    }
  }

  loadDataSeguimiento() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `seguimiento/get_estado_trimestre/` + this.planId + `/` + this.trimestreId).subscribe(async (data: any) => {
      if (data) {
        this.seguimiento = data.Data;
        this.planId = this.planId;
        this.estado = this.seguimiento.estado_seguimiento_id.nombre;
        await this.loadUnidad(this.seguimiento.plan_id.dependencia_id);
        this.loadVigencia(this.seguimiento.plan_id.vigencia)
        this.enviarNotificacion();
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

  loadVigencia(vigencia_id) {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,Id:${vigencia_id},activo:true`)
      .subscribe(
        (data: any) => {
          if (data) {
            this.vigencia = data.Data[0];
          }
        }, (error) => {}
      )
  }

  loadUnidad(dependencia_id) {
    this.request.get(environment.OIKOS_SERVICE, `dependencia?query=Id:` + dependencia_id).subscribe(async (data: any) => {
      if (data) {
        this.unidad = data[0];
        this.formGestionSeguimiento.get('plan').setValue(this.seguimiento.plan_id.nombre);
        this.formGestionSeguimiento.get('unidad').setValue(this.unidad.Nombre);
        this.formGestionSeguimiento.get('estado').setValue(this.seguimiento.estado_seguimiento_id.nombre);
        await this.loadActividades();
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


  async loadActividades() {
    await new Promise((resolve) => {
      this.request
        .get(environment.PLANES_MID, `seguimiento/get_actividades/` + this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            for (let index = 0; index < data.Data.length; index++) {
              const actividad = data.Data[index];
              if (actividad.estado.nombre == "Con observaciones") {
                data.Data[index].estado.color = "conObservacion";
              }
              if (actividad.estado.nombre == "Actividad avalada" || actividad.estado.nombre == "Actividad Verificada") {
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
        });
    });
    // this.request.get(environment.PLANES_MID, `seguimiento/get_actividades/` + this.seguimiento._id).subscribe((data: any) => {
    //   if (data) {

    //     for (let index = 0; index < data.Data.length; index++) {
    //       const actividad = data.Data[index];
    //       if (actividad.estado.nombre == "Con observaciones") {
    //         data.Data[index].estado.color = "conObservacion";
    //       }
    //       if (actividad.estado.nombre == "Actividad avalada" || actividad.estado.nombre == "Actividad Verificada") {
    //         data.Data[index].estado.color = "avalada";
    //       }
    //     }
    //     this.dataSource.data = data.Data;
    //     this.allActividades = this.dataSource.data;
    //     Swal.close();
    //   }
    // }, (error) => {
    //   Swal.fire({
    //     title: 'Error en la operación',
    //     text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
    //     icon: 'warning',
    //     showConfirmButton: false,
    //     timer: 2500
    //   })
    // })
  }


  reportar() {
    Swal.fire({
      title: 'Enviar Reporte',
      text: `¿Confirma que desea enviar el reporte de seguimiento para su etapa de verificación por parte del Jefe de Dependencia?`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/reportar_seguimiento`, "{}", this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            if (data.Success) {
              if (this.estado == 'En reporte') {
                this.codigoNotificacion = "SER"; // NOTIFICACION(SER)
              } else if (this.estado == 'Revisión Verificada con Observaciones') {
                this.codigoNotificacion = "SRVCO"; // NOTIFICACION(SRVCO)
              } else if (this.estado == 'Con observaciones') {
                this.codigoNotificacion = "SCO"; // NOTIFICACION(SCO)
              }
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

  async finalizarRevision() {
    if (await this.validacionActividades() && this.rol === 'ASISTENTE_PLANEACION') { 
      /* Si todas las actividades están avaladas y el rol es ASISTENTE_PLANEACION
      NO se puede finalizar la revisión (Avalar Reporte) debe hacerlo el rol PLANEACION. */
      Swal.fire({
        title: 'Finalización de revisión cancelada',
        text: `Solo el JEFE_PLANEACION puede avalar el reporte de seguimiento`,
        icon: 'error',
        showConfirmButton: false,
        timer: 3500
      });
      return;
    }
    Swal.fire({
      title: 'Finalizar revisión',
      text: `¿Confirma que desea finalizar la revisión del seguimiento al Plan de Acción?`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/revision_seguimiento`, "{}", this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            if (data.Success) {
              this.codigoNotificacion = "SEROAPC"; // NOTIFICACION(SEROAPC)
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
          title: 'Finalización de revisión cancelada',
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

  finalizarRevisionJefeDependencia() {
    Swal.fire({
      title: 'Finalizar revisión',
      text: `¿Confirma que desea finalizar la revisión del seguimiento al Plan de Acción?`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/revision_seguimiento_jefe_dependencia`, "{}", this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            if (data.Success) {
              this.codigoNotificacion = "SERJU" // NOTIFICACION(SERJU)
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
          title: 'Finalización de revisión cancelada',
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

    if ((fechaHoy >= fechaInicio && fechaHoy <= fechaFin) || row.estado.nombre == "Actividad avalada" || (this.rol == 'PLANEACION' || this.rol == 'ASISTENTE_PLANEACION')) {
      this.router.navigate(['pages/seguimiento/generar-trimestre/' + this.planId + '/' + row.index + '/' + this.seguimiento.periodo_seguimiento_id["_id"]])
    } else {
      Swal.fire({
        title: 'Error en la operación',
        text: `Está intentando acceder al seguimiento por fuera de las fechas establecidas`,
        icon: 'warning',
        showConfirmButton: true,
        allowOutsideClick: false,
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
                allowOutsideClick: false,
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

  iniciarRevisionJefeUnidad() {
    Swal.fire({
      title: 'Iniciar Revisión',
      text: `Esta a punto de iniciar la revisión para este Plan`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.get(environment.PLANES_CRUD, `estado-seguimiento?query=activo:true,codigo_abreviacion:RJU`).subscribe((data: any) => {
          if (data) {
            this.seguimiento.estado_seguimiento_id = data.Data[0]._id;;
            this.request.put(environment.PLANES_CRUD, `seguimiento`, this.seguimiento, this.seguimiento._id).subscribe((data: any) => {
              if (data) {
                this.codigoNotificacion = "SEAR" // NOTIFICACION(SEAR)
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

  iniciarRevision() {
    Swal.fire({
      title: 'Iniciar Revisión',
      text: `Esta a punto de iniciar la revisión para este Plan`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.seguimiento.estado_seguimiento_id = "622ba46d16511e32535c326b"
        this.request.put(environment.PLANES_CRUD, `seguimiento`, this.seguimiento, this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            this.codigoNotificacion = "SRV"; // NOTIFICACION(SRV)
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
      showCancelButton: true,
      allowOutsideClick: false,
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
                  allowOutsideClick: false,
                  html: message
                })
              } else {
                Swal.fire({
                  title: 'Debe revisar las observaciones de las siguientes actividades:',
                  icon: 'error',
                  showConfirmButton: true,
                  allowOutsideClick: false,
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

  async validacionActividades() {
    let actividadesSeguimiento = this.allActividades;
    let aux = true;
    let actividadAvalada;
    await new Promise((resolve) => {
      this.request
        .get(
          environment.PLANES_CRUD,
          `estado-seguimiento?query=codigo_abreviacion:AAV,activo:true`
        ).subscribe((data: any) => {
          if (data?.Data) {
            actividadAvalada = data.Data[0]
            resolve(actividadAvalada);
          }
        });
    });
    actividadesSeguimiento.forEach(actividad => {
      if (actividad.estado.id != actividadAvalada._id) {
        aux = false;
      }
    });
    return aux;
  }

  getShortenedPlanId(): string {
    return this.planId ? this.planId.substring(0, 6) : '';
  }
}


