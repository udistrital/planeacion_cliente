import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tabla-resumen-evaluacion',
  templateUrl: './tabla-resumen-evaluacion.component.html',
  styleUrls: ['./tabla-resumen-evaluacion.component.scss'],
})
export class TablaResumenEvaluacionComponent implements OnInit {
  @Input() dataSource: any[] = [];
  columnsToDisplay = [
    'Unidad Academico/Administrativa',
    'Avance Trimestre 1',
    'Avance Trimestre 2',
    'Avance Trimestre 3',
    'Avance Trimestre 4',
    'Avance General',
  ];
  equivalentesAColumnas = {
    'Unidad Academico/Administrativa': 'nombreUnidad',
    'Avance Trimestre 1': 'avanceTr1',
    'Avance Trimestre 2': 'avanceTr2',
    'Avance Trimestre 3': 'avanceTr3',
    'Avance Trimestre 4': 'avanceTr4',
    'Avance General': 'avanceGeneral',
  };
  expandedElement: any | null;

  constructor() {}

  ngOnInit(): void {}
}
