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
import { DataRequest } from 'src/app/@core/models/interfaces/DataRequest.interface';
import { PeriodoSeguimiento } from '../habilitar-reporte/utils/habilitar-reporte.models';
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
  displayedColumns: string[];
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
  planesMostrar: Planes[];
  textBotonMostrarData: string = 'Mostrar Planes Interés Habilitados/Reporte';
  
  @Input() periodoSeguimiento: PeriodoSeguimiento;
  @Input() filtroPlan: boolean;
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
    this.filtroPlan = false;
    this.banderaPlanesAccionFuncionamiento = false;
  }

  ngOnInit(): void {
    this.planesMostrar = [];
    if(this.banderaPlanesAccionFuncionamiento === true){
      if(this.filtroPlan === true){
        this.displayedColumns = ['nombre', 'descripcion', 'tipo_plan', 'activo', 'actions'];
      } else {
        this.displayedColumns = ['nombre', 'descripcion', 'tipo_plan', 'activo', 'usuario', 'fecha_modificacion', 'fecha_inicial', 'fecha_final', 'actions']
      }
    } else {
      this.displayedColumns = ['nombre', 'descripcion', 'tipo_plan', 'activo', 'actions'];
    }
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
          this.ajustarData();
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
    this.dataSource = new MatTableDataSource(this.planesMostrar);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cargando = false;
    Swal.close();
  }

  ajustarData() {
    this.cambiarValor("activo", true, "Activo");
    if(this.banderaPlanesAccionFuncionamiento){
      this.planes = this.planes.filter((plan: Planes) => plan.activo == "Activo");
      this.cambiarValor("iconSelected", undefined, "compare_arrows");
    } else {
      this.cambiarValor("activo", false, "Inactivo");
    }
    this.planesMostrar = this.planes;
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
    this.emitirCambiosPlanesInteres();
  }

  seleccionarTodos() {
    this.banderaTodosSeleccionados = true;
    this.planesInteres = this.planesMostrar.map((element) => ({
      _id: element._id,
      nombre: element.nombre,
    }));
    // Itera sobre los elementos y cambia el icono
    this.planes.forEach((element) => {
      element.iconSelected = 'done';
    });
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
    this.emitirCambiosPlanesInteres();
  }

  emitirCambiosPlanesInteres() {
    this.planesInteresSeleccionados.emit(this.planesInteres);
  }

  cambiarDataTabla(){
    if(this.textBotonMostrarData === 'Mostrar Planes Interés Habilitados/Reporte'){
      Swal.fire({
        title: 'Cargando datos...',
        allowEscapeKey: false,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
      this.request.post(environment.PLANES_CRUD, 'periodo-seguimiento/buscar-unidad-planes/5', this.periodoSeguimiento).subscribe(
        async (data: DataRequest) => {
          if (data) {
            if(data.Data !== null) {
              var periodoSeguimiento = data.Data;
              this.textBotonMostrarData = 'Mostrar todos los planes';
              let planesMostrar = [];
              for (const element of periodoSeguimiento) {
                element.planes_interes = JSON.parse(element.planes_interes);
                let planesFiltrados = this.planes.filter(plan => element.planes_interes.some(planInteres => planInteres._id === plan._id));
                
                for (const planFiltrado of planesFiltrados) {
                  planFiltrado.fecha_modificacion = this.formatearFecha(element.fecha_modificacion);
                  planFiltrado.fecha_inicial = this.formatearFecha(element.fecha_inicio);
                  planFiltrado.fecha_final = this.formatearFecha(element.fecha_fin);
            
                  if (element.usuario_modificacion) {
                    planFiltrado.usuario_modificacion = await this.validarNombreUsuario(element.usuario_modificacion);
                  }
                }
                
                planesMostrar = planesMostrar.concat(planesFiltrados);
              }
  
              planesMostrar = [...new Set(planesMostrar)];
              console.log("Planes Mostrar: ", planesMostrar);
              this.planesMostrar = planesMostrar;
              this.dataSource = new MatTableDataSource(this.planesMostrar);
              this.dataSource.paginator = this.paginator;
              this.dataSource.sort = this.sort;
              Swal.close();
            } else {
              Swal.fire({
                title: 'Error en la operación',
                text: 'Las unidades escogidas no cuentan con planes/proyectos con fechas parametrizadas',
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              })
            }
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
    } else {
      this.textBotonMostrarData = 'Mostrar Planes Interés Habilitados/Reporte';
      this.dataSource = new MatTableDataSource(this.planes);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    }
  }

  formatearFecha(fechaOriginal: string): string {
    const fechaObjeto = new Date(fechaOriginal);

    const dia = fechaObjeto.getUTCDate().toString().padStart(2, '0');
    const mes = (fechaObjeto.getUTCMonth() + 1).toString().padStart(2, '0');
    const anio = fechaObjeto.getUTCFullYear();

    return `${dia}/${mes}/${anio}`;
}


  async validarNombreUsuario(documento_usuario: string) {
    let nombreCompleto = undefined;
    await new Promise((resolve,reject)=>{
      this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion/?query=Numero:` + documento_usuario)
        .subscribe((datosInfoTercero: any) => {
          if(datosInfoTercero[0].TerceroId) {
            console.log("Datos Tercero: ", datosInfoTercero[0]);
            nombreCompleto = datosInfoTercero[0].TerceroId.NombreCompleto;
            resolve(datosInfoTercero[0].TerceroId.NombreCompleto);
          }
          resolve(undefined);
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
        reject(error)
      })
    })
    return nombreCompleto;
  }
}
