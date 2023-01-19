import { Component, Input, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource, MatTable} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AgregarFuenteDialogComponent } from '../agregar-fuente-dialog/agregar-fuente-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { VisualizarSoportesDialogComponent } from '../visualizar-soportes-dialog/visualizar-soportes-dialog.component';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';

export interface Fuentes {
  posicion: number;
  nombre: string;
  presupuesto: number;
}

export interface Soportes {
  posicion: number;
  nombre: string;  
}

// const INFO: Fuentes[] = [
//    {posicion: 1, nombre: 'Fuente1', presupuesto: 20000},
//    {posicion: 2, nombre: 'Fuente2', presupuesto: 40000},
// ]

@Component({
  selector: 'app-fuente-apropiacion-dialog',
  templateUrl: './fuente-apropiacion-dialog.component.html',
  styleUrls: ['./fuente-apropiacion-dialog.component.scss']
})
export class FuenteApropiacionDialogComponent implements OnInit {
  displayedColumns: string[] = ['posicion','nombre', 'presupuesto'];
  displayedColumnSoportes: string[] = ['posicion','nombre', 'actions'];
  dataSource = new MatTableDataSource<Fuentes>();
  dataSourceSoportes = new MatTableDataSource<Soportes>();  
  totalPresupuesto: any;
  dataFuentes = [];
  dataSoportes = [];
  id: string; 
  idSoportes: string; 

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) myTable!: MatTable<Fuentes>;
  
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private request: RequestManager,   
    private activatedRoute: ActivatedRoute,
    private gestorDocumental: GestorDocumentalService,
    ) {  
      activatedRoute.params.subscribe(prm => {

        this.id = prm['id'];
        this.idSoportes = prm['id_detalle_soportes'];
      });
      this.getFuentesApropiacion();
      this.getSoportes();
   }
   public dataFuentesApropiacion: Array<any> = [];

   ngOnInit(): void {
   
   }

   async revisarDocumento(row) {   
      if (row.file != undefined) {
        let header = "data:application/pdf;base64,";
        const dialogRef = this.dialog.open(VisualizarSoportesDialogComponent, {
          width: '1200',
          minHeight: 'calc(100vh - 90px)',
          height: '80%',
          data: { "url": header + row.file}
        });
      } else {
        Swal.fire({
          title: 'Cargando información',
          timerProgressBar: true,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        })
  
        await this.gestorDocumental.get([row]).subscribe(
          (documentos) => {
            Swal.close();
            const dialogRef = this.dialog.open(VisualizarSoportesDialogComponent, {
              width: '1200px',
              minHeight: 'calc(100vh - 90px)',
              height: '800px',
              data: { ...documentos[0] }
            });
  
            dialogRef.afterClosed().subscribe(result => {
              if (result == undefined) {
                return undefined;
              } else {
                for (let index = 0; index < this.dataSource.data.length; index++) {
                  if (this.dataSource.data[index]["Id"] == result["Id"]) {
                    this.dataSource.data[index]["Observacion"] = result["Observacion"];
                  };
                };
              };
            });
          }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              text: `No se pudo cargar el documento ${JSON.stringify(error)}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
          })
        Swal.close();
      }    
  }

   getFuentesApropiacion(){
    this.request.get(environment.PLANES_CRUD, 'subgrupo-detalle/'+ this.id).subscribe((data: any) => {
      if(data) {
          this.dataFuentes = JSON.parse(data.Data.dato);
          for(let i = 0; i < this.dataFuentes.length; i++) {
            this.dataFuentes[i].posicion = i + 1;
          }
          this.dataSource = new MatTableDataSource<Fuentes>(this.dataFuentes);
          this.getTotalPresupuesto();
        
      }
    })
  }
 
   getTotalPresupuesto() {    
    return this.totalPresupuesto = this.dataFuentes.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);
    
  }

  getSoportes(){
    this.request.get(environment.PLANES_CRUD, 'subgrupo-detalle/'+ this.idSoportes).subscribe((data: any) => {
      if(data) {
          this.dataSoportes = JSON.parse(data.Data.dato);
          for(let i = 0; i < this.dataSoportes.length; i++) {
            this.dataSoportes[i].posicion = i + 1;
          } 
          this.dataSourceSoportes = new MatTableDataSource<Soportes>(this.dataSoportes);;
          this.getTotalPresupuesto();
        
      }
    })
  }
  regresar() {
    this.router.navigate(['pages/proyectos-macro/proyectos-de-inversion-vigentes']);
  }  
}
