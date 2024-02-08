import { AfterViewInit, Component, ViewChild, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditarDialogComponent } from '../construir-plan/editar-dialog/editar-dialog.component';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { error } from 'console';

export interface Planes {
  _id: string
  activo: string
  aplicativo_id: string
  dependencia_id: string
  descripcion: string
  formato: boolean
  nombre: string
  nombre_tipo_plan: string
  tipo_plan_id: string
  vigencia: string
  iconSelected: string
}

export interface Plan {
  _id: string;
  nombre: string;
}

@Component({
  selector: 'app-listar-plan',
  templateUrl: './listar-plan.component.html',
  styleUrls: ['./listar-plan.component.scss']
})
export class ListarPlanComponent implements OnInit {
  displayedColumns: string[] = ['nombre', 'descripcion', 'tipo_plan', 'activo', 'actions'];
  dataSource: MatTableDataSource<any>;
  uid: number; // id del objeto
  planes: any[];
  // tipoPlan: any[];
  // nombreTipoPlan:any;
  plan: any;
  cargando = true;

  iconoPlanesAccionFuncionamiento: string = 'compare_arrows';
  planesInteres: any;
  banderaTodosSeleccionados: boolean;

  @Input() banderaPlanesAccionFuncionamiento: boolean;
  @Output() planesInteresSeleccionados = new EventEmitter<any[]>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(
    public dialog: MatDialog,
    private request: RequestManager,
    private router: Router,
  ) {
    this.banderaTodosSeleccionados = false;
    this.planesInteres = [];
    this.banderaPlanesAccionFuncionamiento = false;
  }

