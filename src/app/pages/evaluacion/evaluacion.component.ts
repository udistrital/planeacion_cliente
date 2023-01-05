import { Component, OnInit, ViewChild } from '@angular/core';
import { RequestManager } from '../services/requestManager';
import { environment } from 'src/environments/environment';
import { MatTable } from '@angular/material/table';
import Swal from 'sweetalert2';

import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-evaluacion',
  templateUrl: './evaluacion.component.html',
  styleUrls: ['./evaluacion.component.scss']
})
export class EvaluacionComponent implements OnInit {
  pieTitle = 'Cumplimiento General Plan de Acción 2022 -';
  pieType = 'PieChart';
  columnType = 'ColumnChart';
  spans = [];

  pieChartColumns = [
    'Effort',
    'Amount given'
  ];

  pieChartData = [
    ['', 75],
    ['', 25],
  ];

  pieChartOptions = {
    pieHole: 0.5,
    pieSliceTextStyle: {
      color: 'black',
    },
    slices: {
      1: { color: 'transparent' }
    },
    legend: 'none'
  };

  lineChartOptions = {
    tooltip: { isHtml: true },
    legend: 'none',
  };

  lineChartColumnNames = [
    'Actividad',
    'Avance',
    { role: 'style' },
    { role: 'annotation' },
    { type: 'string', role: 'tooltip', p: { html: true } },
  ];

  lineChartData = [['', 0, 'color: rgb(143, 27, 0)', '', '']];

  displayedColumns: string[] = [
    "id", "ponderacion", "periodo", "actividad", "indicador", "formula", "meta",
    "numt1", "dent1", "pert1", "acut1", "metat1", "actividadt1",
    "numt2", "dent2", "pert2", "acut2", "metat2", "actividadt2",
    "numt3", "dent3", "pert3", "acut3", "metat3", "actividadt3",
    "numt4", "dent4", "pert4", "acut4", "metat4", "actividadt4",];

  displayedHeaders: string[] = [
    "idP", "ponderacionP", "periodoP", "actividadP", "indicadorP", "formulaP", "metaP",
    "trimestre1", "trimestre2", "trimestre3", "trimestre4"];

  planes: any[];
  periodos: any[];
  bandera: boolean;
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
  actividades: any
  rol: string;
  plan = {
    "periodos": [],
    "plan": "",
    "id": ""
  };
  avanceTr1 = 0;
  avanceTr2 = 0;
  avanceTr3 = 0;
  avanceTr4 = 0;

  @ViewChild(MatTable) table: MatTable<any>;

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

