import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';

@Component({
  selector: 'app-habilitar-reporte',
  templateUrl: './habilitar-reporte.component.html',
  styleUrls: ['./habilitar-reporte.component.scss']
})
export class HabilitarReporteComponent implements OnInit {

  vigenciaSelected: boolean;
  tipoSelected: boolean;
  reporteHabilitado: boolean;
  vigencias: any[];
  periodos: any[];
  vigencia: any;
  tipo: string;
  periodo: any;
  periodoFormulacion = [Date, Date];
  formFechas: FormGroup;
  date9: Date = new Date();
  guardarDisabled: boolean;

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
      fecha10: ['',]
    });
  }

  loadVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG`).subscribe((data: any) => {
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

  onChangeFF(index: number, event: MatDatepickerInputEvent<Date>) {
    if (index == 1) {
      let aux: Date = event.value;
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
      this.request.get(environment.PLANES_CRUD, `seguimiento?query=tipo_seguimiento_id:6260e975ebe1e6498f7404ee`).subscribe((data: any) => {
        if (data) {
          let formulacionSeguimiento = data.Data[0];
          let fechaInicio = new Date(formulacionSeguimiento["fecha_inicio"]);
          let fechaFin = new Date(formulacionSeguimiento["fecha_fin"]);
          this.formFechas.get('fecha9').setValue(fechaInicio);
          this.formFechas.get('fecha10').setValue(fechaFin);
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
    } else if (this.tipo === 'seguimiento') {

      for (let i = 0; i < this.periodos.length; i++) {
        this.request.get(environment.PLANES_CRUD, `seguimiento?query=activo:true,tipo_seguimiento_id:61f236f525e40c582a0840d0,periodo_id:` + this.periodos[i].Id).subscribe((data: any) => {
          if (data) {
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
  }

  loadTrimestres() {
    this.request.get(environment.PRUEBA, `seguimiento/get_periodos/` + this.vigencia.Id).subscribe((data: any) => {
      if (data) {
        if (data.Data != "") {
          this.periodos = data.Data;
          this.guardarDisabled = false;
        } else {
          this.guardarDisabled = true;
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
            this.request.get(environment.PLANES_CRUD, `seguimiento?query=tipo_seguimiento_id:6260e975ebe1e6498f7404ee`).subscribe((data: any) => {
              if (data) {
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

  actualizarPeriodo(i: number, periodoId: number) {
    if (i === 0) {
      let body = {
        "periodo_id": periodoId.toString(),
        "fecha_inicio": this.formFechas.get('fecha1').value.toISOString(),
        "fecha_fin": this.formFechas.get('fecha2').value.toISOString()
      }
      this.request.put(environment.PRUEBA, `seguimiento/habilitar_reportes`, body, "").subscribe(), (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      };

    } else if (i === 1) {
      let body = {
        "periodo_id": periodoId.toString(),
        "fecha_inicio": this.formFechas.get('fecha3').value.toISOString(),
        "fecha_fin": this.formFechas.get('fecha4').value.toISOString()
      }
      this.request.put(environment.PRUEBA, `seguimiento/habilitar_reportes`, body, "").subscribe(), (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
    } else if (i === 2) {
      let body = {
        "periodo_id": periodoId.toString(),
        "fecha_inicio": this.formFechas.get('fecha5').value.toISOString(),
        "fecha_fin": this.formFechas.get('fecha6').value.toISOString()
      }
      this.request.put(environment.PRUEBA, `seguimiento/habilitar_reportes`, body, "").subscribe(), (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
    } else if (i === 3) {
      let body = {
        "periodo_id": periodoId.toString(),
        "fecha_inicio": this.formFechas.get('fecha7').value.toISOString(),
        "fecha_fin": this.formFechas.get('fecha8').value.toISOString()
      }
      this.request.put(environment.PRUEBA, `seguimiento/habilitar_reportes`, body, "").subscribe(), (error) => {
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
    }
  }


}