  ngOnInit(): void {
    console.log('Inicia el componente Listar Planes/Proyectos');
    this.loadData();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialogEditar(sub, subDetalle): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: { ban: 'plan', sub, subDetalle }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined) {
        return undefined;
      } else {
        this.putData(result, 'editar');
      }
    });
  }

  putData(res, bandera) {
    if (bandera == 'editar') {
      this.request.put(environment.PLANES_CRUD, `plan`, res, this.uid).subscribe((data: any) => {
        if (data) {
          if (res.activo == "true") {
            this.request.put(environment.PLANES_MID, `arbol/activar_plan`, res, this.uid).subscribe();
          } else {
            this.request.delete(environment.PLANES_MID, `arbol/desactivar_plan`, this.uid).subscribe();
          }
          Swal.fire({
            title: 'Actualización correcta',
            text: `Se actualizaron correctamente los datos`,
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
    } else if (bandera == 'activo') {
      Swal.fire({
        title: 'Inhabilitar plan',
        text: `¿Está seguro de inhabilitar el plan?`,
        showCancelButton: true,
        confirmButtonText: `Si`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          this.request.put(environment.PLANES_CRUD, `plan`, res, this.uid).subscribe((data: any) => {
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

  // Inactivar todo el árbol
  deleteData() {
    Swal.fire({
      title: 'Inhabilitar plan',
      text: `¿Está seguro de inhabilitar el plan?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.delete(environment.PLANES_MID, `arbol/desactivar_plan`, this.uid).subscribe((data: any) => {
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

  consultarPlan(plan_id, nombrePlan, tipo_plan_id) {
    this.router.navigate(['pages/plan/consultar-plan/' + plan_id + '/' + nombrePlan + '/' + tipo_plan_id]);
  }

  loadData() {
    this.mostrarMensajeCarga();

    this.request.get(environment.PLANES_MID, `formulacion/planes`).subscribe(
      (data: any) => {
        if (data) {
          this.planes = data.Data;
          // this.request.get(environment.PLANES_CRUD, `tipo-plan?query=_id:${data.Data.tipo_plan_id}`).subscribe((dat: any) => {
          //   if (dat){
          //     this.tipoPlan = dat.Data;
          //     this.nombreTipoPlan = dat.Data.nombre
          //     this.ajustarData();
          //   }
          // },(error) => {
          //   Swal.fire({
          //     title: 'Error en la operación', 
          //     text: 'No se encontraron datos registrados',
          //     icon: 'warning',
          //     showConfirmButton: false,
          //     timer: 2500
          //   })

          // })
          // this.nombreTipoPlan = this.tipoPlan.nombre
          this.ajustarData();
          if(this.banderaPlanesAccionFuncionamiento){
            this.planes = data.Data.filter((plan: Planes) => plan.activo == "Activo");
          }
          this.cerrarMensajeCarga();
        }
      },
      (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    );
  }

  mostrarMensajeCarga(): void {
    Swal.fire({
      title: 'Cargando datos...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }

  cerrarMensajeCarga(): void {
    this.dataSource = new MatTableDataSource(this.planes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cargando = false;
    Swal.close();
  }

  ajustarData() {
    this.cambiarValor("activo", true, "Activo")
    this.cambiarValor("activo", false, "Inactivo")
    this.cambiarValor("iconSelected", undefined, "compare_arrows")
  }

  editar(fila): void {
    this.uid = fila._id;
    this.request.get(environment.PLANES_CRUD, `plan/` + this.uid).subscribe((data: any) => {
      if (data) {
        this.plan = data.Data;
        let subgrupoDetalle = {
          type: "",
          required: false
        }
        this.openDialogEditar(this.plan, subgrupoDetalle);
      }
    }),
      (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
  }

  inactivar(fila): void {
    this.uid = fila._id;
    if (fila.activo == 'Activo') {
      if (fila.tipo_plan_id != '611af8464a34b3599e3799a2') {
        this.deleteData();
      } else if (fila.tipo_plan_id == '611af8464a34b3599e3799a2') {
        let res = {
          activo: false,
        }
        this.putData(res, 'activo')
      }
    } else if (fila.activo == 'Inactivo') {
      Swal.fire({
        title: 'Plan ya inactivo',
        text: `El plan ya se encuentra en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    }
  }

  cambiarValor(valorABuscar, valorViejo, valorNuevo) {
    this.planes.forEach(function (elemento) {
      elemento[valorABuscar] = elemento[valorABuscar] == valorViejo ? valorNuevo : elemento[valorABuscar]
    })
  }

  changeIcon(row: Planes) {
    if(!row.iconSelected){
      row.iconSelected = this.iconoPlanesAccionFuncionamiento;
    }
    if (row.iconSelected == 'compare_arrows') {
      row.iconSelected = 'done';

      const nuevoPlanProyecto: Plan = {
        _id: row._id,
        nombre: row.nombre,
      };

      this.planesInteres = [...this.planesInteres, nuevoPlanProyecto];
    } else if (row.iconSelected == 'done') {
      row.iconSelected = 'compare_arrows';
      let planProyectoEliminar = row._id;
      const index = this.planesInteres.findIndex(
        (x: { Id: any }) => x.Id == planProyectoEliminar
      );
      this.planesInteres.splice(index, 1);
    }
    console.log('Planes/Proyectos de interés seleccionados: ', this.planesInteres);
    this.emitirCambiosPlanesInteres();
  }

  seleccionarTodos() {
    this.banderaTodosSeleccionados = true;
    this.planesInteres = this.planes.map((element) => ({
      _id: element._id,
      nombre: element.nombre,
    }));

    // Itera sobre los elementos y cambia el icono
    this.planes.forEach((element) => {
      element.iconSelected = 'done';
    });

    // Emite los cambios
    console.log('Todos seleccionados: ', this.planesInteres);
    this.emitirCambiosPlanesInteres();
  }

  borrarSeleccion() {
    this.banderaTodosSeleccionados = false;
    // Itera sobre los elementos y cambia el icono a 'compare_arrows'
    this.planes.forEach((element) => {
      element.iconSelected = 'compare_arrows';
    });

    // Limpia el array de unidades de interés
    this.planesInteres = [];

    // Emite los cambios
    console.log('Ninguno seleccionado: ', this.planesInteres);
    this.emitirCambiosPlanesInteres();
  }

  emitirCambiosPlanesInteres() {
    this.planesInteresSeleccionados.emit(this.planesInteres);
  }
}
