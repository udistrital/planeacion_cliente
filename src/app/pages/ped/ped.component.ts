import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { EditarDialogComponent } from '../plan/construir-plan/editar-dialog/editar-dialog.component';
import { ConsultarDialogPedComponent } from '../ped/consultar-dialog-ped/consultar-dialog-ped.component';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment'
import Swal from 'sweetalert2';
import { CodigosService } from 'src/app/@core/services/codigos.service';

@Component({
  selector: 'app-ped',
  templateUrl: './ped.component.html',
  styleUrls: ['./ped.component.scss']
})
export class PedComponent implements OnInit {

  displayedColumns: string[] = ['nombre', 'descripcion', 'activo', 'vigencia_aplica', 'actions'];
  dataSource: MatTableDataSource<any>;
  uid: number; // id del objeto
  planes: any[];
  plan: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    private request: RequestManager,
    private codigosService: CodigosService
  ) {
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
      data: {ban: 'plan', sub, subDetalle}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined){
        return undefined;
      } else {
        if (result.vigencia_aplica && Array.isArray(result.vigencia_aplica)) {
          if (result.vigencia_aplica.length > 0) {
            result.vigencia_aplica = JSON.stringify(result.vigencia_aplica.map(vigencia => JSON.parse(vigencia)));
            this.putData(result, 'editar');
          } else {
            Swal.fire({
              title: 'Error en la operación',
              text: `Debe seleccionar al menos una vigencia para el plan`,
              icon: 'error',
              confirmButtonText: 'Ok'
            });
          }
        } else {
          this.putData(result, 'editar');
        }
      }
    });
  }

  openDialogConsultar(sub, subDetalle): void {
    const dialogRef = this.dialog.open(ConsultarDialogPedComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: {ban: 'plan', sub, subDetalle}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined){
        return undefined;
      } else {
        this.putData(result, 'editar');
      }
    });
  }

  putData(res, bandera){
    if (bandera == 'editar'){
      this.request.put(environment.PLANES_CRUD, `plan`, res, this.uid).subscribe((data: any) => {
        if(data.Success == true) {
          Swal.fire({
            title: 'Actualización correcta',
            text: `Se actualizaron correctamente los datos`,
            icon: 'success',
          }).then((result) => {
            if (result.value) {
              window.location.reload();
            }
          })
        } else {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se ha podido actualizar el plan estratégico de desarrollo: ${data.Message}`,
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          });
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      })
    } else if (bandera == 'activo') {
      Swal.fire({
        title: 'Inhabilitar plan',
        text: `¿Está seguro de inhabilitar el plan?`,
        showCancelButton: true,
        confirmButtonText: `Si`,
        cancelButtonText: `No`,
        allowOutsideClick: false,
      }).then((result) => {
          if (result.isConfirmed) {
            this.request.put(environment.PLANES_CRUD, `plan`, res, this.uid).subscribe((data: any) => {
              if (data){
                Swal.fire({
                  title: 'Cambio realizado',
                  icon: 'success',
                }).then((result) => {
                  if (result.value) {
                    window.location.reload();
                  }
                })
              }
            }, (error) => {
              Swal.fire({
                title: 'Error en la operación',
                icon: 'error',
                showConfirmButton: false,
                timer: 2500
              })
            })
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
  deleteData(){
    Swal.fire({
      title: 'Inhabilitar plan',
      text: `¿Está seguro de inhabilitar el plan?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
          this.request.delete(environment.PLANES_MID, `arbol/desactivar_plan`, this.uid).subscribe((data: any) => {
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
          }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              showConfirmButton: false,
              timer: 2500
            })
          })
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

  async loadData(){
    this.request.get(environment.PLANES_CRUD, `plan?query=tipo_plan_id:${await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PD_SP')}`).subscribe((data: any) => {
      if (data){
        this.planes = data.Data;
        this.ajustarData();
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

  ajustarData(){
    this.cambiarValor("activo", true, "Activo")
    this.cambiarValor("activo", false, "Inactivo")
    this.dataSource = new MatTableDataSource(this.planes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  editar(fila): void{
    this.uid = fila._id;
    this.request.get(environment.PLANES_CRUD, `plan/`+this.uid).subscribe((data: any) => {
      if(data){
        this.plan = data.Data;
        let subgrupoDetalle={
          type: "",
          required: false
        }
        this.openDialogEditar(this.plan, subgrupoDetalle);
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

  consultar(fila): void{
    this.uid = fila._id;
    this.request.get(environment.PLANES_CRUD, `plan/`+this.uid).subscribe((data: any) => {
      if (data && data.Data && (data.Data !== null)) {
        // Verifica si hay datos y si data.Data no es nulo ni está vacío
        this.plan = data.Data;
        let subgrupoDetalle={
          type: "",
          required: false
        }
        this.openDialogConsultar(this.plan, subgrupoDetalle);
      } else {
        Swal.fire({
          title: 'No hay datos relacionados',
          text: 'No existe información para el plan señalado.',
          icon: 'info',
          showConfirmButton: false,
          timer: 2500
        });
      }
    },(error) => {
      // Maneja el caso de error en la solicitud HTTP GET
      Swal.fire({
        title: 'Error en la operación',
        text: 'No se encontraron datos registrados',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  async inactivar(fila) {
    this.uid = fila._id;
    if (fila.activo == 'Activo'){
      if (fila.tipo_plan_id != await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PR_SP')){
        this.deleteData();
      } else if (fila.tipo_plan_id == await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PR_SP')){
        let res = {
          activo: false,
        }
        this.putData(res, 'activo')
      }
    } else if (fila.activo == 'Inactivo'){
      Swal.fire({
        title: 'Plan ya inactivo',
        text: `El plan ya se encuentra en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    }
  }

  duplicar(row) {
    let plan_id = row._id;
    Swal.fire({
      title: 'Clonar plan',
      text: `¿Está seguro de clonar el plan?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            title: 'Clonando Plan Estratégico de Desarrollo',
            timerProgressBar: true,
            showConfirmButton: false,
            allowEscapeKey: false,
            allowOutsideClick: false,
            willOpen: () => {
              Swal.showLoading();
            },
          });
          return new Promise(async(resolve, reject)=>{
            this.request.post(environment.PLANES_MID, `formulacion/clonar-pi-ped/${plan_id}`, {}).subscribe((data: any) => {
              if (data.Data && data.Success == true) {
                Swal.fire({
                  title: 'Clonar plan',
                  text: `El plan estratégico de desarrollo se ha clonado correctamente`,
                  icon: 'success',
                  showConfirmButton: false,
                  timer: 2500
                }).then(() => {
                  window.location.reload();
                  resolve(true);
                });
              } else {
                Swal.fire({
                  title: 'Error en la operación',
                  text: `No se ha podido clonar el plan estratégico de desarrollo: ${data.Message}`,
                  icon: 'error',
                  showConfirmButton: false,
                  timer: 2500
                });
                resolve(false);
              }
            }, (error) => {
              Swal.fire({
                title: 'Error en la operación',
                text: 'No se encontraron datos registrados',
                icon: 'error',
                showConfirmButton: false,
                timer: 2500
              })
              reject(false);
            });
          });
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: 'Clonación cancelada',
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          })
        }
    });
  }

  formatearVigencias(row) {
    if(!row.vigencia_aplica) return 'Por definir';
    return JSON.parse(row.vigencia_aplica).map(vigencia => vigencia.Nombre).join(', ');
  }

  cambiarValor(valorABuscar, valorViejo, valorNuevo) {
    this.planes.forEach(function(elemento) {
      elemento[valorABuscar] = elemento[valorABuscar] == valorViejo ? valorNuevo : elemento[valorABuscar]
    })
  }

  async ngOnInit(){
    this.loadData();
  }

}
