import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';
import { MatTable } from '@angular/material/table';

type Dato = { id: string; nombre: string };

@Component({
  selector: 'app-evaluacion-plan',
  templateUrl: './evaluacion-plan.component.html',
  styleUrls: ['./evaluacion-plan.component.scss'],
})
export class EvaluacionPlanComponent implements OnInit {
  @Input() idVigencia: string;
  @Input() plan: Dato;
  @Input() periodo: Dato;
  @Input() nombreUnidad: string;
  @Input() mostrarGraficos: boolean;

  pieType = 'PieChart';
  columnType = 'ColumnChart';
  spans = [];

  pieChartColumns = ['Effort', 'Amount given'];

  pieChartData = [
    ['', 75],
    ['', 25],
  ];

  pieChartOptions = {
    title: 'Cumplimiento general',
    pieHole: 0.5,
    pieSliceTextStyle: {
      color: 'black',
    },
    pieSliceBorderColor: 'gray',
    slices: {
      1: { color: 'transparent' },
    },
    legend: 'none',

    titleTextStyle: {
      fontSize: 20,
      // Tamaño de letra
      bold: true,
      Responseive: true,
      color: '#731514',    // Negrilla
    }

  };

  lineChartOptions = {
    tooltip: { isHtml: true },
    legend: 'none',
    vAxis: { minValue: 0, maxValue: 100 },
  };

  lineChartColumnNames = [
    'Actividad',
    'Avance',
    { role: 'style' },
    { role: 'annotation' },
    { type: 'string', role: 'tooltip' },
  ];

  lineChartData = [['', 0, 'color: rgb(143, 27, 0)', '', '']];

  displayedColumns: string[] = [
    "id", "ponderacion", "actividad", "indicador", "formula", "meta",
    "numt1", "dent1", "pert1", "acut1", "metat1", "brecha1", "actividadt1",
    "numt2", "dent2", "pert2", "acut2", "metat2", "brecha2", "actividadt2",
    "numt3", "dent3", "pert3", "acut3", "metat3", "brecha3", "actividadt3",
    "numt4", "dent4", "pert4", "acut4", "metat4", "brecha4", "actividadt4",];

  displayedHeaders: string[] = [
    'idP',
    'ponderacionP',
    'actividadP',
    'indicadorP',
    'formulaP',
    'metaP',
    'trimestre1',
    'trimestre2',
    'trimestre3',
    'trimestre4',
  ];

  actividades: any;

  tr2: boolean = true;
  tr3: boolean = true;
  tr4: boolean = true;
  avanceTr1 = 0;
  avanceTr2 = 0;
  avanceTr3 = 0;
  avanceTr4 = 0;

  @ViewChild(MatTable) table: MatTable<any>;

  constructor(private request: RequestManager) {}

  ngAfterViewChecked(): void {
    if (this.table) {
      this.table.updateStickyColumnStyles();
    }
  }

  ngOnInit(): void {
    this.cargarDatos();
  }

