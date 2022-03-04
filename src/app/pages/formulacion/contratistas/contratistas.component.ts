import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { isNumeric } from "rxjs/internal-compatibility";
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import { request } from 'http';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { read } from 'fs';

@Component({
  selector: 'app-contratistas',
  templateUrl: './contratistas.component.html',
  styleUrls: ['./contratistas.component.scss']
})
export class ContratistasComponent implements OnInit {

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
  mostrarObservaciones : boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() dataSourceActividades: MatTableDataSource<any>;
  @Input() dataTabla: boolean;
  @Input() plan: string;
  @Input() rol: string;
  @Input() versiones: any[];
  @Output() acciones = new EventEmitter<any>();
  constructor(
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService
  ) { }

  ngOnInit(): void {
    this.loadPlan();
    this.dataSource = new MatTableDataSource<any>();
    this.loadPerfiles();
    this.actividades = this.dataSourceActividades.data;
    this.loadTabla();
  }

  loadPlan() {
    this.request.get(environment.PLANES_CRUD, `plan/` + this.plan).subscribe((data: any) => {
      if (data.Data != null) {
        this.Plan = data.Data;
        this.getEstado();
      }
    })
  }

  visualizarColumnas(): string[] {
    if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = this.verificarVersiones();
        this.mostrarObservaciones = this.verificarObservaciones();
        if (this.mostrarObservaciones){
          return ['descripcionNecesidad', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorTotal', 'actividades', 'observaciones', 'acciones',];
        }else{
          return ['descripcionNecesidad', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorTotal', 'actividades', 'acciones',];
        }
      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['descripcionNecesidad', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorTotal', 'actividades', 'observaciones', 'acciones',];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyTable = true;
        this.readonlyObs = true;
        return ['descripcionNecesidad', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorTotal', 'actividades', 'acciones',];
      }
    }

    if (this.rol == 'PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['descripcionNecesidad', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorTotal', 'actividades', 'acciones',];
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['descripcionNecesidad', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorTotal', 'actividades', 'observaciones', 'acciones',];
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['descripcionNecesidad', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorTotal', 'actividades', 'observaciones', 'acciones',];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['descripcionNecesidad', 'perfil', 'cantidad', 'meses', 'dias', 'valorUnitario', 'valorTotal', 'actividades', 'acciones',];
      }
    }
  }

  visualizarHeaders(): string[] {
    if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        if (this.mostrarObservaciones && !this.readonlyTable){
          return ['DescripcionNecesidadP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorTotalP', 'ActividadesP', 'ObservacionesP', 'AccionesP'];
        }else{
          return ['DescripcionNecesidadP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorTotalP', 'ActividadesP', 'AccionesP'];
        }
      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        return ['DescripcionNecesidadP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorTotalP', 'ActividadesP', 'ObservacionesP', 'AccionesP'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        return ['DescripcionNecesidadP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorTotalP', 'ActividadesP', 'AccionesP'];
      }
    }

    if (this.rol == 'PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        return ['DescripcionNecesidadP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorTotalP', 'ActividadesP', 'AccionesP'];
      }
      if (this.estadoPlan == 'En revisión') {
        return ['DescripcionNecesidadP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorTotalP', 'ActividadesP', 'ObservacionesP', 'AccionesP'];
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        return ['DescripcionNecesidadP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorTotalP', 'ActividadesP', 'ObservacionesP', 'AccionesP'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        return ['DescripcionNecesidadP', 'PerfilP', 'CantidadP', 'TiempoContrato', 'ValorUnitarioP', 'ValorTotalP', 'ActividadesP', 'AccionesP'];
      }
    }
  }


  verificarVersiones(): boolean {
    let preAval = this.versiones.filter(group => group.estado_plan_id.match('614d3b4401c7a222052fac05'));
    if (preAval.length != 0) {
      return true;
    } else {
      return false;
    }
  }
  verificarObservaciones(): boolean {
    let preAval = this.versiones.filter(group => group.estado_plan_id.match('614d3b1e01c7a265372fac03'));
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

  loadTabla() {
    if (this.dataTabla) {
      this.request.get(environment.PLANES_MID, `formulacion/get_all_identificacion/` + this.plan + `/6184b3e6f6fc97850127bb68`).subscribe((dataG: any) => {
        if (dataG.Data != null) {
          this.dataSource.data = dataG.Data
        }
      })
    }
  }

  loadPerfiles() {
    this.request.get(environment.PARAMETROS_SERVICE, `parametro?query=TipoParametroId:36`).subscribe((data: any) => {
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

  getValorTotal() {
    if (this.dataSource.data.length !== 0) {
      this.total = this.dataSource.data.map(t => t.valorTotal).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
      if (this.total >> 0.00) {
        return this.total;
      } else {
        return '0';
      }
    } else {
      return '0';
    }
  }

  getTotal(element, rowIndex): number {
    let valor = parseFloat(((element.valorUnitario * element.meses + (element.dias * (element.valorUnitario / 30))) * element.cantidad).toFixed(2))
    this.dataSource.data[rowIndex].valorTotal = valor;
    return valor
  }

  addContratista() {
    if (this.rol === 'PLANEACION') {
      this.dataSource.data.unshift({
        descripcionNecesidad: '',
        perfil: '',
        cantidad: 0,
        meses: 0,
        dias: 0,
        valorUnitario: 0,
        valorTotal: 0,
        observaciones: '',
        actividades: ''
      });
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    } else {
      this.dataSource.data.unshift({
        descripcionNecesidad: '',
        perfil: '',
        cantidad: 0,
        meses: 0,
        dias: 0,
        valorUnitario: 0,
        valorTotal: 0,
        actividades: ''
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

  onSelected(event, rowIndex) {
    if (event.value == undefined) {
      this.dataSource.data[rowIndex].valorUnitario = '';
    } else {
      this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=ParametroId:` + event.value).subscribe((data: any) => {
        if (data) {
          let elemento = data.Data
          let valor = JSON.parse(elemento[0].Valor);
          this.dataSource.data[rowIndex].valorUnitario = valor.ValorMensual;
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

  guardarContratistas() {
    this.accionBoton = 'guardar';
    this.tipoIdenti = 'contratistas'
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
      this.request.put(environment.PLANES_MID, `formulacion/guardar_identificacion`, dataS, this.plan + `/6184b3e6f6fc97850127bb68`).subscribe((data: any) => {
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
  }

  submit(data) {

  }

  validarDataSource(data) {
    this.contador = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].descripcionNecesidad == '' || data[i].perfil == '' || data[i].cantidad == null || data[i].meses == null || data[i].dias == null
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
