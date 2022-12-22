import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AgregarMetaDialogComponent } from '../agregar-meta-dialog/agregar-meta-dialog.component';
import { CargarSoportesDialogComponent } from '../cargar-soportes-dialog/cargar-soportes-dialog.component';

export interface Fuentes {
  Posicion: string;
  Nombre: string;
  Presupuesto: number;
  iconSelected: string;
}
// export class InputClearableExample {
//   value = 'Clear me';
// }

const INFO: Fuentes[] = [
  {Posicion: '1', Nombre: 'Fuente1', Presupuesto: 20000, iconSelected: 'done'},
  {Posicion: '2', Nombre: 'Fuente2', Presupuesto: 40000, iconSelected: 'done'},
]

export interface Soportes {
  posicion: string;
  nombre: string;
  actions: string;  
  //iconSelected: string;
}

const SOPORTES: Soportes[] = [
  {posicion: '1', nombre: 'Fuente1', actions: 'done'},
  {posicion: '2', nombre: 'Fuente2', actions: 'done'},
]

export interface Metas {
  posicion: string;
  nombre: string;
  presupuesto: number;
  iconSelected: string;
}

const METAS: Metas[] = [
  {posicion: '1', nombre: 'Fuente1', presupuesto: 20000, iconSelected: 'done'},
  {posicion: '2', nombre: 'Fuente2', presupuesto: 40000, iconSelected: 'done'},
]

@Component({
  selector: 'app-agregar-proyecto-vigente',
  templateUrl: './agregar-proyecto-vigente.component.html',
  styleUrls: ['./agregar-proyecto-vigente.component.scss']
})



export class AgregarProyectoVigenteComponent implements OnInit {
  displayedColumns: string[] = ['index','nombre', 'presupuesto', 'actions'];
  dataSource = new MatTableDataSource<Fuentes>(INFO);
  displayedColumnSoportes: string[] = ['index', 'nombre', 'actions'];  
  dataSourceSoportes = new MatTableDataSource<Soportes>(SOPORTES);
  displayedColumnsMetas: string[] = ['index','nombre', 'presupuesto', 'actions'];
  dataSourceMetas = new MatTableDataSource<Metas>(METAS);
  fuentes = INFO;
  metasPresupuesto = METAS; 
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    private router: Router,
  ) { }

  ngOnInit(): void {
  }

  guardar() {
    this.router.navigate(['pages/proyectos-macro/proyectos-de-inversion-vigentes']);
  }

  loadSoportes(): void {
    const dialogRef = this.dialog.open(CargarSoportesDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      //data: { ban: 'plan', sub, subDetalle }
    });
  }
  addMeta(): void {
    const dialogRef = this.dialog.open(AgregarMetaDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      //data: { ban: 'plan', sub, subDetalle }
    });
  }

  getTotalPresupuesto() {    
    return this.fuentes.map(t => t.Presupuesto).reduce((acc, value) => acc + value, 0);
  }
  getTotalPresupuestoMetas() {    
    return this.metasPresupuesto.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);
  }
}