  ngAfterViewChecked(): void {
    if (this.table) {
      this.table.updateStickyColumnStyles();
    }
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
    }
  }

  backClicked() {
    this.router.navigate(['pages/dashboard']);
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA';
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION';
    }
  }

  ingresarEvaluacion() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.bandera = true;
    this.request.get(environment.PLANES_MID, `evaluacion/` + this.vigencia.Id + `/` + this.plan.id + `/` + this.periodo.id).subscribe((data: any) => {
      if (data) {
        this.actividades = data.Data;
        this.pieTitle = "Cumplimiento General Plan de Acción 2022 - " + this.unidad.Nombre;
        this.cacheSpan('numero', d => d.numero);
        this.cacheSpan('ponderado', d => d.numero + d.ponderado);
        this.cacheSpan('periodo', d => d.numero + d.ponderado + d.periodo);
        this.cacheSpan('actividad', d => d.numero + d.ponderado + d.periodo + d.actividad);
        this.cacheSpan('actividadt1', d => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1);
        this.cacheSpan('actividadt2', d => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1 + d.actividadt2);
        this.cacheSpan('actividadt3', d => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1 + d.actividadt2 + d.actividadt3);
        this.cacheSpan('actividadt4', d => d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1 + d.actividadt2 + d.actividadt3 + d.actividadt4);

        if (this.periodo.nombre == "Trimestre Dos") {
          this.tr2 = true;
          this.tr3 = false;
          this.tr4 = false;
        } else if (this.periodo.nombre == "Trimestre Tres") {
          this.tr2 = true;
          this.tr3 = true;
          this.tr4 = false;
        } else if (this.periodo.nombre == "Trimestre Cuatro") {
          this.tr2 = true;
          this.tr3 = true;
          this.tr4 = true;
        } else {
          this.tr2 = false;
          this.tr3 = false;
          this.tr4 = false;
        }
        this.calcularAvanceGeneral();
        this.graficarBarras();
        this.graficarCircular();
        Swal.close();
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
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
      });
    });
  }

  loadPeriodo() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
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
      });
    });
  }

  loadUnidades() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) => {
      if (data) {
        this.unidades = data.Data;
        Swal.close();
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }

  loadPlanes() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request.get(environment.PLANES_MID, `evaluacion/planes_periodo/` + this.vigencia.Id + `/` + this.unidad.Id).subscribe((data: any) => {
      if (data) {
        if (data.Data != null) {
          this.planes = data.Data;
          Swal.close();
        } else {
          this.bandera = false;
          this.periodoSelected = false;
          this.planes = [];
          this.plan = { "periodos": [], "plan": "", "id": "" };
          this.tr2 = false;
          this.tr3 = false;
          this.tr4 = false;
          Swal.fire({
            title: 'La unidad no tiene planes con seguimientos avalados para la vigencia selecionada',
            icon: 'info',
            showConfirmButton: false,
            timer: 2500
          });
        }
      }
    }, (error) => {
      Swal.fire({
        title: 'La unidad no tiene planes con seguimientos avalados para la vigencia selecionada',
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    });
  }

  ngOnInit(): void {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.getRol();
  }

  cacheSpan(key, accessor) {
    for (let i = 0; i < this.actividades.length;) {
      let currentValue = accessor(this.actividades[i]);
      let count = 1;

      for (let j = i + 1; j < this.actividades.length; j++) {
        if (currentValue != accessor(this.actividades[j])) {
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

  calcularAvanceGeneral() {
    let numero = 0;
    this.avanceTr1 = 0;
    this.avanceTr2 = 0;
    this.avanceTr3 = 0;
    this.avanceTr4 = 0;

    for (let index = 0; index < this.actividades.length; index++) {
      const actividad = this.actividades[index];
      if (numero != actividad.numero) {
        numero = actividad.numero;
      } else {
        continue;
      }
      if (actividad.trimestre1.actividad) {
        this.avanceTr1 += actividad.ponderado * actividad.trimestre1.actividad;
      }

      if (actividad.trimestre2.actividad) {
        this.avanceTr2 += actividad.ponderado * actividad.trimestre2.actividad;
      }

      if (actividad.trimestre3.actividad) {
        this.avanceTr3 += actividad.ponderado * actividad.trimestre3.actividad;
      }

      if (actividad.trimestre4.actividad) {
        this.avanceTr4 += actividad.ponderado * actividad.trimestre4.actividad;
      }
    }

    this.avanceTr1 = parseFloat((this.avanceTr1 / 100).toFixed(2));
    this.avanceTr2 = parseFloat((this.avanceTr2 / 100).toFixed(2));
    this.avanceTr3 = parseFloat((this.avanceTr3 / 100).toFixed(2));
    this.avanceTr4 = parseFloat((this.avanceTr4 / 100).toFixed(2));
  }

  graficarBarras() {
    let numero = 0;
    let actividades = [];

    for (let index = 0; index < this.actividades.length; index++) {
      const actividad = this.actividades[index];
      if (numero != actividad.numero) {
        numero = actividad.numero;
      } else {
        continue;
      }
      if (this.avanceTr4) {
        actividades.push([actividad.actividad, actividad.trimestre4.actividad, 'color: rgb(143, 27, 0)', String(actividad.trimestre4.actividad) + '%', '']);
        continue;
      }
      if (this.avanceTr3) {
        actividades.push([actividad.actividad, actividad.trimestre3.actividad, 'color: rgb(143, 27, 0)', String(actividad.trimestre3.actividad) + '%', '']);
        continue;
      }
      if (this.avanceTr2) {
        actividades.push([actividad.actividad, actividad.trimestre2.actividad, 'color: rgb(143, 27, 0)', String(actividad.trimestre2.actividad) + '%', '']);
        continue;
      }
      if (this.avanceTr1) {
        actividades.push([actividad.actividad, actividad.trimestre1.actividad, 'color: rgb(143, 27, 0)', String(actividad.trimestre1.actividad) + '%', '']);
        continue;
      }
    }

    this.lineChartData = actividades;
  }

  graficarCircular() {
    let avance = 0;
    if (this.tr4) {
      avance = this.avanceTr4;
    } else if (this.tr3) {
      avance = this.avanceTr3;
    } else if (this.tr2) {
      avance = this.avanceTr2;
    } else {
      avance = this.avanceTr1;
    }

    this.pieChartData = [['Avance', avance],
    ['Restante', 100 - avance]];
  }
}
