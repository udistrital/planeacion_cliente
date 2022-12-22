import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AgregarFuenteDialogComponent } from '../agregar-fuente-dialog/agregar-fuente-dialog.component';

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
  selector: 'app-fuentes-de-apropiacion',
  templateUrl: './fuentes-de-apropiacion.component.html',
  styleUrls: ['./fuentes-de-apropiacion.component.scss']
})
export class FuentesDeApropiacionComponent implements OnInit {
  displayedColumns: string[] = ['index','nombre', 'presupuesto', 'actions'];
  dataSource = new MatTableDataSource<Fuentes>(INFO);
  fuentes = INFO;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    ) {
    
   }

  ngOnInit(): void {
    
  }

  addElement(): void {
    const dialogRef = this.dialog.open(AgregarFuenteDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      //data: { ban: 'plan', sub, subDetalle }
    });
  }

  getTotalPresupuesto() {    
    return this.fuentes.map(t => t.Presupuesto).reduce((acc, value) => acc + value, 0);
  }
  // addElement() {
  //   this.dialog.open(, )
  // }

}
