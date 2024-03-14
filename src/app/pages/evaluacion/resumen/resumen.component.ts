import { Component, Input, OnInit } from '@angular/core';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

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
    legend: 'none',
    hAxis: { title: 'Unidad' },
    vAxis: { title: 'Avance', minValue: 0, maxValue: 100 },
  };

  lineChartColumnNames = [
    'Unidad',
    'Avance',
    { role: 'style' },
  ];

  lineChartData = [['', 0, 'color: rgb(143, 27, 0)']];
  auxLineChartData = [];

  infoTabla = [];

  constructor(private request: RequestManager) {}

  async ngOnInit() {
    await this.calcularAvanceGeneral();
  }

  async obtenerDatosUnidad(unidad: { Id: string; Nombre: string }) {
    return await new Promise((resolve, reject) => {
      this.request
        .get(
          environment.PLANES_MID,
          `evaluacion/avance/${this.plan.nombre}/${this.idVigencia}/${unidad.Id}`
        )
        .subscribe(
          (data: any) => {
            if (data) {
              console.log(data.Data);
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

  async calcularAvanceGeneral() {
    Swal.fire({
      title: 'Cargando datos de las unidades...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    this.auxLineChartData = [];
    for (let index = 0; index < this.unidades.length; index++) {
      await this.obtenerDatosUnidad(this.unidades[index]);
    }
    Swal.close();
    if (this.auxLineChartData.length > 0) {
      this.lineChartData = this.auxLineChartData;
    }
  }
}
