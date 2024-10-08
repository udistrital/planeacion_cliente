import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Vigencia } from '../../habilitar-reporte/utils/habilitar-reporte.models';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { DataRequest } from 'src/app/@core/models/interfaces/DataRequest.interface';
import { AreaTipo, Parametro, ParametroPeriodo, TipoParametro } from '../utils/gestion-parametros.models';
import { CODIGO_ABREVIACION_CORREO_OAP, CODIGO_ABREVIACION_FORMATO_PAF } from '../utils';

@Component({
  selector: 'app-form-parametros',
  templateUrl: './form-parametros.component.html',
  styleUrls: ['./form-parametros.component.scss']
})
export class FormParametrosComponent implements OnInit, OnChanges {

  formParametros: FormGroup;
  
  vigencia: Vigencia;
  vigenciaSelected: boolean;
  areaTipo: AreaTipo;
  tipoParametro: TipoParametro;
  codigosParametros: string[] = [CODIGO_ABREVIACION_CORREO_OAP,CODIGO_ABREVIACION_FORMATO_PAF];
  @Input() banderaAdicion: boolean;
  @Input() banderaEdicion: boolean;
  @Input() vigencias: Vigencia[];
  @Input() parametroPeriodoEdicion: ParametroPeriodo;
  @Output() limpiar = new EventEmitter<void>();

  constructor(
    private request: RequestManager,
    private fb: FormBuilder,
    ) {
      this.formParametros = this.fb.group({
        concepto: ['', Validators.required],
        codigoAbreviacion: ['', Validators.required],
        valor: ['', Validators.required],
        selectVigencia: ['', Validators.required]
      });
    }

