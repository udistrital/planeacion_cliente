import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { FormControl, Validators } from '@angular/forms';
import { isNumeric } from 'rxjs/internal-compatibility';

@Component({
  selector: 'app-docentes',
  templateUrl: './docentes.component.html',
  styleUrls: ['./docentes.component.scss']
})
export class DocentesComponent implements OnInit {

  steps: any[];
  displayedColumns: string[];
  activedStep = 0;
  dataSourceRHF: MatTableDataSource<any>;
  dataSourceRHVPRE: MatTableDataSource<any>;
  dataSourceRHVPOS: MatTableDataSource<any>;

  dataTableMTO: any[];
  dataTableTCO: any[];
  dataTablePrestacional: any[];
  dataTableHonorarios: any[];
  dataAvailable: boolean = false;
  banderaCerrar: boolean = false;

  accionBoton: string;
  tipoIdenti: string;
  Plan: any;
  estadoPlan: string;
  readonlyObs: boolean;
  readonlyTable: boolean = false;
  mostrarObservaciones: boolean;

  totalMTO: number;
  totalTCO: number;
  totalPrestacional: number;
  totalHonorarios: number;

  cantidadMTO: number;
  cantidadTCO: number;
  cantidadPrestacional: number;
  cantidadHonorarios: number;

  valorSueldoMTO: number;
  valorSueldoTCO: number;
  valorSueldoPrestacional: number;
  valorSueldoHonorarios: number;

  valorPrimaNavidadMTO: number;
  valorPrimaNavidadTCO: number;
  valorPrimaNavidadPrestacional: number;
  valorPrimaNavidadHonorarios: number;

  valorPrimaVacacionesMTO: number;
  valorPrimaVacacionesTCO: number;
  valorPrimaVacacionesPrestacional: number;
  valorPrimaVacacionesHonorarios: number;

  valorPensionesPublicasMTO: number;
  valorPensionesPublicasTCO: number;
  valorPensionesPublicasPrestacional: number;
  valorPensionesPublicasHonorarios: number;

  valorPensionesPrivadasMTO: number;
  valorPensionesPrivadasTCO: number;
  valorPensionesPrivadasPrestacional: number;
  valorPensionesPrivadasHonorarios: number;

  valorSaludPrivadaMTO: number;
  valorSaludPrivadaTCO: number;
  valorSaludPrivadaPrestacional: number;
  valorSaludPrivadaHonorarios: number;

  valorCesantiasPublicosMTO: number;
  valorCesantiasPublicosTCO: number;
  valorCesantiasPublicosPrestacional: number;
  valorCesantiasPublicosHonorarios: number;

  valorCesantiasPrivadosMTO: number;
  valorCesantiasPrivadosTCO: number;
  valorCesantiasPrivadosPrestacional: number;
  valorCesantiasPrivadosHonorarios: number;

  valorRiesgoPublicosMTO: number;
  valorRiesgoPublicosTCO: number;
  valorRiesgoPublicosPrestacional: number;
  valorRiesgoPublicosHonorarios: number;

  valorRiesgoPrivadosMTO: number;
  valorRiesgoPrivadosTCO: number;
  valorRiesgoPrivadosPrestacional: number;
  valorRiesgoPrivadosHonorarios: number;

  valorICBFMTO: number;
  valorICBFTCO: number;
  valorICBFPrestacional: number;
  valorICBFHonorarios: number;

  valorMTO: number;
  valorTCO: number;
  valorPrestacional: number;
  valorHonorarios: number;

  totalCantidad: number;
  totalSueldo: number;
  totalPrimaNavidad: number;
  totalPrimaVacaciones: number;
  totalPensionesPublicas: number;
  totalPensionesPrivadas: number;
  totalSaludPrivada: number;
  totalCesantiasPublicos: number;
  totalCesantiasPrivados: number;
  totalRiesgoPublicos: number;
  totalRiesgoPrivados: number;
  totalIcfb: number;
  totalTotal: number;
  data: any;

  banderaSumasPensiones: boolean = false;

