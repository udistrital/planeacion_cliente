import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { EditarDialogComponent } from '../construir-plan/editar-dialog/editar-dialog.component';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import {CrearPlanComponent} from '../crear-plan/crear-plan.component'
import { CodigosService } from 'src/app/@core/services/codigos.service';

@Component({
  selector: 'app-construir-plan-proyecto',
  templateUrl: './construir-plan-proyecto.component.html',
  styleUrls: ['./construir-plan-proyecto.component.scss']
})
export class ConstruirPlanProyectoComponent implements OnInit {

  displayedColumns: string[] = ['nombre', 'descripcion', 'tipo_plan', 'activo', 'actions'];
  dataSource: MatTableDataSource<any>;
  uid: number; // id del objeto
  planes: any[];
  // tipoPlan: any[];
  // nombreTipoPlan:any;
  plan: any;
  cargando = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    private request: RequestManager,
    private router: Router,
    private codigosService: CodigosService
  ) {
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
            text: `No se ha podido actualizar el plan: ${data.Message}`,
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          });
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
          this.request.delete(environment.PLANES_MID, `arbol/desactivar_plan/`, this.uid).subscribe((data: any) => {
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

  construirPlan(plan_id, nombrePlan, tipo_plan_id) {
    this.router.navigate(['pages/plan/construir-plan/' + plan_id+ '/' + nombrePlan + '/' + tipo_plan_id]);
  }

  loadData(){
    this.mostrarMensajeCarga();

    this.request.get(environment.PLANES_MID, `formulacion/planes`).subscribe(
      (data: any) => {
        if (data){
          this.planes = data.Data;
          this.ajustarData();
          this.cerrarMensajeCarga();
        }
      },(error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    )
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
    this.cargando = false;
    Swal.close();
  }

  ajustarData(){
    this.cambiarValor("activo", true, "Activo")
    this.cambiarValor("activo", false, "Inactivo")
    this.dataSource = new MatTableDataSource(this.planes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  editar(fila): void{
    this.mostrarMensajeCarga();
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

  async inactivar(fila) {
    this.uid = fila._id;
    if (fila.activo == 'Activo'){
      if (fila.tipo_plan_id != await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PR_SP')){
        this.deleteData();
      } else {
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

  cambiarValor(valorABuscar, valorViejo, valorNuevo) {
    this.planes.forEach(function(elemento) {
      elemento[valorABuscar] = elemento[valorABuscar] == valorViejo ? valorNuevo : elemento[valorABuscar]
    })
  }

  definir(): void {
    const dialogRef = this.dialog.open(CrearPlanComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      // data: {ban: 'plan', sub, subDetalle}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined){
        return undefined;
      } else {
        this.putData(result, 'editar');
      }
    });
  }

  async ngOnInit(){
    this.loadData();
  }

}
