import { Component, OnInit } from '@angular/core';
import { RequestManager } from '../services/requestManager';
import { environment } from 'src/environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import { Location } from '@angular/common';
import Swal from 'sweetalert2';

import datosTest from 'src/assets/json/evaluacion.json';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import * as internal from 'stream';
import { runInThisContext } from 'vm';


@Component({
  selector: 'app-evaluacion',
  templateUrl: './evaluacion.component.html',
  styleUrls: ['./evaluacion.component.scss']
})
export class EvaluacionComponent implements OnInit {
  title = 'Google Chart Example';
  type = 'PieChart';
  type2 = 'ColumnChart';


  pieChartColumns = [
    'Effort',
    'Amount given'
  ];
  pieChartData = [
    ['', 75],
    ['', 25],
  ];
  options = {
    pieHole: 0.5,
    pieSliceTextStyle: {
      color: 'black',
    },
    tooltip: { trigger: 'none' },
    slices: {
      1: { color: 'transparent' }
    },
    legend: 'none'
  };

  lineChartoptions = {
    tooltip: { isHtml: true },
    legend: 'none',
  };
  lineChartcolumnNames = [
    'Year',
    'value',
    { role: 'style' },
    { role: 'annotation' },
    { type: 'string', role: 'tooltip', p: { html: true } },
  ];

  lineChartdata = [
    ['developer1', 8, 'color: rgb(143, 27, 0)', '6', ''],
    ['developer2', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer3', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer4', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer5', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer6', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer7', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer8', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer9', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer10', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer11', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer12', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer13', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer14', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer15', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer16', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer17', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer18', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer19', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer21', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer22', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer23', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer24', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer25', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer26', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer27', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer28', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer29', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer30', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer31', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer32', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer33', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer34', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer35', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer36', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer37', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer38', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer39', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer40', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer41', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer42', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer43', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer44', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer45', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer46', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer47', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer48', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer49', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer50', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer51', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer52', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer53', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer54', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer55', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer56', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer57', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer58', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer59', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer60', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer61', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer62', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer63', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer64', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer65', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer66', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer67', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer68', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer69', 8, 'color: rgb(143, 27, 0)', '$6', '1221212 <br/> $ 6'],
    ['developer70', 8, 'color: rgb(143, 27, 0)', '$6', ''],
  ];

  dataSources = [
    { priority: 'P1', status: 'Undefined', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P1', status: 'Undefined', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P1', status: 'Undefined', dateCreated: '11/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P1', status: 'Undefined', dateCreated: '11/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P1', status: 'Open', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P1', status: 'Open', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P1', status: 'Open', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P1', status: 'Open', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P1', status: 'New', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P1', status: 'New', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P2', status: 'Undefined', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P2', status: 'Undefined', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P2', status: 'Undefined', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P2', status: 'Undefined', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P2', status: 'Open', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P2', status: 'Open', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P2', status: 'Open', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P2', status: 'Open', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P2', status: 'New', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
    { priority: 'P2', status: 'New', dateCreated: '12/12/12', testNumber: 545, testCurrency: 45, testTime: '12:45' },
  ];
  displayedColumnss = ['priority', 'status', 'dateCreated', 'testNumber', 'testCurrency', 'testTime'];
  spanningColumns = ['priority', 'status', 'dateCreated'];

  displayedColumns: string[] = ["id", "ponderacion", "periodoE", "actividad", "indicador", "formula", "meta", "estado", "vigencia", "periodo", "seguimiento"];
  displayedColumnsSum: string[] = ['avance', 'sumaT1', 'sumaT2', 'sumaT3', 'sumaT4'];
  dataSource: MatTableDataSource<any>;
  tipoPlanId: string; // id tipo plan
  idPadre: string; // id padre del objeto
  planes: any[];
  bandera: boolean;
  sumaT1: number;
  sumaT2: number;
  sumaT3: number;
  sumaT4: number;
  ponderacion: number;
  vigencias: any[];
  unidades: any[];
  unidadSelected: boolean;
  unidad: any;
  vigenciaSelected: boolean;
  vigencia: any;

  // testDatos: any = datosTest;
  testDatos: any = [
    {
      numero: 1, ponderado: 0, periodo: 2, actividad: "Actividad 1",
      indicador: [{ indicadorN: "indicador 1", formula: "x-b", meta: "140", trimestre1: {}, trimestre2: {}, trimestre3: {}, trimestre4: {} },
      { indicadorN: "indicador 2", formula: "x-c", meta: "150", trimestre1: {}, trimestre2: {}, trimestre3: {}, trimestre4: {} },
      { indicadorN: "indicador 3", formula: "x-d", meta: "1640", trimestre1: {}, trimestre2: {}, trimestre3: {}, trimestre4: {} }]
    },

    { numero: 2, ponderado: 10, periodo: 2, actividad: "Actividad 2", indicador: [{ indicadorN: "indicador 01", formula: "x-y", meta: "180", trimestre1: {}, trimestre2: {}, trimestre3: {}, trimestre4: {} }] }];
  rol: string;

  constructor(
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private _location: Location
  ) {
    this.loadPlanes();
    this.loadPeriodos();
    this.loadUnidades();
    this.unidadSelected = false;
    this.vigenciaSelected = false;
  }

  onChange(plan) {
    this.bandera = false;
    if (plan == undefined) {
      this.tipoPlanId = undefined;
    } else {
      this.tipoPlanId = plan.tipo_plan_id;
      let nombrePlan = document.getElementById('test');
      this.idPadre = plan._id; // id plan
    }
  }

  onChangeU(unidad) {
    if (unidad == undefined) {
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
    }
  }

  onChangeV(vigencia) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
    }
  }

  backClicked() {
    this._location.back();
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  ingresarEvaluacion() {
    this.bandera = true;
  }

  loadPeriodos() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
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

  loadUnidades() {
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) => {
      if (data) {
        this.unidades = data.Data;
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

  loadPlanes() {
    this.request.get(environment.PLANES_CRUD, `plan?query=formato:true`).subscribe((data: any) => {
      if (data) {
        this.planes = data.Data;
        this.planes = this.filterActivos(this.planes);
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: 'No se encontraron datos registrados',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  filterActivos(data) {
    return data.filter(e => e.activo == true);
  }

  sumPercent() {
    this.ponderacion = 0;
    for (let ponder of this.testDatos) {
      let ponderacionunidad = parseFloat(ponder.ponderacion);
      this.ponderacion = this.ponderacion + ponderacionunidad;
    }
    this.sumaT1 = 0;
    this.sumaT2 = 0;
    this.sumaT3 = 0;
    this.sumaT4 = 0;

    for (let ponderacion of this.testDatos) {
      let ponder = parseFloat(ponderacion.ponderacion);
      let T1 = parseFloat(ponderacion.trimestre1);
      let T2 = parseFloat(ponderacion.trimestre2);
      let T3 = parseFloat(ponderacion.trimestre3);
      let T4 = parseFloat(ponderacion.trimestre4);
      let suma1 = ((ponder * (T1)) / this.ponderacion);
      let suma2 = ((ponder * (T2)) / this.ponderacion);
      let suma3 = ((ponder * (T3)) / this.ponderacion);
      let suma4 = ((ponder * (T4)) / this.ponderacion);

      this.sumaT1 = this.sumaT1 + suma1;
      this.sumaT2 = this.sumaT2 + suma2;
      this.sumaT3 = this.sumaT3 + suma3;
      this.sumaT4 = this.sumaT4 + suma4;
    }
  }

  ngOnInit(): void {
    this.getRol();
    this.sumPercent();
  }

}
