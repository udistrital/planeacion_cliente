import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import Swal from 'sweetalert2';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import { DataRequest } from 'src/app/@core/models/interfaces/DataRequest.interface';
import { CodigosService } from 'src/app/@core/services/codigos.service';
import { MensajesCargaService } from 'src/app/@core/services/mensajes-carga.service';
import { PeriodoSeguimiento, Unidad, Usuario, Vigencia } from '../habilitar-reporte/utils';

@Component({
  selector: 'app-habilitar-reporte-iniciativas',
  templateUrl: './habilitar-reporte-iniciativas.component.html',
  styleUrls: ['../habilitar-reporte/habilitar-reporte.component.scss', './habilitar-reporte-iniciativas.component.scss']
})
export class HabilitarReporteIniciativasComponent implements OnInit {

  vigencias: Vigencia[] = [];
  vigencia: Vigencia;
  vigenciaSelected: boolean = false;
  tipoSelected: boolean = false;
  banderaUnidadesInteres: boolean = false;
  guardarDisabled: boolean = false;
  tipo: string;
  unidadesInteres: Unidad[] | any;
  user: Usuario;

  selectVigencia = new FormControl();
  selectTipo = new FormControl();
  formFechas = new FormGroup({
    fechaInicio: new FormControl(''),
    fechaFin: new FormControl('')
  });

  CODIGO_TIPO_SEGUIMIENTO_F: string;

  constructor(
    private request: RequestManager,
    private codigosService: CodigosService,
    private mensajesCarga: MensajesCargaService
  ) { }

  async ngOnInit() {
    this.user = JSON.parse(atob(localStorage.getItem('user')));
    this.CODIGO_TIPO_SEGUIMIENTO_F = await this.codigosService.getId('PLANES_CRUD', 'tipo-seguimiento', 'FIPI_SP');
    this.cargarVigencias();
  }

  cargarVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=codigo_abreviacion:VG,activo:true`)
      .subscribe((data: DataRequest) => {
        if (data && data.Data) {
          data.Data.sort((a, b) => a.Nombre - b.Nombre);
          this.vigencias = data.Data;
        }
      }, () => {
        this.mostrarMensaje('warning', 'No se pudieron cargar las vigencias, por favor comunicarse con computo@udistrital.edu.co');
      });
  }

  manejarCambiosUnidadesInteres(nuevasUnidades: Unidad[]) {
    this.unidadesInteres = nuevasUnidades;
  }

  onChangeVigencia(vigencia: Vigencia) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
      this.vigencia = undefined;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
    }
  }

  onChangeProceso(tipo: string) {
    if (tipo == undefined) {
      this.tipoSelected = false;
    } else {
      this.tipoSelected = true;
      this.tipo = tipo;
    }
  }

  banderaTabla(objeto: string) {
    // Objeto hace referencia a las unidades
    switch (objeto) {
      case 'unidades':
        this.banderaUnidadesInteres = true;
        break;
      default:
        this.banderaUnidadesInteres = false;
    }
  }

  guardar() {
    if (this.unidadesInteres == undefined || this.unidadesInteres.length == 0) {
      this.mostrarMensaje('warning', 'Por favor seleccione las unidades de interés para continuar');
      return;
    }

    const fechaInicio = this.formFechas.get('fechaInicio').value;
    const fechaFin = this.formFechas.get('fechaFin').value;
    if (!fechaInicio || !fechaFin) {
      this.mostrarMensaje('error', 'Por favor complete las fechas para continuar');
      return;
    }

    Swal.fire({
      title: 'Habilitar Fechas',
      text: `¿Desea habilitar la formulación de planes para la vigencia ${this.vigencia.Nombre} ?`,
      showCancelButton: true,
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      allowOutsideClick: false,
    }).then((result) => {
      if (!result.isConfirmed) return;

      this.mensajesCarga.mostrarMensajeCarga(true);
      const periodoSeguimiento: PeriodoSeguimiento = {} as PeriodoSeguimiento;
      periodoSeguimiento.periodo_id = this.vigencia.Id.toString();
      periodoSeguimiento.fecha_inicio = fechaInicio;
      periodoSeguimiento.fecha_fin = fechaFin;
      periodoSeguimiento.tipo_seguimiento_id = this.CODIGO_TIPO_SEGUIMIENTO_F;
      periodoSeguimiento.unidades_interes = JSON.stringify(this.unidadesInteres);
      periodoSeguimiento.usuario_modificacion = this.user.userService.documento ? this.user.userService.documento : '';
      periodoSeguimiento.activo = true;

      // revisar el endpoint
      this.request.post(environment.PLANES_MID, 'formulacion_iniciativas/habilitar_fechas_iniciativa', periodoSeguimiento)
        .subscribe((data: DataRequest) => {
          if (data && data.Success) {
            Swal.fire({
              title: 'Fechas Actualizadas',
              icon: 'success',
              showConfirmButton: false,
              timer: 2500
            });
            this.limpiarForm();
          }
        }, () => {
          this.mostrarMensaje('error', 'Hubo un problema al procesar la solicitud. Por favor, inténtelo de nuevo.');
        });
    });
  }

  limpiarForm() {
    this.vigenciaSelected = false;
    this.vigencia = undefined;
    this.tipo = undefined;
    this.tipoSelected = false;
    this.selectTipo.setValue('');
    this.selectVigencia.setValue('--');
    this.unidadesInteres = undefined;
    this.banderaUnidadesInteres = false;
    this.formFechas.reset({ fechaInicio: '', fechaFin: '' });
  }

  private mostrarMensaje(icon: 'warning' | 'error', texto: string) {
    Swal.fire({
      title: 'Error en la operación',
      text: texto,
      icon,
      showConfirmButton: false,
      timer: 2500
    });
  }
}