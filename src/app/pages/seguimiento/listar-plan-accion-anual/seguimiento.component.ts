import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { UserService } from '../../services/userService';
import { ResumenPlan } from 'src/app/@core/models/plan/resumen_plan';
import { DataRequest } from 'src/app/@core/models/interfaces/DataRequest.interface';
import { CodigosService } from 'src/app/@core/services/codigos.service';

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
  planesMostrar: any[] = [];
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
  formPlanes: FormGroup;
  formSelect: FormGroup;
  selectUnidad = new FormControl();
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    public dialog: MatDialog,
    private request: RequestManager,
    private router: Router,
    private autenticationService: ImplicitAutenticationService,
    private userService: UserService,
    private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private codigosService: CodigosService
  ) {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find((x) => x == 'PLANEACION')) {
      this.rol = 'PLANEACION';
    } else if (roles.__zone_symbol__value.find((x) => x == 'ASISTENTE_PLANEACION')) {
      this.rol = 'ASISTENTE_PLANEACION';
    } else if (roles.__zone_symbol__value.find((x) => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')){
      this.rol = 'JEFE_DEPENDENCIA';
    }

    this.unidadSelected = false;

    this.formFechas = this.formBuilder.group({
      selectVigencia: null,
      fecha1: null,
      fecha2: null,
      fecha3: null,
      fecha4: null,
      fecha5: null,
      fecha6: null,
      fecha7: null,
      fecha8: null
    });
    this.formPlanes = this.formBuilder.group({
      selectPlan: null,
    });
    this.formSelect = this.formBuilder.group({
      selectUnidad: null,
    });
  }

  ngAfterViewInit(): void {
    this.dataSource = new MatTableDataSource<any>();
    this.dataSource.data = [];
  }

  async ngOnInit() {
    if (
      this.rol == 'JEFE_DEPENDENCIA' ||
      this.rol == 'ASISTENTE_DEPENDENCIA'
    ) {
      await this.validarUnidad();
    } else {
      await this.loadUnidades();
    }
    await this.loadPeriodos();
    this.activatedRoute.params.subscribe(async (prm) => {
      let vigencia_id = prm['vigencia_id'];
      let nombre = prm['nombre_plan'];
      let dependencia_id = prm['unidad_id'];
      if (
        dependencia_id != undefined &&
        vigencia_id != undefined &&
        nombre != undefined
      ) {
        this.cargarPlan({
          dependencia_id,
          vigencia_id,
          nombre,
        } as ResumenPlan);
      }
    });
  }

  async validarUnidad() {
    Swal.fire({
      title: 'Validando unidad',
      timerProgressBar: true,
      showConfirmButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    await new Promise((resolve) => {
      this.userService.user$.subscribe((data) => {
        this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion/?query=Numero:` + data['userService']['documento'])
          .subscribe((datosInfoTercero: any) => {
            this.request.get(environment.PLANES_MID, `formulacion/vinculacion_tercero/` + datosInfoTercero[0].TerceroId.Id)
              .subscribe((vinculacion: any) => {
                let vinculaciones: any[] = vinculacion['Data'];
                vinculaciones.forEach(vinculacion => {
                  this.request.get(environment.OIKOS_SERVICE, `dependencia_tipo_dependencia?query=DependenciaId:` + vinculacion["DependenciaId"]).subscribe((dataUnidad: any) => {
                    if (dataUnidad) {
                      let unidad = dataUnidad[0]["DependenciaId"]
                      unidad["TipoDependencia"] = dataUnidad[0]["TipoDependenciaId"]["Id"]
  
                      this.unidades.push(unidad);
                      this.auxUnidades.push(unidad);
                      this.formSelect.get('selectUnidad').setValue(unidad);
                      this.onChangeU(unidad);
                      Swal.close();
                      resolve(unidad)
                    }
                  })
                })
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

  async loadUnidades() {
    Swal.fire({
      title: 'Cargando unidades',
      timerProgressBar: true,
      showConfirmButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    await new Promise((resolve,reject)=>{
      this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: DataRequest) => {
        if (data) {
          this.unidades = data.Data;
          this.auxUnidades = data.Data;
          Swal.close();
          resolve(this.unidades)
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
        reject(error)
      })
    })
  }

  onKey(value: string, type: string) {
    if (value == undefined || value.trim() === '') {
      if (type === 'plan') {
        this.auxPlanes = [...this.planes];
      } else if (type === 'unidad') {
        this.auxUnidades = [...this.unidades];
      }
    } else {
      if (type === 'plan') {
        this.auxPlanes = this.buscarPlanes(value);
      } else if (type === 'unidad') {
        this.auxUnidades = this.buscarUnidades(value);
      }
    }
  }
  
  buscarPlanes(value: string) {
    return this.planes.filter(plan => 
      plan.nombre.toLowerCase().includes(value.toLowerCase()));
  }
  
  buscarUnidades(value: string) {
    return this.unidades.filter(unidad => 
      unidad.Nombre.toLowerCase().includes(value.toLowerCase()));
  }

  searchPlanById(value:string) {
    let filtro = value.toLowerCase();
    if (this.planes != undefined) {
      return this.planes.filter(plan => plan._id.toLowerCase().includes(filtro));
    }
  }

  async filterPlanes(data) {
    const CODIGO_TIPO_PLAN_PROYECTO:string = await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PR_SP')
    var dataAux = data.filter(e => e.tipo_plan_id != CODIGO_TIPO_PLAN_PROYECTO);
    return dataAux.filter(e => e.activo == true);
  }

  async loadPeriodos() {
    Swal.fire({
      title: 'Cargando períodos',
      timerProgressBar: true,
      showConfirmButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      
      willOpen: () => {
        Swal.showLoading();
      },
    })
    await new Promise((resolve,reject)=>{
      this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: DataRequest) => {
        if (data) {
          data.Data.sort((a, b) => a.Nombre - b.Nombre);
          this.vigencias = data.Data;
          resolve(this.vigencias)
        }
        Swal.close();
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
        reject(error)
      })
    })
  }

  async loadFechas() {
    this.limpiarCampoFechas();
    if (this.vigencia) {
      Swal.fire({
        title: 'Cargando períodos',
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
      await new Promise((resolve,reject)=>{
        this.request.get(environment.PLANES_MID, `seguimiento/trimestres/` + this.vigencia.Id).subscribe(async (data: DataRequest) => {
          if (data) {
            if (data.Data != "" && data.Data != null) {
              let periodos = data.Data;
              if (periodos.length > 0) {
                this.trimestres = { t1: {}, t2: {}, t3: {}, t4: {} }
                for (let i = 0; i < periodos.length; i++) {
                  if(this.plan.nueva_estructura) {
                    let plan = {
                      _id: this.plan.formato_id,
                      nombre: this.plan.nombre
                    }
                    let unidad = {
                      Id: this.unidad.Id,
                      Nombre: this.unidad.Nombre
                    }
                    let body = {
                      periodo_id: periodos[i].Id,
                      tipo_seguimiento_id: await this.codigosService.getId('PLANES_CRUD', 'tipo-seguimiento', 'S_SP'),
                      planes_interes: JSON.stringify([plan]),
                      unidades_interes: JSON.stringify([unidad]),
                      activo: true
                    }
                    await new Promise((resolve, reject) => {
                      this.request.post(environment.PLANES_CRUD,`periodo-seguimiento/buscar-unidad-planes/7`, body)
                        .subscribe(
                          async (data: DataRequest) => {
                            if (data) {
                              if (data.Data.length != 0) {
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
                                  if (this.rol != undefined && this.rol == 'PLANEACION' || this.rol == 'ASISTENTE_PLANEACION' || this.rol == 'JEFE_DEPENDENCIA') {
                                    await this.evaluarFechasPlan();
                                  }
                                }
                                Swal.close();
                                resolve(true)
                              } else {
                                Swal.fire({
                                  title: 'Error en la operación',
                                  text: `No se encontraron datos registrados`,
                                  icon: 'warning',
                                  showConfirmButton: false,
                                  timer: 2500
                                });
                                this.limpiarCampoFechas();
                                reject()
                              }
                            }
                          }, (error) => {
                            Swal.fire({
                              title: 'Error en la operación',
                              text: `No se encontraron datos registrados ${JSON.stringify(
                                error
                              )}`,
                              icon: 'warning',
                              showConfirmButton: false,
                              timer: 2500,
                            });
                          }
                        );
                    });
                  } else {
                    let body = {
                      periodo_id: periodos[i].Id,
                      tipo_seguimiento_id: await this.codigosService.getId('PLANES_CRUD', 'tipo-seguimiento', 'S_SP'),
                      activo: true,
                    }
                    await new Promise((resolve, reject) => {
                      this.request.post(environment.PLANES_CRUD,`periodo-seguimiento/buscar-unidad-planes/8`, body)
                        .subscribe(async (data: DataRequest) => {
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
                            if (this.rol != undefined && this.rol == 'PLANEACION' || this.rol == 'ASISTENTE_PLANEACION' || this.rol == 'JEFE_DEPENDENCIA') {
                              await this.evaluarFechasPlan();
                            }
                          }
                          Swal.close();
                          resolve(true)
                        } else {
                          Swal.fire({
                            title: 'Error en la operación',
                            text: `No se encontraron datos registrados`,
                            icon: 'warning',
                            showConfirmButton: false,
                            timer: 2500
                          });
                          this.limpiarCampoFechas();
                          reject()
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
                        reject(error)
                      })
                    })
                  }
                }
                resolve(true)
              } else {
                Swal.fire({
                  title: 'Error en la operación',
                  text: `No se encuentran tirmestres habilitados para esta vigencia`,
                  icon: 'warning',
                  showConfirmButton: false,
                  timer: 2500
                });
                this.limpiarCampoFechas();
                reject()
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
              reject()
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
          reject(error)
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
      allowOutsideClick: false,
      allowEscapeKey: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })

    this.auxEstadosSeguimientos = [];

    for (let index = 0; index < this.dataSource.data.length; index++) {
      if (this.rol != undefined && (this.rol == 'PLANEACION' || this.rol == 'ASISTENTE_PLANEACION')) {
        Swal.update({
          text: `${index + 1} de ${this.dataSource.data.length}`,

        })
        Swal.showLoading();
      }
      const plan = this.dataSource.data[index];
      for (let trimestre in this.trimestres) {
        await new Promise(async (resolve, reject) => {
          this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,tipo_seguimiento_id:${await this.codigosService.getId('PLANES_CRUD', 'tipo-seguimiento', 'S_SP')}
,plan_id:` + plan._id + `,periodo_seguimiento_id:` + this.trimestres[trimestre]["id"]).subscribe(async (data: DataRequest) => {
            if (data.Data.length != 0) {
              let estadoTemp;
              if (this.auxEstadosSeguimientos.some(estado => estado.id == data.Data[0].estado_seguimiento_id) && this.auxEstadosSeguimientos.length > 0) {
                estadoTemp = this.auxEstadosSeguimientos.find(estado => estado.id == data.Data[0].estado_seguimiento_id).nombre;
              } else {
                await new Promise((resolve, reject) => {
                  this.request.get(environment.PLANES_CRUD, `estado-seguimiento/` + data.Data[0].estado_seguimiento_id).subscribe((estado: DataRequest) => {
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
              resolve(true);
            } else {
              Swal.close();
            }
          });
        });
      }
    }
    Swal.close();
  }

  async onChangeU(unidad) {
    this.dataSource.data = [];
    if (unidad == undefined) {
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
    }
    if (this.unidadSelected && this.vigenciaSelected) {
      await this.loadPlanes("unidad");
    }
    this.allPlanes = this.dataSource.data;
  }

  async onChangeP(plan) {
    this.plan = plan;
    if (plan == undefined || (plan == undefined && this.vigencia == undefined)) {
      this.dataSource.data = this.planes;
    } else {
      this.planesMostrar = this.searchPlanById(plan._id);
      this.dataSource = new MatTableDataSource(this.planesMostrar);
      if (this.rol != undefined && (this.rol == 'PLANEACION' || this.rol == 'ASISTENTE_PLANEACION')) {
        await this.getUnidades();
        await this.getEstados();
        await this.getVigencias();
        // await this.evaluarFechasPlan();
      }
      await this.loadFechas()
    }
    this.allPlanes = this.dataSource.data;
    this.dataSource.filter = ""
    this.OnPageChange({ length: 0, pageIndex: 0, pageSize: 5 });
  }

  async onChangeV(vigencia) {
    if(vigencia == undefined) {
      this.vigenciaSelected = false;
      this.vigencia = undefined;
    } else {
      this.limpiarCampoFechas();
      this.vigencia = vigencia;
      this.vigenciaSelected = true;
      this.dataSource.data = this.planes;
      this.dataSource.filter = ""; // Quita los filtros de la tabla
      this.auxPlanes = [];
      this.plan = undefined;
      if (!(this.vigencia == undefined || (this.plan == undefined && this.vigencia == undefined))) {
        if (this.rol != undefined && (this.rol == 'PLANEACION' || this.rol == 'ASISTENTE_PLANEACION')) {
          await this.loadPlanes("vigencia");
        } else {
          await this.loadPlanes("unidad");
        }
      }
    }
  }

  async loadPlanes(tipo: string) {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })

    this.auxEstadosPlanes = [];

    if (tipo == "unidad") {
      return await new Promise(async (resolve, reject) => {
        this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,estado_plan_id:${await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'A_SP')},vigencia:${this.vigencia.Id},dependencia_id:${this.unidad.Id}`).subscribe(async (data: DataRequest) => {
          if (data?.Data.length != 0) {
            data.Data.sort(function(a, b) { return b.vigencia - a.vigencia; });
            this.planes = data.Data;
            this.auxPlanes = this.planes;
            await this.getEstados();
            await this.getVigencias();
            this.dataSource.data = [];
            this.allPlanes = this.dataSource.data;
            this.OnPageChange({ length: 0, pageIndex: 0, pageSize: 5 });
            Swal.close();
            resolve(true);
          } else {
            this.unidadSelected = false;
            this.dataSource.data = this.planes;
            this.vigencia = undefined;
            this.limpiarCampoFechas();
            Swal.fire({
              title: 'No se encontraron planes',
              icon: 'error',
              text: `No se encontraron planes para realizar seguimiento`,
              showConfirmButton: false,
              timer: 3500
            })
            Swal.close();
            reject(false);
          }
        }, (error) => {
          Swal.close();
          Swal.fire({
            title: 'Error en la operación',
            text: 'No se encontraron datos registrados',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
          reject(error)
        })
      });
    } else if (tipo == 'vigencia') {
      return await new Promise(async (resolve,reject)=>{
        this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,estado_plan_id:${await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'A_SP')},vigencia:${this.vigencia.Id},dependencia_id:${this.unidad.Id}`).subscribe(async (data: DataRequest) => {
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
              // await this.loadFechas();
              this.dataSource.data = this.planes;
              this.allPlanes = this.dataSource.data;
              this.OnPageChange({ length: 0, pageIndex: 0, pageSize: 5 });
              Swal.close();
              resolve(true);
            } else {
              this.unidadSelected = false;
              Swal.close();
              Swal.fire({
                title: 'No se encontraron planes',
                icon: 'error',
                text: `No se encontraron planes para realizar el seguimiento`,
                showConfirmButton: false,
                timer: 2500
              })
              reject();
            }
          }
        }, (error) => {
          Swal.close();
          Swal.fire({
            title: 'Error en la operación',
            text: 'No se encontraron datos registrados',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
          reject(error);
        })
      })
    }
  }

  async getUnidades() {
    return await new Promise((resolve,reject)=>{
      for (let i = 0; i < this.planes.length; i++) {
        this.request.get(environment.OIKOS_SERVICE, `dependencia?query=Id:` + this.planes[i].dependencia_id).subscribe((data: DataRequest) => {
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
          reject(error)
        })
      }
      resolve(true);
    })
  }

  async getEstados() {
    for (let i = 0; i < this.planes.length; i++) {
      if (this.auxEstadosPlanes.some(estado => { estado._id != this.planes[i].estado_plan_id }) || this.auxEstadosPlanes.length == 0) {
        this.auxEstadosPlanes.push({ _id: this.planes[i].estado_plan_id })
        return await new Promise((resolve, reject) => {
          this.request.get(environment.PLANES_CRUD, `estado-plan?query=_id:` + this.planes[i].estado_plan_id).subscribe((data: DataRequest) => {
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

  async getVigencias() {
    return new Promise((resolve, reject)=>{
      this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=Id:` + this.vigencia.Id.toString()).subscribe((data: DataRequest) => {
        if (data) {
          let vigencia: any = data.Data[0];
          for (let index = 0; index < this.planes.length; index++) {
            this.planes[index].vigencia = vigencia.Nombre;
          }
          resolve(data)
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        });
        reject(error)
      });
    })
  }

  async getPeriodos() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      allowEscapeKey: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.auxPeriodos = [];

    for (let i = 0; i < this.planes.length; i++) {
      // await new Promise((resolve, reject) => {

      this.request.get(environment.PLANES_CRUD, `seguimiento?query=plan_id:` + this.planes[i]._id + `,activo:true`).subscribe(async (data: DataRequest) => {
        if (data) {
          if (data.Data.length != 0) {
            let seguimiento: any = data.Data[data.Data.length - 1];

            if (this.auxPeriodos.some(periodo => periodo.id != seguimiento.periodo_seguimiento_id) || this.auxPeriodos.length == 0) {
              this.auxPeriodos.push({ id: seguimiento.periodo_seguimiento_id });

              await new Promise((resolve, reject) => {
                this.request.get(environment.PLANES_CRUD, `periodo-seguimiento/` + seguimiento.periodo_seguimiento_id).subscribe((data: DataRequest) => {
                  if (data) {
                    let auxTrimestre = data.Data;

                    this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=Id:` + auxTrimestre.periodo_id).subscribe((data: DataRequest) => {
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
                      reject(error);
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
                  reject(error);
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

  /**
   * Obtiene el elemento filtrado por los valores dados y actualiza su campo respectivo
   * @param arreglo Lista de elementos en los cuales se va a buscar un elemento teniendo en cuenta un parametro de busqueda y el valor esperado
   * @param parametroFiltro parametro de busqueda por el cual se buscará
   * @param form formulario asociado al desplegable de la interfaz
   * @param selectFormulario select relacionado al formulario de el elemento
   * @param valor valor por el cual se filtrará
   * @returns elemento que cumpla con los valores dados
   */
  obtenerElemento(arreglo: any[], parametroFiltro:string, form:FormGroup, selectFormulario:string, valor: string|number): any{
    let elementos = arreglo.filter((elemento) => elemento[parametroFiltro] == valor)
    if(elementos.length > 0){
      form.get(selectFormulario).setValue(elementos[0]);
      return elementos[0]
    }
  }

  async cargarPlan(planACargar: ResumenPlan){
    await this.onChangeV(this.obtenerElemento(
      this.vigencias,
      'Id',
      this.formFechas,
      'selectVigencia',
      Number(planACargar.vigencia_id)
    ));
    await this.onChangeP(
      this.obtenerElemento(
        this.auxPlanes,
        'nombre',
        this.formPlanes,
        'selectPlan',
        planACargar.nombre
      )
    );
    this.dataSource.filter = planACargar.nombre
    this.dataSource.filterPredicate = (plan, _) => {
      return plan["nombre"] === planACargar.nombre && planACargar.dependencia_id === plan["dependencia_id"]
    }
  }
}
