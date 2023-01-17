import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FuenteApropiacionDialogComponent } from '../fuente-apropiacion-dialog/fuente-apropiacion-dialog.component';

export interface Fuentes {
  Codigo: string;
  Nombre: string;
  Apropiacion: number;
  iconSelected: string;
}

const INFO: Fuentes[] = [
  {Codigo: '1', Nombre: 'Fuente1', Apropiacion: 20000, iconSelected: 'done'},
  {Codigo: '2', Nombre: 'Fuente2', Apropiacion: 40000, iconSelected: 'done'},
]

@Component({
  selector: 'app-proyectos-de-inversion-vigentes',
  templateUrl: './proyectos-de-inversion-vigentes.component.html',
  styleUrls: ['./proyectos-de-inversion-vigentes.component.scss']
})
export class ProyectosDeInversionVigentesComponent implements OnInit {
  displayedColumns: string[] = ['codigo','nombre', 'apropiacion', 'actions'];
  dataSource = new MatTableDataSource<Fuentes>(INFO);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    ) {
    
   }

  ngOnInit(): void {
  }

  addElement() {
    //this.dialog.open(, )
    this.router.navigate(['pages/proyectos-macro/agregar-proyecto-vigente']);
  }

  verListadoFuentes() {
    this.router.navigate(['pages/proyectos-macro/fuente-apropiacion-dialog']);
  }

  // verListadoFuentes(): void {
  //   const dialogRef = this.dialog.open(FuenteApropiacionDialogComponent, {
  //     width: 'calc(80vw - 60px)',
  //     height: 'calc(40vw - 60px)',
  //     //data: { ban: 'plan', sub, subDetalle }
  //   });
  // }
  

}
