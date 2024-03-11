import { Component, Input, OnInit } from '@angular/core';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';

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
  columnType = 'ColumnChart';
  lineChartOptions = {
    title: 'Avance ponderado por planes',
    // tooltip: { isHtml: true },
    legend: 'none',
    vAxis: { minValue: 0, maxValue: 100 },
  };

  lineChartColumnNames = ['Plan', 'Avance', { role: 'style' }];

  lineChartData = [['', 0, 'color: rgb(143, 27, 0)']];

  constructor(private request: RequestManager) {}

  ngOnInit(): void {
    if (this.idVigencia && this.unidades && this.plan) {
      this.calcularAvanceGeneral();
    }
  }

  calcularAvanceGeneral() {
    this.unidades.forEach((unidad) => {
      this.request
        .get(
          environment.PLANES_MID,
          `evaluacion/planes_periodo/${this.idVigencia}/${unidad.Id}`
        )
        .subscribe((data: any) => {
          if (data?.Data != null) {
            data.Data.filter((plan) => {
              return plan['plan'] === this.plan.nombre;
            }).forEach((plan) => {
              let periodos = plan['periodos'];
              console.log(`Plan:`, plan);
              periodos.forEach((periodo) => {
                console.log('periodo:', periodo);
                let tr2: boolean = true;
                let tr3: boolean = true;
                let tr4: boolean = true;
                let numero = 0;
                let avanceTr1: number = 0;
                let avanceTr2: number = 0;
                let avanceTr3: number = 0;
                let avanceTr4: number = 0;
                if (periodo.nombre == 'Trimestre dos') {
                  tr2 = true;
                  tr3 = false;
                  tr4 = false;
                } else if (periodo.nombre == 'Trimestre tres') {
                  tr2 = true;
                  tr3 = true;
                  tr4 = false;
                } else if (periodo.nombre == 'Trimestre cuatro') {
                  tr2 = true;
                  tr3 = true;
                  tr4 = true;
                } else {
                  tr2 = false;
                  tr3 = false;
                  tr4 = false;
                }
                this.request
                  .get(
                    environment.PLANES_MID,
                    `evaluacion/${this.idVigencia}/${plan.id}/${periodo.id}`
                  )
                  .subscribe((data) => {
                    if (data) {
                      console.log(data);
                      data.Data.forEach((actividad) => {
                        console.log(actividad);
                        if (numero != actividad.numero) {
                          numero = actividad.numero;
                          if (actividad.trimestre1.actividad) {
                            avanceTr1 +=
                              (actividad.ponderado / 100) *
                              (actividad.trimestre1.actividad <= 1
                                ? actividad.trimestre1.actividad
                                : 1);
                          }

                          if (actividad.trimestre2.actividad) {
                            avanceTr2 +=
                              (actividad.ponderado / 100) *
                              (actividad.trimestre2.actividad <= 1
                                ? actividad.trimestre2.actividad
                                : 1);
                          }

                          if (actividad.trimestre3.actividad) {
                            avanceTr3 +=
                              (actividad.ponderado / 100) *
                              (actividad.trimestre3.actividad <= 1
                                ? actividad.trimestre3.actividad
                                : 1);
                          }

                          if (actividad.trimestre4.actividad) {
                            avanceTr4 +=
                              (actividad.ponderado / 100) *
                              (actividad.trimestre4.actividad <= 1
                                ? actividad.trimestre4.actividad
                                : 1);
                          }
                        }
                      });
                    }
                  });
                // Desde aquí quedé sin poder entrar :(
                console.log('avanceTr1:', avanceTr1);
                console.log('avanceTr2:', avanceTr2);
                console.log('avanceTr3:', avanceTr3);
                console.log('avanceTr4:', avanceTr4);
                let avancePromedio =
                  (avanceTr1 + avanceTr2 + avanceTr3 + avanceTr4) / 4;
                // Tal vez no sea necesario
                avancePromedio = Math.round(avancePromedio * 100 * 100) / 100;
                console.log('avancePonderado:', avancePromedio);
                let color: string;
                if (avancePromedio <= 20) {
                  //  0,0 -  20  % #c50820
                  color = '#c50820';
                } else if (avancePromedio > 20 && avancePromedio <= 40) {
                  // 20,1 -  40  % #faa99c
                  color = '#faa99c';
                } else if (avancePromedio > 40 && avancePromedio <= 60) {
                  // 40,1 -  60  % #fac11d
                  color = '#fac11d';
                } else if (avancePromedio > 60 && avancePromedio <= 80) {
                  // 60,1 -  80  % #fdff21
                  color = '#fdff21';
                } else {
                  // 80,1 - 100  % #73af49
                  color = '#73af49';
                }
                this.lineChartData.push([
                  unidad.Nombre,
                  avancePromedio,
                  `color: ${color}`,
                ]);


              });
            });
          }
        });
    });
  }
}