  ngOnInit(): void {
    this.formParametros = new FormGroup({
      concepto: new FormControl(),
      codigoAbreviacion: new FormControl(),
      valor: new FormControl(),
      selectVigencia: new FormControl(),
    })
    if(this.banderaEdicion) {
      this.formParametros.reset();
      this.loadDataEdicion();
    } else {
      this.loadAreaTipo();
      this.loadTipoParametro();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    // Se llama cada vez que hay cambios en las propiedades de entrada
    if (changes.parametroPeriodoEdicion && this.banderaEdicion) {
      // Actualiza el formulario con los datos del componente padre
      this.loadDataEdicion();
    }
  }

  loadAreaTipo() {
    this.request.get(environment.PARAMETROS_SERVICE, `/area_tipo?query=CodigoAbreviacion%3APL_SISGPLAN`).subscribe(
      (data: DataRequest) => {
        if (data) {
          this.areaTipo = data.Data[0];
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    );
  }

  loadTipoParametro() {
    this.request.get(environment.PARAMETROS_SERVICE, `tipo_parametro?query=CodigoAbreviacion%3AP_SISGPLAN,activo:true`).subscribe(
      (data: DataRequest) => {
        if (data) {
          this.tipoParametro = data.Data[0];
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    );
  }

  loadDataEdicion() {
    if (this.codigosParametros.includes(this.parametroPeriodoEdicion.ParametroId.CodigoAbreviacion)) {
      this.formParametros.get('codigoAbreviacion').disable();
    } else {
      this.formParametros.get('codigoAbreviacion').enable();
    }
    this.formParametros.get('concepto').setValue(this.parametroPeriodoEdicion.ParametroId.Nombre);
    this.formParametros.get('codigoAbreviacion').setValue(this.parametroPeriodoEdicion.ParametroId.CodigoAbreviacion);
    this.formParametros.get('valor').setValue(this.parametroPeriodoEdicion.Valor);
    this.vigencia = this.vigencias.find(vigencia => vigencia.Id === this.parametroPeriodoEdicion.PeriodoId.Id);
    this.formParametros.get('selectVigencia').setValue(this.vigencia);
  }

  onChangeVigencia(vigencia: Vigencia) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
    }
  }

  limpiarForm() {
    this.limpiar.emit();
    this.vigenciaSelected = false;
    this.vigencia = undefined;
    this.formParametros.reset();
  }

  guardar() {
    this.mostrarMensajeCarga(true);
    if (this.formParametros.valid) {
      if(this.banderaAdicion) {
        let valorParametro = {
          Valor: this.formParametros.get('valor').value
        };
        this.tipoParametro.AreaTipoId = this.areaTipo;
        var parametro: Parametro = {
          Activo: true,
          CodigoAbreviacion: this.formParametros.get('codigoAbreviacion').value,
          Descripcion: this.formParametros.get('concepto').value,
          Nombre: this.formParametros.get('concepto').value,
          NumeroOrden: 0,
          ParametroPadreId: null,
          TipoParametroId: this.tipoParametro,
        }
        var parametroPeriodo: ParametroPeriodo = {
          Activo: true,
          ParametroId: undefined,
          PeriodoId: this.vigencia,
          Valor: JSON.stringify(valorParametro),
        }
        console.log(parametro);
        console.log(parametroPeriodo);
        this.agregar(parametro, parametroPeriodo);
      } else if (this.banderaEdicion) {
        let parametroPeriodo: ParametroPeriodo = { ...this.parametroPeriodoEdicion };
        this.editar(parametroPeriodo);
      }
    } else {
      this.marcarCamposInvalidos();
    }
  }

  agregar(parametro: Parametro, parametroPeriodo: ParametroPeriodo) {
    this.request.post(environment.PARAMETROS_SERVICE, `parametro`, parametro).subscribe((data: DataRequest) => {
      if (data) {
        let parametroCreado: Parametro = data.Data;
        parametroPeriodo.ParametroId = parametroCreado;
        this.request.post(environment.PARAMETROS_SERVICE, `parametro_periodo`, parametroPeriodo).subscribe((data: DataRequest) => {
          if (data) {
            Swal.fire({
              title: 'Parámetro agregado',
              icon: 'success',
              allowEscapeKey: false,
              allowOutsideClick: false,
              showConfirmButton: false,
              timer: 4500
            }).then(() => {
              window.location.reload();
            });
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se almacenó el registro por fallas en el servicio, intente nuevamente más tarde`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se almacenó el registro por fallas en el servicio, intente nuevamente más tarde`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  editar(parametroPeriodo: ParametroPeriodo) {
    var parametro: Parametro = parametroPeriodo.ParametroId;
    parametro.Nombre = this.formParametros.get('concepto').value;
    parametro.Descripcion = this.formParametros.get('concepto').value;
    parametro.CodigoAbreviacion = this.formParametros.get('codigoAbreviacion').value;
    this.request.put(environment.PARAMETROS_SERVICE, `parametro`, parametro, parametro.Id).subscribe((data: DataRequest) => {
      if (data) {
        let valorParametro = {
          Valor: this.formParametros.get('valor').value
        };
        parametroPeriodo.Valor = JSON.stringify(valorParametro);
        parametroPeriodo.PeriodoId = this.vigencia;
        parametroPeriodo.ParametroId = parametro;
        this.request.put(environment.PARAMETROS_SERVICE, `parametro_periodo`, parametroPeriodo, parametroPeriodo.Id).subscribe((data: DataRequest) => {
          if (data) {
            Swal.fire({
              title: 'Parámetro actualizado',
              icon: 'success',
              allowEscapeKey: false,
              allowOutsideClick: false,
              showConfirmButton: false,
              timer: 4500
            }).then(() => {
              window.location.reload();
            });
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se almacenó el registro por fallas en el servicio, intente nuevamente más tarde`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se almacenó el registro por fallas en el servicio, intente nuevamente más tarde`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  marcarCamposInvalidos() {
    Object.keys(this.formParametros.controls).forEach(controlName => {
      this.formParametros.get(controlName).markAsTouched();
    });
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
