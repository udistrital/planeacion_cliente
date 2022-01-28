import { Component, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './gestion-seguimiento.component.html',
  styleUrls: ['./gestion-seguimiento.component.scss']
})
export class SeguimientoComponentGestion implements OnInit {
  displayedColumns: string[] = ['id', 'actividad', 'estado', 'fecha', 'gestion'];
  dataSource: MatTableDataSource<any>;

  constructor() { }

  ngOnInit(): void {
  }

  reportar(){
    window.location.href = '#/pages/seguimiento/reportar-periodo';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