  cargarDatos() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.actividades = [];
    this.spans = [];
    this.request
      .get(
        environment.PLANES_MID,
        `evaluacion/${this.idVigencia}/${this.plan.id}/${this.periodo.id}`
      ).subscribe(
        (data: any) => {
          if (data) {
            this.actividades = data.Data;
            this.actividades.forEach((actividad) => {
              actividad.class = actividad.numero % 2 == 0 ? 'claro' : 'oscuro';
            });
            this.cacheSpan('numero', (d) => d.numero);
            this.cacheSpan('ponderado', (d) => d.numero + d.ponderado);
            this.cacheSpan('periodo',(d) => d.numero + d.ponderado + d.periodo);
            this.cacheSpan( 'actividad', (d) => d.numero + d.ponderado + d.periodo + d.actividad);
            this.cacheSpan('actividadt1',(d) =>d.numero + d.ponderado + d.periodo + d.actividad + d.actividadt1);
            this.cacheSpan('actividadt2', (d) => d.numero +d.ponderado +  d.periodo + d.actividad +d.actividadt1 +d.actividadt2);
            this.cacheSpan('actividadt3',(d) =>d.numero + d.numero +d.ponderado +d.periodo + d.actividad + d.actividadt1 + d.actividadt2 + d.actividadt3);
            this.cacheSpan( 'actividadt4', (d) => d.numero +d.ponderado + d.periodo + d.actividad + d.actividadt1 + d.actividadt2 + d.actividadt3 + d.actividadt4 );

            if (this.periodo.nombre.toLowerCase() == 'trimestre dos') {
              this.tr2 = true;
              this.tr3 = false;
              this.tr4 = false;
            } else if (this.periodo.nombre.toLowerCase() == 'trimestre tres') {
              this.tr2 = true;
              this.tr3 = true;
              this.tr4 = false;
            } else if (this.periodo.nombre.toLowerCase() == 'trimestre cuatro') {
              this.tr2 = true;
              this.tr3 = true;
              this.tr4 = true;
            } else {
              this.tr2 = false;
              this.tr3 = false;
              this.tr4 = false;
            }
            this.calcularAvanceGeneral();
            if (this.mostrarGraficos) {
              this.graficarBarras();
              this.graficarCircular();
            }
            Swal.close();
          }
        },
        (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500,
          });
        }
      );
  }

  cacheSpan(key, accessor) {
    for (let i = 0; i < this.actividades.length; ) {
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
        this.avanceTr1 += (actividad.ponderado / 100) * (actividad.trimestre1.actividad <= 1 ? actividad.trimestre1.actividad : 1);
      }

      if (actividad.trimestre2.actividad) {
        this.avanceTr2 += (actividad.ponderado / 100) * (actividad.trimestre2.actividad <= 1 ? actividad.trimestre2.actividad : 1);
      }

      if (actividad.trimestre3.actividad) {
        this.avanceTr3 += (actividad.ponderado / 100) * (actividad.trimestre3.actividad <= 1 ? actividad.trimestre3.actividad : 1);
      }

      if (actividad.trimestre4.actividad) {
        this.avanceTr4 += (actividad.ponderado / 100) * (actividad.trimestre4.actividad <= 1 ? actividad.trimestre4.actividad : 1);
      }
    }
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

      let actividadValor;
      if (this.avanceTr4) {
        actividadValor =
          Math.round(actividad.trimestre4.actividad * 100 * 100) / 100;
      } else if (this.avanceTr3) {
        actividadValor =
          Math.round(actividad.trimestre3.actividad * 100 * 100) / 100;
      } else if (this.avanceTr2) {
        actividadValor =
          Math.round(actividad.trimestre2.actividad * 100 * 100) / 100;
      } else if (this.avanceTr1) {
        actividadValor =
          Math.round(actividad.trimestre1.actividad * 100 * 100) / 100;
      }

      actividades.push([
        actividad.numero,
        actividadValor,
        `color: ${this.colorPorPorcentaje(actividadValor)}`,
        `${actividadValor}%`,
        actividad.actividad,
      ]);
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

    this.pieChartData = [
      ['Avance', avance * 100],
      ['Restante', 100 - avance * 100],
    ];
  }

  //convertir a entero en vista
  abs(value: number): number {
    return Math.abs(value);
  }

  colorPorPorcentaje(porcentajeAvance: number) {
    if (porcentajeAvance === undefined || porcentajeAvance <= 20) {
      return '#c50820';
    } else if (porcentajeAvance > 20 && porcentajeAvance <= 40) {
      return '#faa99c';
    } else if (porcentajeAvance > 40 && porcentajeAvance <= 60) {
      return '#fac11d';
    } else if (porcentajeAvance > 60 && porcentajeAvance <= 80) {
      return '#fdff21';
    } else if (porcentajeAvance > 80) {
      return '#73af49';
    }
  }

  //agregar color al Cumplimiento por Meta
  colorCM(fila, trimestre): string {
    if (fila !== undefined){
      if (fila.trimestre1 !== undefined && trimestre === 1){
        if (fila.trimestre1.tipo_denominador === "Denominador variable"){
          if (fila.trimestre1.meta >= 0 && fila.trimestre1.meta <= (0.2 * 0.25)) {
            return 'meta-rojo';
          } else if (fila.trimestre1.meta > (0.2 * 0.25) && fila.trimestre1.meta <= (0.4 * 0.25)) {
            return 'meta-piel';
          } else if (fila.trimestre1.meta > (0.4 * 0.25) && fila.trimestre1.meta <= (0.6 * 0.25)) {
            return 'meta-naranja';
          } else if (fila.trimestre1.meta > (0.6 * 0.25) && fila.trimestre1.meta <= (0.8 * 0.25)) {
            return 'meta-amarillo';
          } else if (fila.trimestre1.meta > (0.8 * 0.25)) {
            return 'meta-verde';
          }
        } else {
          if (fila.trimestre1.meta >= 0 && fila.trimestre1.meta <= 0.2) {
            return 'meta-rojo';
          } else if (fila.trimestre1.meta > 0.2 && fila.trimestre1.meta <= 0.4) {
            return 'meta-piel';
          } else if (fila.trimestre1.meta > 0.4 && fila.trimestre1.meta <= 0.6) {
            return 'meta-naranja';
          } else if (fila.trimestre1.meta > 0.6 && fila.trimestre1.meta <= 0.8) {
            return 'meta-amarillo';
          } else if (fila.trimestre1.meta > 0.8) {
            return 'meta-verde';
          }
        }
      }

      if (fila.trimestre2 !== undefined && trimestre === 2){
        if (fila.trimestre2.tipo_denominador === "Denominador variable"){
          if (fila.trimestre2.meta >= 0 && fila.trimestre2.meta <= (0.2 * 0.5)) {
            return 'meta-rojo';
          } else if (fila.trimestre2.meta > (0.2 * 0.5) && fila.trimestre2.meta <= (0.4 * 0.5)) {
            return 'meta-piel';
          } else if (fila.trimestre2.meta > (0.4 * 0.5) && fila.trimestre2.meta <= (0.6 * 0.5)) {
            return 'meta-naranja';
          } else if (fila.trimestre2.meta > (0.6 * 0.5) && fila.trimestre2.meta <= (0.8 * 0.5)) {
            return 'meta-amarillo';
          } else if (fila.trimestre2.meta > (0.8 * 0.5)) {
            return 'meta-verde';
          }
        } else {
          if (fila.trimestre2.meta >= 0 && fila.trimestre2.meta <= 0.2) {
            return 'meta-rojo';
          } else if (fila.trimestre2.meta > 0.2 && fila.trimestre2.meta <= 0.4) {
            return 'meta-piel';
          } else if (fila.trimestre2.meta > 0.4 && fila.trimestre2.meta <= 0.6) {
            return 'meta-naranja';
          } else if (fila.trimestre2.meta > 0.6 && fila.trimestre2.meta <= 0.8) {
            return 'meta-amarillo';
          } else if (fila.trimestre2.meta > 0.8) {
            return 'meta-verde';
          }
        }
      }

      if (fila.trimestre3 !== undefined && trimestre === 3){
        if (fila.trimestre3.tipo_denominador === "Denominador variable"){
          if (fila.trimestre3.meta >= 0 && fila.trimestre3.meta <= (0.2 * 0.75)) {
            return 'meta-rojo';
          } else if (fila.trimestre3.meta > (0.2 * 0.75) && fila.trimestre3.meta <= (0.4 * 0.75)) {
            return 'meta-piel';
          } else if (fila.trimestre3.meta > (0.4 * 0.75) && fila.trimestre3.meta <= (0.6 * 0.75)) {
            return 'meta-naranja';
          } else if (fila.trimestre3.meta > (0.6 * 0.75) && fila.trimestre3.meta <= (0.8 * 0.75)) {
            return 'meta-amarillo';
          } else if (fila.trimestre3.meta > (0.8 * 0.75)) {
            return 'meta-verde';
          }
        } else {
          if (fila.trimestre3.meta >= 0 && fila.trimestre3.meta <= 0.2) {
            return 'meta-rojo';
          } else if (fila.trimestre3.meta > 0.2 && fila.trimestre3.meta <= 0.4) {
            return 'meta-piel';
          } else if (fila.trimestre3.meta > 0.4 && fila.trimestre3.meta <= 0.6) {
            return 'meta-naranja';
          } else if (fila.trimestre3.meta > 0.6 && fila.trimestre3.meta <= 0.8) {
            return 'meta-amarillo';
          } else if (fila.trimestre3.meta > 0.8) {
            return 'meta-verde';
          }
        }
      }

      if (fila.trimestre4 !== undefined && trimestre === 4){
        if (fila.trimestre4.tipo_denominador === "Denominador variable"){
          if (fila.trimestre4.meta >= 0 && fila.trimestre4.meta <= (0.2)) {
            return 'meta-rojo';
          } else if (fila.trimestre4.meta > (0.2) && fila.trimestre4.meta <= (0.4)) {
            return 'meta-piel';
          } else if (fila.trimestre4.meta > (0.4) && fila.trimestre4.meta <= (0.6)) {
            return 'meta-naranja';
          } else if (fila.trimestre4.meta > (0.6) && fila.trimestre4.meta <= (0.8)) {
            return 'meta-amarillo';
          } else if (fila.trimestre4.meta > (0.8)) {
            return 'meta-verde';
          }
        } else {
          if (fila.trimestre4.meta >= 0 && fila.trimestre4.meta <= 0.2) {
            return 'meta-rojo';
          } else if (fila.trimestre4.meta > 0.2 && fila.trimestre4.meta <= 0.4) {
            return 'meta-piel';
          } else if (fila.trimestre4.meta > 0.4 && fila.trimestre4.meta <= 0.6) {
            return 'meta-naranja';
          } else if (fila.trimestre4.meta > 0.6 && fila.trimestre4.meta <= 0.8) {
            return 'meta-amarillo';
          } else if (fila.trimestre4.meta > 0.8) {
            return 'meta-verde';
          }
        }
      }
    } else {
      return '';
    }
  }
}
