import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { CodigosService } from 'src/app/@core/services/codigos.service';

export interface Fuentes {
  posicion: string;
  nombre: string;
  presupuesto: number;
  iconSelected: string;
}

@Component({
  selector: 'app-proyectos-de-inversion-vigentes',
  templateUrl: './proyectos-de-inversion-vigentes.component.html',
  styleUrls: ['./proyectos-de-inversion-vigentes.component.scss']
})
export class ProyectosDeInversionVigentesComponent implements OnInit {
  displayedColumns: string[] = ['posicion', 'nombre', 'presupuesto', 'actions'];
  dataSource = new MatTableDataSource<Fuentes>();
  planes: any[] = [];
  fuentes: any[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private request: RequestManager,
    private codigosService: CodigosService
  ) { }

  async ngOnInit(){
    await this.codigosService.cargarIdentificadores();
    this.loadData();
  }

  addElement() {
    this.router.navigate(['pages/proyectos-macro/agregar-proyecto-vigente']);
  }

  verProyecto(row) {
    this.router.navigate(['pages/proyectos-macro/consultar-proyecto-inversion/' + row.id]);
  }

  editarProyecto(row) {
    this.router.navigate(['pages/proyectos-macro/proyecto-inversion/' + row.id]);
  }

  loadData() {
    Swal.fire({
      title: 'Cargando Proyectos',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `inversion/proyectos/${this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PRI_SP')}`).subscribe((data: any) => {
      if (data) {
        this.planes = data.Data;
        if (this.planes.length > 0) {
          for (let index = 0; index < this.planes.length; index++) {
            if (this.planes[index].fuentes != undefined) {
              let valorFuente = this.planes[index].fuentes;
              let sumaFuentes = 0;
              for (let i = 0; i < valorFuente.length; i++) {
                sumaFuentes += valorFuente[i].presupuestoProyecto == undefined ? 0 : valorFuente[i].presupuestoProyecto;
              }
              this.fuentes.push({
                id: this.planes[index].id,
                nombre: this.planes[index].nombre_proyecto,
                codigo: this.planes[index].codigo_proyecto,
                presupuesto: sumaFuentes,
                id_detalle_fuentes: this.planes[index].id_detalle_fuentes,
                id_detalle_soportes: this.planes[index].id_detalle_soportes,
              });
            }
          }
          this.dataSource = new MatTableDataSource<Fuentes>(this.fuentes);
          Swal.close();
        }
      }
    }, (error) => {
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
  inactivar(row) {
    Swal.fire({
      title: 'Inactivar proyecto',
      text: `¿Desea inactivar el proyecto seleccionado?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.delete(environment.PLANES_MID, `arbol/desactivar_plan`, row.id).subscribe((data: any) => {
          if (data) {
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
}
