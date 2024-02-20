import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { UserService } from '../../services/userService';
import { VerificarFormulario } from '../../services/verificarFormulario'
import { Router } from '@angular/router';

@Component({
  selector: 'app-tabla-pendientes-seguimiento',
  templateUrl: './tabla-pendientes-seguimiento.component.html',
  styleUrls: ['./tabla-pendientes-seguimiento.component.scss'],
})
export class TablaPendientesSeguimientoComponent implements OnInit, AfterViewInit {
  columnasMostradas: string[] = [
    'dependencia',
    'vigencia',
    'nombre',
    'trimestre',
    'estado',
    'acciones',
  ];
  informacionTabla: MatTableDataSource<any>;
  inputsFiltros: NodeListOf<HTMLInputElement>;
  auxUnidades: any[] = [];
  unidad: any;
  vigencias: any[];
  planes: any[];
  periodos: any[];
  nombresPeriodos: any[];
  trimestreEstado: any[];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private request: RequestManager,
    private userService: UserService,
    private verificarFormulario: VerificarFormulario,
    private router: Router,
  ) { }

  ngOnInit(): void {
    this.validarUnidad()
    const datosPrueba: any[] = [];
    this.informacionTabla = new MatTableDataSource<any>(datosPrueba);
    this.informacionTabla.filterPredicate = (plan: any, _) => {
      let filtrosPasados: number = 0;
      let valoresAComparar = [
        plan.dependencia_nombre.toLowerCase(),
        plan.vigencia.toString(),
        plan.nombre.toLowerCase(),
        plan.version.toString(),
        plan.estado.toLowerCase(),
      ];
      this.inputsFiltros.forEach((input, posicion) => {
        if (valoresAComparar[posicion].includes(input.value.toLowerCase())) {
          filtrosPasados++;
        }
      });
      return filtrosPasados === valoresAComparar.length;
    };
  }

  ngAfterViewInit(): void {
    this.inputsFiltros = document.querySelectorAll('th.mat-header-cell input');
    this.informacionTabla.paginator = this.paginator;
  }

  aplicarFiltro(event: any): void {
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

  async ajustarData(event: any) {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })

    try {
      await this.loadPeriodos()
      await this.loadPlanes()
      await this.obtenerEstado()

      //Lógica filtro
      const filteredData = []
      this.trimestreEstado.map((plan) => {
        const auxFilter = plan.filter(pl => pl["estado_seguimiento_id"]["codigo_abreviacion"] === "ER")
        if (auxFilter.length != 0) {
          for (let i = 0; i < auxFilter.length; i++) {
            auxFilter[i]["plan_id"]["dependencia_nombre"] = event.value
            auxFilter[i]["plan_id"]["vigencia_nombre"] = this.vigencias.filter(vig => vig["Id"] == auxFilter[i]["plan_id"]["vigencia"])[0]["Nombre"]
            filteredData.push(auxFilter[i]);
          }
        }
      })

      this.informacionTabla = new MatTableDataSource(filteredData);
      this.informacionTabla.paginator = this.paginator;
      Swal.close();
      if (this.informacionTabla.filteredData.length === 0) {
        Swal.fire({
          title: 'Atención en la operación',
          text: `No hay planes pendientes para verificar`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 3500
        });
      }
    } catch (error) {
      console.error('Error al ajustar datos:', error);
      Swal.close();
    }
  }

  validarUnidad() {
    this.userService.user$.subscribe((data) => {
      this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion/?query=Numero:` + data['userService']['documento'])
        .subscribe((datosInfoTercero: any) => {
          this.request.get(environment.PLANES_MID, `formulacion/vinculacion_tercero/` + datosInfoTercero[0].TerceroId.Id)
            .subscribe((vinculacion: any) => {
              if (vinculacion["Data"] != "") {
                this.request.get(environment.OIKOS_SERVICE, `dependencia_tipo_dependencia?query=DependenciaId:` + vinculacion["Data"]["DependenciaId"]).subscribe((dataUnidad: any) => {
                  if (dataUnidad) {
                    let unidad = dataUnidad[0]["DependenciaId"]
                    unidad["TipoDependencia"] = dataUnidad[0]["TipoDependenciaId"]["Id"]
                    for (let i = 0; i < dataUnidad.length; i++) {
                      if (dataUnidad[i]["TipoDependenciaId"]["Id"] === 2) {
                        unidad["TipoDependencia"] = dataUnidad[i]["TipoDependenciaId"]["Id"]
                      }
                    }
                    this.auxUnidades.push(unidad);
                    this.unidad = unidad
                  }
                })
              } else {
                Swal.fire({
                  title: 'Error en la operación',
                  text: `No cuenta con los permisos requeridos para acceder a este módulo`,
                  icon: 'warning',
                  showConfirmButton: false,
                  timer: 4000
                })
              }
            })
        })

    })
  }

  consultarPlan(plan) {
    const auxId = plan["plan_id"]["_id"]
    const auxTrimestres = plan["periodo_seguimiento_id"]["periodo_nombre"]
    this.verificarFormulario.setEstadoLista(true);
    this.router.navigate([`pages/seguimiento/gestion-seguimiento/` + auxId + `/` + auxTrimestres]);
  }

  loadPlanes(): Promise<void> {
    return new Promise((resolve, reject) => {
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })

      this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,estado_plan_id:6153355601c7a2365b2fb2a1,dependencia_id:${this.unidad.Id}`).subscribe(async (data: any) => {
        if (data) {
          if (data.Data.length != 0) {
            data.Data.sort(function(a, b) { return b.vigencia - a.vigencia; });
            this.planes = data.Data;
            resolve()
          } else {
            Swal.fire({
              title: 'No se encontraron planes',
              icon: 'error',
              text: `No se encontraron planes para realizar el seguimiento`,
              showConfirmButton: false,
              timer: 3500
            })
            reject("No se encontraron planes");
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
        reject(error);
      })
    })
  }

  loadPeriodos(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
        if (data) {
          this.vigencias = data.Data;
        }
        resolve()
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

  }

  obtenerEstado(): Promise<void> {
    return new Promise((resolve, reject) => {
      const auxPlanesTrimestre: any[] = [];

      const promises = this.planes.map((plan) => {
        return new Promise((innerResolve, innerReject) => {
          this.request.get(environment.PLANES_MID, `seguimiento/estado_trimestres/` + plan._id).subscribe(
            (data: any) => {
              if (data) {
                if (data.Data != '' && data.Data != null) {
                  auxPlanesTrimestre.push(data.Data);
                }
              }
              innerResolve(auxPlanesTrimestre);
            },
            (error) => {
              Swal.fire({
                title: 'Error en la operación',
                text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              });
              innerReject(error);
            }
          );
        });
      });

      Promise.all(promises)
        .then(() => {
          this.trimestreEstado = auxPlanesTrimestre;
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    })
  }
}
