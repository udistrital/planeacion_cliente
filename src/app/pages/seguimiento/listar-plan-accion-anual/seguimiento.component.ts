import { Component, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import datosTest from 'src/assets/json/data.json';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.scss']
})
export class SeguimientoComponentList implements OnInit {
  displayedColumns: string[] = ['id', 'unidad', 'estado', 'vigencia', 'periodo', 'seguimiento', 'observaciones', 'enviar'];
  displayedColumnsPL: string[] = ['id', 'unidad', 'estado', 'vigencia', 'periodo', 'seguimiento'];
  dataSource: MatTableDataSource<any>;

  testDatos: any = datosTest;

  constructor() { }

  ngOnInit(): void {
  }

  gestion(){
    window.location.href = '#/pages/seguimiento/gestion-seguimiento';
  }

  traerDatos(){
    console.log('si entra en traer datos');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
