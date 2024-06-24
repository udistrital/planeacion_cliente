import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RequestManager } from '../../services/requestManager'
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { ResumenPlan } from 'src/app/@core/models/plan/resumen_plan';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-plan-accion-formulacion',
  templateUrl: './plan-accion-formulacion.component.html',
  styleUrls: ['./plan-accion-formulacion.component.scss'],
})
export class PlanAccionFormulacionComponent implements OnInit, AfterViewInit {
  columnasMostradas: string[] = [
    'dependencia',
    'vigencia',
    'nombre',
    'version',
    'fase',
    'estado',
    'acciones',
  ];
  informacionTabla: MatTableDataSource<ResumenPlan>;
  inputsFiltros: NodeListOf<HTMLInputElement>;
  planes: ResumenPlan[];

  rol: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private router: Router
  ) {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find((x) => x == 'PLANEACION' || x == 'ASISTENTE_PLANEACION')) {
      this.rol = 'PLANEACION';
    } else if (
      roles.__zone_symbol__value.find(
        (x) => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA'
      )
    ) {
      this.rol = 'JEFE_DEPENDENCIA';
    }
  }

  async ngOnInit() {
    await this.cargarPlanes();
    this.informacionTabla = new MatTableDataSource<ResumenPlan>(this.planes);
    this.informacionTabla.filterPredicate = (plan: ResumenPlan, _) => {
      let filtrosPasados: number = 0;
      let valoresAComparar = [
        plan.dependencia_nombre.toLowerCase(),
        plan.vigencia.toString(),
        plan.nombre.toLowerCase(),
        plan.version == undefined ? 'n/a' : plan.version.toString(),
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
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    await new Promise((resolve, reject) => {
      if (this.rol == 'PLANEACION') {
        this.request.get(environment.PLANES_MID, `planes_accion`).subscribe(
          (data) => {
            const allData: ResumenPlan[] = data.Data;
            this.planes = allData.filter(plan => plan.fase === "Formulación");
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
      } else {
        // 'JEFE_DEPENDENCIA'
        //let documento: string = this.autenticationService.getDocument()['__zone_symbol__value'];
        let documento: string =
          this.autenticationService.getPayload()['documento'];
        let idTercero: number;
        let idDependencia: string;
        this.request
          .get(
            environment.TERCEROS_SERVICE,
            'datos_identificacion/?query=Numero:' + documento
          )
          .subscribe(
            (data) => {
              if (data.length == 0) {
                Swal.close();
                Swal.fire({
                  title:
                    'Han habido problemas trayendo información del usuario',
                  icon: 'info',
                  text: 'Intente más tarde',
                  showConfirmButton: false,
                  timer: 2500,
                });
              } else {
                idTercero = data[0]['TerceroId']['Id'];
                this.request
                  .get(
                    environment.PLANES_MID,
                    'formulacion/vinculacion_tercero/' + idTercero
                  )
                  .subscribe(
                    (data) => {
                      if (data.Data == null) {
                        Swal.close();
                        Swal.fire({
                          title:
                            'Han habido problemas trayendo información del usuario',
                          icon: 'info',
                          text: 'Intente más tarde',
                          showConfirmButton: false,
                          timer: 2500,
                        });
                      } else {
                        const vinculaciones = data.Data;
                        let allData = [];
                        this.planes = [];
                        for (let i = 0; i < vinculaciones.length; i++) {
                          idDependencia = vinculaciones[i].DependenciaId;
                          this.request.get(environment.PLANES_MID, `planes_accion/${idDependencia}`).subscribe(async (data) => {
                            if (data && data.Success) {
                              allData.push(data.Data);
                              let resultado = [];
                              setTimeout(() => {
                                console.log("DATA: ", allData);
                                resultado = allData[i].filter(plan => plan.fase === "Formulación");
                                this.planes = [...this.planes, ...resultado];
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
                                if ((data.Success) && (i == (vinculaciones.length - 1))) {
                                  resolve(this.planes);
                                }
                              }, 10);
                            } else {
                              Swal.close();
                              this.planes = [];
                              Swal.fire({
                                title:
                                  'Error al intentar obtener los planes de acción',
                                icon: 'error',
                                text: 'Ingresa más tarde',
                                showConfirmButton: false,
                                timer: 2500,
                              });
                              reject();
                            }
                          }, (error) => {
                            Swal.close();
                            this.planes = [];
                            console.error(error);
                            Swal.fire({
                              title:
                                'Error al intentar obtener los planes de acción',
                              icon: 'error',
                              text: 'Ingresa más tarde',
                              showConfirmButton: false,
                              timer: 2500,
                            });
                            reject();
                          }
                          );
                        }
                      }
                    },
                    (error) => {
                      Swal.close();
                      this.planes = [];
                      console.error(error);
                      Swal.fire({
                        title:
                          'Error al intentar traer información del usuario',
                        icon: 'error',
                        text: 'Ingresa más tarde',
                        showConfirmButton: false,
                        timer: 2500,
                      });
                      reject();
                    }
                  );
              }
            },
            (error) => {
              Swal.close();
              this.planes = [];
              console.error(error);
              Swal.fire({
                title: 'Error al intentar traer información del usuario',
                icon: 'error',
                text: 'Ingresa más tarde',
                showConfirmButton: false,
                timer: 2500,
              });
              reject();
            }
          );
      }
    });
  }
  consultar(plan: ResumenPlan) {
    if (plan.fase.includes('Formulación')) {
      this.router.navigate([
        'pages/formulacion/' + plan.dependencia_id
        + "/" + plan.nombre
        + "/" + plan.vigencia_id
        + "/" + plan.version
      ]);
    } else if (plan.fase == 'Seguimiento') {
      this.router.navigate([
        'pages/seguimiento/listar-plan-accion-anual/' + plan.vigencia_id
        + "/" + plan.nombre
        + "/" + plan.dependencia_id
      ]);
    }
  }
}
