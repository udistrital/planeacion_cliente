import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';

export interface Unidades {
  posicion: string;
  correoElectronico: string;
  DependenciaTipoDependencia: string;
  Id: number;
  Nombre: string;
  TelefonoDependencia: string;
  TipoDependencia: string;
  iconSelected: string;
}

export interface PeriodoSeguimiento {
  _id: string
  fecha_inicio: string
  fecha_fin: string
  periodo_id: string
  tipo_seguimiento_id: string
  activo: boolean
  unidades_interes: string
  planes_interes: string
  fecha_creacion: string
  fecha_modificacion: string
}

export interface Unidad {
  Id: string;
  Nombre: string;
  FechaModificacion: string;
}

@Component({
  selector: 'app-habilitar-reporte',
  templateUrl: './habilitar-reporte.component.html',
  styleUrls: ['./habilitar-reporte.component.scss'],
})
export class HabilitarReporteComponent implements OnInit {
  vigenciaSelected: boolean;
  vigenciaSelectedInv: boolean;
  banderaUnidadesInteres: boolean;
  banderaPlanesInteres: boolean;
  banderaPlanesInteresPeriodoSeguimiento: boolean;
  tipoSelected: boolean;
  tipoSelectedInv: boolean;
  reporteHabilitado: boolean;
  vigencias: any[];
  periodos: any[];
  vigencia: any;
  vigenciaInv: any;
  tipo: string;
  tipoInv: string;
  unidad: string;
  periodo: any;
  periodoFormulacion = [Date, Date];
  formFechas: FormGroup;
  date9: Date = new Date();
  guardarDisabled: boolean;
  displayedColumns: string[] = ['index', 'Nombre', 'actions'];
  unidadesInteres: any;
  planesInteres: any;
  unidadesInteresPeriodoSeguimiento: any;
  planesInteresPeriodoSeguimiento: any;
  seguimientoFormulacionPAF: any;
  periodoSeguimientoFormulacionPAF: any;
  dataUnidades: any;
  dataSource = new MatTableDataSource<Unidades>();

