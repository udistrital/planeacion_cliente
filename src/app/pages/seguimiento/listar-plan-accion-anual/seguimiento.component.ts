import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { UserService } from '../../services/userService';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.scss']
})
export class SeguimientoComponentList implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['unidad', 'vigencia', 'estado', 'periodo', 'seguimiento'];
  displayedColumnsPL: string[] = ['unidad', 'vigencia', 'estado', 'periodo', 'seguimiento'];
  dataSource: MatTableDataSource<any>;
  planes: any[];
  allPlanes: any[] = [];
  unidades: any[] = [];
  auxUnidades: any[] = [];
  auxPlanes: any[] = [];
  auxEstadosPlanes: any[] = [];
  auxEstadosSeguimientos: any[] = [];
  auxPeriodos: any[] = [];
  trimestres = { t1: {}, t2: {}, t3: {}, t4: {} }
  unidadSelected: boolean;
  unidad: any = { nombre: "" };
  vigencias: any[];
  vigenciaSelected: boolean;
  vigencia: any;
  plan: any;
  rol: string;
  periodoHabilitado: boolean;
  formFechas: FormGroup;
  formSelect: FormGroup;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private request: RequestManager,
    private router: Router,
    private autenticationService: ImplicitAutenticationService,
    private userService: UserService,
    private formBuilder: FormBuilder,
  ) {
    this.unidadSelected = false;
    this.getRol();
    if (this.rol != undefined && this.rol == 'PLANEACION') {
      this.loadPeriodos();
    } else if (this.rol != undefined && this.rol == 'JEFE_DEPENDENCIA' || 'ASISTENTE_DEPENDENCIA' || 'JEFE_UNIDAD_PLANEACION') {
      this.loadPeriodos();
      this.validarUnidad();
    }
    this.dataSource = new MatTableDataSource<any>();
  }

  ngAfterViewInit(): void {
    this.dataSource.data = [];
  }

  ngOnInit(): void {
    this.formFechas = this.formBuilder.group({
      fecha1: null,
      fecha2: null,
      fecha3: null,
      fecha4: null,
      fecha5: null,
      fecha6: null,
      fecha7: null,
      fecha8: null
    });
    this.formSelect = this.formBuilder.group({
      selectUnidad: ['',],
    });
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find((x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA'))) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    } else if (roles.__zone_symbol__value.find(x => x == 'JEFE_UNIDAD_PLANEACION')) {
      this.rol = 'JEFE_UNIDAD_PLANEACION'
    }
  }

  validarUnidad() {
    this.userService.user$.subscribe((data) => {
      this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion/?query=Numero:` + data['userService']['documento'])
        .subscribe((datosInfoTercero: any) => {
          this.request.get(environment.PLANES_MID, `formulacion/vinculacion_tercero/` + datosInfoTercero[0].TerceroId.Id)
            .subscribe((vinculacion: any) => {
              this.request.get(environment.OIKOS_SERVICE, `dependencia_tipo_dependencia?query=DependenciaId:` + vinculacion["Data"]["DependenciaId"]).subscribe((dataUnidad: any) => {
                if (dataUnidad) {
                  let unidad = dataUnidad[0]["DependenciaId"]
                  unidad["TipoDependencia"] = dataUnidad[0]["TipoDependenciaId"]["Id"]

                  this.unidades.push(unidad);
                  this.auxUnidades.push(unidad);
                  this.formSelect.get('selectUnidad').setValue(unidad);
                  this.onChangeU(unidad);
                }
              })
            })
        })
    })
  }

  gestion() {
    window.location.href = '#/pages/seguimiento/gestion-seguimiento';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadUnidades() {
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) => {
      if (data) {
        this.unidades = data.Data;
        this.auxUnidades = data.Data;
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

  onKey(value) {
    if (value === "") {
      this.auxUnidades = this.unidades;
    } else {
      this.auxUnidades = this.search(value);
    }
  }

  onKeyP(value) {
    if (value === "") {
      this.auxPlanes = this.planes;
    } else {
      this.auxPlanes = this.searchP(value);
    }
  }

  search(value) {
    let filter = value.toLowerCase();
    if (this.unidades != undefined) {
      return this.unidades.filter(option => option.Nombre.toLowerCase().startsWith(filter));
    }
  }

  searchP(value) {
    let filter = value.toLowerCase();
    if (this.planes != undefined) {
      return this.planes.filter(option => option.nombre.toLowerCase().includes(filter));
    }
  }

  filterPlanes(data) {
    var dataAux = data.filter(e => e.tipo_plan_id != "611af8464a34b3599e3799a2");
    return dataAux.filter(e => e.activo == true);
  }

  loadPeriodos() {
    Swal.fire({
      title: 'Cargando períodos',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data;
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

  loadFechas() {
    if (this.vigencia) {
      Swal.fire({
        title: 'Cargando períodos',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })

      this.request.get(environment.PLANES_MID, `seguimiento/get_periodos/` + this.vigencia.Id).subscribe(async (data: any) => {
        if (data) {
          if (data.Data != "" && data.Data != null) {
            let periodos = data.Data;

            if (periodos.length > 0) {
              this.trimestres = { t1: {}, t2: {}, t3: {}, t4: {} }
              for (let i = 0; i < periodos.length; i++) {
                await this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=tipo_seguimiento_id:61f236f525e40c582a0840d0,periodo_id:` + periodos[i].Id).subscribe((data: any) => {
                  if (data && data.Data != "") {
                    let seguimiento = data.Data[0];

                    let fechaInicio = new Date(seguimiento["fecha_inicio"].replace("Z", ""));
                    let fechaFin = new Date(seguimiento["fecha_fin"].replace("Z", ""));

                    if (i == 0) {
                      this.formFechas.get('fecha1').setValue(fechaInicio.toLocaleDateString());
                      this.formFechas.get('fecha2').setValue(fechaFin.toLocaleDateString());
                      this.trimestres.t1 = { id: seguimiento._id, fecha_inicio: fechaInicio, fecha_fin: fechaFin };
                    } else if (i == 1) {
                      this.formFechas.get('fecha3').setValue(fechaInicio.toLocaleDateString());
                      this.formFechas.get('fecha4').setValue(fechaFin.toLocaleDateString());
                      this.trimestres.t2 = { id: seguimiento._id, fecha_inicio: fechaInicio, fecha_fin: fechaFin };
                    } else if (i == 2) {
                      this.formFechas.get('fecha5').setValue(fechaInicio.toLocaleDateString());
                      this.formFechas.get('fecha6').setValue(fechaFin.toLocaleDateString());
                      this.trimestres.t3 = { id: seguimiento._id, fecha_inicio: fechaInicio, fecha_fin: fechaFin };
                    } else if (i == 3) {
                      this.formFechas.get('fecha7').setValue(fechaInicio.toLocaleDateString());
                      this.formFechas.get('fecha8').setValue(fechaFin.toLocaleDateString());
                      this.trimestres.t4 = { id: seguimiento._id, fecha_inicio: fechaInicio, fecha_fin: fechaFin };
                    }

                    if (Object.keys(this.trimestres.t1).length !== 0 &&
                      Object.keys(this.trimestres.t2).length !== 0 &&
                      Object.keys(this.trimestres.t3).length !== 0 &&
                      Object.keys(this.trimestres.t4).length !== 0) {
                      let datos = this.allPlanes.filter(plan => plan.vigencia == this.vigencia.Nombre);

                      this.dataSource.data = datos;
                      if (this.rol != undefined && this.rol == 'JEFE_DEPENDENCIA' || this.rol == 'JEFE_UNIDAD_PLANEACION') {
                        this.evaluarFechasPlan();
                      }
                      Swal.close();
                    }
                  } else {
                    Swal.fire({
                      title: 'Error en la operación',
                      text: `No se encontraron datos registrados`,
                      icon: 'warning',
                      showConfirmButton: false,
                      timer: 2500
                    });
                    this.limpiarCampoFechas();
                  }
                }, (error) => {
                  Swal.fire({
                    title: 'Error en la operación',
                    text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 2500
                  });
                  this.limpiarCampoFechas();
                })
              }
            } else {
              Swal.fire({
                title: 'Error en la operación',
                text: `No se encuentran tirmestres habilitados para esta vigencia`,
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              });
              this.limpiarCampoFechas();
            }
          } else {
            Swal.fire({
              title: 'Error en la operación',
              text: `No se encontraron trimestres para esta vigencia`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
            this.limpiarCampoFechas();
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
    } else {
      this.limpiarCampoFechas();
    }
  }

  async evaluarFechasPlan() {
    Swal.fire({
      title: 'Evaluando fechas',
      text: '',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })

    this.auxEstadosSeguimientos = [];

    for (let index = 0; index < this.dataSource.data.length; index++) {
      if (this.rol != undefined && this.rol == 'PLANEACION') {
        Swal.update({
          text: `${index + 1} de ${this.dataSource.data.length}`,

        })
        Swal.showLoading();
      }
      const plan = this.dataSource.data[index];
      for (let trimestre in this.trimestres) {
        await new Promise((resolve, reject) => {
          this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,tipo_seguimiento_id:61f236f525e40c582a0840d0,plan_id:` + plan._id + `,periodo_seguimiento_id:` + this.trimestres[trimestre]["id"]).subscribe(async (data: any) => {
            if (data.Data.length != 0) {
              let estadoTemp;
              if (this.auxEstadosSeguimientos.some(estado => estado.id == data.Data[0].estado_seguimiento_id) && this.auxEstadosSeguimientos.length > 0) {
                estadoTemp = this.auxEstadosSeguimientos.find(estado => estado.id == data.Data[0].estado_seguimiento_id).nombre;
              } else {
                await new Promise((resolve, reject) => {
                  this.request.get(environment.PLANES_CRUD, `estado-seguimiento/` + data.Data[0].estado_seguimiento_id).subscribe((estado: any) => {
                    if (estado && estado.Data != null) {
                      estadoTemp = estado.Data.nombre;
                      this.auxEstadosSeguimientos.push({ id: estado.Data._id, nombre: estado.Data.nombre });
                      resolve(true);
                    } else {
                      Swal.fire({
                        title: 'Error en la operación',
                        text: `No se encontraron datos de estado`,
                        icon: 'warning',
                        showConfirmButton: false,
                        timer: 2500
                      });
                      reject(false);
                    }
                  })
                });
              }

              let auxFecha = new Date();
              let auxFechaCol = auxFecha.toLocaleString('en-US', { timeZone: 'America/Mexico_City' })
              let strFechaHoy = new Date(auxFechaCol).toISOString();
              let fechaHoy = new Date(strFechaHoy);

              if (estadoTemp == "Reporte Avalado") {
                this.dataSource.data[index][trimestre + "class"] = "verde";
                this.dataSource.data[index]["estado"] = estadoTemp;
              } else if (fechaHoy >= this.trimestres[trimestre]["fecha_inicio"] && fechaHoy <= this.trimestres[trimestre]["fecha_fin"]) {
                this.dataSource.data[index][trimestre + "class"] = "amarillo";
                this.dataSource.data[index]["estado"] = estadoTemp;
              } else {
                this.dataSource.data[index][trimestre + "class"] = "gris";
              }
              this.dataSource.data[index][trimestre + "estado"] = estadoTemp;
              this.allPlanes = this.dataSource.data;
            }
            resolve(true);
          });
        });
      }
    }
    Swal.close();
  }

  onChangeU(unidad) {
    this.dataSource.data = [];
    if (unidad == undefined) {
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
    }
    this.allPlanes = this.dataSource.data;
  }

  async onChangeP(plan) {
    this.plan = plan;
    if (plan == undefined || (plan == undefined && this.vigencia == undefined)) {
      this.dataSource.data = this.planes;
    } else {
      this.dataSource.data = this.searchP(plan[0]);
      if (this.rol != undefined && this.rol == 'PLANEACION') {
        await this.getUnidades();
        await this.getEstados();
        await this.getVigencias();
        await this.evaluarFechasPlan();
      }
    }
    this.allPlanes = this.dataSource.data;
    this.OnPageChange({ length: 0, pageIndex: 0, pageSize: 5 });
  }

  onChangeV(vigencia) {
    this.limpiarCampoFechas();
    this.vigencia = vigencia;
    this.dataSource.data = this.planes;
    this.auxPlanes = [];
    this.plan = undefined;
    if (!(this.vigencia == undefined || (this.plan == undefined && this.vigencia == undefined))) {
      if (this.rol != undefined && this.rol == 'PLANEACION') {
        this.loadPlanes("vigencia");
      } else {
        this.loadPlanes("unidad");
      }
    }
  }

  async loadPlanes(tipo) {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })

    this.auxEstadosPlanes = [];

    if (tipo == "unidad") {
      await new Promise((resolve, reject) => {
        this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,estado_plan_id:6153355601c7a2365b2fb2a1,vigencia:${this.vigencia.Id},dependencia_id:${this.unidad.Id}`).subscribe(async (data: any) => {
          if (data) {
            if (data.Data.length != 0) {
              data.Data.sort(function(a, b) { return b.vigencia - a.vigencia; });
              this.planes = data.Data;
              await this.getEstados();
              await this.getVigencias();
              this.dataSource.data = this.planes;
              this.allPlanes = this.dataSource.data;
              this.loadFechas();
              this.OnPageChange({ length: 0, pageIndex: 0, pageSize: 5 });
              resolve(true);
            } else {
              this.unidadSelected = false;
              this.dataSource.data = this.planes;
              this.vigencia = undefined;
              this.limpiarCampoFechas();
              Swal.fire({
                title: 'No se encontraron planes',
                icon: 'error',
                text: `No se encontraron planes para realizar el seguimiento`,
                showConfirmButton: false,
                timer: 3500
              })
              reject(false);
            }
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: 'No se encontraron datos registrados',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        })
      });
    } else if (tipo == 'vigencia') {
      this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,estado_plan_id:6153355601c7a2365b2fb2a1,vigencia:${this.vigencia.Id}`).subscribe((data: any) => {
        if (data) {
          if (data.Data.length != 0) {
            data.Data.sort(function(a, b) { return b.vigencia - a.vigencia; });
            this.planes = data.Data;
            this.planes.forEach(plan => {
              let bandera = true;
              this.auxPlanes.forEach(auxplan => {
                if (auxplan.nombre == plan.nombre) {
                  bandera = false;
                }
              });

              if (bandera) {
                this.auxPlanes.push(plan);
              }
            });
            this.loadFechas();
            this.dataSource.data = this.planes;
            this.allPlanes = this.dataSource.data;
            this.OnPageChange({ length: 0, pageIndex: 0, pageSize: 5 });
          } else {
            this.unidadSelected = false;
            Swal.fire({
              title: 'No se encontraron planes',
              icon: 'error',
              text: `No se encontraron planes para realizar el seguimiento`,
              showConfirmButton: false,
              timer: 2500
            })
          }
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
    }
    Swal.close();
  }

  getUnidades() {
    for (let i = 0; i < this.planes.length; i++) {
      this.request.get(environment.OIKOS_SERVICE, `dependencia?query=Id:` + this.planes[i].dependencia_id).subscribe((data: any) => {
        if (data) {
          let unidad: any = data[0];
          this.planes[i].unidad = unidad.Nombre;
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
    }
  }

  async getEstados() {
    for (let i = 0; i < this.planes.length; i++) {
      if (this.auxEstadosPlanes.some(estado => { estado._id != this.planes[i].estado_plan_id }) || this.auxEstadosPlanes.length == 0) {
        this.auxEstadosPlanes.push({ _id: this.planes[i].estado_plan_id })
        await new Promise((resolve, reject) => {
          this.request.get(environment.PLANES_CRUD, `estado-plan?query=_id:` + this.planes[i].estado_plan_id).subscribe((data: any) => {
            if (data) {
              let estado: any = data.Data[0];
              this.auxEstadosPlanes[this.auxEstadosPlanes.findIndex(estadoInt => estadoInt._id == estado._id)] = estado;
              resolve(true);
            }
          }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              text: 'No se encontraron datos registrados',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
            reject(false);
          })
        });
      }
    }

    for (let i = 0; i < this.planes.length; i++) {
      this.planes[i].estado = this.auxEstadosPlanes.find(estado => estado._id == this.planes[i].estado_plan_id).nombre;
    }
  }

  getVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=Id:` + this.planes[0].vigencia).subscribe((data: any) => {
      if (data) {
        let vigencia: any = data.Data[0];
        for (let index = 0; index < this.planes.length; index++) {
          this.planes[index].vigencia = vigencia.Nombre;
        }
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: 'No se encontraron datos registrados',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }

  async getPeriodos() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.auxPeriodos = [];

    for (let i = 0; i < this.planes.length; i++) {
      // await new Promise((resolve, reject) => {

      this.request.get(environment.PLANES_CRUD, `seguimiento?query=plan_id:` + this.planes[i]._id + `,activo:true`).subscribe(async (data: any) => {
        if (data) {
          if (data.Data.length != 0) {
            let seguimiento: any = data.Data[data.Data.length - 1];

            if (this.auxPeriodos.some(periodo => periodo.id != seguimiento.periodo_seguimiento_id) || this.auxPeriodos.length == 0) {
              this.auxPeriodos.push({ id: seguimiento.periodo_seguimiento_id });

              await new Promise((resolve, reject) => {
                this.request.get(environment.PLANES_CRUD, `periodo-seguimiento/` + seguimiento.periodo_seguimiento_id).subscribe((data: any) => {
                  if (data) {
                    let auxTrimestre = data.Data;

                    this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=Id:` + auxTrimestre.periodo_id).subscribe((data: any) => {
                      if (data) {
                        let aux = data.Data[0];
                        let parametroTemp = { "trimestre": aux.ParametroId.CodigoAbreviacion, "nombre": aux.ParametroId.Nombre, "id": seguimiento.periodo_seguimiento_id }
                        this.auxPeriodos[this.auxPeriodos.findIndex(periodoInt => periodoInt.id == auxTrimestre._id)].periodo = parametroTemp;
                        this.planes[i].periodo = aux.ParametroId.Nombre;
                        this.periodoHabilitado = true;
                        resolve(true);
                      }
                    }, (error) => {
                      Swal.fire({
                        title: 'Error en la operación',
                        text: 'No se encontraron datos registrados',
                        icon: 'warning',
                        showConfirmButton: false,
                        timer: 2500
                      })
                      reject(false);
                    })
                  }
                }, (error) => {
                  Swal.fire({
                    title: 'Error en la operación',
                    text: 'No se encontraron datos registrados',
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 2500
                  })
                  reject(false);
                })
              });
            } else {
              let parametroTemp = this.auxPeriodos.find(periodo => periodo.id == seguimiento.periodo_seguimiento_id).periodo;
              this.planes[i].periodo = parametroTemp.nombre;
              this.periodoHabilitado = true;
            }

          } else {
            this.periodoHabilitado = false;
            this.planes[i].periodo = "No disponible";
          }
          // resolve(true);
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
        // reject(false);
      })
      // });
    }
    Swal.close();

  }

  gestionSeguimiento(plan) {
    if (plan.trimestre != undefined) {
      this.router.navigate(['pages/seguimiento/gestion-seguimiento/' + plan._id + '/' + plan.trimestre])
    } else {
      Swal.fire({
        title: 'Seleccione el trimestre',
        text: 'Por favor seleccione el trimestre al cual desea hacer seguimiento del plan ' + plan.nombre + " con vigencia " + plan.vigencia,
        icon: 'warning',
        showConfirmButton: false,
        timer: 5000
      })
    }
  }

  OnPageChange(event: PageEvent) {
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.allPlanes.length) {
      endIndex = this.allPlanes.length;
    }
    this.dataSource.data = this.allPlanes.slice(startIndex, endIndex);
    this.dataSource.data.length = this.allPlanes.length;
  }

  onTrimestreChange(trimestre: any, id: any) {
    let index = this.dataSource.data.findIndex(row => row._id == id)
    if (this.vigencia) {
      this.dataSource.data[index]["estado"] = this.dataSource.data[index][trimestre.toLowerCase() + "estado"];
    }
    this.dataSource.data[index]["trimestre"] = trimestre;

  }

  limpiarCampoFechas() {
    this.formFechas.get('fecha1').setValue(null);
    this.formFechas.get('fecha2').setValue(null);
    this.formFechas.get('fecha3').setValue(null);
    this.formFechas.get('fecha4').setValue(null);
    this.formFechas.get('fecha5').setValue(null);
    this.formFechas.get('fecha6').setValue(null);
    this.formFechas.get('fecha7').setValue(null);
    this.formFechas.get('fecha8').setValue(null);
  }
}
