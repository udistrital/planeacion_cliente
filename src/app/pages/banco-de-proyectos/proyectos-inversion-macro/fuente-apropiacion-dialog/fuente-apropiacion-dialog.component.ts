import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AgregarFuenteDialogComponent } from '../agregar-fuente-dialog/agregar-fuente-dialog.component';
import { Router } from '@angular/router';

export interface Fuentes {
  Posicion: string;
  Nombre: string;
  Presupuesto: number;
  iconSelected: string;
}

const INFO: Fuentes[] = [
  {Posicion: '1', Nombre: 'Fuente1', Presupuesto: 20000, iconSelected: 'done'},
  {Posicion: '2', Nombre: 'Fuente2', Presupuesto: 40000, iconSelected: 'done'},
]

@Component({
  selector: 'app-fuente-apropiacion-dialog',
  templateUrl: './fuente-apropiacion-dialog.component.html',
  styleUrls: ['./fuente-apropiacion-dialog.component.scss']
})
export class FuenteApropiacionDialogComponent implements OnInit {
  displayedColumns: string[] = ['index','nombre', 'presupuesto'];
  dataSource = new MatTableDataSource<Fuentes>(INFO);
  fuentes = INFO;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    ) {
    
   }

   ngOnInit(): void {
    
   }
 
   getTotalPresupuesto() {    
    return this.fuentes.map(t => t.Presupuesto).reduce((acc, value) => acc + value, 0);
  }
  guardar() {
    this.router.navigate(['pages/proyectos-macro/proyectos-de-inversion-vigentes']);
  }  
}
