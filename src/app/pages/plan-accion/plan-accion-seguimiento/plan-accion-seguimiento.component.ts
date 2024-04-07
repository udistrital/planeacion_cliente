import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { RequestManager } from '../../services/requestManager';
import Swal from 'sweetalert2';
import { environment } from 'src/environments/environment';
import { ResumenPlan } from 'src/app/@core/models/plan/resumen_plan';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { Router } from '@angular/router';
import { TrimestreDialogComponent } from '../trimestre-dialog/trimestre-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import * as XLSX from 'sheetjs-style';

const jsonData = [
  {
    make: 'Plan de acción 2023 Prod',
    model: 'FACULTAD DE INGENIERIA',
    year: 2023,
    specifications: {
      specifications1: {
        mileage: 56.21,
        trim: 'En revisión OAPC',
      },
      specifications2: {
        mileage: 56.21,
        trim: 'En revisión OAPC',
      },
      specifications3: {
        mileage: 56.21,
        trim: 'En revisión OAPC',
      },
      specifications4: {
        mileage: 56.21,
        trim: 'En revisión OAPC',
      },
    },
  },
  {
    make: 'Plan de acción 2023 Prod',
    model: 'FACULTAD DE INGENIERIA',
    year: 2023,
    specifications: {
      specifications1: {
        mileage: 56.21,
        trim: 'En revisión OAPC',
      },
      specifications2: {
        mileage: 56.21,
        trim: 'En revisión OAPC',
      },
      specifications3: {
        mileage: 56.21,
        trim: 'En revisión OAPC',
      },
      specifications4: {
        mileage: 56.21,
        trim: 'En revisión OAPC',
      },
    },
  },
];

@Component({
  selector: 'app-plan-accion-seguimiento',
  templateUrl: './plan-accion-seguimiento.component.html',
  styleUrls: ['./plan-accion-seguimiento.component.scss'],
})
export class PlanAccionSeguimientoComponent implements OnInit, AfterViewInit {
  columnasMostradas: string[] = [
    'dependencia',
    'vigencia',
    'nombre',
    'fase',
    'estado',
    'acciones',
  ];
  informacionTabla: MatTableDataSource<ResumenPlan>;
  inputsFiltros: NodeListOf<HTMLInputElement>;
  planes: any[];
  auxUnidades: any[] = [];
  estadoDescarga: boolean = false;

