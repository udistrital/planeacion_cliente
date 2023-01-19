import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTable, MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AgregarFuenteDialogComponent } from '../agregar-fuente-dialog/agregar-fuente-dialog.component';
import { EditarFuenteComponent } from '../editar-fuente/editar-fuente.component';
import { RequestManager } from '../../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { element } from 'protractor';
import { ControlContainer } from '@angular/forms';


export interface Fuentes {
  posicion: number;
  nombre: string;
  presupuesto: number;
  //iconSelected: string;
}

// const INFO: Fuentes[] = [
//   {Posicion: '1', Nombre: 'Fuente1', Presupuesto: 20000 },
//   {Posicion: '2', Nombre: 'Fuente2', Presupuesto: 40000 },
// ]

@Component({
  selector: 'app-fuentes-de-apropiacion',
  templateUrl: './fuentes-de-apropiacion.component.html',
  styleUrls: ['./fuentes-de-apropiacion.component.scss']
})
export class FuentesDeApropiacionComponent implements OnInit {
  static reloadFuentes() {
    throw new Error('Method not implemented.');
  }
  displayedColumns: string[] = ['index','nombre', 'presupuesto', 'actions'];
  dataSource = new MatTableDataSource();
  dataFuentes = [];
  fuente: any;
  totalPresupuesto: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) myTable!: MatTable<Fuentes>;

  constructor(
    private request: RequestManager,
    public dialog: MatDialog,
    //private formBuilder: FormBuilder,
    ) {

   }

  ngOnInit(): void {
    this.getFuentesApropiacion();
  }

  addElement(): void {
    const dialogRef = this.dialog.open(AgregarFuenteDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(50vw - 70px)',      //data: { ban: 'plan', sub, subDetalle }
      
    });
    dialogRef.afterClosed().subscribe(result => {
      window.location.reload();
    });
  }

  getFuentesApropiacion() {
    this.request.get(environment.PLANES_CRUD, 'fuentes-apropiacion').subscribe((data: any) => {
      if(data) {
        if (data.Data.length != 0) {         
          for(let i = 0; i < data.Data.length; i++) { 
            if( data.Data[i].activo == true ) {  
              this.dataFuentes.push(data.Data[i]);
            }
          }
          for(let i = 0; i < this.dataFuentes.length; i++) {
            this.dataFuentes[i].posicion = i + 1;
          }
          this.dataSource = new MatTableDataSource<Fuentes>(this.dataFuentes);
          this.getTotalPresupuesto();
        }
      }
    })
  }
  getTotalPresupuesto() {
    return this.totalPresupuesto = this.dataFuentes.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);
  }

  openEditarFuente(row): void {
    const dialogRef = this.dialog.open(EditarFuenteComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: {row}      
    });

    dialogRef.afterClosed().subscribe(result => {
      //this.myTable.renderRows();   
      this.reloadFuentes();
      //window.location.reload();
    });
  }

  inactivar(row) {
    Swal.fire({
      title: 'Inhabilitar fuente',
      text: `¿Está seguro de inhabilitar la fuente?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      this.fuente = row;
      if (this.fuente["id"] == row["id"]) {        
        this.fuente["activo"] = false;
        this.request.put(environment.PLANES_CRUD, 'fuentes-apropiacion', this.fuente, this.fuente["_id"]).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Fuente Inhabilitada',
              icon: 'success',
              showConfirmButton: false,
              timer: 2500
            })
            this.reloadFuentes();
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          }).then((result) => {
              if (result.value) {
                window.location.reload();
              }
            })
        })       
      }
    })     
  }
  reloadFuentes() {    
    window.location.reload();
  }
}