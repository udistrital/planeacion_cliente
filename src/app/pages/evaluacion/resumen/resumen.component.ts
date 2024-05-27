import { Component, Input, OnInit } from '@angular/core';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { UnaryOperator } from '@angular/compiler';

type Dato = { id: string; nombre: string };

@Component({
  selector: 'app-resumen',
  templateUrl: './resumen.component.html',
  styleUrls: ['./resumen.component.scss'],
})
export class ResumenComponent implements OnInit {
  @Input() idVigencia: string;
  @Input() plan: Dato;
  @Input() unidades: any[];
  @Input() periodo: any;
  unidadesConPeriodoSeleccionado = [];

  columnType = 'ColumnChart';
  lineChartOptions = {
    title: 'Avance ponderado por planes',
    legend: 'none',
    hAxis: { title: 'Unidad' },
    vAxis: { title: 'Avance', minValue: 0, maxValue: 100 },
  };
  lineChartColumnNames = ['Unidad', 'Avance', { role: 'style' }];
  lineChartData = [['', 0, 'color: rgb(143, 27, 0)']];
  auxLineChartData = [];

  infoTabla = [];
  mostrarTabla: boolean = false;
  mostrarGrafica: boolean = false;

  constructor(private request: RequestManager) {}

  async ngOnInit() {
    if (this.periodo === 'TODOS') {
      await this.calcularAvanceGeneral();
      this.mostrarTabla = true;
      this.mostrarGrafica = true;
    } else {
      this.mostrarTabla = false;
      await this.obtenerUnidadesConPeriodo();
      this.unidades = this.unidadesConPeriodoSeleccionado;
      if (this.unidades.length === 0) {
        Swal.fire({
          title: 'No se cuenta con registros asociados a los trimestres buscados',
          text: 'No existen proyectos con registros en fase de seguimiento asociados al trimestre seleccionado',
          icon: 'warning',
          showConfirmButton: true,
        });
      } else {
        await this.calcularAvanceGeneral();
        this.mostrarGrafica = true;
      }
    }
  }
  