  selectVigencia = new FormControl();
  selectTipo = new FormControl();
  selectVigenciaInv = new FormControl();
  selectTipoInv = new FormControl();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    private request: RequestManager,
    private formBuilder: FormBuilder
  ) {
    this.loadVigencias();
    this.vigenciaSelected = false;
    this.vigenciaSelectedInv = false;
    this.guardarDisabled = false;
    this.banderaPlanesInteresPeriodoSeguimiento = false;
  }

  ngOnInit(): void {
    this.formFechas = this.formBuilder.group({
      fecha1: ['',],
      fecha2: ['',],
      fecha3: ['',],
      fecha4: ['',],
      fecha5: ['',],
      fecha6: ['',],
      fecha7: ['',],
      fecha8: ['',],
      fecha9: ['',],
      fecha10: ['',],
      fecha11: ['',],
      fecha12: ['',],
      fecha13: ['',],
      fecha14: ['',],
      fecha15: ['',],
      fecha16: ['',],
      fecha17: ['',],
      fecha18: ['',],
      fecha19: ['',],
      fecha20: ['',]
    });
    this.unidadesInteres = [];
  }

  manejarCambiosUnidadesInteres(nuevasUnidades: any[]) {
    this.unidadesInteres = nuevasUnidades;
    
    // Aquí se comparan this.unidadesInteres con las unidadesInteres del registro en la base de datos
    this.banderaPlanesInteresPeriodoSeguimiento = this.hayRegistrosIguales(this.unidadesInteres, this.unidadesInteresPeriodoSeguimiento);
    if(this.banderaPlanesInteresPeriodoSeguimiento){
      this.planesInteresPeriodoSeguimiento = JSON.parse(this.periodoSeguimientoFormulacionPAF['planes_interes']);
      this.planesInteresPeriodoSeguimiento.forEach(plan => {
        plan.fecha_modificacion = this.periodoSeguimientoFormulacionPAF['fecha_modificacion']; // Puedes establecer la fecha que desees
      });
      console.log("SI hay planes de interes: ", this.planesInteresPeriodoSeguimiento);
    } else {
      this.planesInteresPeriodoSeguimiento = [];
      console.log("NO hay planes de interes asociados a la unidades seleccionadas");
    }
  }

  manejarCambiosPlanesInteres(nuevosPlanes: any[]) {
    this.planesInteres = nuevosPlanes;
  }

  // Función para comparar dos registros de la interfaz Unidad
  sonIguales(unidad1: Unidad, unidad2: Unidad): boolean {
    return unidad1.Id === unidad2.Id && unidad1.Nombre === unidad2.Nombre;
  }

  // Función para verificar si hay dos registros iguales en los arrays
  hayRegistrosIguales(arr1: Unidad[], arr2: Unidad[]): boolean {
    return arr1.some((unidad1) => arr2.some((unidad2) => this.sonIguales(unidad1, unidad2)));
  }

  loadVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500,
      });
    }
  );
  }

  onChangeV(vigencia: any) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      this.loadTrimestres(this.vigencia);
      if (this.tipoSelected) this.loadFechas();
    }
  }

  onChange(tipo: string) {
    if (tipo == undefined) {
      this.tipoSelected = false;
    } else {
      this.tipoSelected = true;
      this.tipo = tipo;
      this.loadFechas();
    }
  }

  onChangeInv(tipo: string) {
    if (tipo == undefined) {
      this.tipoSelectedInv = false;
    } else {
      this.tipoSelectedInv = true;
      this.tipoInv = tipo;
      this.loadFechasInv();
    }
  }

  banderaTabla(objeto: string) {
    //Objeto hace referencia a las unidades o proyectos
    switch (objeto) {
      case 'unidades':
        this.banderaUnidadesInteres = true;
        break;
      case 'planes_proyectos':
        this.banderaPlanesInteres = true;
        break;
      default:
        this.banderaUnidadesInteres = false;
        this.banderaPlanesInteres = false;
    }
  }

  onChangeFF(index: number, event: MatDatepickerInputEvent<Date>) {
    if (index == 1) {
      let aux: Date = event.value;
    }
  }
  onChangeI(vigencia: any) {
    if (vigencia == undefined) {
      this.vigenciaSelectedInv = false;
    } else {
      this.vigenciaSelectedInv = true;
      this.vigenciaInv = vigencia;
      this.loadTrimestres(this.vigenciaInv);
      if (this.tipoSelectedInv) this.loadFechasInv();
    }
  }

  loadFechasInv() {
    Swal.fire({
      title: 'Cargando Fechas',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    if (this.tipoInv === 'formulaciones') {
      if (this.periodos && this.periodos.length > 0) {
        this.readUnidadesForm();
      } else {
        Swal.close();
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500,
        });
      }
      this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,tipo_seguimiento_id:6389efac6a0d190ffb883f71`).subscribe((data: any) => {
        if (data) {
          if (data.Data.length != 0) {
            let formulacionSeguimiento = data.Data[0];
            let fechaInicio = new Date(formulacionSeguimiento["fecha_inicio"]);
            let fechaFin = new Date(formulacionSeguimiento["fecha_fin"]);
            this.formFechas.get('fecha19').setValue(fechaInicio);
            this.formFechas.get('fecha20').setValue(fechaFin);
            Swal.close();
          } else {
            Swal.close();
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

    } else if (this.tipoInv === 'seguimientos') {
      if (this.periodos && this.periodos.length > 0) {
        this.readUnidades();
        for (let i = 0; i < this.periodos.length; i++) {
          this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + this.periodos[i].Id + `,tipo_seguimiento_id:6385fa136a0d19d7888837ed`).subscribe((data: any) => {
            if (data.Data.length != 0) {
              let seguimiento = data.Data[0];
                  let fechaInicio = new Date(seguimiento['fecha_inicio']);
                  let fechaFin = new Date(seguimiento['fecha_fin']);

              if (i == 0) {
                this.formFechas.get('fecha11').setValue(fechaInicio);
                this.formFechas.get('fecha12').setValue(fechaFin);
              } else if (i == 1) {
                this.formFechas.get('fecha13').setValue(fechaInicio);
                this.formFechas.get('fecha14').setValue(fechaFin);
              } else if (i == 2) {
                this.formFechas.get('fecha15').setValue(fechaInicio);
                this.formFechas.get('fecha16').setValue(fechaFin);
              } else if (i == 3) {
                this.formFechas.get('fecha17').setValue(fechaInicio);
                this.formFechas.get('fecha18').setValue(fechaFin);
                Swal.close();
              }
            } else {
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
      } else {
        Swal.close();
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encuentran trimestres habilitados para esta vigencia`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    }
  }

  loadFechas() {
    Swal.fire({
      title: 'Cargando Fechas',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    if (this.tipo === 'formulacion') {
      this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,tipo_seguimiento_id:6260e975ebe1e6498f7404ee`).subscribe((data: any) => {
        if (data) {
          if (data.Data.length != 0) {
            this.seguimientoFormulacionPAF = data.Data[0];
            this.formFechas.get('fecha9').setValue(new Date(this.seguimientoFormulacionPAF["fecha_inicio"]));
            this.formFechas.get('fecha10').setValue(new Date(this.seguimientoFormulacionPAF["fecha_fin"]));
            this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,_id:${this.seguimientoFormulacionPAF["periodo_seguimiento_id"]}`).subscribe((data: any) => {
              if(data){
                if(data.Data.length > 0){
                  this.periodoSeguimientoFormulacionPAF = data.Data[0];
                  this.unidadesInteresPeriodoSeguimiento = JSON.parse(this.periodoSeguimientoFormulacionPAF['unidades_interes']);
                  Swal.close();
                }
              }
            })
            Swal.close();
          } else {
            Swal.close();
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
    } else if (this.tipo === 'seguimiento') {
      if (this.periodos && this.periodos.length > 0) {
        for (let i = 0; i < this.periodos.length; i++) {
          this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + this.periodos[i].Id + `,tipo_seguimiento_id:61f236f525e40c582a0840d0`).subscribe((data: any) => {
            if (data.Data.length != 0) {
              let seguimiento = data.Data[0];
              this.periodoSeguimientoFormulacionPAF = data.Data[0];
              let fechaInicio = new Date(seguimiento['fecha_inicio']);
              let fechaFin = new Date(seguimiento['fecha_fin']);
              this.unidadesInteresPeriodoSeguimiento = JSON.parse(this.periodoSeguimientoFormulacionPAF['unidades_interes']);
              if (i == 0) {
                this.formFechas.get('fecha1').setValue(fechaInicio);
                this.formFechas.get('fecha2').setValue(fechaFin);
              } else if (i == 1) {
                this.formFechas.get('fecha3').setValue(fechaInicio);
                this.formFechas.get('fecha4').setValue(fechaFin);
              } else if (i == 2) {
                this.formFechas.get('fecha5').setValue(fechaInicio);
                this.formFechas.get('fecha6').setValue(fechaFin);
              } else if (i == 3) {
                this.formFechas.get('fecha7').setValue(fechaInicio);
                this.formFechas.get('fecha8').setValue(fechaFin);
                Swal.close();
              }
            } else {
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
      } else {
        Swal.close();
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encuentran trimestres habilitados para esta vigencia`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500,
        });
      }
    }
  }

  loadTrimestres(vigencia: any) {
    Swal.fire({
      title: 'Cargando períodos',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `seguimiento/get_periodos/` + vigencia.Id).subscribe((data: any) => {
      if (data) {
        if (data.Data != "") {
          this.periodos = data.Data;
          this.guardarDisabled = false;
          //this.readUnidades();
          Swal.close();
        } else {
          this.guardarDisabled = true;
          this.periodos = [];
          Swal.close();
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron trimestres para esta vigencia`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
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

  readUnidadesForm() {
    this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + this.periodos[0].Id + `,tipo_seguimiento_id:6389efac6a0d190ffb883f71`).subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {
          this.unidadesInteres = JSON.parse(data.Data[0].unidades_interes);
          if (data.Data[0].unidades_interes == undefined) {
            this.unidadesInteres = ' ';
          }
        } else if (data.Data.length == 0) {
          this.unidadesInteres = ' ';
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
    });
  }

  readUnidades() {
    this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + this.periodos[0].Id + `,tipo_seguimiento_id:6385fa136a0d19d7888837ed`).subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {
          this.unidadesInteres = JSON.parse(data.Data[0].unidades_interes);
          if (data.Data[0].unidades_interes == undefined) {
            this.unidadesInteres = ' ';
          }
        } else if (data.Data.length == 0) {
          this.unidadesInteres = ' ';
        }
      }
    }, (error) => {
    Swal.fire({
      title: 'Error en la operación',
      text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
      icon: 'warning',
      showConfirmButton: false,
          timer: 2500,
        });
      }
    );
  }

  // Función para validar un ObjectId
  isValidObjectId(id: string): boolean {
    // Utiliza una expresión regular para verificar el formato del ObjectId
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    // Verifica si el id tiene el formato correcto
    return objectIdRegex.test(id);
  }

  guardar() {
    if(this.unidadesInteres == undefined || this.unidadesInteres.length == 0){
      Swal.fire({
        title: 'Error en la operación',
        text: `Por favor seleccione las unidades de interés para continuar`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
      return;
    }
    if(this.planesInteres == undefined || this.planesInteres.length == 0){
      Swal.fire({
        title: 'Error en la operación',
        text: `Por favor seleccione los planes de interés para continuar`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
      return;
    }

    if (this.tipo == 'formulacion') {
      var periodo_seguimiento_formulacion: PeriodoSeguimiento;
      var seguimientoFormulacion;
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar la formulación de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.formFechas.get('fecha9').value != "" && this.formFechas.get('fecha10').value != "") {
            this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,tipo_seguimiento_id:6260e975ebe1e6498f7404ee`).subscribe(async (data: any) => {
              if (data) {
                if (data.Data.length > 0) {
                  seguimientoFormulacion = data.Data[0];
                  seguimientoFormulacion["fecha_inicio"] = this.formFechas.get('fecha9').value//.toISOString();
                  seguimientoFormulacion["fecha_fin"] = this.formFechas.get('fecha10').value//.toISOString();
                  if(this.isValidObjectId(seguimientoFormulacion["periodo_seguimiento_id"])){
                    this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,_id:${seguimientoFormulacion["periodo_seguimiento_id"]}`).subscribe((data: any) => {
                      if (data.Data.length > 0) {
                        periodo_seguimiento_formulacion = data.Data[0];
                        periodo_seguimiento_formulacion["periodo_id"] = "46";
                        periodo_seguimiento_formulacion["fecha_inicio"] = this.formFechas.get('fecha9').value;
                        periodo_seguimiento_formulacion["fecha_fin"] = this.formFechas.get('fecha10').value;
                        periodo_seguimiento_formulacion["unidades_interes"] = JSON.stringify(this.unidadesInteres);
                        periodo_seguimiento_formulacion["planes_interes"] = JSON.stringify(this.planesInteres);
                        this.request.put(environment.PLANES_CRUD, `periodo-seguimiento`, periodo_seguimiento_formulacion, seguimientoFormulacion["periodo_seguimiento_id"]).subscribe((data: any) => {
                          if (data) {
                            this.request.put(environment.PLANES_CRUD, `seguimiento`, seguimientoFormulacion, seguimientoFormulacion['_id']).subscribe((data: any) => {
                              if (data) {
                                Swal.fire({
                                  title: 'Fechas Actualizadas',
                                  icon: 'success',
                                  showConfirmButton: false,
                                  timer: 2500
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
                    })
                  } else { // Si el ObjectId de periodo_seguimiendo_id no es válido, se crea un registro en periodo-seguimiento
                    seguimientoFormulacion["periodo_seguimiento_id"] = "";
                    let bodySeguimientoPeriodoFormulacion = {
                      fecha_inicio: this.formFechas.get('fecha9').value,
                      fecha_fin: this.formFechas.get('fecha10').value,
                      periodo_id: "46", //Este periodo_id hace ref. al registro de fechas para proceso de seguimiento de los planes de acción de funcionamiento
                      tipo_seguimiento_id: "6260e975ebe1e6498f7404ee",
                      unidades_interes: JSON.stringify(this.unidadesInteres),
                      planes_interes: JSON.stringify(this.planesInteres),
                      activo: true,
                    }
                    await this.request.post(environment.PLANES_CRUD, `periodo-seguimiento`, bodySeguimientoPeriodoFormulacion).subscribe((data: any) => {
                      if (data) {
                        periodo_seguimiento_formulacion = data.Data;
                        seguimientoFormulacion["periodo_seguimiento_id"] = periodo_seguimiento_formulacion._id;
                        this.request.put(environment.PLANES_CRUD, `seguimiento`, seguimientoFormulacion, seguimientoFormulacion['_id']).subscribe((data: any) => {
                          if (data) {
                            Swal.fire({
                              title: 'Fechas Actualizadas',
                              icon: 'success',
                              showConfirmButton: false,
                              timer: 2500
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
                    }, (error) => {
                      Swal.fire({
                        title: 'Error en la operación',
                        text: `Por favor intente de nuevo`,
                        icon: 'warning',
                        showConfirmButton: false,
                        timer: 2500
                      })
                    })
                    
                  }
                } else { //Hay que implementar el codigo para insertar unidades y planes de interes
                  let seguimientoFormulacion = {
                    nombre: "Seguimiento Formulación",
                    descripcion: "Fechas para control de formulación",
                    plan_id: "No aplica",
                    dato: "{}",
                    tipo_seguimiento_id: "6260e975ebe1e6498f7404ee",
                    estado_seguimiento_id: "No aplica",
                    periodo_seguimiento_id: "No aplica",
                    activo: true,
                    fecha_inicio: this.formFechas.get('fecha9').value.toISOString(),
                    fecha_fin: this.formFechas.get('fecha10').value.toISOString()
                  }
                  this.request.post(environment.PLANES_CRUD, `seguimiento`, seguimientoFormulacion).subscribe((data: any) => {
                    if (data) {
                      Swal.fire({
                        title: 'Fechas Actualizadas',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2500
                      })
                    }
                  }, (error) => {
                    Swal.fire({
                      title: 'Error en la operación',
                      text: `Por favor intente de nuevo`,
                      icon: 'warning',
                      showConfirmButton: false,
                      timer: 2500
                    })
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

          } else {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `Por favor complete las fechas para continuar`,
              showConfirmButton: false,
              timer: 2500,
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      }),
        (error: any) => {
          Swal.fire({
            title: 'Error en la operación',
            icon: 'error',
            text: `${JSON.stringify(error)}`,
            showConfirmButton: false,
            timer: 2500,
          });
        };
    } else {
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar el seguimiento de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (
            this.formFechas.get('fecha1').value != '' &&
            this.formFechas.get('fecha2').value != '' &&
            this.formFechas.get('fecha3').value != '' &&
            this.formFechas.get('fecha4').value != '' &&
            this.formFechas.get('fecha5').value != '' &&
            this.formFechas.get('fecha6').value != '' &&
            this.formFechas.get('fecha7').value != '' &&
            this.formFechas.get('fecha8').value != ''
          ) {
            for (let i = 0; i < this.periodos.length; i++) {
              this.actualizarPeriodo(i, this.periodos[i].Id);
            }
            Swal.fire({
              title: 'Fechas Actualizadas',
              icon: 'success',
              showConfirmButton: false,
              timer: 2500,
            });
          } else {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `Por favor complete las fechas para continuar`,
              showConfirmButton: false,
              timer: 2500,
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      }),
        (error: any) => {
          Swal.fire({
            title: 'Error en la operación',
            icon: 'error',
            text: `${JSON.stringify(error)}`,
            showConfirmButton: false,
            timer: 2500,
          });
        };
    }
  }

  guardarInv() {
    if (this.tipoInv == 'formulaciones') {
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar la formulación de planes para la vigencia ` + this.vigenciaInv.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.formFechas.get('fecha19').value != "" && this.formFechas.get('fecha20').value != "") {
            this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,tipo_seguimiento_id:6389efac6a0d190ffb883f71`).subscribe((data: any) => {
              // this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,tipo_seguimiento_id:6260e975ebe1e6498f7404ee`).subscribe((data: any) => {
              if (data) {
                if (data.Data.length > 0) {
                  let seguimientoFormulacion = data.Data[0];
                  seguimientoFormulacion["periodo_id"] = this.periodos[0].Id;
                  seguimientoFormulacion["fecha_inicio"] = this.formFechas.get('fecha19').value.toISOString();
                  seguimientoFormulacion["fecha_fin"] = this.formFechas.get('fecha20').value.toISOString();
                  seguimientoFormulacion["unidades_interes"] = JSON.stringify(this.unidadesInteres);
                  this.request.put(environment.PLANES_CRUD, `periodo-seguimiento`, seguimientoFormulacion, seguimientoFormulacion["_id"]).subscribe((data: any) => {

                    if (data) {
                      Swal.fire({
                        title: 'Fechas Actualizadas',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2500
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
                } else {
                  let seguimientoFormulacion = {
                    //nombre: "Seguimiento Formulación",
                    //descripcion: "Fechas para control de formulación de inversión",
                    //plan_id: "No aplica",
                    //dato: "{}",
                    periodo_id: this.periodos[0].Id,
                    tipo_seguimiento_id: "6389efac6a0d190ffb883f71",
                    //estado_seguimiento_id: "No aplica",
                    //periodo_seguimiento_id: "No aplica",
                    activo: true,
                    fecha_inicio: this.formFechas.get('fecha19').value.toISOString(),
                    fecha_fin: this.formFechas.get('fecha20').value.toISOString(),
                    unidades_interes: JSON.stringify(this.unidadesInteres),
                  }
                  this.request.post(environment.PLANES_CRUD, `periodo-seguimiento`, seguimientoFormulacion).subscribe((data: any) => {
                    if (data) {
                      Swal.fire({
                        title: 'Fechas Actualizadas',
                        icon: 'success',
                        showConfirmButton: false,
                        timer: 2500
                      })
                    }
                  }, (error) => {
                    Swal.fire({
                      title: 'Error en la operación',
                      text: `Por favor intente de nuevo`,
                      icon: 'warning',
                      showConfirmButton: false,
                      timer: 2500
                    })
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

          } else {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `Por favor complete las fechas para continuar`,
              showConfirmButton: false,
              timer: 2500,
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      }),
        (error: any) => {
          Swal.fire({
            title: 'Error en la operación',
            icon: 'error',
            text: `${JSON.stringify(error)}`,
            showConfirmButton: false,
            timer: 2500,
          });
        };
    } else if (this.tipoInv == 'seguimientos') {
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar el seguimiento de planes para la vigencia ` + this.vigenciaInv.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (
            this.formFechas.get('fecha11').value != '' &&
            this.formFechas.get('fecha12').value != '' &&
            this.formFechas.get('fecha13').value != '' &&
            this.formFechas.get('fecha14').value != '' &&
            this.formFechas.get('fecha15').value != '' &&
            this.formFechas.get('fecha16').value != '' &&
            this.formFechas.get('fecha17').value != '' &&
            this.formFechas.get('fecha18').value != ''
          ) {
            for (let i = 0; i < this.periodos.length; i++) {
              this.actualizarPeriodoInv(i, this.periodos[i].Id);
            }
            Swal.fire({
              title: 'Fechas Actualizadas',
              icon: 'success',
              showConfirmButton: false,
              timer: 2500,
            });
          } else {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `Por favor complete las fechas para continuar`,
              showConfirmButton: false,
              timer: 2500,
            });
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
        }
      }),
        (error: any) => {
          Swal.fire({
            title: 'Error en la operación',
            icon: 'error',
            text: `${JSON.stringify(error)}`,
            showConfirmButton: false,
            timer: 2500,
          });
        };
    }
  }

  actualizarPeriodo(i: number, periodoId: number) {
    let body: { periodo_id: string; fecha_inicio: any; fecha_fin: any; unidades_interes: any, planes_interes: any};
    let fecha_inicio, fecha_fin;
    if (i === 0) {
      fecha_inicio = new Date(this.formFechas.get('fecha1').value);
      fecha_fin = new Date(this.formFechas.get('fecha2').value);
    } else if (i === 1) {
      fecha_inicio = new Date(this.formFechas.get('fecha3').value);
      fecha_fin = new Date(this.formFechas.get('fecha4').value);
    } else if (i === 2) {
      fecha_inicio = new Date(this.formFechas.get('fecha5').value);
      fecha_fin = new Date(this.formFechas.get('fecha6').value);
    } else if (i === 3) {
      fecha_inicio = new Date(this.formFechas.get('fecha7').value);
      fecha_fin = new Date(this.formFechas.get('fecha8').value);
    }

    if (fecha_fin.getHours() == 19) {
      fecha_fin.setHours(42, 59, 59);
    } else {
      fecha_fin.setHours(18, 59, 59);
    }

    body = {
      periodo_id: periodoId.toString(),
      fecha_inicio: fecha_inicio.toISOString(),
      fecha_fin: fecha_fin.toISOString(),
      unidades_interes: JSON.stringify(this.unidadesInteres),
      planes_interes: JSON.stringify(this.planesInteres),
    };

    this.request.put(environment.PLANES_MID, `seguimiento/habilitar_reportes`, body, "").subscribe(), (error: any) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
          timer: 2500,
        });
      };
  }

  actualizarPeriodoInv(i: number, periodoId: number) {
    let fecha_In: any;
    let fecha_Fin: any;

    if (i === 0) {
      fecha_In = this.formFechas.get('fecha11').value.toISOString();
      fecha_Fin = this.formFechas.get('fecha12').value.toISOString();
    } else if (i === 1) {
      fecha_In = this.formFechas.get('fecha13').value.toISOString();
      fecha_Fin = this.formFechas.get('fecha14').value.toISOString();
    } else if (i === 2) {
      fecha_In = this.formFechas.get('fecha15').value.toISOString();
      fecha_Fin = this.formFechas.get('fecha16').value.toISOString();
    } else if (i === 3) {
      fecha_In = this.formFechas.get('fecha17').value.toISOString();
      fecha_Fin = this.formFechas.get('fecha18').value.toISOString();
    }
    this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + periodoId + `,tipo_seguimiento_id:6385fa136a0d19d7888837ed`).subscribe((data: any) => {
      if (data) {
        let seguimientoFormulacionGlobal = data.Data[0];
        if (data.Data.length == 0) {
          let body = {
            periodo_id: periodoId.toString(),
            fecha_inicio: fecha_In,
            fecha_fin: fecha_Fin,
            activo: true,
            tipo_seguimiento_id: '6385fa136a0d19d7888837ed',
            unidades_interes: JSON.stringify(this.unidadesInteres),
          };
          this.request.post(environment.PLANES_CRUD, `periodo-seguimiento`, body).subscribe((data: any) => {
            if (data) {
              Swal.fire({
                title: 'Error en la operación',
                text: `No se creó el registro`,
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              })
            }
          })
        } else if (data.Data.length > 0) {
          seguimientoFormulacionGlobal["fecha_inicio"] = fecha_In;
          seguimientoFormulacionGlobal["fecha_fin"] = fecha_Fin;
          seguimientoFormulacionGlobal["tipo_seguimiento_id"] = '6385fa136a0d19d7888837ed';
          seguimientoFormulacionGlobal["unidades_interes"] = JSON.stringify(this.unidadesInteres);
          this.request.put(environment.PLANES_CRUD, `periodo-seguimiento`, seguimientoFormulacionGlobal, seguimientoFormulacionGlobal['_id']).subscribe((data: any) => {
            if (data) {
              Swal.fire({
                title: 'Fechas Actualizadas',
                icon: 'success',
                showConfirmButton: false,
                timer: 2500
              })
            }
          }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              text: `No se actualizo el registro ${JSON.stringify(error)}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          })
        }
      }
    })
  }

  limpiarInv() {
    this.vigenciaInv = undefined;
    this.vigenciaSelectedInv = false;
    this.tipoInv = undefined;
    this.tipoSelectedInv = false;
    this.selectTipoInv.setValue('');
    this.selectVigenciaInv.setValue('--');
    this.unidadesInteres = undefined;
    this.planesInteres = undefined;
    if (this.tipoInv === 'formulaciones') {
      this.formFechas.get('fecha19').setValue('');
      this.formFechas.get('fecha20').setValue('');
    } else if (this.tipoInv == 'seguimientos') {
      this.formFechas.get('fecha11').setValue('');
      this.formFechas.get('fecha12').setValue('');
      this.formFechas.get('fecha13').setValue('');
      this.formFechas.get('fecha14').setValue('');
      this.formFechas.get('fecha15').setValue('');
      this.formFechas.get('fecha16').setValue('');
      this.formFechas.get('fecha17').setValue('');
      this.formFechas.get('fecha18').setValue('');
    }
  }

  limpiar() {
    this.vigenciaSelected = false;
    this.vigencia = undefined;
    this.tipo = undefined;
    this.tipoSelected = false;
    this.selectTipo.setValue('');
    this.selectVigencia.setValue('--');
    this.unidadesInteres = undefined;
    this.planesInteres = undefined;
    if (this.tipo === 'formulacion') {
      this.formFechas.get('fecha9').setValue('');
      this.formFechas.get('fecha10').setValue('');
    } else if (this.tipo == 'seguimiento') {
      this.formFechas.get('fecha1').setValue('');
      this.formFechas.get('fecha2').setValue('');
      this.formFechas.get('fecha3').setValue('');
      this.formFechas.get('fecha4').setValue('');
      this.formFechas.get('fecha5').setValue('');
      this.formFechas.get('fecha6').setValue('');
      this.formFechas.get('fecha7').setValue('');
      this.formFechas.get('fecha8').setValue('');
    }
  }
}
