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
    'Trimestre 1',
    'Trimestre 2',
    'Trimestre 3',
    'Trimestre 4',
    'General',
  ];
  equivalentesAColumnas = {
    'Unidad Academico/Administrativa': 'nombreUnidad',
    'Trimestre 1': 'avanceTr1',
    'Trimestre 2': 'avanceTr2',
    'Trimestre 3': 'avanceTr3',
    'Trimestre 4': 'avanceTr4',
    'General': 'avanceGeneral',
  };
  expandedElement: any | null;

  constructor() {}

  ngOnInit(): void {}
}
