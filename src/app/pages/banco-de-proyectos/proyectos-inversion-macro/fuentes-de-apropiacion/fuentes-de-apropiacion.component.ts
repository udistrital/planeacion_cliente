import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { AgregarFuenteDialogComponent } from '../agregar-fuente-dialog/agregar-fuente-dialog.component';
import { EditarFuenteComponent } from '../editar-fuente/editar-fuente.component';
import { RequestManager } from '../../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

export interface Fuentes {
  posicion: number;
  nombre: string;
  presupuesto: number;
  presupuestoDisponible: number;
}

@Component({
  selector: 'app-fuentes-de-apropiacion',
  templateUrl: './fuentes-de-apropiacion.component.html',
  styleUrls: ['./fuentes-de-apropiacion.component.scss']
})
export class FuentesDeApropiacionComponent implements OnInit {
  displayedColumns: string[] = ['index', 'nombre', 'presupuesto', 'actions'];
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
  ) { }

  ngOnInit(): void {
    this.getFuentesApropiacion();
  }

  addElement(): void {
    const dialogRef = this.dialog.open(AgregarFuenteDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(35vw - 70px)',
    });
    dialogRef.afterClosed().subscribe(result => {
      this.getFuentesApropiacion();
    });
  }

  getFuentesApropiacion() {
    this.dataFuentes = [];
    this.request.get(environment.PLANES_CRUD, 'fuentes-apropiacion').subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {
          for (let i = 0; i < data.Data.length; i++) {
            if (data.Data[i].activo == true) {
              this.dataFuentes.push(data.Data[i]);
            }
          }
          for (let i = 0; i < this.dataFuentes.length; i++) {
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
      data: { row }
    });

    dialogRef.afterClosed().subscribe(result => {
      this.getFuentesApropiacion();
    });
  }

  /**
   
  inactivar(row) {
  Swal.fire({
    title: 'Inhabilitar fuente',
    text: `¿Está seguro de inhabilitar la fuente?`,
    showCancelButton: true,
    confirmButtonText: `Si`,
    cancelButtonText: `No`,
  }).then((result) => {
    if (result.isConfirmed) {
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
            this.getFuentesApropiacion();
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          }).then(() => {
            this.getFuentesApropiacion();
          });
        });
      }
    } else if (result.isDismissed) {
      // El usuario seleccionó "No", aquí puedes realizar alguna acción adicional si es necesario.
    }
  });
}

    
   */

  inactivar(row) {
    Swal.fire({
      title: 'Inhabilitar fuente',
      text: `¿Está seguro de inhabilitar la fuente?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
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
              this.getFuentesApropiacion();
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
                this.getFuentesApropiacion();
              }
            })
          })
        }
      } /*else {
        Swal.fire({
          title: 'CANCELADO',
          text: '',
          icon: 'info',
          showConfirmButton: false,
          timer: 2500
        })
      }*/
    })
  }
}
