import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';

@Component({
  selector: 'app-pui',
  templateUrl: './pui.component.html',
  styleUrls: ['./pui.component.scss']
})
export class PUIComponent implements OnInit {
  displayedColumns: string[] = ['numero', 'Vigencia', 'Nombre', 'Descripcion', 'Soporte'];
  dataSource: MatTableDataSource<any>;

  constructor() { }

  ngOnInit(): void {
  }

}
