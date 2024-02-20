import {
  AfterViewInit,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RequestManager } from '../services/requestManager';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-plan-accion',
  templateUrl: './plan-accion.component.html',
  styleUrls: ['./plan-accion.component.scss'],
})
export class PlanAccionComponent implements OnInit, AfterViewInit {
  columnasMostradas: string[] = [
    'dependencia',
    'vigencia',
    'nombre',
    'version',
    'fase',
    'estado',
    'acciones',
  ];
  informacionTabla: MatTableDataSource<any>;
  inputsFiltros: NodeListOf<HTMLInputElement>;
  planes: any[];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private request: RequestManager) {}

  async ngOnInit() {
    await this.cargarPlanes();
    this.informacionTabla = new MatTableDataSource<any>(this.planes);
    this.informacionTabla.filterPredicate = (plan: any, _) => {
      let filtrosPasados: number = 0;
      let valoresAComparar = [
        plan.dependencia_nombre.toLowerCase(),
        plan.vigencia.toString(),
        plan.nombre.toLowerCase(),
        plan.version == undefined ? 'n/a': plan.version.toString(),
        plan.fase.toLowerCase(),
        plan.estado.toLowerCase(),
      ];
      this.inputsFiltros.forEach((input, posicion) => {
        if (valoresAComparar[posicion].includes(input.value.toLowerCase())) {
          filtrosPasados++;
        }
      });
      return filtrosPasados === valoresAComparar.length;
    };
    this.informacionTabla.paginator = this.paginator;
  }

  ngAfterViewInit(): void {
    this.inputsFiltros = document.querySelectorAll('th.mat-header-cell input');
  }

  aplicarFiltro(event: Event): void {
    let filtro: string = (event.target as HTMLInputElement).value;

    if (filtro === '') {
      this.inputsFiltros.forEach((input) => {
        if (input.value !== '') {
          filtro = input.value;
          return;
        }
      });
    }
    // Se debe poner algún valor que no sea vacio  para que se accione el filtro la tabla
    this.informacionTabla.filter = filtro.trim().toLowerCase();
  }

  async cargarPlanes(): Promise<void> {
    Swal.fire({
      title: 'Cargando planes de acción',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    await new Promise((resolve, reject) => {
      this.request
        .get(environment.PLANES_MID, `planes_accion`)
        .subscribe(
          (data) => {
            this.planes = data.Data;
            if (this.planes.length != 0) {
              Swal.close();
            } else {
              Swal.close();
              Swal.fire({
                title: 'No existen registros',
                icon: 'info',
                text: 'No hay planes en formulación',
                showConfirmButton: false,
                timer: 2500,
              });
            }
            resolve(this.planes);
          },
          (error) => {
            Swal.close();
            this.planes = [];
            console.error(error);
            Swal.fire({
              title: 'Error al intentar obtener los planes de acción',
              icon: 'error',
              text: 'Ingresa más tarde',
              showConfirmButton: false,
              timer: 2500,
            });
            reject();
          }
        );
    });
  }
  consultar(plan){
    console.log(plan.ultima_modificacion)
  }
}
