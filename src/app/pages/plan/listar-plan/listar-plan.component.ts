import { AfterViewInit, Component, ViewChild, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { EditarDialogComponent } from '../construir-plan/editar-dialog/editar-dialog.component';
import { Subgrupo } from '../construir-plan/construir-plan.component';
import { RequestManager } from '../../services/requestManager';

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  estado: string;
}

@Component({
  selector: 'app-listar-plan',
  templateUrl: './listar-plan.component.html',
  styleUrls: ['./listar-plan.component.scss']
})
export class ListarPlanComponent implements OnInit {

  displayedColumns: string[] = ['nombre', 'descripcion', 'id', 'actions'];
  dataSource: MatTableDataSource<Plan>;
  uid: number; // id del objeto

  planes: Plan[] = [
    {id: 1, nombre: 'Proyecto Universitario Institucional', descripcion: 'Desc', estado: 'Activo'},
    {id: 2, nombre: 'Plan Estrategico de Desarrollo', descripcion: 'Desc', estado: 'Inactivo'},
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    public dialog: MatDialog,
    private request: RequestManager,
  ) {
    this.dataSource = new MatTableDataSource(this.planes);
   }

   ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
      data: {ban: true, sub}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      if (result == undefined){
        return undefined;
      } else {
        this.putData(result);
      }
      //console.log(JSON.stringify(this.sub));
    });
  }

  putData(res){
    console.log('Hace put');
    // PUT
    // RECARGAR
    this.loadData();
  }

  loadData(){
    this.request.get
    console.log('Cargó data LISTA')
  }

  editar(fila): void{
    this.uid = fila.id;
    // GET BY ID
    let sub = {} as Subgrupo;
    sub.id = this.uid;
    sub.nombre = 'nombre consultado';
    sub.descripcion = 'descripcion consultada';
    sub.estado = false; // boolean consultado ¿String?
    this.openDialogEditar(sub);
  }

  inactivar(fila):void{
    this.uid = fila.id;
    // PUT FALSE o INACTIVO
    this.loadData();
  }

  ngOnInit(): void {
  }

}
