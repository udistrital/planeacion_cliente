import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Component({
  selector: 'app-listar-plan',
  templateUrl: './listar-plan.component.html',
  styleUrls: ['./listar-plan.component.scss']
})
export class ListarPlanComponent implements OnInit {

  displayedColumns: string[] = ['nombre', 'descripcion', 'id', 'actions'];
  dataSource: MatTableDataSource<Plan>;

  planes: Plan[] = [
    {id: 1, nombre: 'Proyecto Universitario Institucional', descripcion: 'Desc', estado: 'Activo'},
    {id: 2, nombre: 'Plan Estrategico de Desarrollo', descripcion: 'Desc', estado: 'Inactivo'},
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor() {
    this.dataSource = new MatTableDataSource(this.planes);
   }

   ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  ngOnInit(): void {
  }

}