  async obtenerUnidadesConPeriodo() {
    Swal.fire({
      title: 'Cargando Periodos',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
  
    for (let index = 0; index < this.unidades.length; index++) {
      const unidad = this.unidades[index];
      await new Promise((resolve) => {
        this.request
          .get(
            environment.PLANES_MID,
            `evaluacion/planes_periodo/${this.idVigencia}/${unidad.Id}`
          )
          .subscribe((data: any) => {
            if (data?.Data) {
              for (let pos = 0; pos < data.Data.length; pos++) {
                const elemento = data.Data[pos];
                if (elemento['plan'] === this.plan.nombre) {
                  elemento['periodos'].forEach((periodo) => {
                    if (
                      `${periodo.nombre[0].toUpperCase()}${periodo.nombre
                        .substring(1)
                        .toLowerCase()}` === this.periodo.nombre
                    ) {
                      this.unidadesConPeriodoSeleccionado.push(unidad);
                    }
                  });
                }
              }
            }
            resolve(this.unidadesConPeriodoSeleccionado);
          });
      });
    }
    Swal.close();
  }

  async obtenerDatosGraficaPorPeriodos(unidad: { Id: string; Nombre: string }) {
    await new Promise((resolve, reject) => {
      this.request
        .get(
          environment.PLANES_MID,
          `evaluacion/avance/${this.plan.nombre}/${this.idVigencia}/${unidad.Id}`
        )
        .subscribe(
          (data: any) => {
            if (data && data.Data && data.Data.Trimestres) {
              let auxDataBarra: [string, number, string] = ['', 0, ''];
              auxDataBarra[0] = unidad.Nombre;
              let color: string;
              let avance = 0;
              switch (this.periodo.nombre) {
                case 'Trimestre uno':
                  avance = data.Data.Trimestres['1'];
                  break;
                case 'Trimestre dos':
                  avance = data.Data.Trimestres['2'];
                  break;
                case 'Trimestre tres':
                  avance = data.Data.Trimestres['3'];
                  break;
                case 'Trimestre cuatro':
                  avance = data.Data.Trimestres['4'];
                  break;
                default:
                  break;
              }
  
              if (avance <= 20) {
                color = '#c50820';
              } else if (avance > 20 && avance <= 40) {
                color = '#faa99c';
              } else if (avance > 40 && avance <= 60) {
                color = '#fac11d';
              } else if (avance > 60 && avance <= 80) {
                color = '#fdff21';
              } else {
                color = '#73af49';
              }
              auxDataBarra[1] = avance;
              auxDataBarra[2] = `color: ${color}`;
  
              this.auxLineChartData.push(auxDataBarra);
              resolve(auxDataBarra);
            } else {
              Swal.fire({
                title: 'No hay datos para mostrar',
                text: `No se encontró el avance para la Unidad ${unidad.Nombre}`,
                icon: 'info',
                showConfirmButton: true,
              });
              resolve(null);
            }
          },
          (error) => {
            Swal.fire({
              title: 'Error al obtener los datos',
              text: `No se encontró el avance de la Unidad ${unidad.Nombre}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500,
            });
            reject(error);
          }
        );
    });
  }
  

  async obtenerDatosUnidad(unidad: { Id: string; Nombre: string }) {
    await new Promise((resolve, reject) => {
      this.request
        .get(
          environment.PLANES_MID,
          `evaluacion/avance/${this.plan.nombre}/${this.idVigencia}/${unidad.Id}`
        )
        .subscribe(
          (data: any) => {
            if (data) {
              let auxDataBarra: [string, number, string] = ['', 0, ''];
              auxDataBarra[0] = unidad.Nombre;
              let avanceGeneral = data.Data.Promedio;
              let color: string;
              if (avanceGeneral <= 20) {
                //  0,0 -  20  % #c50820
                color = '#c50820';
              } else if (avanceGeneral > 20 && avanceGeneral <= 40) {
                // 20,1 -  40  % #faa99c
                color = '#faa99c';
              } else if (avanceGeneral > 40 && avanceGeneral <= 60) {
                // 40,1 -  60  % #fac11d
                color = '#fac11d';
              } else if (avanceGeneral > 60 && avanceGeneral <= 80) {
                // 60,1 -  80  % #fdff21
                color = '#fdff21';
              } else {
                // 80,1 - 100  % #73af49
                color = '#73af49';
              }
              auxDataBarra[1] = avanceGeneral;
              auxDataBarra[2] = `color: ${color}`;
              this.infoTabla.push({
                idVigencia: this.idVigencia,
                plan: data.Data.plan,
                periodo: data.Data.periodo,
                nombreUnidad: unidad.Nombre,
                avanceTr1: data.Data.Trimestres['1'],
                avanceTr2: data.Data.Trimestres['2'],
                avanceTr3: data.Data.Trimestres['3'],
                avanceTr4: data.Data.Trimestres['4'],
                avanceGeneral,
              });
              this.auxLineChartData.push(auxDataBarra);
              resolve(auxDataBarra);
            }
          },
          (error) => {
            Swal.close();
            Swal.fire({
              title: 'Error al obtener los datos',
              text: `No se encontró el avance de la Unidad`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500,
            });
            reject(error);
          }
        );
    });
  }

  async calcularAvanceGeneral(unidades = this.unidades) {
    Swal.fire({
      title: 'Cargando datos de las unidades...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    this.auxLineChartData = [];
    if (this.periodo === 'TODOS') {
      for (let index = 0; index < unidades.length; index++) {
        await this.obtenerDatosUnidad(unidades[index]);
        console.log('unidad',unidades[index] , this.obtenerDatosUnidad(unidades[index]));
      }
    } else {
      for (let index = 0; index < unidades.length; index++) {
        await this.obtenerDatosGraficaPorPeriodos(unidades[index]);
      }
    }
    Swal.close();
    if (this.auxLineChartData.length > 0) {
      this.lineChartData = this.auxLineChartData;
    }
  }
}