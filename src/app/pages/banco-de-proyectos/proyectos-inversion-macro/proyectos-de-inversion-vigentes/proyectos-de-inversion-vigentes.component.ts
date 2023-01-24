import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { FuenteApropiacionDialogComponent } from '../fuente-apropiacion-dialog/fuente-apropiacion-dialog.component';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';


export interface Fuentes {
  posicion: string;
  nombre: string;
  presupuesto: number;
  iconSelected: string;
}

const INFO: Fuentes[] = [
  //{posicion: '1', nombre: 'Fuente1', presupuesto: 20000, iconSelected: 'done'},
  //{posicion: '2', nombre: 'Fuente2', presupuesto: 40000, iconSelected: 'done'},
]

@Component({
  selector: 'app-proyectos-de-inversion-vigentes',
  templateUrl: './proyectos-de-inversion-vigentes.component.html',
  styleUrls: ['./proyectos-de-inversion-vigentes.component.scss']
})
export class ProyectosDeInversionVigentesComponent implements OnInit {
  displayedColumns: string[] = ['posicion','nombre', 'presupuesto', 'actions'];
  dataSource = new MatTableDataSource<Fuentes>(INFO);
  documentos: any[] = [];
  planes: any[] = [];
  fuentes: any[] = []
  fuentesPlan: any[] = [];
  renderProyects: any[] = [];
  sumaFuentes = 0;
  valorFuente: any;
  dataRow: any;
  //id: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private request: RequestManager,    
    ) {
    
   }

  ngOnInit(): void {
    this.loadData()
  }

  addElement() {
    //this.dialog.open(, )
    this.router.navigate(['pages/proyectos-macro/agregar-proyecto-vigente']);
  }

  verListadoFuentes(row) {    
    this.router.navigate(['pages/proyectos-macro/fuente-apropiacion-dialog/'+ row.id_detalle_fuentes + '/' + row.id_detalle_soportes]);
  }

  loadData(){   
    Swal.fire({
      title: 'Cargando Proyectos',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    }) 
    this.request.get(environment.PLANES_MID, `inversion/getproyectos/63ca86f1b6c0e5725a977dae`).subscribe( (data: any) => {
      if (data){
        console.log(data, "data");
        this.planes = data.Data;      
        if(this.planes.length > 0){
          for(let index=0; index < this.planes.length; index++) {
            if(this.planes[index].fuentes != undefined) {
              console.log(this.planes[index].fuentes, "proyecto")
              this.valorFuente = JSON.parse(this.planes[index].fuentes)
              this.sumaFuentes = 0;
              for(let i = 0; i < this.valorFuente.length; i++) {
                this.sumaFuentes +=  this.valorFuente[i].presupuesto;
              }
              this.fuentes.push({nombre: this.planes[index].nombre_proyecto, posicion: (index + 1), fuentes_apropiacion: JSON.parse(this.planes[index].fuentes), presupuesto: this.sumaFuentes, id_detalle_fuentes:this.planes[index].id_detalle_fuentes,
              id_detalle_soportes:this.planes[index].id_detalle_soportes,id: this.planes[index].id, soportes: this.planes[index].soportes});              
            }            
          }
          this.dataSource = new MatTableDataSource<Fuentes>(this.fuentes);
          Swal.close();
        }
      }
    },(error) => {      
      Swal.fire({
        title: 'Error en la operación', 
        text: 'No se encontraron datos registrados',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })

    })
  }

  // Inactivar todo el árbol
  inactivar(row){
    Swal.fire({
      title: 'Inhabilitar plan',
      text: `¿Está seguro de inhabilitar el plan?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
        if (result.isConfirmed) {
          this.request.delete(environment.PLANES_MID, `arbol/desactivar_plan`, row.id).subscribe((data: any) => {
            if(data){
              Swal.fire({
                title: 'Cambio realizado', 
                icon: 'success',
              }).then((result) => {
                if (result.value) {
                  window.location.reload();
                }
              })
            }
          }),
          (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              showConfirmButton: false,
              timer: 2500
            })
          }
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: 'Cambio cancelado', 
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          })
        }
    })
  }
  // verListadoFuentes(): void {
  //   const dialogRef = this.dialog.open(FuenteApropiacionDialogComponent, {
  //     width: 'calc(80vw - 60px)',
  //     height: 'calc(40vw - 60px)',
  //     //data: { ban: 'plan', sub, subDetalle }
  //   });
  // }
  

}
