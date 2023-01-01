import { Component, OnInit } from '@angular/core';
import { RequestManager } from '../services/requestManager';
import { environment } from 'src/environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';

import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { Router } from '@angular/router';

class plan {
  periodos: string[];
  plan: string;
}

@Component({
  selector: 'app-evaluacion',
  templateUrl: './evaluacion.component.html',
  styleUrls: ['./evaluacion.component.scss']
})
export class EvaluacionComponent implements OnInit {
  title = 'Cumplimiento General Plan de Acción 2022 - Unidad ';
  type = 'PieChart';
  type2 = 'ColumnChart';
  spans = [];
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
    // tooltip: { trigger: 'none' },
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
    'Actividad',
    'Avance',
    { role: 'style' },
    { role: 'annotation' },
    { type: 'string', role: 'tooltip', p: { html: true } },
  ];

  lineChartdata = [
    ['developer1', 8, 'color: rgb(143, 27, 0)', '6', ''],
    ['developer2', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer3', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer4', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer5', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer6', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer7', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer8', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer9', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer10', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer11', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer12', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer13', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer14', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer15', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer16', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer17', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer18', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer19', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer21', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer22', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer64', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer65', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer66', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer67', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer68', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer69', 8, 'color: rgb(143, 27, 0)', '$6', ''],
    ['developer70', 8, 'color: rgb(143, 27, 0)', '$6', ''],
  ];

  displayedColumns: string[] = [
    "id", "ponderacion", "periodo", "actividad", "indicador", "formula", "meta",
    "numt1", "dent1", "pert1", "acut1", "metat1", "actividadt1",

    "numt2", "dent2", "pert2", "acut2", "metat2", "actividadt2",

    "numt3", "dent3", "pert3", "acut3", "metat3", "actividadt3",

    "numt4", "dent4", "pert4", "acut4", "metat4", "actividadt4",];

  displayedHeaders: string[] = ["idP", "ponderacionP", "periodoP", "actividadP", "indicadorP", "formulaP", "metaP", "trimestre1", "trimestre2", "trimestre3", "trimestre4"];
  dataSource: MatTableDataSource<any>;
  tipoPlanId: string; // id tipo plan
  idPadre: string; // id padre del objeto
  planes: any[];
  periodos: any[];
  bandera: boolean;
  ponderacion: number;
  vigencias: any[];
  unidades: any[];
  unidadSelected: boolean;
  unidad: any;
  vigenciaSelected: boolean;
  vigencia: any;
  periodoSelected: boolean;
  periodo: any;
  planSelected: boolean;
  tr2: boolean = true;
  tr3: boolean = true;
  tr4: boolean = true;
  testDatos: any
  plan = {
    "periodos": [],
    "plan": "",
    "id": ""
  };

  // testDatos: any = [
  //   {
  //     numero: 1, ponderado: 0, periodo: 2, actividad: "Actividad 1",
  //     indicador: "indicador 1", formula: "x-b", meta: "140", trimestre1: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }, trimestre2: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }, trimestre3: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }, trimestre4: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }
  //   },
  //   {
  //     numero: 1, ponderado: 0, periodo: 2, actividad: "Actividad 1",
  //     indicador: "indicador 3", formula: "x-d", meta: "1640", trimestre1: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }, trimestre2: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }, trimestre3: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }, trimestre4: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }
  //   },
  //   {
  //     numero: 1, ponderado: 0, periodo: 2, actividad: "Actividad 1",
  //     indicador: "indicador 3", formula: "x-d", meta: "1640", trimestre1: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }, trimestre2: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }, trimestre3: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }, trimestre4: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }
  //   },


  //   {
  //     numero: 2, ponderado: 10, periodo: 2, actividad: "Actividad 2", indicador: "indicador 01", formula: "x-y", meta: "180", trimestre1: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre2: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre3: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre4: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }
  //   },

  //   {
  //     numero: 3, ponderado: 20, periodo: 3, actividad: "Actividad 3", indicador: "indicador 01", formula: "x-y", meta: "180", trimestre1: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre2: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre3: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre4: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }
  //   },
  //   {
  //     numero: 3, ponderado: 20, periodo: 3, actividad: "Actividad 3", indicador: "indicador 01", formula: "x-y", meta: "180", trimestre1: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre2: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre3: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre4: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }
  //   },
  //   {
  //     numero: 3, ponderado: 20, periodo: 3, actividad: "Actividad 3", indicador: "indicador 01", formula: "x-y", meta: "180", trimestre1: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre2: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre3: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 },
  //     trimestre4: { "numerador": 1, "denominador": 1, "periodo": 4, "acumulado": 19, "meta": 12, "actividad": 32 }
  //   }

  // ];
  rol: string;

  constructor(
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private router: Router
  ) {
    this.loadVigencias();
    this.loadUnidades();
    this.unidadSelected = false;
    this.vigenciaSelected = false;


  }

  onChangeU(unidad) {
    if (unidad == undefined) {
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
      if (this.vigenciaSelected) {
        this.loadPlanes();
      }
    }
  }

  onChangeV(vigencia) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      // this.loadPeriodo();
      if (this.unidadSelected) {
        this.loadPlanes();
      }
    }
  }

  onChangeP(plan) {
    if (plan == undefined) {
      this.planSelected = false;
    } else {
      this.planSelected = true;
      this.plan = plan;
    }
  }

  onChangePe(periodo) {
    if (periodo == undefined) {
      this.periodoSelected = false;
    } else {
      this.periodoSelected = true;
      this.periodo = periodo;
      if (periodo.nombre == "Trimestre Dos") {
        this.tr2 = true;
        this.tr3 = false;
        this.tr4 = false;
      } else if (periodo.nombre == "Trimestre Tres") {
        this.tr2 = true;
        this.tr3 = true;
        this.tr4 = false;
      } else if (periodo.nombre == "Trimestre Cuatro") {
        this.tr2 = true;
        this.tr3 = true;
        this.tr4 = true;
      } else {
        this.tr2 = false;
        this.tr3 = false;
        this.tr4 = false;
      }
    }
  }

  backClicked() {
    this.router.navigate(['pages/dashboard'])
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
    debugger
    this.bandera = true;
    this.request.get(environment.PLANES_MID, `evaluacion/`+this.vigencia.Id+`/`+this.plan.id+`/`+this.periodo.id).subscribe((data: any) => {
      if (data) {
        this.testDatos = data.Data;
        this.cacheSpan('numero', d => d.numero)
        this.cacheSpan('ponderado', d => d.numero + d.ponderado)
        this.cacheSpan('periodo', d => d.numero + d.ponderado + d.periodo)
        this.cacheSpan('actividad', d => d.numero + d.ponderado + d.periodo + d.actividad)
        this.cacheSpan('actividadt1', d => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1)
        this.cacheSpan('actividadt2', d => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1 + d.actividadt2)
        this.cacheSpan('actividadt3', d => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1 + d.actividadt2 + d.actividadt3)
        this.cacheSpan('actividadt4', d => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1 + d.actividadt2 + d.actividadt3 + d.actividadt4)
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

  loadVigencias() {
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

  loadPeriodo() {
    this.request.get(environment.PLANES_MID, `seguimiento/get_periodos/` + this.vigencia.Id).subscribe((data: any) => {
      if (data) {
        this.periodos = data.Data;
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
    this.request.get(environment.PLANES_MID, `evaluacion/planes_periodo/` + this.vigencia.Id + `/` + this.unidad.Id).subscribe((data: any) => {
      if (data) {
        if (data.Data != null) {
          this.planes = data.Data;
        } else {
          Swal.fire({
            title: 'La unidad no tiene planes con seguimientos avalados para la vigencia selecionada',
            icon: 'info',
            showConfirmButton: false,
            timer: 2500
          })
        }
      }
    }, (error) => {
      Swal.fire({
        // title: 'Error en la operación',
        title: 'La unidad no tiene planes con seguimientos avalados para la vigencia selecionada',
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  ngOnInit(): void {
    this.getRol();
  }

  cacheSpan(key, accessor) {
    for (let i = 0; i < this.testDatos.length;) {
      let currentValue = accessor(this.testDatos[i]);
      let count = 1;

      for (let j = i + 1; j < this.testDatos.length; j++) {
        if (currentValue != accessor(this.testDatos[j])) {
          break;
        }
        count++;
      }

      if (!this.spans[i]) {
        this.spans[i] = {};
      }

      this.spans[i][key] = count;
      i += count;
    }
  }

  getRowSpan(col, index) {
    return this.spans[index] && this.spans[index][col];
  }
}
