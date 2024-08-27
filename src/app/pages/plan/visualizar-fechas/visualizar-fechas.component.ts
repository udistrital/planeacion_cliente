import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { PeriodoSeguimiento, PlanInteres, Unidad, Vigencia } from '../habilitar-reporte/utils';
import { DataRequest } from 'src/app/@core/models/interfaces/DataRequest.interface';
import { BodyPeticion, PeriodoSeguimientoTrimestres, Plan, PLAN_ACCION_FUNCIONAMIENTO, PROCESO_FORMULACION_FUNCIONAMIENTO, PROCESO_SEGUIMIENTO_FUNCIONAMIENTO, Tipo } from './utils';
import { DependenciaID } from '../gestion-usuarios/utils';
import { CodigosService } from 'src/app/@core/services/codigos.service';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-visualizar-fechas',
  templateUrl: './visualizar-fechas.component.html',
  styleUrls: ['./visualizar-fechas.component.scss']
})
export class VisualizarFechasComponent implements OnInit {

  vigencias: Vigencia[];
  vigencia: Vigencia;
  vVigenciaSeleccionada: boolean; // vVigenciaSeleccionada = Validación Vigencia Seleccionada
  tiposProcesos: Tipo[] = [PROCESO_FORMULACION_FUNCIONAMIENTO, PROCESO_SEGUIMIENTO_FUNCIONAMIENTO];
  tipoProceso: Tipo;
  vTipoProcesoSeleccionado: boolean;
  unidades: DependenciaID[];
  auxUnidades: DependenciaID[];
  unidad: DependenciaID;
  vUnidadSeleccionada: boolean;
  tiposPlanes: Tipo[] = [PLAN_ACCION_FUNCIONAMIENTO];
  tipoPlan: Tipo;
  vTipoPlanSeleccionado: boolean;
  planes: Plan[];
  auxPlanes: Plan[];
  plan: Plan;
  vPlanSeleccionado: boolean;
  vCargaCorrecta: boolean = true;
  periodosSeguimiento: PeriodoSeguimiento[];
  vPeriodosSeguimiento: boolean;
  datosTabla: MatTableDataSource<PeriodoSeguimiento>;
  columnasTabla: string[];

