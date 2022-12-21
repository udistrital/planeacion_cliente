import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { Row } from 'ng2-smart-table/lib/lib/data-set/row';

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

export interface Unidad {
  Id: string;
  Nombre: string;
}



@Component({
  selector: 'app-habilitar-reporte',
  templateUrl: './habilitar-reporte.component.html',
  styleUrls: ['./habilitar-reporte.component.scss']
})
export class HabilitarReporteComponent implements OnInit {

  vigenciaSelected: boolean;
  unidadSelected: boolean;
  tipoSelected: boolean;
  tipoSelectedInv: boolean;
  reporteHabilitado: boolean;
  vigencias: any[];
  periodos: any[];
  vigencia: any;
  tipo: string;
  unidad: string;
  periodo: any;
  periodoFormulacion = [Date, Date];
  formFechas: FormGroup;
  date9: Date = new Date();
  guardarDisabled: boolean;
  displayedColumns: string[] = ['index','Nombre', 'actions'];
  unidadesInteres: any;
  dataUnidades: any;
  dataSource = new MatTableDataSource<Unidades>();  
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  
  constructor(
    private request: RequestManager,
    private formBuilder: FormBuilder,
  ) {
    this.loadVigencias();
    this.vigenciaSelected = false;
    this.guardarDisabled = false;
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
        timer: 2500
      })
    })
  }
  changeIcon(row) {            
    if (row.iconSelected == 'compare_arrows') {
      row.iconSelected = 'done';  
      let unidad = [];      
      if (this.unidadesInteres[0].Id == undefined ) {
        unidad = [...[{
                  "Id": row.Id,
                  "Nombre": row.Nombre,                  
                }]];
      this.unidadesInteres = unidad;
      } else {
        unidad = [...this.unidadesInteres, ...[{
                  "Id": row.Id,
                  "Nombre": row.Nombre,                  
                }]];
      this.unidadesInteres = unidad;
      }           
    } else if (row.iconSelected == 'done') {
      row.iconSelected = 'compare_arrows';
      let unidadEliminar = row.Id;  
      const index = this.unidadesInteres.findIndex(x => x.Id == unidadEliminar); 
      this.unidadesInteres.splice(index, 1);
    }
  }

  onChangeV(vigencia) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      this.loadTrimestres();
      if (this.tipoSelected)
        this.loadFechas();
    }
  }


  onChange(tipo) {
    if (tipo == undefined) {
      this.tipoSelected = false;
    } else {
      this.tipoSelected = true;
      this.tipo = tipo;
      this.loadFechas();
    }
  }

  onChangeInv(tipo) {
    if (tipo == undefined) {
      this.tipoSelectedInv = false;
    } else {
      this.tipoSelectedInv = true;
      this.tipo = tipo;
      this.loadFechas();
    }
  }

  onChangeU(unidad) {
    this.loadUnidades();    
    if (unidad == undefined) {
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
    }       
  }

  

  onChangeFF(index: number, event: MatDatepickerInputEvent<Date>) {
    if (index == 1) {
      let aux: Date = event.value;
    }
  }
  onChangeI(vigencia) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      this.loadTrimestres();
      if (this.tipoSelectedInv)
        this.loadFechas();
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
    })
    if (this.tipo === 'formulacion') {
      this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,tipo_seguimiento_id:6260e975ebe1e6498f7404ee`).subscribe((data: any) => {
        if (data) {
          if (data.Data.length != 0) {
            let formulacionSeguimiento = data.Data[0];
            let fechaInicio = new Date(formulacionSeguimiento["fecha_inicio"]);
            let fechaFin = new Date(formulacionSeguimiento["fecha_fin"]);
            this.formFechas.get('fecha9').setValue(fechaInicio);
            this.formFechas.get('fecha10').setValue(fechaFin);
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
    } else if (this.tipo === 'formulaciones') {
      this.readUnidadesForm();
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
    } else if (this.tipo === 'seguimiento') {
      if (this.periodos.length > 0) {
        for (let i = 0; i < this.periodos.length; i++) {
          this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + this.periodos[i].Id + `,tipo_seguimiento_id:61f236f525e40c582a0840d0`).subscribe((data: any) => {
            if (data.Data.length != 0) {
              let seguimiento = data.Data[0];
              let fechaInicio = new Date(seguimiento["fecha_inicio"]);
              let fechaFin = new Date(seguimiento["fecha_fin"]);

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
          text: `No se encuentran tirmestres habilitados para esta vigencia`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }


    } else if (this.tipo === 'seguimientos') {
      this.readUnidades();
      if (this.periodos.length > 0) {
        for (let i = 0; i < this.periodos.length; i++) {
          this.request.get(environment.PLANES_CRUD, `periodo-seguimiento?query=activo:true,periodo_id:` + this.periodos[i].Id + `,tipo_seguimiento_id:6385fa136a0d19d7888837ed`).subscribe((data: any) => {
            if (data.Data.length != 0) {
              let seguimiento = data.Data[0];
              let fechaInicio = new Date(seguimiento["fecha_inicio"]);
              let fechaFin = new Date(seguimiento["fecha_fin"]);

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
          text: `No se encuentran tirmestres habilitados para esta vigencia`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }


    }
  }

  loadTrimestres() {
    Swal.fire({
      title: 'Cargando períodos',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `seguimiento/get_periodos/` + this.vigencia.Id).subscribe((data: any) => {
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
        } else if (data.Data.length == 0){
            this.unidadesInteres = ' ';         
        }
      }
    },(error) => {
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
        } else if (data.Data.length == 0){
            this.unidadesInteres = ' ';          
        }
      }
    },(error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    });
  }

  loadUnidades() {
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) =>{
      if(data) {
        if(data.Data.length != 0) {
          this.dataUnidades = data.Data;
          if (this.unidadesInteres.length == 0 || this.unidadesInteres.length == undefined || this.unidadesInteres == ' ') {
            for ( let i = 0; i < this.dataUnidades.length; i++) {             
              this.dataUnidades[i].iconSelected = 'compare_arrows';
              this.dataUnidades[i].posicion = i + 1;
            }
          } else {
            for ( let i = 0; i < this.dataUnidades.length; i++ ){
              for (let j = 0; j < this.unidadesInteres.length; j++ ) {
                if (this.unidadesInteres[j].Id == this.dataUnidades[i].Id) {
                  if (this.dataUnidades[i].iconSelected == 'compare_arrows' || this.dataUnidades[i].iconSelected == '' || this.dataUnidades[i].iconSelected == undefined) {
                    this.dataUnidades[i].iconSelected = 'done';
                    this.dataUnidades[i].posicion = i + 1;
                  }
                } else if (this.unidadesInteres[j].Id != this.dataUnidades[i].Id) {
                    if (this.dataUnidades[i].iconSelected == 'done') {
                      this.dataUnidades[i].posicion = i + 1;
                    } else if (this.dataUnidades.iconSelected == '' || this.dataUnidades.iconSelected == undefined) {
                        this.dataUnidades[i].iconSelected = 'compare_arrows';
                        this.dataUnidades[i].posicion = i + 1;                       
                    }
                  }
                }
              }
            }
          this.dataSource = new MatTableDataSource(this.dataUnidades);
          this.dataSource.paginator = this.paginator;       
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

  guardar() {
    if (this.tipo == 'formulacion') {
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar la formulación de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.formFechas.get('fecha9').value != "" && this.formFechas.get('fecha10').value != "") {
            this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,tipo_seguimiento_id:6260e975ebe1e6498f7404ee`).subscribe((data: any) => {
              if (data) {
                if (data.Data.length > 0) {
                  let seguimientoFormulacion = data.Data[0];
                  seguimientoFormulacion["fecha_inicio"] = this.formFechas.get('fecha9').value.toISOString();
                  seguimientoFormulacion["fecha_fin"] = this.formFechas.get('fecha10').value.toISOString();
                  this.request.put(environment.PLANES_CRUD, `seguimiento`, seguimientoFormulacion, seguimientoFormulacion["_id"]).subscribe((data: any) => {
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
              timer: 2500
            })
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
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
    } else {
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar el seguimiento de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.formFechas.get('fecha1').value != "" && this.formFechas.get('fecha2').value != "" && this.formFechas.get('fecha3').value != "" && this.formFechas.get('fecha4').value != "" && this.formFechas.get('fecha5').value != ""
            && this.formFechas.get('fecha6').value != "" && this.formFechas.get('fecha7').value != "" && this.formFechas.get('fecha8').value != "") {
            for (let i = 0; i < this.periodos.length; i++) {
              this.actualizarPeriodo(i, this.periodos[i].Id);
            }
            Swal.fire({
              title: 'Fechas Actualizadas',
              icon: 'success',
              showConfirmButton: false,
              timer: 2500
            })
          } else {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `Por favor complete las fechas para continuar`,
              showConfirmButton: false,
              timer: 2500
            })
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
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


  guardarInv() {
    if (this.tipo == 'formulaciones') {
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar la formulación de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
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
              timer: 2500
            })
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
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
    } else if (this.tipo == 'seguimientos') {
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar el seguimiento de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (this.formFechas.get('fecha11').value != "" && this.formFechas.get('fecha12').value != "" && this.formFechas.get('fecha13').value != "" && this.formFechas.get('fecha14').value != "" && this.formFechas.get('fecha15').value != ""
            && this.formFechas.get('fecha16').value != "" && this.formFechas.get('fecha17').value != "" && this.formFechas.get('fecha18').value != "") {
            for (let i = 0; i < this.periodos.length; i++) {
              this.actualizarPeriodoInv(i, this.periodos[i].Id);
            }
            Swal.fire({
              title: 'Fechas Actualizadas',
              icon: 'success',
              showConfirmButton: false,
              timer: 2500
            })
          } else {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `Por favor complete las fechas para continuar`,
              showConfirmButton: false,
              timer: 2500
            })
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
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

  actualizarPeriodo(i: number, periodoId: number) {
    let body;
    if (i === 0) {
      body = {
        "periodo_id": periodoId.toString(),
        "fecha_inicio": this.formFechas.get('fecha1').value.toISOString(),
        "fecha_fin": this.formFechas.get('fecha2').value.toISOString(),
        
      }
    } else if (i === 1) {
      body = {
        "periodo_id": periodoId.toString(),
        "fecha_inicio": this.formFechas.get('fecha3').value.toISOString(),
        "fecha_fin": this.formFechas.get('fecha4').value.toISOString()
      }
    } else if (i === 2) {
      body = {
        "periodo_id": periodoId.toString(),
        "fecha_inicio": this.formFechas.get('fecha5').value.toISOString(),
        "fecha_fin": this.formFechas.get('fecha6').value.toISOString()
      }
    } else if (i === 3) {
      body = {
        "periodo_id": periodoId.toString(),
        "fecha_inicio": this.formFechas.get('fecha7').value.toISOString(),
        "fecha_fin": this.formFechas.get('fecha8').value.toISOString()
      }
    }

    this.request.put(environment.PLANES_MID, `seguimiento/habilitar_reportes`, body, "").subscribe(), (error) => {
      Swal.fire({
        title: 'Error en la operación',
        icon: 'error',
        text: `${JSON.stringify(error)}`,
        showConfirmButton: false,
        timer: 2500
      })
    }
  }

  actualizarPeriodoInv(i: number, periodoId: number) {
    let fecha_In;
    let fecha_Fin;

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
          seguimientoFormulacionGlobal["fecha_inicio"]= fecha_In;
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

limpiar() {
  if (this.tipo === 'formulacion') {
    this.formFechas.get('fecha9').setValue("");
    this.formFechas.get('fecha10').setValue("");
  } else if (this.tipo == 'seguimiento') {
    this.formFechas.get('fecha1').setValue("");
    this.formFechas.get('fecha2').setValue("");
    this.formFechas.get('fecha3').setValue("");
    this.formFechas.get('fecha4').setValue("");
    this.formFechas.get('fecha5').setValue("");
    this.formFechas.get('fecha6').setValue("");
    this.formFechas.get('fecha7').setValue("");
    this.formFechas.get('fecha8').setValue("");
  } else if (this.tipo === 'formulaciones') {
    this.formFechas.get('fecha19').setValue("");
    this.formFechas.get('fecha20').setValue("");
  } else if (this.tipo == 'seguimientos') {
    this.formFechas.get('fecha11').setValue("");
    this.formFechas.get('fecha12').setValue("");
    this.formFechas.get('fecha13').setValue("");
    this.formFechas.get('fecha14').setValue("");
    this.formFechas.get('fecha15').setValue("");
    this.formFechas.get('fecha16').setValue("");
    this.formFechas.get('fecha17').setValue("");
    this.formFechas.get('fecha18').setValue("");
    }
  }
}

