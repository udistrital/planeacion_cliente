import { Component, OnInit } from '@angular/core';
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
  periodoSelected: boolean;
  reporteHabilitado: boolean;
  vigencias: any[];
  periodos: any[];
  vigencia: any;
  periodo: any;
  constructor(
    private request: RequestManager
  ) {
    this.loadVigencias();
    this.vigenciaSelected = false;
    this.periodoSelected = false;
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

  loadPeriodos() {
    this.request.get(environment.PLANES_MID, `seguimiento/get_periodos/` + this.vigencia.Id).subscribe((data: any) => {
      if (data) {
        if (data.Data[0].ParametroId){
          this.periodos = data.Data;
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

  onChangeV(vigencia) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      if (this.vigenciaSelected) {
        this.loadPeriodos();
      }
    }
  }

  onChangeP(periodo) {
    if (periodo == undefined) {
      this.periodoSelected = false;
    } else {
      this.periodoSelected = true;
      this.periodo = periodo;
      if (this.vigenciaSelected && this.periodoSelected) {
        this.verificarReporte();
      }
    }
  }

  verificarReporte() {
    this.request.get(environment.PLANES_CRUD, `seguimiento?query=periodo_id:` + this.periodo.Id + `,activo:true`).subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {
          this.reporteHabilitado = true;
        } else {
          this.reporteHabilitado = false;
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

  habilitarReportes() {
    Swal.fire({
      title: 'Habilitar Reportes',
      text: `¿Desea habilitar los reportes para el ` + this.periodo.ParametroId.Nombre + ` de la vigencia ` + this.vigencia.Nombre + ` ?`,
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