  rol: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    public dialog: MatDialog,
    private router: Router
  ) {

  }

  async ngOnInit() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find((x) => x == 'PLANEACION')) {
      this.rol = 'PLANEACION';
      await this.loadUnidades()
    } else {
      if (roles.__zone_symbol__value.find((x) => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
        this.rol = 'JEFE_DEPENDENCIA';
      } else if (roles.__zone_symbol__value.find((x) => x == 'JEFE_UNIDAD_PLANEACION')) {
        this.rol = 'JEFE_UNIDAD_PLANEACION';
      }
      await this.cargarPlanes("");
      this.informacionTabla = new MatTableDataSource<ResumenPlan>(this.planes);
      this.informacionTabla.filterPredicate = (plan: ResumenPlan, _) => {
        let filtrosPasados: number = 0;
        let valoresAComparar = [
          plan.dependencia_nombre.toLowerCase(),
          plan.vigencia.toString(),
          plan.nombre.toLowerCase(),
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

  async cargarPlanes(unidad: string): Promise<void> {
    Swal.fire({
      title: 'Cargando planes de acción',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.estadoDescarga = true;
    await new Promise((resolve, reject) => {
      if (this.rol == 'PLANEACION') {
        this.request.get(environment.PLANES_MID, `planes_accion`).subscribe(
          (data) => {
            const allData: any[] = data.Data;
            this.planes = allData.filter(plan => plan.fase === "Seguimiento" && plan.dependencia_nombre === unidad);
            if (this.planes.length != 0) {
              Swal.close();
            } else {
              this.estadoDescarga = false;
              Swal.close();
              Swal.fire({
                title: 'No existen registros',
                icon: 'info',
                text: 'No existen proyectos con registros en fase de seguimiento asociados a la unidad seleccionada',
                showConfirmButton: true,
              });
            }
            resolve(this.planes);
          },
          (error) => {
            Swal.close();
            this.estadoDescarga = false;
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
                this.estadoDescarga = false;
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
                        this.estadoDescarga = false;
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
                        idDependencia = data.Data['DependenciaId'];
                        this.request
                          .get(
                            environment.PLANES_MID,
                            `planes_accion/${idDependencia}`
                          )
                          .subscribe(
                            (data) => {
                              const allData = data.Data;
                              this.planes = allData.filter(plan => plan.fase === "Seguimiento");
                              if (this.planes.length != 0) {
                                Swal.close();
                              } else {
                                this.estadoDescarga = false;
                                Swal.close();
                                Swal.fire({
                                  title: 'No existen registros',
                                  icon: 'info',
                                  text: 'No existen proyectos con registros en fase de seguimiento asociados a la unidad seleccionada',
                                  showConfirmButton: true,
                                });
                              }
                              resolve(this.planes);
                            },
                            (error) => {
                              Swal.close();
                              this.estadoDescarga = false;
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
                    },
                    (error) => {
                      Swal.close();
                      this.estadoDescarga = false;
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
              this.estadoDescarga = false;
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
  async consultar(plan: any) {
    Swal.fire({
      title: 'Cargando Trimestres',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    await new Promise((resolve, reject) => {
      this.request
        .get(environment.PLANES_MID, `seguimiento/get_periodos/` + plan.vigencia_id)
        .subscribe(
          (data: any) => {
            if (data) {
              const trimestres = []
              data.Data.forEach(element => {
                const trimestre = {
                  codigo: element["ParametroId"].CodigoAbreviacion,
                  nombre: element["ParametroId"].Nombre
                }
                trimestres.push(trimestre);
              });
              const promises = trimestres.map(tr => {
                return new Promise((innerResolve, innerReject) => {
                  this.request.get(environment.PLANES_MID, `seguimiento/get_estado_trimestre/` + plan.id + "/" + tr.codigo).subscribe(
                    (datos: any) => {
                      if (datos) {
                        tr.estado = datos.Data["estado_seguimiento_id"].nombre;
                      }
                      innerResolve("Success")
                    }, (error) => {
                      Swal.close();
                      Swal.fire({
                        title: 'Error en la operación',
                        text: `No se encontraron datos registrados ${JSON.stringify(
                          error
                        )}`,
                        icon: 'warning',
                        showConfirmButton: false,
                        timer: 2500,
                      });
                      innerReject(error);
                    }
                  )
                });
              });
              Promise.all(promises).then(() => {
                console.log(trimestres);
                this.request.get(environment.PLANES_MID, `evaluacion/unidades/` + plan.nombre + "/" + plan.vigencia_id).subscribe(
                  (datosEval: any) => {
                    if (datosEval) {
                      if (datosEval.Data.length !== 0) {
                        this.request.get(environment.PLANES_MID, `evaluacion/planes_periodo/` + plan.vigencia_id + "/" + plan.dependencia_id).subscribe(
                          (datosP: any) => {
                            if (datosP.Data.length !== 0) {
                              const planEspecifico = datosP.Data.find(objeto => objeto.plan === plan.nombre);
                              const idUltimoTrimestre = planEspecifico["periodos"][planEspecifico["periodos"].length - 1].id;
                              this.request.get(environment.PLANES_MID, `evaluacion/` + plan.vigencia_id + "/" + datosP.Data[0].id + "/" + idUltimoTrimestre).subscribe(
                                (datosB: any) => {
                                  if (datosB) {
                                    console.log(datosB.Data);
                                    const brechasT1 = [];
                                    const brechasT2 = [];
                                    const brechasT3 = [];
                                    const brechasT4 = [];
                                    datosB.Data.map(br => {
                                      if (br.trimestre1 && Object.keys(br.trimestre1).length !== 0) {
                                        brechasT1.push(br.trimestre1.brecha);
                                      }
                                      if (br.trimestre2 && Object.keys(br.trimestre2).length !== 0) {
                                        brechasT2.push(br.trimestre2.brecha);
                                      }
                                      if (br.trimestre3 && Object.keys(br.trimestre3).length !== 0) {
                                        brechasT3.push(br.trimestre3.brecha);
                                      }
                                      if (br.trimestre4 && Object.keys(br.trimestre4).length !== 0) {
                                        brechasT4.push(br.trimestre4.brecha);
                                      }
                                    });
                                    trimestres.map(tri => {
                                      if (tri.codigo === 'T1' && brechasT1.length !== 0) {
                                        tri.promedioBrechas = ((brechasT1.reduce((total, numero) => total + numero, 0)) / brechasT1.length).toFixed(2);
                                      }
                                      else if (tri.codigo === 'T2' && brechasT2.length !== 0) {
                                        tri.promedioBrechas = ((brechasT2.reduce((total, numero) => total + numero, 0)) / brechasT2.length).toFixed(2);
                                      }
                                      else if (tri.codigo === 'T3' && brechasT3.length !== 0) {
                                        tri.promedioBrechas = ((brechasT3.reduce((total, numero) => total + numero, 0)) / brechasT3.length).toFixed(2);
                                      }
                                      else if (tri.codigo === 'T4' && brechasT4.length !== 0) {
                                        tri.promedioBrechas = ((brechasT4.reduce((total, numero) => total + numero, 0)) / brechasT4.length).toFixed(2);
                                      } else {
                                        tri.promedioBrechas = 0;
                                      }
                                    });
                                    const dialogRef = this.dialog.open(TrimestreDialogComponent, {
                                      width: 'calc(85vw - 65px)',
                                      height: 'calc(45vw - 65px)',
                                      data: { plan, trimestres }
                                    });
                                    console.log("FINAL: ", trimestres)
                                    Swal.close();
                                  }
                                }, (error) => {
                                  Swal.close();
                                  Swal.fire({
                                    title: 'Error en la operación',
                                    text: `No se encontraron datos registrados ${JSON.stringify(
                                      error
                                    )}`,
                                    icon: 'warning',
                                    showConfirmButton: false,
                                    timer: 2500,
                                  });
                                }
                              )
                            }
                          }, (error) => {
                            Swal.close();
                            Swal.fire({
                              title: 'Error en la operación',
                              text: `No se encontraron datos registrados ${JSON.stringify(
                                error
                              )}`,
                              icon: 'warning',
                              showConfirmButton: false,
                              timer: 2500,
                            });
                          }
                        )
                      } else {
                        trimestres.map(tri => {
                          tri.promedioBrechas = 0;
                        });
                        const dialogRef = this.dialog.open(TrimestreDialogComponent, {
                          width: 'calc(85vw - 65px)',
                          height: 'calc(45vw - 65px)',
                          data: { plan, trimestres }
                        });
                        Swal.close();
                      }
                    }
                  }, (error) => {
                    Swal.close();
                    Swal.fire({
                      title: 'Error en la operación',
                      text: `No se encontraron datos registrados ${JSON.stringify(
                        error
                      )}`,
                      icon: 'warning',
                      showConfirmButton: false,
                      timer: 2500,
                    });
                  }
                )
              })
              resolve("trimestres");
            }
          },
          (error) => {
            Swal.close();
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
          }
        );
    });
  }

  // async obtenerBrecha(periodos: any[]) {
  //   const promises = periodos[0].periodos.map(pe => {
  //     return new Promise((innerResolve, innerReject) => {
  //       this.request.get(path, endpoint)
  //     })
  //   })
  // }

  async loadUnidades() {
    Swal.fire({
      title: 'Cargando Unidades',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    return new Promise((resolve, reject) => {
      this.request
        .get(environment.PLANES_MID, `formulacion/get_unidades`)
        .subscribe(
          (data: any) => {
            if (data) {
              this.auxUnidades = data.Data;
              Swal.close();
              resolve(this.auxUnidades);
            }
          },
          (error) => {
            Swal.close();
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
          }
        );
    });
  }

  async ajustarData(event: any) {
    await this.cargarPlanes(event.value);
    this.informacionTabla = new MatTableDataSource<ResumenPlan>(this.planes);
    this.informacionTabla.filterPredicate = (plan: ResumenPlan, _) => {
      let filtrosPasados: number = 0;
      let valoresAComparar = [
        plan.dependencia_nombre.toLowerCase(),
        plan.vigencia.toString(),
        plan.nombre.toLowerCase(),
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

  descargarData() {
    const data = jsonData.map(item => {
      return {
        Make: item.make,
        Model: item.model,
        Year: item.year,
        Specifications1_Mileage: item.specifications.specifications1.mileage,
        Specifications1_Trim: item.specifications.specifications1.trim,
        Specifications2_Mileage: item.specifications.specifications2.mileage,
        Specifications2_Trim: item.specifications.specifications2.trim,
        Specifications3_Mileage: item.specifications.specifications3.mileage,
        Specifications3_Trim: item.specifications.specifications3.trim,
        Specifications4_Mileage: item.specifications.specifications4.mileage,
        Specifications4_Trim: item.specifications.specifications4.trim,
      };
    });

    const headerStyles = {
      alignment: {
        horizontal: 'center',
        vertical: 'center',
      },
      fill: { fgColor: { rgb: '731514' } },
      font: {
        bold: true,
        sz: '13',
        color: { rgb: 'FFFFFF' }
      },
      border: {
        bottom: { style: 'medium', color: { rgb: 'FFFFFF' } },
        left: { style: 'medium', color: { rgb: 'FFFFFF' } },
        right: { style: 'medium', color: { rgb: 'FFFFFF' } }
      }
    };

    //Crear un libro de trabajo
    const workbook = XLSX.utils.book_new();

    // Crear una hoja de trabajo
    const worksheet = XLSX.utils.aoa_to_sheet([[]]);
    XLSX.utils.sheet_add_json(worksheet, data, { origin: 'A6' });

    XLSX.utils.sheet_add_aoa(worksheet, [[
      'Plan de acción',
      'Unidad',
      'Vigencia',
      'Brecha',
      'Estado',
      'Brecha',
      'Estado',
      'Brecha',
      'Estado',
      'Brecha',
      'Estado',
    ]], { origin: "A6" });

    worksheet['D5'] = { v: 'Trimestre Uno', t: 's' };
    worksheet['F5'] = { v: 'Trimestre Dos', t: 's' };
    worksheet['H5'] = { v: 'Trimestre Tres', t: 's' };
    worksheet['J5'] = { v: 'Trimestre Cuatro', t: 's' };

    worksheet['!merges'] = [
      { s: { r: 4, c: 3 }, e: { r: 4, c: 4 } },
      { s: { r: 4, c: 5 }, e: { r: 4, c: 6 } },
      { s: { r: 4, c: 7 }, e: { r: 4, c: 8 } },
      { s: { r: 4, c: 9 }, e: { r: 4, c: 10 } },
    ];

    worksheet['!cols'] = [
      { width: 40 },
      { width: 40 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
      { width: 20 },
    ]

    //Estilo alto de las celdas
    const defaultRowHeight = 20;
    const filas = [];
    const regex = /(\d+)$/;
    const resultado = regex.exec(worksheet['!ref']);
    const filaFinal = parseInt(resultado[1]);
    for (let i = 0; i < filaFinal; i++) {
      filas.push({ hpx: defaultRowHeight });
    }
    if (filas.length > 0) {
      worksheet['!rows'] = filas;
    }

    //Estilo color celdas
    for (let j = 0; j < 11; j++) {
      const cellAddressF = XLSX.utils.encode_cell({ r: 4, c: j });
      const cellAddressH = XLSX.utils.encode_cell({ r: 5, c: j });
      if (j >= 3) {
        if (worksheet[cellAddressF]) {
          worksheet[cellAddressF].s = headerStyles;
        }
        worksheet[cellAddressH].s = {
          alignment: {
            horizontal: 'center',
            vertical: 'center',
          },
          fill: { fgColor: { rgb: '753E3D' } },
          font: {
            bold: true,
            sz: '13',
            color: { rgb: 'FFFFFF' }
          },
          border: {
            top: { style: 'medium', color: { rgb: 'FFFFFF' } },
            bottom: { style: 'medium', color: { rgb: 'FFFFFF' } },
            left: { style: 'medium', color: { rgb: 'FFFFFF' } },
            right: { style: 'medium', color: { rgb: 'FFFFFF' } }
          }
        };
      } else {
        worksheet[cellAddressH].s = headerStyles;
      }
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Procesos de seguimiento');

    XLSX.writeFile(workbook, 'Procesos de seguimiento.xlsx');
  }
}