  selectVigencia = new FormControl();
  selectUnidad = new FormControl();
  selectTipoPlan = new FormControl();
  selectPlan = new FormControl();
  selectTipoProceso = new FormControl();
  formFechas: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private codigosService: CodigosService,
  ) { }

  async ngOnInit(): Promise<void> {
    this.mostrarMensajeCarga();
    this.vVigenciaSeleccionada = false;
    this.vUnidadSeleccionada = false;
    this.vTipoProcesoSeleccionado = false;
    this.vTipoPlanSeleccionado = false;
    this.vPlanSeleccionado = false;
    this.vPeriodosSeguimiento = false;
    this.formFechas = this.construirFormulario();
    this.datosTabla = new MatTableDataSource<PeriodoSeguimiento>();
    this.columnasTabla = ['Plan', 'Proceso', 'Fecha_Modificacion',
      'Usuario_Modificacion', 'Fecha_Inicial', 'Fecha_Final'];
    await this.cargarVigencias();
    await this.cargarUnidades();
    await this.cargarIdTiposPlanes();
    await this.cargarIdTiposProcesos();
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

  async cargarIdTiposPlanes() {
    for (let index = 0; index < this.tiposPlanes.length; index++) {
      let tipoPlan: Tipo = this.tiposPlanes[index];
      let idTipoPlan = await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', tipoPlan.CodigoAbreviacion)
      this.tiposPlanes[index].Id = idTipoPlan;
    }
  }

  async cargarIdTiposProcesos() {
    for (let index = 0; index < this.tiposProcesos.length; index++) {
      let tipoProceso: Tipo = this.tiposProcesos[index];
      let idTipoProceso = await this.codigosService.getId('PLANES_CRUD', 'tipo-seguimiento', tipoProceso.CodigoAbreviacion)
      this.tiposProcesos[index].Id = idTipoProceso;
    }
  }

  async cargarPlanes() {
    this.mostrarMensajeCarga();
    return await new Promise((resolve, reject) => {
      this.request.get(environment.PLANES_CRUD, `plan?query=formato:true,activo:true,tipo_plan_id:${this.tipoPlan.Id}`).subscribe((data: DataRequest) => {
        if (data.Data && data.Data.length > 0) {
          this.planes = data.Data;
          this.auxPlanes = this.planes;
          resolve(this.planes);
          Swal.close();
        } else {
          reject(new Error('No se encontraron datos registrados'));
        }
      }, (error) => {
        reject(error);
      });
    }).catch((error) => {
      this.vCargaCorrecta = false;
      this.planes = [];
      this.auxPlanes = [];
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

  async buscarFechas() {
    if (this.vBotonBuscar()) {
      this.vPeriodosSeguimiento = false;
      this.mostrarMensajeCarga(true);
      let unidad: Unidad = {
        Id: this.unidad.Id.toString(),
        Nombre: this.unidad.Nombre
      };
      let plan: PlanInteres = {
        _id: this.plan._id,
        nombre: this.plan.nombre
      }
      let body: BodyPeticion = {
        vigencia_id: this.vigencia.Id.toString(),
        tipo_seguimiento_id: this.tipoProceso.Id,
        codigo_abreviacion_proceso: this.tipoProceso.CodigoAbreviacion,
        activo: true,
        unidades_interes: JSON.stringify([unidad]),
        planes_interes: JSON.stringify([plan]),
      }
      return await new Promise((resolve, reject) => {
        this.request.post(environment.PLANES_MID, `formulacion/obtener-fechas`, body).subscribe(async (data: DataRequest) => {
          if (data.Data && data.Data.length > 0) {
            this.periodosSeguimiento = data.Data;
            await this.manejarDatosTabla(this.periodosSeguimiento);
            resolve(this.periodosSeguimiento);
            Swal.close();
          } else {
            reject(new Error('No se encontraron datos registrados'));
          }
        }, (error) => {
          reject(error);
        });
      }).catch((error) => {
        this.vPeriodosSeguimiento = false;
        let text: string = `No se encontraron datos registrados`;
        Swal.fire({
          title: 'Error en la operación',
          text: error.error ? `${text}: ${error.error.Data}` : text,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        });
      });
    }
  }

  async manejarDatosTabla(periodosSeguimiento: PeriodoSeguimientoTrimestres[]) {
    let indexTrimestre: number = 1; // Solo para el proceso de seguimiento
    for await (const periodoSeguimiento of periodosSeguimiento) {
      let nombreUsuarioModificacion = await this.validarNombreUsuario(periodoSeguimiento.usuario_modificacion)
      if (nombreUsuarioModificacion) periodoSeguimiento.usuario_modificacion = nombreUsuarioModificacion
      if (this.tipoProceso.CodigoAbreviacion === PROCESO_SEGUIMIENTO_FUNCIONAMIENTO.CodigoAbreviacion) {
        periodoSeguimiento.trimestre = `- T${indexTrimestre}`;
        indexTrimestre++;
      }
    }
    this.vPeriodosSeguimiento = true;
    this.datosTabla = new MatTableDataSource(periodosSeguimiento);
  }

  async validarNombreUsuario(documento_usuario: string) {
    let nombreCompleto: string = undefined;
    if(documento_usuario) {
      await new Promise((resolve,reject)=>{
        this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion/?query=Numero:` + documento_usuario)
          .subscribe((datosInfoTercero: any) => {
            if(datosInfoTercero[0].TerceroId) {
              nombreCompleto = datosInfoTercero[0].TerceroId.NombreCompleto;
              resolve(nombreCompleto);
            }
        }, (error) => {
          reject(error)
        })
      })
    }
    return nombreCompleto;
  }

  vBotonBuscar(): boolean {
    return this.vCargaCorrecta && this.vVigenciaSeleccionada && this.vUnidadSeleccionada
      && this.vTipoPlanSeleccionado && this.vPlanSeleccionado && this.vTipoProcesoSeleccionado;
  }

  limpiarFormulario(): void {
    this.vVigenciaSeleccionada = false;
    this.vigencia = undefined;
    this.vUnidadSeleccionada = false;
    this.unidad = undefined;
    this.vTipoPlanSeleccionado = false;
    this.tipoPlan = undefined;
    this.vPlanSeleccionado = false;
    this.plan = undefined
    this.vTipoProcesoSeleccionado = false;
    this.tipoProceso = undefined;
    this.vPeriodosSeguimiento = false;
    this.periodosSeguimiento = [];
    this.vCargaCorrecta = true;
    this.selectVigencia.setValue('--')
    this.selectUnidad.setValue('--')
    this.selectTipoPlan.setValue('--')
    this.selectPlan.setValue('--')
    this.selectTipoProceso.setValue('--')
    this.formFechas.reset();
  }

  onChangeVigencia(vigencia: Vigencia) {
    if (vigencia == undefined) {
      this.vVigenciaSeleccionada = false;
    } else {
      this.vVigenciaSeleccionada = true;
      this.vigencia = vigencia;
      this.vPeriodosSeguimiento = false;
    }
  }

  onChangeUnidad(unidad: DependenciaID) {
    if (unidad == undefined) {
      this.vUnidadSeleccionada = false;
    } else {
      this.vUnidadSeleccionada = true;
      this.unidad = unidad;
      this.vPeriodosSeguimiento = false;
    }
  }

  async onChangeTipoPlan(tipoPlan: Tipo) {
    if (tipoPlan == undefined) {
      this.vTipoPlanSeleccionado = false;
      this.planes = [];
      this.auxPlanes = [];
    } else {
      this.vTipoPlanSeleccionado = true;
      this.tipoPlan = tipoPlan;
      this.vPeriodosSeguimiento = false;
      await this.cargarPlanes();
    }
  }

  onChangePlan(plan: Plan) {
    if (plan == undefined) {
      this.vPlanSeleccionado = false;
    } else {
      this.vPlanSeleccionado = true;
      this.plan = plan;
      this.vPeriodosSeguimiento = false;
    }
  }

  onChangeTipoProceso(tipoProceso: Tipo) {
    if (tipoProceso == undefined) {
      this.vTipoProcesoSeleccionado = false;
    } else {
      this.vTipoProcesoSeleccionado = true;
      this.tipoProceso = tipoProceso;
      this.vPeriodosSeguimiento = false;
    }
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

  construirFormulario(): FormGroup {
    return this.formBuilder.group({
      vigencia: [this.vigencia, Validators.required],
      unidad: [this.unidad, Validators.required],
      tipoProceso: [this.tipoProceso, Validators.required],
      tipoPlan: [this.tipoPlan, Validators.required],
      plan: [this.plan, Validators.required],
    });
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
}
