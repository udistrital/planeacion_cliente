import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { isNumeric } from "rxjs/internal-compatibility";
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { CurrencyPipe, formatCurrency, getCurrencySymbol } from '@angular/common';
import { rubros_aux } from '../recursos/rubros';
import { CodigosService } from 'src/app/@core/services/codigos.service';
import { Observable } from 'rxjs';
import { startWith, map } from 'rxjs/operators';


@Component({
  selector: 'app-contratistas',
  templateUrl: './contratistas.component.html',
  styleUrls: ['./contratistas.component.scss']
})
export class ContratistasComponent implements OnInit {

  contratistasGroup: FormGroup
  displayedColumns: string[];
  displayedHeaders: string[];
  columnsToDisplay: string[];
  dataSource: MatTableDataSource<any>;
  total: number;
  contratistas: any[];
  actividades: any[];
  perfiles: any[];
  accionBoton: string;
  tipoIdenti: string;
  selectedActividades;
  errorDataSource: boolean = false;
  contador: number = 0;
  estadoPlan: string;
  Plan: any;
  readonlyObs: boolean;
  readonlyTable: boolean = false;
  mostrarObservaciones: boolean;
  porcentajeIncremento: string;
  rubroSeleccionado: any;
  vigenciaConsulta: any;
  rubros = rubros_aux
  totalInc: number;
  rubroControl = new FormControl();
  filteredRubros: Observable<any[]>;

  CODIGO_ESTADO_PRE_AVAL: string;
  CODIGO_ESTADO_REVISADO: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() dataSourceActividades: MatTableDataSource<any>;
  @Input() dataTabla: boolean;
  @Input() plan: string;
  @Input() rol: string;
  @Input() versiones: any[];
  @Input() vigencia: any;
  @Output() acciones = new EventEmitter<any>();
  constructor(
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private currencyPipe: CurrencyPipe,
    private codigosService: CodigosService
  ) { }