  //valores desagregado
  titularMTO: any;
  titularTCO: any;
  titularPrestacional: any;
  titularHonorarios: any;

  auxiliarMTO: any;
  auxiliarTCO: any;
  auxiliarPrestacional: any;
  auxiliarHonorarios: any;

  asistenteMTO: any;
  asistenteTCO: any;
  asistentePrestacional: any;
  asistenteHonorarios: any;

  asociadoMTO: any;
  asociadoTCO: any;
  asociadoPrestacional: any;
  asociadoHonorarios: any;

  //

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() dataTabla: boolean;
  @Input() plan: string;
  @Input() rol: string;
  @Input() versiones: any[];

  @Output() acciones = new EventEmitter<any>();
  constructor(private request: RequestManager) {

  }

  ngOnInit(): void {
    this.dataSourceRHF = new MatTableDataSource<any>();
    this.dataSourceRHVPRE = new MatTableDataSource<any>();
    this.dataSourceRHVPOS = new MatTableDataSource<any>();
    this.loadDesagregado();
    this.loadPlan();
    this.loadTabla();
  }



  loadTabla() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    if (this.dataTabla) {
      this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:` + this.plan + `,tipo_identificacion_id:61897518f6fc97091727c3c3`).subscribe((data: any) => {
        if (data) {
          let identificacion = data.Data[0];
          if (identificacion.activo === false) {
            this.inicializarTabla();
            this.banderaCerrar = true;
            let datoIdenti = {
              "activo": true
            }
            Swal.close()
            this.request.put(environment.PLANES_CRUD, `identificacion`, datoIdenti, identificacion._id).subscribe((dataP: any) => {
              Swal.fire({
                title: 'Identificación Docente Creada',
                icon: 'success',
                showConfirmButton: false,
                timer: 3500
              })
              this.guardarRecursos();
            })

          } else {


            this.steps = [
              {
                "nombre": "Recurso horas fijas",
                "descripcion": "Pregrado",
                "tipo": "RHF",
                "nivel": "Pregrado",
                "data": this.dataSourceRHF,
                "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Compĺeto" }],
                "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
              },
              {
                "nombre": "Recurso horas variable",
                "descripcion": "Pregrado",
                "tipo": 'RHVPRE',
                "nivel": "Pregrado",
                "data": this.dataSourceRHVPRE,
                "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Compĺeto" }],
                "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
              },
              {
                "nombre": "Recurso horas variable",
                "descripcion": "Posgrado",
                "tipo": "RHVPOS",
                "nivel": "Posgrado",
                "data": this.dataSourceRHVPOS,
                "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Compĺeto" }],
                "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
              }
            ];
            Swal.close();
          }
        }
      })
    }
  }

  getData(): Promise<any> {
    let message: any;
    let resolveRef;
    let rejectRef;

    let dataPromise: Promise<any> = new Promise((resolve, reject) => {
      resolveRef = resolve;
      rejectRef = reject;
    });
    this.request.get(environment.PLANES_MID, `formulacion/get_all_identificacion/` + this.plan + `/61897518f6fc97091727c3c3`).subscribe((data: any) => {
      if (data) {
        let aux: object = data.Data;
        this.data = aux;
        resolveRef(message)
      }
    })
    return dataPromise
  }

  loadPlan() {
    this.request.get(environment.PLANES_CRUD, `plan/` + this.plan).subscribe((data: any) => {
      if (data.Data != null) {
        this.Plan = data.Data;
        this.getEstado();
      }
    })
  }

  getEstado() {
    this.request.get(environment.PLANES_CRUD, `estado-plan/` + this.Plan.estado_plan_id).subscribe((data: any) => {
      if (data) {
        this.estadoPlan = data.Data.nombre;
        this.displayedColumns = ['nivel', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'totalPensiones', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'total', 'acciones'];
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

  visualizarColumnas(): string[] {
    if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = this.verificarVersiones();
        this.mostrarObservaciones = this.verificarObservaciones();
        if (this.mostrarObservaciones) {
          return ['docente'];
        } else {
          return ['docente'];
        }

      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente'];
      }
    }

    if (this.rol == 'PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente'];
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['docente'];
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente'];
      }
    }
  }

  verificarVersiones(): boolean {
    let preAval = this.versiones.filter(group => group.estado_plan_id.match('614d3b4401c7a222052fac05'));
    if (preAval.length != 0) {
      return false;
    } else {
      return false;
    }
  }

  verificarObservaciones(): boolean {
    let preAval = this.versiones.filter(group => group.estado_plan_id.match('614d3b1e01c7a265372fac03'));
    if (preAval.length != 0) {
      return true;
    } else {
      return false;
    }
  }

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
  }

  loadDesagregado() {
    let bodyMTO = [
      {
        "Vigencia": 2021,
        "Dedicacion": "MTO",
        "Categoria": "Titular",
        "NivelAcademico": "PREGRADO"
      },
      {
        "Vigencia": 2021,
        "Dedicacion": "MTO",
        "Categoria": "Auxiliar",
        "NivelAcademico": "PREGRADO"
      },
      {
        "Vigencia": 2021,
        "Dedicacion": "MTO",
        "Categoria": "Asistente",
        "NivelAcademico": "PREGRADO"
      },
      {
        "Vigencia": 2021,
        "Dedicacion": "MTO",
        "Categoria": "Asociado",
        "NivelAcademico": "PREGRADO"
      }
    ]
    let bodyTCO = [{
      "Vigencia": 2021,
      "Dedicacion": "TCO",
      "Categoria": "Titular",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": 2021,
      "Dedicacion": "TCO",
      "Categoria": "Auxiliar",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": 2021,
      "Dedicacion": "TCO",
      "Categoria": "Asistente",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": 2021,
      "Dedicacion": "TCO",
      "Categoria": "Asociado",
      "NivelAcademico": "PREGRADO"
    }
    ]
    let bodyPrestacional = [{
      "Vigencia": 2021,
      "Dedicacion": "HCP",
      "Categoria": "Titular",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": 2021,
      "Dedicacion": "HCP",
      "Categoria": "Auxiliar",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": 2021,
      "Dedicacion": "HCP",
      "Categoria": "Asistente",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": 2021,
      "Dedicacion": "HCP",
      "Categoria": "Asociado",
      "NivelAcademico": "PREGRADO"
    }
    ]
    let bodyHonorarios = [{
      "Vigencia": 2021,
      "Dedicacion": "HCH",
      "Categoria": "Titular",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": 2021,
      "Dedicacion": "HCH",
      "Categoria": "Auxiliar",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": 2021,
      "Dedicacion": "HCH",
      "Categoria": "Asistente",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": 2021,
      "Dedicacion": "HCH",
      "Categoria": "Asociado",
      "NivelAcademico": "PREGRADO"
    }
    ]
    this.request.post(environment.RESOLUCIONES_DOCENTES_SERVICE, "services/desagregado_planeacion", bodyMTO).subscribe((data: any) => {
      if (data) {
        this.titularMTO = data.Data[0];
        this.auxiliarMTO = data.Data[1];
        this.asistenteMTO = data.Data[2];
        this.asociadoMTO = data.Data[3];
      }
    })

    this.request.post(environment.RESOLUCIONES_DOCENTES_SERVICE, "services/desagregado_planeacion", bodyTCO).subscribe((data: any) => {
      if (data) {
        this.titularTCO = data.Data[0];
        this.auxiliarTCO = data.Data[1];
        this.asistenteTCO = data.Data[2];
        this.asociadoTCO = data.Data[3];
      }
    })

    this.request.post(environment.RESOLUCIONES_DOCENTES_SERVICE, "services/desagregado_planeacion", bodyPrestacional).subscribe((data: any) => {
      if (data) {
        this.titularPrestacional = data.Data[0];
        this.auxiliarPrestacional = data.Data[1];
        this.asistentePrestacional = data.Data[2];
        this.asociadoPrestacional = data.Data[3];
      }
    })

    this.request.post(environment.RESOLUCIONES_DOCENTES_SERVICE, "services/desagregado_planeacion", bodyHonorarios).subscribe((data: any) => {
      if (data) {
        this.titularHonorarios = data.Data[0];
        this.auxiliarHonorarios = data.Data[1];
        this.asistenteHonorarios = data.Data[2];
        this.asociadoHonorarios = data.Data[3];
      }
    })
  }

  addElement(tipo) {
    if (tipo === 'RHF') {
      this.dataSourceRHF.data.unshift({
        nivel: 'Pregrado',
        tipo: '',
        categoria: '',
        semanas: '',
        horas: '',
        totalHoras: '',
        meses: '',
        sueldoBasico: '',
        sueldoMensual: '',
        primaServicios: '',
        primaNavidad: '',
        primaVacaciones: '',
        bonificacion: '',
        cesantiasPublico: '',
        cesantiasPrivado: '',
        interesesCesantias: '',
        cesantias: '',
        totalCesantias: '',
        totalSalud: '',
        totalPensiones: '',
        pensionesPublico: '',
        pensionesPrivado: '',
        totalArl: '',
        caja: '',
        icbf: '',
        total: ''
      });
      this.dataSourceRHF.paginator = this.paginator;
      this.dataSourceRHF.sort = this.sort;
    } else if (tipo == 'RHVPRE') {
      this.dataSourceRHVPRE.data.unshift({
        nivel: 'Pregrado',
        tipo: '',
        categoria: '',
        semanas: '',
        horas: '',
        totalHoras: '',
        meses: '',
        sueldoBasico: '',
        sueldoMensual: '',
        privaServicios: '',
        primaNavidad: '',
        primaVacaciones: '',
        bonificacion: '',
        cesantiasPublico: '',
        cesantiasPrivado: '',
        interesesCesantias: '',
        cesantias: '',
        totalCesantias: '',
        totalSalud: '',
        pensionesPublico: '',
        pensionesPrivado: '',
        totalPensiones: '',
        totalArl: '',
        caja: '',
        icbf: '',
        total: ''
      });
      this.dataSourceRHVPRE.paginator = this.paginator;
      this.dataSourceRHVPRE.sort = this.sort;
    } else if (tipo == 'RHVPOS') {
      this.dataSourceRHVPOS.data.unshift({
        nivel: 'Posgrado',
        tipo: '',
        categoria: '',
        semanas: '',
        horas: '',
        totalHoras: '',
        meses: '',
        sueldoBasico: '',
        sueldoMensual: '',
        privaServicios: '',
        primaNavidad: '',
        primaVacaciones: '',
        bonificacion: '',
        cesantiasPublico: '',
        cesantiasPrivado: '',
        interesesCesantias: '',
        cesantias: '',
        totalCesantias: '',
        totalSalud: '',
        pensionesPublico: '',
        pensionesPrivado: '',
        totalPensiones: '',
        totalArl: '',
        caja: '',
        icbf: '',
        total: ''
      });
      this.dataSourceRHVPOS.paginator = this.paginator;
      this.dataSourceRHVPOS.sort = this.sort;
    }
  }

  deleteElement(index, tipo) {
    Swal.fire({
      title: 'Eliminar recurso',
      text: `¿Está seguro de eliminar este recurso?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this._deleteElemento(index, tipo);
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    });

  }

  private _deleteElemento(index, tipo) {

    if (tipo === 'RHF') {
      const indices = isNumeric(index) ? [index] : (Array.isArray(index) ? index : undefined);
      if (indices) {
        const data = this.dataSourceRHF.data;
        indices.sort((a, b) => b - a);
        for (let i = 0; i < indices.length; i++) {
          data.splice((this.paginator.pageIndex * this.paginator.pageSize) + indices[i], 1);
        }
        this.dataSourceRHF.data = data;
      }
    } else if (tipo == 'RHVPRE') {
      const indices = isNumeric(index) ? [index] : (Array.isArray(index) ? index : undefined);
      if (indices) {
        const data = this.dataSourceRHVPRE.data;
        indices.sort((a, b) => b - a);
        for (let i = 0; i < indices.length; i++) {
          data.splice((this.paginator.pageIndex * this.paginator.pageSize) + indices[i], 1);
        }
        this.dataSourceRHVPRE.data = data;
      }
    } else if (tipo == 'RHVPOS') {
      const indices = isNumeric(index) ? [index] : (Array.isArray(index) ? index : undefined);
      if (indices) {
        const data = this.dataSourceRHVPOS.data;
        indices.sort((a, b) => b - a);
        for (let i = 0; i < indices.length; i++) {
          data.splice((this.paginator.pageIndex * this.paginator.pageSize) + indices[i], 1);
        }
        this.dataSourceRHVPOS.data = data;
      }
    }

  }


  onSelected(event, rowIndex, tipo) {
    if (tipo === 'RHF') {
      if (event == undefined) {
        this.dataSourceRHF.data[rowIndex].tipo = '';
      } else {
        console.log(event.value)
        this.dataSourceRHF.data[rowIndex].tipo = event.value;
      }
    } else if (tipo == 'RHVPRE') {
      if (event == undefined) {
        this.dataSourceRHVPRE.data[rowIndex].tipo = '';
      } else {

        this.dataSourceRHVPRE.data[rowIndex].tipo = event.value;
      }
    } else if (tipo == 'RHVPOS') {
      if (event == undefined) {
        this.dataSourceRHVPOS.data[rowIndex].tipo = '';
      } else {
        this.dataSourceRHVPOS.data[rowIndex].tipo = event.value;
      }
    }
  }

  onSelectedCategoria(event, rowIndex, tipo) {
    if (tipo === 'RHF') {
      if (event == undefined) {
        this.dataSourceRHF.data[rowIndex].categoria = '';
      } else {
        this.dataSourceRHF.data[rowIndex].categoria = event.value;
      }
    } else if (tipo == 'RHVPRE') {
      if (event == undefined) {
        this.dataSourceRHVPRE.data[rowIndex].categoria = '';
      } else {

        this.dataSourceRHVPRE.data[rowIndex].categoria = event.value;
      }
    } else if (tipo == 'RHVPOS') {
      if (event == undefined) {
        this.dataSourceRHVPOS.data[rowIndex].categoria = '';
      } else {
        this.dataSourceRHVPOS.data[rowIndex].categoria = event.value;
      }
    }
  }

  // Operacion con desagregado

  // Funciones para valores totales de la tabla ///
  getValorTotal(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.totalMTO = this.dataSourceMTO.data.map(t => t.total).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.totalMTO >> 0.00) {
    //       return this.totalMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.totalTCO = this.dataSourceTCO.data.map(t => t.total).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.totalTCO >> 0.00) {
    //       return this.totalTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.totalPrestacional = this.dataSourcePrestacional.data.map(t => t.total).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.totalPrestacional >> 0.00) {
    //       return this.totalPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   if (this.dataSourceHonorarios.data.length !== 0) {
    //     this.totalHonorarios = this.dataSourceHonorarios.data.map(t => t.total).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.totalHonorarios >> 0.00) {
    //       return this.totalHonorarios;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
  }

  getCantidad(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.cantidadMTO = this.dataSourceMTO.data.map(t => t.cantidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.cantidadMTO >> 0.00) {
    //       return this.cantidadMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.cantidadTCO = this.dataSourceTCO.data.map(t => t.cantidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.cantidadTCO >> 0.00) {
    //       return this.cantidadTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.cantidadPrestacional = this.dataSourcePrestacional.data.map(t => t.cantidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.cantidadPrestacional >> 0.00) {
    //       return this.cantidadPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   if (this.dataSourceHonorarios.data.length !== 0) {
    //     this.cantidadHonorarios = this.dataSourceHonorarios.data.map(t => t.cantidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.cantidadHonorarios >> 0.00) {
    //       return this.cantidadHonorarios;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
  }

  getValorSueldo(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorSueldoMTO = this.dataSourceMTO.data.map(t => t.sueldoBasico).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorSueldoMTO >> 0.00) {
    //       return this.valorSueldoMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorSueldoTCO = this.dataSourceTCO.data.map(t => t.sueldoBasico).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorSueldoTCO >> 0.00) {
    //       return this.valorSueldoTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorSueldoPrestacional = this.dataSourcePrestacional.data.map(t => t.sueldoBasico).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorSueldoPrestacional >> 0.00) {
    //       return this.valorSueldoPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   if (this.dataSourceHonorarios.data.length !== 0) {
    //     this.valorSueldoHonorarios = this.dataSourceHonorarios.data.map(t => t.sueldoBasico).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorSueldoHonorarios >> 0.00) {
    //       return this.valorSueldoHonorarios;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
  }

  getValorPrimaNavidad(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorPrimaNavidadMTO = this.dataSourceMTO.data.map(t => t.primaNavidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPrimaNavidadMTO >> 0.00) {
    //       return this.valorPrimaNavidadMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorPrimaNavidadTCO = this.dataSourceTCO.data.map(t => t.primaNavidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPrimaNavidadTCO >> 0.00) {
    //       return this.valorPrimaNavidadTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorPrimaNavidadPrestacional = this.dataSourcePrestacional.data.map(t => t.primaNavidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPrimaNavidadPrestacional >> 0.00) {
    //       return this.valorPrimaNavidadPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   return 0;
    // }
  }

  getValorPrimaVacaciones(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorPrimaVacacionesMTO = this.dataSourceMTO.data.map(t => t.primaVacaciones).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPrimaVacacionesMTO >> 0.00) {
    //       return this.valorPrimaVacacionesMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorPrimaVacacionesTCO = this.dataSourceTCO.data.map(t => t.primaVacaciones).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPrimaVacacionesTCO >> 0.00) {
    //       return this.valorPrimaVacacionesTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorPrimaVacacionesPrestacional = this.dataSourcePrestacional.data.map(t => t.primaVacaciones).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPrimaVacacionesPrestacional >> 0.00) {
    //       return this.valorPrimaVacacionesPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   return 0;
    // }
  }

  getValorPensionesPublicas(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorPensionesPublicasMTO = this.dataSourceMTO.data.map(t => t.aportesPensionesPublicas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPensionesPublicasMTO >> 0.00) {
    //       return this.valorPensionesPublicasMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorPensionesPublicasTCO = this.dataSourceTCO.data.map(t => t.aportesPensionesPublicas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPensionesPublicasTCO >> 0.00) {
    //       return this.valorPensionesPublicasTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorPensionesPublicasPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesPensionesPublicas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPensionesPublicasPrestacional >> 0.00) {
    //       return this.valorPensionesPublicasPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   return 0;
    // }
  }

  getValorPensionesPrivadas(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorPensionesPrivadasMTO = this.dataSourceMTO.data.map(t => t.aportesPensionesPrivadas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPensionesPrivadasMTO >> 0.00) {
    //       return this.valorPensionesPrivadasMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorPensionesPrivadasTCO = this.dataSourceTCO.data.map(t => t.aportesPensionesPrivadas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPensionesPrivadasTCO >> 0.00) {
    //       return this.valorPensionesPrivadasTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorPensionesPrivadasPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesPensionesPrivadas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorPensionesPrivadasPrestacional >> 0.00) {
    //       return this.valorPensionesPrivadasPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   return 0;
    // }
  }

  getValorSaludPrivada(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorSaludPrivadaMTO = this.dataSourceMTO.data.map(t => t.aportesSaludPrivada).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorSaludPrivadaMTO >> 0.00) {
    //       return this.valorSaludPrivadaMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorSaludPrivadaTCO = this.dataSourceTCO.data.map(t => t.aportesSaludPrivada).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorSaludPrivadaTCO >> 0.00) {
    //       return this.valorSaludPrivadaTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorSaludPrivadaPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesSaludPrivada).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorSaludPrivadaPrestacional >> 0.00) {
    //       return this.valorSaludPrivadaPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   return 0;
    // }
  }

  getValorCesantiasPublicos(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorCesantiasPublicosMTO = this.dataSourceMTO.data.map(t => t.aportesCesantiasPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorCesantiasPublicosMTO >> 0.00) {
    //       return this.valorCesantiasPublicosMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorCesantiasPublicosTCO = this.dataSourceTCO.data.map(t => t.aportesCesantiasPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorCesantiasPublicosTCO >> 0.00) {
    //       return this.valorCesantiasPublicosTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorCesantiasPublicosPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesCesantiasPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorCesantiasPublicosPrestacional >> 0.00) {
    //       return this.valorCesantiasPublicosPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   return 0;
    // }
  }

  getValorCesantiasPrivados(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorCesantiasPrivadosMTO = this.dataSourceMTO.data.map(t => t.aportesCesantiasPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorCesantiasPrivadosMTO >> 0.00) {
    //       return this.valorCesantiasPrivadosMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorCesantiasPrivadosTCO = this.dataSourceTCO.data.map(t => t.aportesCesantiasPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorCesantiasPrivadosTCO >> 0.00) {
    //       return this.valorCesantiasPrivadosTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorCesantiasPrivadosPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesCesantiasPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorCesantiasPrivadosPrestacional >> 0.00) {
    //       return this.valorCesantiasPrivadosPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   return 0;
    // }
  }

  getValorRiesgoPublicos(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorRiesgoPublicosMTO = this.dataSourceMTO.data.map(t => t.aportesRiesgoPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorRiesgoPublicosMTO >> 0.00) {
    //       return this.valorRiesgoPublicosMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorRiesgoPublicosTCO = this.dataSourceTCO.data.map(t => t.aportesRiesgoPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorRiesgoPublicosTCO >> 0.00) {
    //       return this.valorRiesgoPublicosTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorRiesgoPublicosPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesRiesgoPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorRiesgoPublicosPrestacional >> 0.00) {
    //       return this.valorRiesgoPublicosPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   return 0;
    // }
  }

  getValorRiesgoPrivados(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorRiesgoPrivadosMTO = this.dataSourceMTO.data.map(t => t.aportesRiesgoPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorRiesgoPrivadosMTO >> 0.00) {
    //       return this.valorRiesgoPrivadosMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorRiesgoPrivadosTCO = this.dataSourceTCO.data.map(t => t.aportesRiesgoPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorRiesgoPrivadosTCO >> 0.00) {
    //       return this.valorRiesgoPrivadosTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorRiesgoPrivadosPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesRiesgoPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorRiesgoPrivadosPrestacional >> 0.00) {
    //       return this.valorRiesgoPrivadosPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   return 0;
    // }
  }

  getValorICBF(tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorICBFMTO = this.dataSourceMTO.data.map(t => t.aportesICBF).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorICBFMTO >> 0.00) {
    //       return this.valorICBFMTO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorICBFTCO = this.dataSourceTCO.data.map(t => t.aportesICBF).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorICBFTCO >> 0.00) {
    //       return this.valorICBFTCO;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorICBFPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesICBF).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
    //     if (this.valorICBFPrestacional >> 0.00) {
    //       return this.valorICBFPrestacional;
    //     } else {
    //       return '0';
    //     }
    //   } else {
    //     return '0';
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   return 0;
    // }
  }

  //Total por registro
  getTotal(element, rowIndex, tipo) {
    // if (tipo == 'MTO') {
    //   if (this.dataSourceMTO.data.length !== 0) {
    //     this.valorMTO = parseFloat((element.sueldoBasico + element.primaNavidad + element.primaVacaciones + element.totalAportesPensiones + element.aportesSaludPrivada + element.totalAportesCesantias +
    //       element.totalAportesRiesgos + element.aportesICBF).toFixed(2))
    //     if (this.valorMTO >> 0.00) {
    //       this.dataSourceMTO.data[rowIndex].total = this.valorMTO;
    //       return this.valorMTO;
    //     } else {
    //       this.dataSourceMTO.data[rowIndex].total = this.valorMTO;
    //       return 0
    //     }
    //   } else {
    //     return 0;
    //   }
    // }
    // if (tipo == 'TCO') {
    //   if (this.dataSourceTCO.data.length !== 0) {
    //     this.valorTCO = parseFloat((element.sueldoBasico + element.primaNavidad + element.primaVacaciones + element.aportesPensionesPublicas +
    //       element.aportesPensionesPrivadas + element.aportesSaludPrivada + element.aportesCesantiasPublicos + element.aportesCesantiasPrivados +
    //       element.aportesRiesgoPublicos + element.aportesRiesgoPrivados + element.aportesICBF).toFixed(2))
    //     if (this.valorTCO >> 0.00) {
    //       this.dataSourceTCO.data[rowIndex].total = this.valorTCO;
    //       return this.valorTCO;
    //     } else {
    //       this.dataSourceTCO.data[rowIndex].total = this.valorTCO;
    //       return 0;
    //     }
    //   } else {
    //     return 0;
    //   }
    // }
    // if (tipo == 'Prestacional') {
    //   if (this.dataSourcePrestacional.data.length !== 0) {
    //     this.valorPrestacional = parseFloat((element.sueldoBasico + element.primaNavidad + element.primaVacaciones + element.aportesPensionesPublicas +
    //       element.aportesPensionesPrivadas + element.aportesSaludPrivada + element.aportesCesantiasPublicos + element.aportesCesantiasPrivados +
    //       element.aportesRiesgoPublicos + element.aportesRiesgoPrivados + element.aportesICBF).toFixed(2))
    //     if (this.valorPrestacional >> 0.00) {
    //       this.dataSourcePrestacional.data[rowIndex].total = this.valorPrestacional;
    //       return this.valorPrestacional;
    //     } else {
    //       this.dataSourcePrestacional.data[rowIndex].total = this.valorPrestacional;
    //       return 0;
    //     }
    //   } else {
    //     return 0;
    //   }
    // }
    // if (tipo == 'Honorarios') {
    //   if (this.dataSourceHonorarios.data.length !== 0) {
    //     this.valorHonorarios = parseFloat((element.sueldoBasico).toFixed(2))
    //     if (this.valorHonorarios >> 0.00) {
    //       this.dataSourceHonorarios.data[rowIndex].total = this.valorHonorarios;
    //       return this.valorHonorarios;
    //     } else {
    //       this.dataSourceHonorarios.data[rowIndex].total = this.valorHonorarios;
    //       return 0;
    //     }
    //   } else {
    //     return 0;
    //   }
    // }
  }

  guardarRecursos() {


  }

  ocultarRecursos() {
    this.accionBoton = 'ocultar';
    this.tipoIdenti = 'docentes';
    let data = this.dataSourceRHF.data;
    let accion = this.accionBoton;
    let identi = this.tipoIdenti;
    this.acciones.emit({ data, accion, identi });
  }

  sumasTotales(tipo) {

  }

  verificarSumasPensiones() {

  }

  verificarSumasCesantias() {

  }

  verificarSumasRiesgos() {

  }

  inicializarTabla() {
    this.steps = [
      {
        "nombre": "Recurso horas fijas",
        "descripcion": "Pregrado",
        "tipo": "RHF",
        "nivel": "Pregrado",
        "data": this.dataSourceRHF,
        "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Compĺeto" }],
        "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
      },
      {
        "nombre": "Recurso horas variable",
        "descripcion": "Pregrado",
        "tipo": 'RHVPRE',
        "nivel": "Pregrado",
        "data": this.dataSourceRHVPRE,
        "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Compĺeto" }],
        "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
      },
      {
        "nombre": "Recurso horas variable",
        "descripcion": "Posgrado",
        "tipo": "RHVPOS",
        "nivel": "Posgrado",
        "data": this.dataSourceRHVPOS,
        "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Compĺeto" }],
        "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
      }
    ];


  }
}
