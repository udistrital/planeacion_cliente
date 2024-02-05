import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ResumenPlan } from 'src/app/@core/models/plan/resumen_plan';

@Component({
  selector: 'app-tabla-resumen',
  templateUrl: './tabla-resumen.component.html',
  styleUrls: ['./tabla-resumen.component.scss'],
})
export class TablaResumenComponent implements OnInit, AfterViewInit {
  columnasMostradas: string[] = [
    'dependencia',
    'vigencia',
    'nombre',
    'version',
    'estado',
    'acciones',
  ];
  informacionTabla: MatTableDataSource<ResumenPlan>;
  inputsFiltros: NodeListOf<HTMLInputElement>;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor() {}

  ngOnInit(): void {
    const datosPrueba: ResumenPlan[] = [
      {
        dependencia_id: '8',
        dependencia_nombre: 'VICERRECTORIA ACADEMICA',
        estado: 'Pre Aval',
        estado_id: '614d3b4401c7a222052fac05',
        id: '65bc4eaef7b85c3d986c6192',
        nombre: 'Plan de prueba 1',
        ultima_edicion: new Date('2024-02-02T04:19:08.531Z'),
        version: 1,
        vigencia: 2021,
        vigencia_id: '35',
      },
      {
        dependencia_id: '8',
        dependencia_nombre: 'FACULTAD DE INGENIERIA',
        estado: 'En formulación',
        estado_id: '614d3ad301c7a200482fabfd',
        id: '65bc4422f7b85c3d986c3e0e',
        nombre: 'Plan de prueba 2',
        ultima_edicion: new Date('2024-02-02T03:56:11.635Z'),
        version: 1,
        vigencia: 2022,
        vigencia_id: '35',
      },
      {
        dependencia_id: '8',
        dependencia_nombre: 'VICERRECTORIA ACADEMICA',
        estado: 'Pre Aval',
        estado_id: '614d3b4401c7a222052fac05',
        id: '65bc0ced18f02a27a456d380',
        nombre: 'Plan de prueba 7',
        ultima_edicion: new Date('2024-02-02T02:08:49.276Z'),
        version: 7,
        vigencia: 2024,
        vigencia_id: '35',
      },
      {
        dependencia_id: '8',
        dependencia_nombre: 'FACULTAD DE ARTES - ASAB',
        estado: 'Pre Aval',
        estado_id: '614d3b4401c7a222052fac05',
        id: '65bc059618f02a27a456d293',
        nombre: 'Plan de prueba 6',
        ultima_edicion: new Date('2024-02-02T02:08:49.060Z'),
        version: 6,
        vigencia: 2021,
        vigencia_id: '35',
      },
      {
        dependencia_id: '8',
        dependencia_nombre:
          'COORDINACION GENERAL DE AUTOEVALUACION Y ACREDITACION',
        estado: 'Revisión Verificada',
        estado_id: '65bbf86918f02a27a456d20f',
        id: '65bbf36518f02a27a456d1f1',
        nombre: 'Plan de prueba 4',
        ultima_edicion: new Date('2024-02-02T02:08:48.855Z'),
        version: 5,
        vigencia: 2022,
        vigencia_id: '35',
      },
      {
        dependencia_id: '8',
        dependencia_nombre: 'VICERRECTORIA ACADEMIA',
        estado: 'Pre Aval',
        estado_id: '614d3b4401c7a222052fac05',
        id: '65bbcde018f02a27a456ceb1',
        nombre: 'Plan Prueba Steven',
        ultima_edicion: new Date('2024-02-02T02:08:48.649Z'),
        version: 4,
        vigencia: 2023,
        vigencia_id: '35',
      },
    ];
    this.informacionTabla = new MatTableDataSource<ResumenPlan>(datosPrueba);
    this.informacionTabla.filterPredicate = (plan: ResumenPlan, _) => {
      let filtrosPasados: number = 0;
      let valoresAComparar = [
        plan.dependencia_nombre.toLowerCase(),
        plan.vigencia.toString(),
        plan.nombre.toLowerCase(),
        plan.version.toString(),
        plan.estado.toLowerCase(),
      ];
      this.inputsFiltros.forEach((input, posicion) => {
        if (valoresAComparar[posicion].includes(input.value.toLowerCase())) {
          filtrosPasados++;
        }
      });
      return filtrosPasados === valoresAComparar.length;
    };
  }

  ngAfterViewInit(): void {
    this.inputsFiltros = document.querySelectorAll('th.mat-header-cell input');
    this.informacionTabla.paginator = this.paginator;
  }

  aplicarFiltro(event: Event): void {
    let filtro: string = (event.target as HTMLInputElement).value;

    if (filtro === '') {
      this.inputsFiltros.forEach((input) => {
        if (input.value !== '') {
          filtro = input.value;
          return;
        }
      });
    }
    // Se debe poner algún valor que no sea vacio  para que se accione el filtro la tabla
    this.informacionTabla.filter = filtro.trim().toLowerCase();
  }
}
