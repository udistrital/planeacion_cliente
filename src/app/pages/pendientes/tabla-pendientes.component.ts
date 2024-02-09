import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ResumenPlan } from 'src/app/@core/models/plan/resumen_plan';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';
import { UserService } from '../services/userService';

@Component({
  selector: 'app-tabla-pendientes',
  templateUrl: './tabla-pendientes.component.html',
  styleUrls: ['./tabla-pendientes.component.scss'],
})
export class TablaPendientesComponent implements OnInit, AfterViewInit {
  columnasMostradas: string[] = [
    'dependencia',
    'vigencia',
    'nombre',
    'version',
    'estado',
    'acciones',
  ];
  informacionTabla: MatTableDataSource<ResumenPlan>;
  inputsFiltros: NodeListOf<HTMLInputElement>;
  auxUnidades: any[] = [];
  // planAux: any;
  // estadoPlan: string;
  // addActividad: boolean;
  // identContratistas: boolean;
  // identRecursos: boolean;
  // iconEstado: string;
  // versionPlan: string;
  // banderaEstadoDatos: boolean;
  // unidad: any;
  // vigencias: any[];

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private request: RequestManager, private userService: UserService) { }

  ngOnInit(): void {
    // this.loadPeriodos()
    this.validarUnidad()
    const datosPrueba: ResumenPlan[] = [];
    this.informacionTabla = new MatTableDataSource<ResumenPlan>(datosPrueba);
    this.informacionTabla.filterPredicate = (plan: ResumenPlan, _) => {
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

    await new Promise((resolve, reject) => {
      this.request.get(environment.PLANES_MID, `formulacion/planes_formulacion`).subscribe((data: any) => {
        if (data.Data != null) {
          const filterData = data.Data.filter(unid => unid.dependencia_nombre == event.value && unid.estado === "Revisado");

          const latestVersions = filterData.reduce((acc, obj) => {
            // Si ya existe un objeto con el mismo nombre y su versión es menor, lo reemplazamos
            const key = `${obj.nombre}-${obj.vigencia}`;
            if (!acc[key] || obj.version > acc[key].version) {
              acc[key] = obj;
            }
            return acc;
          }, {} as Record<string, ResumenPlan>);

          // Obtenemos los valores del objeto, que representan la data filtrada
          const filteredData: ResumenPlan[] = Object.values(latestVersions);

          this.informacionTabla = new MatTableDataSource(filteredData);
          this.informacionTabla.paginator = this.paginator;
          resolve(true);
        } else if (data.Data == null) {
          Swal.fire({
            title: 'Atención en la operación',
            text: `No hay planes pendientes para verificar`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 3500
          })
          reject(false);
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
    });
    Swal.close();
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
                    // this.unidad = unidad
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

  // consultarPlan(plan) {
  //   if (plan == undefined) {
  //     // this.planSelected = false;
  //   } else {
  //     this.planAux = plan;
  //     // this.planSelected = true;
  //     this.addActividad = false;
  //     this.identRecursos = false;
  //     this.identContratistas = false;
  //     this.estadoPlan = "";
  //     this.iconEstado = "";
  //     this.versionPlan = "";
  //     this.busquedaPlanes(plan);
  //   }
  // }

  // busquedaPlanes(planB) {
  //   //Antes de cargar algún plan, hago la búsqueda del formato si tiene datos y la bandera "banderaEstadoDatos" se vuelve true o false.
  //   // this.cargaFormato(planB);
  //   const vigencia = this.vigencias.filter(vg => vg.Year == planB.vigencia)
  //   //validación con bandera para el estado de los datos de los planes.
  //   if (this.banderaEstadoDatos == true) {
  //     this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:` + this.unidad.Id + `,vigencia:` +
  //       vigencia[0].Id + `,formato:false,nombre:` + planB.nombre).subscribe(
  //         (data: any) => {
  //           Swal.fire({
  //             title: 'Formulación nuevo plan',
  //             html: 'No existe plan <b>' + planB.nombre + '</b> <br>' +
  //               'para la dependencia <b>' + this.unidad.Nombre + '</b> y la <br>' +
  //               'vigencia <b>' + vigencia[0].Nombre + '</b><br></br>' +
  //               '<i>Deberá formular el plan</i>',
  //             // text: `No existe plan ${planB.nombre} para la dependencia ${this.unidad.Nombre} y la vigencia ${this.vigencia.Nombre}.
  //             // Deberá formular un nuevo plan`,
  //             icon: 'warning',
  //             showConfirmButton: false,
  //             timer: 7000
  //           })
  //           // this.clonar = true;
  //           // this.plan = planB;
  //         }, (error) => {
  //           Swal.fire({
  //             title: 'Error en la operación',
  //             text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
  //             icon: 'warning',
  //             showConfirmButton: false,
  //             timer: 2500
  //           })
  //         })
  //   } else {
  //     Swal.fire({
  //       title: 'Error',
  //       text: 'No se recibieron datos.',
  //       icon: 'error',
  //       showConfirmButton: true,
  //       timer: 3500
  //     });
  //   }
  // }

  // cargaFormato(plan) {
  //   Swal.fire({
  //     title: 'Cargando formato',
  //     timerProgressBar: true,
  //     showConfirmButton: false,
  //     willOpen: () => {
  //       Swal.showLoading();
  //     },
  //   })
  //   this.request.get(environment.PLANES_MID, `formato/` + plan._id).subscribe((data: any) => {
  //     //if (data) {
  //     // Bloque if: Se ejecutará si data no es null y data[0] no es null, y data[1][0] es un objeto no vacío.
  //     if (data && data[0] !== null && data[1] && data[1][0] && Object.keys(data[1][0]).length > 0) {
  //       Swal.close();
  //       this.estado = plan.estado_plan_id;
  //       this.steps = data[0]
  //       this.json = data[1][0]
  //       this.form = this.formBuilder.group(this.json);
  //       this.banderaEstadoDatos = true;//bandera validacion de la data
  //     } else {
  //       this.banderaEstadoDatos = false;//bandera validacion de la data
  //     }
  //   }, (error) => {
  //     Swal.fire({
  //       title: 'Error en la operación',
  //       text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
  //       icon: 'warning',
  //       showConfirmButton: false,
  //       timer: 2500
  //     })
  //   })
  // }

  // loadPeriodos() {
  //   this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
  //     if (data) {
  //       this.vigencias = data.Data;
  //     }
  //   }, (error) => {
  //     Swal.fire({
  //       title: 'Error en la operación',
  //       text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
  //       icon: 'warning',
  //       showConfirmButton: false,
  //       timer: 2500
  //     })
  //   })
  // }
}
