import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { DataRequest } from 'src/app/@core/models/interfaces/DataRequest.interface';
import { RequestManager } from '../../services/requestManager';
import { Vigencia } from '../habilitar-reporte/utils';
import { DependenciaID } from '../gestion-usuarios/utils';

interface ProcesoFormulacion {
  Etiqueta: string;
  CodigoAbreviacion: string;
}

interface FechaFormulacion {
  fecha_inicio: string;
  fecha_fin: string;
}

const PROCESO_FORMULACION_INICIATIVAS: ProcesoFormulacion = { Etiqueta: 'Formulación', CodigoAbreviacion: 'FIPI_SP' };

@Component({
  selector: 'app-visualizar-fechas-iniciativas',
  templateUrl: './visualizar-fechas-iniciativas.component.html',
  styleUrls: ['../habilitar-reporte/habilitar-reporte.component.scss', './visualizar-fechas-iniciativas.component.scss']
})
export class VisualizarFechasIniciativasComponent implements OnInit {

  vigencias: Vigencia[] = [];
  unidades: DependenciaID[] = [];
  auxUnidades: DependenciaID[] = [];
  procesos: ProcesoFormulacion[] = [PROCESO_FORMULACION_INICIATIVAS];
  vCargaCorrecta = true;

  fechas: FechaFormulacion[] = [];
  mostrarResultados = false;
  sinResultados = false;
  unidadConsultada: DependenciaID;
  procesoConsultado: ProcesoFormulacion;
  columnasTabla: string[] = ['Unidad', 'Proceso', 'Fecha_Inicial', 'Fecha_Final'];

  formFechas = new FormGroup({
    vigencia: new FormControl(null, Validators.required),
    unidad: new FormControl(null, Validators.required),
    proceso: new FormControl(null, Validators.required),
  });

  constructor(
    private request: RequestManager,
  ) { }

  async ngOnInit(): Promise<void> {
    this.mostrarMensajeCarga();
    await this.cargarVigencias();
    await this.cargarUnidades();
    if (this.vCargaCorrecta) Swal.close();
  }

  async cargarVigencias() {
    return await new Promise((resolve, reject) => {
      this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: DataRequest) => {
        if (data.Data && data.Data.length > 0) {
          data.Data.sort((a, b) => a.Nombre - b.Nombre);
          this.vigencias = data.Data;
          resolve(this.vigencias);
        } else {
          reject(new Error('No se encontraron datos registrados'));
        }
      }, (error) => reject(error));
    }).catch((error) => this.mostrarErrorCarga(error));
  }

  async cargarUnidades() {
    return await new Promise((resolve, reject) => {
      this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: DataRequest) => {
        if (data.Data && data.Data.length > 0) {
          this.unidades = data.Data;
          this.auxUnidades = this.unidades;
          resolve(this.unidades);
        } else {
          reject(new Error('No se encontraron datos registrados'));
        }
      }, (error) => reject(error));
    }).catch((error) => this.mostrarErrorCarga(error));
  }

  vBotonBuscar(): boolean {
    return this.vCargaCorrecta && this.formFechas.valid;
  }

  buscarFechas(): void {
    if (!this.vBotonBuscar()) {
      return;
    }
    const { vigencia, unidad, proceso } = this.formFechas.value;
    this.mostrarResultados = false;
    this.sinResultados = false;
    this.mostrarMensajeCarga(true);
    const body = {
      periodoId: vigencia.Id.toString(),
      dependenciaId: unidad.Id,
    };
    this.request.post(environment.PLANES_MID, `formulacion_iniciativas/consultar_fechas_iniciativa`, body)
      .subscribe((data: DataRequest) => {
        Swal.close();
        this.unidadConsultada = unidad;
        this.procesoConsultado = proceso;
        if (data.Data && data.Data.encontrado) {
          this.fechas = [data.Data];
          this.mostrarResultados = true;
        } else {
          this.fechas = [];
          this.sinResultados = true;
        }
      }, () => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se pudieron consultar las fechas de formulación. Intente de nuevo por favor.',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        });
      });
  }

  limpiarFormulario(): void {
    this.formFechas.reset();
    this.auxUnidades = [...this.unidades];
    this.fechas = [];
    this.mostrarResultados = false;
    this.sinResultados = false;
  }

  alCambiarFiltro(): void {
    this.mostrarResultados = false;
    this.sinResultados = false;
  }

  onKey(value: string): void {
    if (value == undefined || value.trim() === '') {
      this.auxUnidades = [...this.unidades];
    } else {
      this.auxUnidades = this.unidades.filter(unidad =>
        unidad.Nombre.toLowerCase().includes(value.toLowerCase()));
    }
  }

  formatearFecha(fechaOriginal: string): string {
    const fechaObjeto = new Date(fechaOriginal);
    const dia = fechaObjeto.getUTCDate().toString().padStart(2, '0');
    const mes = (fechaObjeto.getUTCMonth() + 1).toString().padStart(2, '0');
    const anio = fechaObjeto.getUTCFullYear();
    return `${dia}/${mes}/${anio}`;
  }

  mostrarMensajeCarga(banderaPeticion: boolean = false): void {
    Swal.fire({
      title: (!banderaPeticion) ? 'Cargando datos...' : 'Procesando petición...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  private mostrarErrorCarga(error: any): void {
    this.vCargaCorrecta = false;
    Swal.fire({
      title: 'Error en la operación',
      text: (error && typeof error.error === 'string' && error.error) || 'No se encontraron datos registrados',
      icon: 'warning',
      showConfirmButton: false,
      timer: 2500
    });
  }
}