  async ngOnInit() {
    this.CODIGO_ESTADO_PRE_AVAL = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'PA_SP');
    this.CODIGO_ESTADO_REVISADO = await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'R_SP');
    this.loadPlan();
    this.dataSource = new MatTableDataSource<any>();
    this.loadPerfiles();
    this.actividades = this.dataSourceActividades.data;
    this.loadTabla();
    this.loadVigenciaConsulta();

    this.filteredRubros = this.rubroControl.valueChanges.pipe(
      startWith(''),
      map(value => this._filterRubros(value))
    );
    Swal.close();
  }

  private _filterRubros(value: string): any[] {
    const filterValue = value.toLowerCase();
    return this.rubros.filter(rubro => rubro.Nombre.toLowerCase().includes(filterValue) || rubro.Codigo.toLowerCase().includes(filterValue));
  }

  loadPlan() {
    this.request.get(environment.PLANES_CRUD, `plan/` + this.plan).subscribe((data: any) => {
      if (data.Data != null) {
        this.Plan = data.Data;
        this.getEstado();
      }
    })
  }

  loadVigenciaConsulta() {
    let aux: number = + this.vigencia.Nombre;
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=Nombre:` + (aux - 1).toString()).subscribe((data: any) => {
      if (data) {
        let auxVigencia = data.Data[0];
        if (auxVigencia.Id != null) {
          this.vigenciaConsulta = auxVigencia;
        } else {
          this.readonlyTable = true;
          Swal.fire({
            title: 'Error en la operación',
            icon: 'error',
            text: `No se encuentran datos registrados para la vigencia actual`,
            showConfirmButton: false,
            timer: 2500
          })
        }
      }
    })
  }

  updateValue(element, rowIndex) {
    let val = parseFloat(element.valorUnitario);
    if (Number.isNaN(val)) {
      let auxVal = element.valorUnitario.replace(/\$|,/g, '')
      let aux2 = parseFloat(auxVal);
      this.dataSource.data[rowIndex].valorUnitario = formatCurrency(aux2, 'en-US', getCurrencySymbol('USD', 'wide'));
      this.getTotal(element, rowIndex)
    } else {
      this.dataSource.data[rowIndex].valorUnitario = formatCurrency(val, 'en-US', getCurrencySymbol('USD', 'wide'));
      this.getTotal(element, rowIndex)
    }
  }



  visualizarColumnas(): string[] {
    if (this.rol == 'JEFE_DEPENDENCIA' || this.rol == 'ASISTENTE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.mostrarObservaciones = this.verificarObservaciones();
        this.readonlyTable = false;
        if (this.mostrarObservaciones) {
          return ['acciones', 'descripcionNecesidad', 'requisitos', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorUnitarioInc', 'valorTotal', 'valorTotalInc', 'actividades', 'observaciones'];
        } else {
          return ['acciones', 'descripcionNecesidad', 'requisitos', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorUnitarioInc', 'valorTotal', 'valorTotalInc', 'actividades'];
        }
      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Revisión Verificada' || this.estadoPlan == 'Pre Aval') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'descripcionNecesidad', 'requisitos', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorUnitarioInc', 'valorTotal', 'valorTotalInc', 'actividades', 'observaciones'];
      }
      if (this.estadoPlan == 'Aval') {
        this.readonlyTable = true;
        this.readonlyObs = true;
        return ['acciones', 'descripcionNecesidad', 'requisitos', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorUnitarioInc', 'valorTotal', 'valorTotalInc', 'actividades'];
      }
    }

    if (this.rol == 'PLANEACION' || this.rol == 'ASISTENTE_PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'descripcionNecesidad', 'requisitos', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorUnitarioInc', 'valorTotal', 'valorTotalInc', 'actividades'];
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['acciones', 'descripcionNecesidad', 'requisitos', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorUnitarioInc', 'valorTotal', 'valorTotalInc', 'actividades', 'observaciones'];
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Revisión Verificada') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'descripcionNecesidad', 'requisitos', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorUnitarioInc', 'valorTotal', 'valorTotalInc', 'actividades', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'descripcionNecesidad', 'requisitos', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorUnitarioInc', 'valorTotal', 'valorTotalInc', 'actividades'];
      }
    }
  }

  visualizarHeaders(): string[] {
    if (this.rol == 'JEFE_DEPENDENCIA' || this.rol == 'ASISTENTE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        if (this.mostrarObservaciones && !this.readonlyTable) {
          return ['AccionesP', 'DescripcionNecesidadP', 'RequisitosP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorUnitarioIncP', 'ValorTotalP', 'ValorTotalIncP', 'ActividadesP', 'ObservacionesP'];
        } else {
          return ['AccionesP', 'DescripcionNecesidadP', 'RequisitosP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorUnitarioIncP', 'ValorTotalP', 'ValorTotalIncP', 'ActividadesP'];
        }
      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Revisión Verificada' || this.estadoPlan == 'Pre Aval') {
        this.readonlyObs = true;
        return ['AccionesP', 'DescripcionNecesidadP', 'RequisitosP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorUnitarioIncP', 'ValorTotalP', 'ValorTotalIncP', 'ActividadesP', 'ObservacionesP'];
      }
      if (this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        return ['AccionesP', 'DescripcionNecesidadP', 'RequisitosP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorUnitarioIncP', 'ValorTotalP', 'ValorTotalIncP', 'ActividadesP'];
      }
    }

    if (this.rol == 'PLANEACION' || this.rol == 'ASISTENTE_PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        return ['AccionesP', 'DescripcionNecesidadP', 'RequisitosP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorUnitarioIncP', 'ValorTotalP', 'ValorTotalIncP', 'ActividadesP'];
      }
      if (this.estadoPlan == 'En revisión') {
        return ['AccionesP', 'DescripcionNecesidadP', 'RequisitosP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorUnitarioIncP', 'ValorTotalP', 'ValorTotalIncP', 'ActividadesP', 'ObservacionesP'];
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Revisión Verificada') {
        return ['AccionesP', 'DescripcionNecesidadP', 'RequisitosP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorUnitarioIncP', 'ValorTotalP', 'ValorTotalIncP', 'ActividadesP', 'ObservacionesP'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        return ['AccionesP', 'DescripcionNecesidadP', 'RequisitosP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorUnitarioIncP', 'ValorTotalP', 'ValorTotalIncP', 'ActividadesP'];
      }
    }
  }


  verificarVersiones(): boolean {
    let preAval = this.versiones.filter(group => group.estado_plan_id.match(this.CODIGO_ESTADO_PRE_AVAL));
    if (preAval.length != 0) {
      return true;
    } else {
      return false;
    }
  }
  verificarObservaciones() {
    let preAval = this.versiones.filter(group => group.estado_plan_id.match(this.CODIGO_ESTADO_REVISADO));
    if (preAval.length != 0) {
      return true;
    } else {
      return false;
    }
  }

  getEstado() {
    this.request.get(environment.PLANES_CRUD, `estado-plan/` + this.Plan.estado_plan_id).subscribe((data: any) => {
      if (data) {
        this.estadoPlan = data.Data.nombre;
        this.displayedColumns = this.visualizarColumnas();
        this.displayedHeaders = this.visualizarHeaders();
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

  async loadTabla() {
    if (this.dataTabla) {
      this.request.get(environment.PLANES_MID, `formulacion/get_all_identificacion/${this.plan}/${await this.codigosService.getId('PLANES_CRUD', 'tipo-identificacion', 'IC_SP')}`).subscribe((dataG: any) => {
        if (dataG.Data != null) {
          this.dataSource.data = dataG.Data;
          this.rubroSeleccionado = rubros_aux[rubros_aux.findIndex((e: any) => e.Codigo === this.dataSource.data[0].rubro)]
          this.validarIncremento();
        }
      })
    }
  }

  async loadPerfiles() {
    this.request.get(environment.PARAMETROS_SERVICE,`parametro?query=TipoParametroId:${await this.codigosService.getId("PARAMETROS_SERVICE", "tipo_parametro", "PC")}`).subscribe((data: any) => {
      if (data) {
        this.perfiles = data.Data
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  validarIncremento() {
    let strValUnitario = (this.dataSource.data[0].valorUnitario.toString()).replace(/\$|,/g, '');
    let strValUnitarioInc = (this.dataSource.data[0].valorUnitarioInc.toString()).replace(/\$|,/g, '');
    this.porcentajeIncremento = ((((parseFloat(strValUnitarioInc) - parseInt(strValUnitario)) / parseInt(strValUnitario)) * 100)).toFixed(2);
    if (parseFloat(this.porcentajeIncremento) < 0) {
      this.porcentajeIncremento = "10.22"
      this.actualizarIncremento()
    }
  }

  getValorTotal() {
    if (this.dataSource.data.length !== 0) {
      let acc = 0;
      for (let i = 0; i < this.dataSource.data.length; i++) {
        let aux = this.dataSource.data[i].valorTotal.toString();
        let strValTotal = aux.replace(/\$|,/g, '');
        acc = acc + parseFloat(strValTotal)
      }
      this.total = acc;
      if (this.total >> 0.00) {
        return this.total;
      } else {
        return '0';
      }
    } else {
      return '0';
    }
  }


  getValorTotalInc() {
    if (this.dataSource.data.length !== 0) {
      let acc = 0;
      for (let i = 0; i < this.dataSource.data.length; i++) {
        let aux = this.dataSource.data[i].valorTotalInc.toString();
        let strValTotalInc = aux.replace(/\$|,/g, '');
        acc = acc + parseFloat(strValTotalInc)
      }
      this.total = acc;
      if (this.total >> 0.00) {
        this.totalInc = this.total
        return this.total;
      } else {
        return '0';
      }
    } else {
      return '0';
    }
  }

  getTotal(element, rowIndex) {
    let strValUnitario = element.valorUnitario.replace(/\$|,/g, '')
    let aux = parseInt(strValUnitario, 10);
    let valor = parseFloat(((aux * element.meses + (element.dias * (aux / 30))) * element.cantidad).toFixed(2))
    this.dataSource.data[rowIndex].valorTotal = formatCurrency(valor, 'en-US', getCurrencySymbol('USD', 'wide'));
    this.getIncremento(element, rowIndex);
  }

  getIncremento(element, rowIndex) {
    if (this.porcentajeIncremento == '' || this.porcentajeIncremento == undefined) {
      this.dataSource.data[rowIndex].valorUnitarioInc = this.dataSource.data[rowIndex].valorUnitario;
      this.dataSource.data[rowIndex].valorTotalInc = this.dataSource.data[rowIndex].valorTotal;
    }
    else {
      let incremento = parseFloat(this.porcentajeIncremento);
      let strValUnitario = element.valorUnitario.replace(/\$|,/g, '');
      let strValTotal = element.valorTotal.replace(/\$|,/g, '');
      let valorUnitarioInc = parseFloat((((incremento / 100) * parseInt(strValUnitario)) + parseInt(strValUnitario)).toFixed(2));
      let valorTotalInc = parseFloat((((incremento / 100) * parseInt(strValTotal)) + parseInt(strValTotal)).toFixed(2));
      this.dataSource.data[rowIndex].valorUnitarioInc = formatCurrency(valorUnitarioInc, 'en-US', getCurrencySymbol('USD', 'wide'));
      this.dataSource.data[rowIndex].valorTotalInc = formatCurrency(valorTotalInc, 'en-US', getCurrencySymbol('USD', 'wide'));
    }

  }

  actualizarIncremento() {
    if (this.porcentajeIncremento == '' || this.porcentajeIncremento == undefined) {
      for (let i = 0; i < this.dataSource.data.length; i++) {
        this.dataSource.data[i].valorUnitarioInc = this.dataSource.data[i].valorUnitario;
        this.dataSource.data[i].valorTotalInc = this.dataSource.data[i].valorTotal;
      }
    }
    else {
      let incremento = parseFloat(this.porcentajeIncremento);
      for (let i = 0; i < this.dataSource.data.length; i++) {
        let strValUnitario = this.dataSource.data[i].valorUnitario.replace(/\$|,/g, '');
        let strValTotal = this.dataSource.data[i].valorTotal.replace(/\$|,/g, '');
        let valorUnitarioInc = parseFloat((((incremento / 100) * parseInt(strValUnitario)) + parseInt(strValUnitario)).toFixed(2));
        let valorTotalInc = parseFloat((((incremento / 100) * parseInt(strValTotal)) + parseInt(strValTotal)).toFixed(2));
        this.dataSource.data[i].valorUnitarioInc = formatCurrency(valorUnitarioInc, 'en-US', getCurrencySymbol('USD', 'wide'));
        this.dataSource.data[i].valorTotalInc = formatCurrency(valorTotalInc, 'en-US', getCurrencySymbol('USD', 'wide'));
      }

    }

  }


  addContratista() {
    if (this.rol === 'PLANEACION') {
      this.dataSource.data.unshift({
        descripcionNecesidad: '',
        requisitos: '',
        perfil: '',
        cantidad: 0,
        meses: 0,
        dias: 0,
        valorUnitario: 0,
        valorUnitarioInc: 0,
        valorTotal: 0,
        valorTotalInc: 0,
        observaciones: '',
        actividades: '',
        rubro: '',
        rubroNombre: '',
        total: ''
      });
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } else {
      this.dataSource.data.unshift({
        descripcionNecesidad: '',
        requisitos: '',
        perfil: '',
        cantidad: 0,
        meses: 0,
        dias: 0,
        valorUnitario: 0,
        valorUnitarioInc: 0,
        valorTotal: 0,
        valorTotalInc: 0,
        actividades: '',
        rubro: '',
        rubroNombre: '',
        total: ''
      });
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }

  }

  deleteContratista(index) {
    Swal.fire({
      title: 'Eliminar Contratista',
      text: `¿Está seguro de eliminar este contratista?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this._deleteElemento(index);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    });
  }

  private _deleteElemento(index) {
    const indices = isNumeric(index) ? [index] : (Array.isArray(index) ? index : undefined);
    if (indices) {
      const data = this.dataSource.data;
      indices.sort((a, b) => b - a);
      for (let i = 0; i < indices.length; i++) {
        data.splice((this.paginator.pageIndex * this.paginator.pageSize) + indices[i], 1);
      }
      this.dataSource.data = data;
    }
  }

  onSelected(event, element, rowIndex) {
    if (event.value == undefined) {
      this.dataSource.data[rowIndex].valorUnitario = '';
    } else {
      this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=ParametroId:` + event.value + `,PeriodoId:` + this.vigenciaConsulta.Id).subscribe((data: any) => {
        if (data) {
          let elemento = data.Data
          if (elemento[0].Valor != null) {
            let valor = JSON.parse(elemento[0].Valor);
            this.dataSource.data[rowIndex].valorUnitario = formatCurrency(valor.ValorMensual, 'en-US', getCurrencySymbol('USD', 'wide'));
            this.getTotal(element,rowIndex)
          } else {
            this.readonlyTable = true;
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `No se encuentran datos registrados para la vigencia actual`,
              showConfirmButton: false,
              timer: 2500
            })
          }
        }
      })

    }
  }

  onChange(event) {
  }

  ocultarContratistas() {
    this.accionBoton = 'ocultar';
    this.tipoIdenti = 'contratistas'
    let data = this.dataSource.data;
    let accion = this.accionBoton;
    let identi = this.tipoIdenti;
    this.acciones.emit({ data, accion, identi });
  }

  async guardarContratistas() {
    if (this.rubroSeleccionado != undefined) {
      this.accionBoton = 'guardar';
      this.tipoIdenti = 'contratistas'
      for (let i = 0; i < this.dataSource.data.length; i++) {
        this.dataSource.data[i].rubro = this.rubroSeleccionado.Codigo
        this.dataSource.data[i].totalInc = ((this.total).toFixed(2)).toString()
        this.dataSource.data[i].rubroNombre = this.rubroSeleccionado.Nombre
      }
      let data = this.dataSource.data;
      this.validarDataSource(data);
      if (this.errorDataSource) {
        Swal.fire({
          title: 'Tiene datos sin completar. Por favor verifique',
          icon: 'error',
          showConfirmButton: false,
          timer: 3500
        })
      } else if (!this.errorDataSource) {
        let accion = this.accionBoton;
        let identi = this.tipoIdenti;
        for (var i in data) {
          var obj = data[i];
          obj["activo"] = true;
          var num = +i + 1;
          obj["index"] = num.toString();
        }
        let dataS = JSON.stringify(Object.assign({}, data))
        this.request.put(environment.PLANES_MID, `formulacion/guardar_identificacion`, dataS, `${this.plan}/${await this.codigosService.getId('PLANES_CRUD', 'tipo-identificacion', 'IC_SP')}`).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Guardado exitoso',
              icon: 'success',
              showConfirmButton: false,
              timer: 3500
            })
            this.acciones.emit({ dataS, accion, identi });
          }
        })
      }
    } else {
      Swal.fire({
        title: 'Por favor selecione el rubro correspondiente.',
        icon: 'error',
        showConfirmButton: false,
        timer: 3500
      })
    }
  }

  submit(data) {

  }

  validarDataSource(data) {
    this.contador = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].descripcionNecesidad == '' || data[i].requisitos == '' || data[i].perfil == '' || data[i].cantidad == null || data[i].meses == null || data[i].dias == null
        || data[i].valorUnitario == null || data[i].valorTotal == null || data[i].actividades == "" || data[i].actividades == null) {
        this.contador++;
      }
      if (this.contador > 0) {
        this.errorDataSource = true;
      }
      else {
        this.errorDataSource = false;
      }
    }
  }
}
