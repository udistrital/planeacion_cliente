import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { UserService } from '../../services/userService';
import { VerificarFormulario } from '../../services/verificarFormulario'
import { Router } from '@angular/router';
import { CodigosService } from 'src/app/@core/services/codigos.service';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';

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
    'seleccionar'
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
  planesInteres: any;
  banderaTodosSeleccionados: boolean;
  datosCargados: boolean;
  rol: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private request: RequestManager,
    private userService: UserService,
    private verificarFormulario: VerificarFormulario,
    private router: Router,
    private codigosService: CodigosService,
    private autenticationService: ImplicitAutenticationService
  ) {
    this.planesInteres = [];
    this.banderaTodosSeleccionados = false;
    this.datosCargados = false;
    let roles: any = this.autenticationService.getRole();
    if (
      roles.__zone_symbol__value.find(
        (x: string) => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA'
      )
    ) {
      this.rol = 'JEFE_DEPENDENCIA';
    } else if (
      roles.__zone_symbol__value.find((x: string) => x == 'PLANEACION')
    ) {
      this.rol = 'PLANEACION';
    } else if (
      roles.__zone_symbol__value.find(
        (x: string) => x == 'JEFE_UNIDAD_PLANEACION'
      )
    ) {
      this.rol = 'JEFE_UNIDAD_PLANEACION';
    }
  }

  async ngOnInit() {
    if (
      this.rol == 'JEFE_DEPENDENCIA' ||
      this.rol == 'ASISTENTE_DEPENDENCIA' ||
      this.rol == 'JEFE_UNIDAD_PLANEACION'
    ) {
      this.validarUnidad();
    } else {
      await this.loadUnidades();
    }
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
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })

    this.auxUnidades.map((und: any) => {
      if (und.Nombre === event.value) {
        this.unidad = und;
      }
    });

    if (event.value) {
      try {
        await this.loadPeriodos()
        await this.loadPlanes()
        await this.obtenerEstado()

        //Lógica filtro
        const filteredData = []
        this.trimestreEstado.map((plan) => {
          const auxFilter = plan.filter(pl => pl["estado_seguimiento_id"]["codigo_abreviacion"] === "RJU")
          if (auxFilter.length != 0) {
            for (let i = 0; i < auxFilter.length; i++) {
              auxFilter[i]["plan_id"]["dependencia_nombre"] = event.value
              auxFilter[i]["plan_id"]["vigencia_nombre"] = this.vigencias.filter(vig => vig["Id"] == auxFilter[i]["plan_id"]["vigencia"])[0]["Nombre"]
              filteredData.push(auxFilter[i]);
            }
          }
        })

        const estadoSeleccion = filteredData.map(pl => ({
          ...pl,
          seleccionado: false
        }));

        this.informacionTabla = new MatTableDataSource(estadoSeleccion);
        this.informacionTabla.paginator = this.paginator;
        this.datosCargados = true;
        Swal.close();
        if (this.informacionTabla.filteredData.length === 0) {
          this.datosCargados = false;
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
    } else {
      this.informacionTabla = new MatTableDataSource([]);
      this.informacionTabla.paginator = this.paginator;
      this.datosCargados = false;
      Swal.close();
    }
  }

  validarUnidad() {
    this.userService.user$.subscribe((data) => {
      this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion/?query=Numero:` + data['userService']['documento'])
        .subscribe((datosInfoTercero: any) => {
          this.request.get(environment.PLANES_MID, `formulacion/vinculacion_tercero/` + datosInfoTercero[0].TerceroId.Id)
            .subscribe((vinculaciones: any) => {
              if (vinculaciones["Data"] != "") {
                const vinculacion = vinculaciones.Data;

                for (let i = 0; i < vinculaciones.Data.length; i++) {
                  this.request.get(environment.OIKOS_SERVICE, `dependencia_tipo_dependencia?query=DependenciaId:` + vinculacion[i].DependenciaId).subscribe((dataUnidad: any) => {
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
                }
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
    return new Promise(async (resolve, reject) => {
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })

      this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,estado_plan_id:${await this.codigosService.getId('PLANES_CRUD', 'estado-plan', 'A_SP')},dependencia_id:${this.unidad.Id}`).subscribe(async (data: any) => {
        if (data) {
          if (data.Data.length != 0) {
            data.Data.sort(function (a, b) { return b.vigencia - a.vigencia; });
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
          data.Data.sort((a, b) => a.Nombre - b.Nombre);
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

  async loadUnidades() {
    Swal.fire({
      title: 'Cargando unidades',
      timerProgressBar: true,
      showConfirmButton: false,
      allowEscapeKey: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    await new Promise((resolve, reject) => {
      this.request
        .get(environment.PLANES_MID, `formulacion/get_unidades`)
        .subscribe({
          next: (data: any) => {
            if (data) {
              this.auxUnidades = data.Data;
              Swal.close();
              resolve(this.auxUnidades);
            }
          },
          error: (error) => {
            Swal.fire({
              title: 'Error en la operación',
              text: `No se encontraron datos registrados ${JSON.stringify(
                error
              )}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500,
            });
            reject(error);
          },
        });
    });
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

  seleccionarPlan(plan) {
    if (!plan.seleccionado) {
      plan.seleccionado = true;
      this.planesInteres = [...this.planesInteres, plan];
    } else if (plan.seleccionado) {
      if (this.banderaTodosSeleccionados) {
        this.borrarSeleccion()
      } else {
        plan.seleccionado = false;
        let unidadEliminar = plan.id;
        const index = this.planesInteres.findIndex(
          (x: { id: any }) => x.id == unidadEliminar
        );
        this.planesInteres.splice(index, 1);

        this.banderaTodosSeleccionados = false;
      }
    }
  }

  seleccionarTodos() {
    Swal.fire({
      title: 'Seleccionar Todos los planes/proyectos',
      text: `¿Desea seleccionar todos los planes/proyectos?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        this.banderaTodosSeleccionados = true;
        this.planesInteres = this.informacionTabla.data

        // Itera sobre los elementos y cambia el icono
        for (const plan of this.informacionTabla.data) {
          plan.seleccionado = true;
        }
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Selección de todos los planes/proyectos cancelada',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }),
      (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
  }

  borrarSeleccion() {
    this.banderaTodosSeleccionados = false;
    // Itera sobre los elementos y cambia el icono a 'compare_arrows'
    for (const plan of this.informacionTabla.data) {
      plan.seleccionado = false;
    }

    // Limpia el array de unidades de interés
    this.planesInteres = [];
  }

  verificarSeleccion() {
    Swal.fire({
      title: 'Verificar revisión',
      text: `¿Confirma que desea verificar la revisión del seguimiento de los planes/proyectos seleccionados?`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let planesNoVerificables: any[] = [];

        const promises = this.planesInteres.map((plan) => {
          return new Promise((innerResolve, innerReject) => {
            this.request.put(environment.PLANES_MID, `seguimiento/verificar_seguimiento`, "{}", plan._id).subscribe((data: any) => {
              if (data) {
                if (data.Success) {
                  Swal.fire({
                    title: 'El reporte se ha enviado satisfactoriamente',
                    icon: 'success',
                  })
                } else {
                  planesNoVerificables.push(
                    {
                      nombre: plan["plan_id"]["nombre"],
                      periodo: plan["periodo_seguimiento_id"]["periodo_nombre"]
                    }
                  )
                }
              }
              innerResolve("Verificado");
            }, (error) => {
              Swal.fire({
                title: 'Error en la operación',
                icon: 'error',
                text: `El plan ${plan["plan_id"]["nombre"]} está generando error en su aprobación, intente más tarde o comuniquese con la OATI`,
                showConfirmButton: false,
                timer: 2500
              })
              innerReject(error);
            });
          })
        })

        Promise.all(promises)
          .then(() => {
            const actualUrl = this.router.url;
            if (planesNoVerificables.length != 0) {
              let message: string = '<b>Planes/Proyectos</b><br/>';
              for (let i = 0; i < planesNoVerificables.length; i++) {
                message = message + (i + 1).toString() + '. ' + planesNoVerificables[i].nombre + ' - ' + planesNoVerificables[i].periodo + "<br/>"
              }
              Swal.fire({
                title: 'Los siguientes planes/proyectos no son verificables (revisar sus respectivas actividades):',
                icon: 'warning',
                showConfirmButton: true,
                allowOutsideClick: false,
                html: message
              }).then((result) => {
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate([actualUrl]);
                });
              })
            } else {
              Swal.fire({
                title: 'Todos los planes/proyectos fueron verificados satisfactoriamente',
                icon: 'success',
                showConfirmButton: true,
                allowOutsideClick: false,
              }).then((result) => {
                this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
                  this.router.navigate([actualUrl]);
                });
              })
            }
          })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Verificación de revisión cancelada',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }),
      (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
  }
}
