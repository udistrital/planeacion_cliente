import { Component, OnInit } from '@angular/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { Data } from '@angular/router';
import { report } from 'process';
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
  periodo1 : Date[];
  periodo2 : Date[];
  periodo3 : Date[];
  periodo4 : Date[];
  periodoFormulacion = [Date, Date];

  constructor(
    private request: RequestManager
  ) {
    this.loadVigencias();
    this.vigenciaSelected = false;
  }

  ngOnInit(): void {

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
    }
  }

  onChange(tipo) {
    if (tipo == undefined) {
      this.tipoSelected = false;
    } else {
      this.tipoSelected = true;
      this.tipo = tipo;
      console.log(tipo)
    }
  }

  onChangeFF(index : number, event: MatDatepickerInputEvent<Date>){
    console.log(index + " "+ event)
    if (index == 1){
      console.log(event.value)
    }
  }


  guardar() {
    if (this.tipo == 'formulacion'){
      Swal.fire({
        title: 'Habilitar Fechas',
        text: `¿Desea habilitar la formulación de planes para la vigencia ` + this.vigencia.Nombre + ` ?`,
        showCancelButton: true,
        confirmButtonText: `Sí`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {

          let aux = {}
          this.request.put(environment.PLANES_MID, `seguimiento/habilitar_reportes` , aux,  this.periodo.Id).subscribe((data: any) => {
            if (data) {
              this.reporteHabilitado = true
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

  limpiar(){
    console.log("limpiar")
  }


}
