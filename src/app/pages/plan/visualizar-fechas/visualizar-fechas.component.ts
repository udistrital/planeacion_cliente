import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { Vigencia } from '../habilitar-reporte/utils';
import { DataRequest } from 'src/app/@core/models/interfaces/DataRequest.interface';
import { PLAN_ACCION_FUNCIONAMIENTO, PROCESO_FORMULACION, PROCESO_SEGUIMIENTO, Tipo } from './utils';
import { DependenciaID } from '../gestion-usuarios/utils';

@Component({
  selector: 'app-visualizar-fechas',
  templateUrl: './visualizar-fechas.component.html',
  styleUrls: ['./visualizar-fechas.component.scss']
})
export class VisualizarFechasComponent implements OnInit {

  vigencias: Vigencia[];
  vigencia: Vigencia;
  vVigenciaSeleccionada: boolean; // vVigenciaSeleccionada = Validación Vigencia Seleccionada
  procesos: Tipo[] = [PROCESO_FORMULACION, PROCESO_SEGUIMIENTO];
  proceso: Tipo;
  vProcesoSeleccionado: boolean;
  unidades: DependenciaID[];
  auxUnidades: DependenciaID[];
  unidad: DependenciaID;
  vUnidadSeleccionada: boolean;
  tiposPlanes: Tipo[] = [PLAN_ACCION_FUNCIONAMIENTO];
  tipoPlan: Tipo;
  vTipoPlanSeleccionado: boolean;
  planes: any[];
  plan: any;
  vPlanSeleccionado: boolean;
  vCargaCorrecta: boolean = true;

  selectVigencia = new FormControl();
  selectUnidad = new FormControl();
  selectProceso = new FormControl();
  selectTipoPlan = new FormControl();
  selectPlan = new FormControl();
  formFechas: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
  ) { }

  async ngOnInit(): Promise<void> {
    this.mostrarMensajeCarga();
    this.formFechas = this.formBuilder.group({
      vigencia: [this.vigencia, Validators.required],
      unidad: [this.unidad, Validators.required],
      proceso: [this.proceso, Validators.required],
      tipoPlan: [this.tipoPlan, Validators.required],
      plan: [this.plan, Validators.required],
    })
    await this.cargarVigencias();
    await this.cargarUnidades();
    if (this.vCargaCorrecta) Swal.close();
  }

  async cargarVigencias() {
    return await new Promise((resolve, reject) => {
      this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: DataRequest) => {
        if (data.Data && data.Data.length > 0) {
          this.vigencias = data.Data;
          resolve(this.vigencias);
        } else {
          reject(new Error('No se encontraron datos registrados'));
        }
      }, (error) => {
        reject(error);
      });
    }).catch((error) => {
      this.vCargaCorrecta = false;
      Swal.fire({
        title: 'Error en la operación',
        text: error.error || 'Error inesperado en la operación, intente de nuevo por favor',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }

  onChangeVigencia(vigencia: Vigencia) {
    if (vigencia == undefined) {
      this.vVigenciaSeleccionada = false;
    } else {
      this.vVigenciaSeleccionada = true;
      this.vigencia = vigencia;
    }
  }

  onChangeProceso(proceso: Tipo) {
    if (proceso == undefined) {
      this.vProcesoSeleccionado = false;
    } else {
      this.vProcesoSeleccionado = true;
      this.proceso = proceso;
    }
  }

  onChangeUnidad(unidad: DependenciaID) {
    if (unidad == undefined) {
      this.vUnidadSeleccionada = false;
    } else {
      this.vUnidadSeleccionada = true;
      this.unidad = unidad;
    }
  }

  onKey(value: string) {
    if (value == undefined) {
      this.auxUnidades = this.unidades;
    } else {
      this.auxUnidades = this.search(value);
    }
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
      }, (error) => {
        reject(error);
      });
    }).catch((error) => {
      this.vCargaCorrecta = false;
      let text: string = `No se encontraron datos registrados`;
      Swal.fire({
        title: 'Error en la operación',
        text: error.error ? `${text} ${JSON.stringify(error.error)}` : text,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }
  
  search(value: string) {
    if (this.unidades != undefined) {
      return this.unidades.filter(unidad => unidad.Nombre.toLowerCase().includes(value.toLowerCase()));
    }
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
}
