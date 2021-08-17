import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { EditarDialogComponent } from '../construir-plan/editar-dialog/editar-dialog.component';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment'
import Swal from 'sweetalert2';

@Component({
  selector: 'app-listar-plan',
  templateUrl: './listar-plan.component.html',
  styleUrls: ['./listar-plan.component.scss']
})
export class ListarPlanComponent implements OnInit {

  displayedColumns: string[] = ['nombre', 'descripcion', 'activo', 'actions'];
  dataSource: MatTableDataSource<any>;
  uid: number; // id del objeto

  planes: any[];
  plan: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    private request: RequestManager,
  ) {
   }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  openDialogEditar(sub): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: {ban: 'plan', sub}
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
      this.request.put(environment.CRUD_PRUEBAS, `plan`, res, this.uid).subscribe((data: any) => {
        if(data){
          Swal.fire({
            title: 'Actualización correcta',
            text: `Se actualizaron correctamente los datos`,
            icon: 'success',
          }).then((result) => {
            if (result.value) {
              window.location.reload();
            }
          })
        } else {}
      }),
      (error) => {
        console.log(error)
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
            this.request.put(environment.CRUD_PRUEBAS, `plan`, res, this.uid).subscribe((data: any) => {
              if (data){
                Swal.fire({
                  title: 'Cambio realizado', 
                  icon: 'success',
                }).then((result) => {
                  if (result.value) {
                    window.location.reload();
                  }
                })
              } else {}
            }),
            (error) => {
              console.log(error)
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

  loadData(){
    //this.cambiarValor("activo", true, "Activo")
    //this.cambiarValor("activo", false, "Inactivo")
    this.dataSource = new MatTableDataSource(this.planes);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  editar(fila): void{
    this.uid = fila._id;
    this.request.get(environment.CRUD_PRUEBAS, `plan/`+this.uid).subscribe((data: any) => {
      if(data){
        this.plan = data.Data;
        this.openDialogEditar(this.plan);  
      }
    }),
    (error) => {
      console.log(error)
    } 
  }

  inactivar(fila):void{
    this.uid = fila._id;
    if (fila.activo == true){
      let res = {
        activo: false,
      }
      this.putData(res, 'activo')
    } else if (fila.activo == false){
      Swal.fire({
        title: 'Plan ya inactivo',
        text: `El plan ya se encuentra en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    }
  }

  ngOnInit(): void {
    this.request.get(environment.CRUD_PRUEBAS, `plan`).subscribe((data: any) => {
      if (data){
        this.planes = data.Data;
        this.loadData();
      }
    },(error) => {
      console.log(error);
    })
  }

  // cambiarValor(valorABuscar, valorViejo, valorNuevo) {
  //   this.planes.forEach(function (elemento) {
  //     elemento[valorABuscar] = elemento[valorABuscar] == valorViejo ? valorNuevo : elemento[valorABuscar]
  //   })
  // }

}
