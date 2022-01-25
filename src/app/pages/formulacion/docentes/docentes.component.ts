import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-docentes',
  templateUrl: './docentes.component.html',
  styleUrls: ['./docentes.component.scss']
})
export class DocentesComponent implements OnInit {

  steps: any[];
  displayedColumns: string[];
  activedStep = 0;
  dataSource: MatTableDataSource<any>;
  dataSourceMTO: MatTableDataSource<any>;
  dataSourceTCO: MatTableDataSource<any>;
  dataSourcePrestacional: MatTableDataSource<any>;
  dataSourceHonorarios: MatTableDataSource<any>;
  dataTableMTO: any[];
  dataTableTCO: any[];
  dataTablePrestacional: any[];
  dataTableHonorarios: any[];
  dataAvailable: boolean = false;
  banderaCerrar : boolean = false;

  accionBoton: string;
  tipoIdenti: string;
  Plan: any;
  estadoPlan: string;
  readonlyObs: boolean;
  readonlyTable: boolean = false;


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
            this.dataSource = new MatTableDataSource<any>();
            this.dataSourceMTO = new MatTableDataSource<any>();
            this.dataSourceTCO = new MatTableDataSource<any>();
            this.dataSourcePrestacional = new MatTableDataSource<any>();
            this.dataSourceHonorarios = new MatTableDataSource<any>();
            this.dataSourceMTO.data = [];
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
            })

          } else {
            this.dataSource = new MatTableDataSource<any>();
            this.dataSourceMTO = new MatTableDataSource<any>();
            this.dataSourceTCO = new MatTableDataSource<any>();
            this.dataSourcePrestacional = new MatTableDataSource<any>();
            this.dataSourceHonorarios = new MatTableDataSource<any>();
            this.getData().then(() => {
              this.dataSourceTCO.data = this.data.tco;
              this.dataSourceMTO.data = this.data.mto;
              this.dataSourcePrestacional.data = this.data.prestacional;
              this.dataSourceHonorarios.data = this.data.honorarios;

              this.steps = [
                {
                  "nombre": "Docentes Ocasionales de Medio Tiempo (MTO)",
                  "descripcion": "Recuerde que según el árticulo 01 del Acuerdo 008/2001 del Consejo Superior Universitario, el número máximo de Docentes MTO a contratar es 25",
                  "footer": "Total Recursos Medio Tiempo Ocasional",
                  "tipo": "MTO",
                  "maxHoras": 20,
                  "minHoras": 16,
                  "data": this.dataSourceMTO
                },
                {
                  "nombre": "Docentes Ocasionales de  Tiempo Completo (TCO)",
                  "descripcion": "NA",
                  "footer": "Total Recursos Tiempo Completo Ocasional",
                  "tipo": 'TCO',
                  "maxHoras": 40,
                  "minHoras": 24,
                  "data": this.dataSourceTCO
                },
                {
                  "nombre": "Docentes Hora Cátedra Prestacional",
                  "descripcion": "NA",
                  "footer": "Total Recursos Hora Cátedra prestacional",
                  "tipo": "Prestacional",
                  "maxHoras": 16,
                  "minHoras": 2,
                  "data": this.dataSourcePrestacional
                },
                {
                  "nombre": "Docentes Hora Cátedra por Honorarios",
                  "descripcion": "NA",
                  "footer": "Total Recursos Hora Cátedra por Honorarios",
                  "tipo": "Honorarios",
                  "maxHoras": 8,
                  "minHoras": 4,
                  "data": this.dataSourceHonorarios
                }
              ];
              Swal.close();
            })

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
        this.displayedColumns = this.visualizarColumnas();
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
        return ['docente', 'cantidad','cantidadHoras', 'sueldoBasico',  'interesesCesantias', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total'];
      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente', 'cantidad', 'cantidadHoras','sueldoBasico',  'interesesCesantias', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente', 'cantidad','cantidadHoras', 'sueldoBasico',  'interesesCesantias', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total'];
      }
    }

    if (this.rol == 'PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente', 'cantidad','cantidadHoras', 'sueldoBasico',  'interesesCesantias', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total'];
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['docente', 'cantidad', 'cantidadHoras','sueldoBasico',  'interesesCesantias', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente', 'cantidad', 'cantidadHoras','sueldoBasico',  'interesesCesantias', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente', 'cantidad','cantidadHoras', 'sueldoBasico',  'interesesCesantias', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total'];
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



  submit(data) {

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

  // Operacion con desagregado

  getSueldoBasico(tipo, rowIndex, element) {
    if (tipo == 'MTO') {
      if (element.docente == 'Titular MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularMTO.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].sueldoBasico = valor;
        return valor;
      } else if (element.docente == 'Asistente MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteMTO.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].sueldoBasico = valor;
        return valor;
      } else if (element.docente == 'Asociado MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoMTO.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].sueldoBasico = valor;
        return valor;
      } else if (element.docente == 'Auxiliar MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarMTO.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].sueldoBasico = valor;
        return valor;
      }
    }
    if (tipo == 'TCO') {
      if (element.docente == 'Titular TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularTCO.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].sueldoBasico = valor;
        return valor;
      } if (element.docente == 'Asistente TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteTCO.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].sueldoBasico = valor;
        return valor;
      } if (element.docente == 'Asociado TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoTCO.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].sueldoBasico = valor;
        return valor;
      } if (element.docente == 'Auxiliar TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarTCO.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].sueldoBasico = valor;
        return valor;
      }
    }
    if (tipo == 'Prestacional') {
      if (element.docente == 'Hora Catedra Titular') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularPrestacional.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].sueldoBasico = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asistente') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistentePrestacional.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].sueldoBasico = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asociado') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoPrestacional.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].sueldoBasico = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Auxiliar') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarPrestacional.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].sueldoBasico = valor;
        return valor;
      }
    }
    if (tipo == 'Honorarios') {
      if (element.docente == 'Hora Catedra Titular') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularHonorarios.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceHonorarios.data[rowIndex].sueldoBasico = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asistente') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteHonorarios.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceHonorarios.data[rowIndex].sueldoBasico = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asociado') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoHonorarios.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceHonorarios.data[rowIndex].sueldoBasico = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Auxiliar') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarHonorarios.salarioBasico) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceHonorarios.data[rowIndex].sueldoBasico = valor;
        return valor;
      }
    }
  }

  getInteresesCesantias(tipo, rowIndex, element) {
    if (tipo == 'MTO') {
      if (element.docente == 'Titular MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularMTO.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].interesesCesantias = valor;
        return valor;
      } else if (element.docente == 'Asistente MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteMTO.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].interesesCesantias = valor;
        return valor;
      } else if (element.docente == 'Asociado MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoMTO.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].interesesCesantias = valor;
        return valor;
      } else if (element.docente == 'Auxiliar MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarMTO.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].interesesCesantias = valor;
        return valor;
      }
    }
    if (tipo == 'TCO') {
      if (element.docente == 'Titular TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularTCO.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].interesesCesantias = valor;
        return valor;
      } if (element.docente == 'Asistente TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteTCO.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].interesesCesantias = valor;
        return valor;
      } if (element.docente == 'Asociado TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoTCO.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].interesesCesantias = valor;
        return valor;
      } if (element.docente == 'Auxiliar TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarTCO.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].interesesCesantias = valor;
        return valor;
      }
    }
    if (tipo == 'Prestacional') {
      if (element.docente == 'Hora Catedra Titular') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularPrestacional.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].interesesCesantias = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asistente') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistentePrestacional.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].interesesCesantias = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asociado') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoPrestacional.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].interesesCesantias = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Auxiliar') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarPrestacional.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].interesesCesantias = valor;
        return valor;
      }
    }
    if (tipo == 'Honorarios') {
      if (element.docente == 'Hora Catedra Titular') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularHonorarios.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceHonorarios.data[rowIndex].interesesCesantias = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asistente') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteHonorarios.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceHonorarios.data[rowIndex].interesesCesantias = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asociado') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoHonorarios.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceHonorarios.data[rowIndex].interesesCesantias = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Auxiliar') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarHonorarios.interesCesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceHonorarios.data[rowIndex].interesesCesantias = valor;
        return valor;
      }
    }
  }

  getPrimaNavidad(tipo, rowIndex, element) {
    if (tipo == 'MTO') {
      if (element.docente == 'Titular MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularMTO.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].primaNavidad = valor;
        return valor;
      } else if (element.docente == 'Asistente MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteMTO.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].primaNavidad = valor;
        return valor;
      } else if (element.docente == 'Asociado MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoMTO.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].primaNavidad = valor;
        return valor;
      } else if (element.docente == 'Auxiliar MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarMTO.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].primaNavidad = valor;
        return valor;
      }
    }
    if (tipo == 'TCO') {
      if (element.docente == 'Titular TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularTCO.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].primaNavidad = valor;
        return valor;
      } if (element.docente == 'Asistente TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteTCO.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].primaNavidad = valor;
        return valor;
      } if (element.docente == 'Asociado TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoTCO.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].primaNavidad = valor;
        return valor;
      } if (element.docente == 'Auxiliar TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarTCO.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].primaNavidad = valor;
        return valor;
      }
    }
    if (tipo == 'Prestacional') {
      if (element.docente == 'Hora Catedra Titular') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularPrestacional.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].primaNavidad = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asistente') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistentePrestacional.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].primaNavidad = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asociado') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoPrestacional.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].primaNavidad = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Auxiliar') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarPrestacional.primaNavidad) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].primaNavidad = valor;
        return valor;
      }
    }
    if (tipo == 'Honorarios') {
      return 'N/A';
    }
  }


  getPrimaVacaciones(tipo, rowIndex, element) {
    if (tipo == 'MTO') {
      if (element.docente == 'Titular MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularMTO.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].primaVacaciones = valor;
        return valor;
      } else if (element.docente == 'Asistente MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteMTO.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].primaVacaciones = valor;
        return valor;
      } else if (element.docente == 'Asociado MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoMTO.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].primaVacaciones = valor;
        return valor;
      } else if (element.docente == 'Auxiliar MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarMTO.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].primaVacaciones = valor;
        return valor;
      }
    }
    if (tipo == 'TCO') {
      if (element.docente == 'Titular TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularTCO.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].primaVacaciones = valor;
        return valor;
      } if (element.docente == 'Asistente TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteTCO.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].primaVacaciones = valor;
        return valor;
      } if (element.docente == 'Asociado TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoTCO.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].primaVacaciones = valor;
        return valor;
      } if (element.docente == 'Auxiliar TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarTCO.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].primaVacaciones = valor;
        return valor;
      }
    }
    if (tipo == 'Prestacional') {
      if (element.docente == 'Hora Catedra Titular') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularPrestacional.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].primaVacaciones = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asistente') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistentePrestacional.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].primaVacaciones = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asociado') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoPrestacional.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].primaVacaciones = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Auxiliar') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarPrestacional.primaVacaciones) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].primaVacaciones = valor;
        return valor;
      }
    }
    if (tipo == 'Honorarios') {
      return 'N/A';
    }
  }


  getTotalAportesPensiones(tipo, rowIndex, element) {

    if (tipo == 'MTO') {

      if (element.docente == 'Titular MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularMTO.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      } else if (element.docente == 'Asistente MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteMTO.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      } else if (element.docente == 'Asociado MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoMTO.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      } else if (element.docente == 'Auxiliar MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarMTO.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      }
    }
    if (tipo == 'TCO') {
      if (element.docente == 'Titular TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularTCO.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      } if (element.docente == 'Asistente TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteTCO.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      } if (element.docente == 'Asociado TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoTCO.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      } if (element.docente == 'Auxiliar TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarTCO.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      }
    }
    if (tipo == 'Prestacional') {
      if (element.docente == 'Hora Catedra Titular') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularPrestacional.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asistente') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistentePrestacional.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asociado') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoPrestacional.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Auxiliar') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarPrestacional.pension) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesPensiones = valor;
        return valor;
      }
    }
    if (tipo == 'Honorarios') {
      return 'N/A';
    }
  }

  getTotalAportesSalud(tipo, rowIndex, element) {
    if (tipo == 'MTO') {
      if (element.docente == 'Titular MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularMTO.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      } else if (element.docente == 'Asistente MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteMTO.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      } else if (element.docente == 'Asociado MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoMTO.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      } else if (element.docente == 'Auxiliar MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarMTO.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      }
    }
    if (tipo == 'TCO') {
      if (element.docente == 'Titular TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularTCO.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      } if (element.docente == 'Asistente TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteTCO.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      } if (element.docente == 'Asociado TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoTCO.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      } if (element.docente == 'Auxiliar TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarTCO.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      }
    }
    if (tipo == 'Prestacional') {
      if (element.docente == 'Hora Catedra Titular') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularPrestacional.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asistente') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistentePrestacional.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asociado') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoPrestacional.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Auxiliar') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarPrestacional.salud) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].aportesSaludPrivada = valor;
        return valor;
      }
    }
    if (tipo == 'Honorarios') {
      return 'N/A';
    }
  }

  getTotalAportesCesantias(tipo, rowIndex, element) {
    if (tipo == 'MTO') {
      if (element.docente == 'Titular MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularMTO.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      } else if (element.docente == 'Asistente MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteMTO.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      } else if (element.docente == 'Asociado MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoMTO.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      } else if (element.docente == 'Auxiliar MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarMTO.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      }
    }
    if (tipo == 'TCO') {
      if (element.docente == 'Titular TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularTCO.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      } if (element.docente == 'Asistente TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteTCO.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      } if (element.docente == 'Asociado TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoTCO.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      } if (element.docente == 'Auxiliar TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarTCO.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      }
    }
    if (tipo == 'Prestacional') {
      if (element.docente == 'Hora Catedra Titular') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularPrestacional.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asistente') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistentePrestacional.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asociado') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoPrestacional.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Auxiliar') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarPrestacional.cesantias) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesCesantias = valor;
        return valor;
      }
    }
    if (tipo == 'Honorarios') {
      return 'N/A';
    }
  }

  getTotalAportesRiesgos(tipo, rowIndex, element) {
    if (tipo == 'MTO') {
      if (element.docente == 'Titular MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularMTO.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      } else if (element.docente == 'Asistente MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteMTO.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      } else if (element.docente == 'Asociado MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoMTO.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      } else if (element.docente == 'Auxiliar MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarMTO.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      }
    }
    if (tipo == 'TCO') {
      if (element.docente == 'Titular TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularTCO.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      } if (element.docente == 'Asistente TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteTCO.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      } if (element.docente == 'Asociado TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoTCO.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      } if (element.docente == 'Auxiliar TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarTCO.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      }
    }
    if (tipo == 'Prestacional') {
      if (element.docente == 'Hora Catedra Titular') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularPrestacional.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asistente') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistentePrestacional.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asociado') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoPrestacional.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Auxiliar') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarPrestacional.arl) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].totalAportesRiesgos = valor;
        return valor;
      }
    }
    if (tipo == 'Honorarios') {
      return 'N/A';
    }
  }

  getAportesICBF(tipo, rowIndex, element) {
    if (tipo == 'MTO') {
      if (element.docente == 'Titular MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularMTO.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].aportesICBF = valor;
        return valor;
      } else if (element.docente == 'Asistente MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteMTO.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].aportesICBF = valor;
        return valor;
      } else if (element.docente == 'Asociado MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoMTO.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].aportesICBF = valor;
        return valor;
      } else if (element.docente == 'Auxiliar MTO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarMTO.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceMTO.data[rowIndex].aportesICBF = valor;
        return valor;
      }
    }
    if (tipo == 'TCO') {
      if (element.docente == 'Titular TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularTCO.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].aportesICBF = valor;
        return valor;
      } if (element.docente == 'Asistente TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistenteTCO.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].aportesICBF = valor;
        return valor;
      } if (element.docente == 'Asociado TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoTCO.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].aportesICBF = valor;
        return valor;
      } if (element.docente == 'Auxiliar TCO') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarTCO.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourceTCO.data[rowIndex].aportesICBF = valor;
        return valor;
      }
    }
    if (tipo == 'Prestacional') {
      if (element.docente == 'Hora Catedra Titular') {
        let valor = parseFloat(((((element.cantidadHoras * this.titularPrestacional.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].aportesICBF = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asistente') {
        let valor = parseFloat(((((element.cantidadHoras * this.asistentePrestacional.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].aportesICBF = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Asociado') {
        let valor = parseFloat(((((element.cantidadHoras * this.asociadoPrestacional.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].aportesICBF = valor;
        return valor;
      } else if (element.docente == 'Hora Catedra Auxiliar') {
        let valor = parseFloat(((((element.cantidadHoras * this.auxiliarPrestacional.icbf) / 5) * 30) * element.cantidad).toFixed(2))
        this.dataSourcePrestacional.data[rowIndex].aportesICBF = valor;
        return valor;
      }
    }
    if (tipo == 'Honorarios') {
      return 'N/A';
    }
  }
  //////////////


  // Funciones para valores totales de la tabla ///
  getValorTotal(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.totalMTO = this.dataSourceMTO.data.map(t => t.total).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.totalMTO >> 0.00) {
          return this.totalMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.totalTCO = this.dataSourceTCO.data.map(t => t.total).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.totalTCO >> 0.00) {
          return this.totalTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.totalPrestacional = this.dataSourcePrestacional.data.map(t => t.total).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.totalPrestacional >> 0.00) {
          return this.totalPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.totalHonorarios = this.dataSourceHonorarios.data.map(t => t.total).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.totalHonorarios >> 0.00) {
          return this.totalHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
  }

  getCantidad(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.cantidadMTO = this.dataSourceMTO.data.map(t => t.cantidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.cantidadMTO >> 0.00) {
          return this.cantidadMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.cantidadTCO = this.dataSourceTCO.data.map(t => t.cantidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.cantidadTCO >> 0.00) {
          return this.cantidadTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.cantidadPrestacional = this.dataSourcePrestacional.data.map(t => t.cantidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.cantidadPrestacional >> 0.00) {
          return this.cantidadPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.cantidadHonorarios = this.dataSourceHonorarios.data.map(t => t.cantidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.cantidadHonorarios >> 0.00) {
          return this.cantidadHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
  }

  getValorSueldo(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorSueldoMTO = this.dataSourceMTO.data.map(t => t.sueldoBasico).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorSueldoMTO >> 0.00) {
          return this.valorSueldoMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorSueldoTCO = this.dataSourceTCO.data.map(t => t.sueldoBasico).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorSueldoTCO >> 0.00) {
          return this.valorSueldoTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorSueldoPrestacional = this.dataSourcePrestacional.data.map(t => t.sueldoBasico).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorSueldoPrestacional >> 0.00) {
          return this.valorSueldoPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorSueldoHonorarios = this.dataSourceHonorarios.data.map(t => t.sueldoBasico).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorSueldoHonorarios >> 0.00) {
          return this.valorSueldoHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
  }

  getValorPrimaNavidad(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorPrimaNavidadMTO = this.dataSourceMTO.data.map(t => t.primaNavidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaNavidadMTO >> 0.00) {
          return this.valorPrimaNavidadMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorPrimaNavidadTCO = this.dataSourceTCO.data.map(t => t.primaNavidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaNavidadTCO >> 0.00) {
          return this.valorPrimaNavidadTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorPrimaNavidadPrestacional = this.dataSourcePrestacional.data.map(t => t.primaNavidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaNavidadPrestacional >> 0.00) {
          return this.valorPrimaNavidadPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      return 0;
    }
  }

  getValorPrimaVacaciones(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorPrimaVacacionesMTO = this.dataSourceMTO.data.map(t => t.primaVacaciones).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaVacacionesMTO >> 0.00) {
          return this.valorPrimaVacacionesMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorPrimaVacacionesTCO = this.dataSourceTCO.data.map(t => t.primaVacaciones).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaVacacionesTCO >> 0.00) {
          return this.valorPrimaVacacionesTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorPrimaVacacionesPrestacional = this.dataSourcePrestacional.data.map(t => t.primaVacaciones).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaVacacionesPrestacional >> 0.00) {
          return this.valorPrimaVacacionesPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      return 0;
    }
  }

  getValorPensionesPublicas(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorPensionesPublicasMTO = this.dataSourceMTO.data.map(t => t.aportesPensionesPublicas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPensionesPublicasMTO >> 0.00) {
          return this.valorPensionesPublicasMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorPensionesPublicasTCO = this.dataSourceTCO.data.map(t => t.aportesPensionesPublicas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPensionesPublicasTCO >> 0.00) {
          return this.valorPensionesPublicasTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorPensionesPublicasPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesPensionesPublicas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPensionesPublicasPrestacional >> 0.00) {
          return this.valorPensionesPublicasPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      return 0;
    }
  }

  getValorPensionesPrivadas(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorPensionesPrivadasMTO = this.dataSourceMTO.data.map(t => t.aportesPensionesPrivadas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPensionesPrivadasMTO >> 0.00) {
          return this.valorPensionesPrivadasMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorPensionesPrivadasTCO = this.dataSourceTCO.data.map(t => t.aportesPensionesPrivadas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPensionesPrivadasTCO >> 0.00) {
          return this.valorPensionesPrivadasTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorPensionesPrivadasPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesPensionesPrivadas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPensionesPrivadasPrestacional >> 0.00) {
          return this.valorPensionesPrivadasPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      return 0;
    }
  }

  getValorSaludPrivada(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorSaludPrivadaMTO = this.dataSourceMTO.data.map(t => t.aportesSaludPrivada).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorSaludPrivadaMTO >> 0.00) {
          return this.valorSaludPrivadaMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorSaludPrivadaTCO = this.dataSourceTCO.data.map(t => t.aportesSaludPrivada).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorSaludPrivadaTCO >> 0.00) {
          return this.valorSaludPrivadaTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorSaludPrivadaPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesSaludPrivada).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorSaludPrivadaPrestacional >> 0.00) {
          return this.valorSaludPrivadaPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      return 0;
    }
  }

  getValorCesantiasPublicos(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorCesantiasPublicosMTO = this.dataSourceMTO.data.map(t => t.aportesCesantiasPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorCesantiasPublicosMTO >> 0.00) {
          return this.valorCesantiasPublicosMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorCesantiasPublicosTCO = this.dataSourceTCO.data.map(t => t.aportesCesantiasPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorCesantiasPublicosTCO >> 0.00) {
          return this.valorCesantiasPublicosTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorCesantiasPublicosPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesCesantiasPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorCesantiasPublicosPrestacional >> 0.00) {
          return this.valorCesantiasPublicosPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      return 0;
    }
  }

  getValorCesantiasPrivados(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorCesantiasPrivadosMTO = this.dataSourceMTO.data.map(t => t.aportesCesantiasPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorCesantiasPrivadosMTO >> 0.00) {
          return this.valorCesantiasPrivadosMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorCesantiasPrivadosTCO = this.dataSourceTCO.data.map(t => t.aportesCesantiasPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorCesantiasPrivadosTCO >> 0.00) {
          return this.valorCesantiasPrivadosTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorCesantiasPrivadosPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesCesantiasPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorCesantiasPrivadosPrestacional >> 0.00) {
          return this.valorCesantiasPrivadosPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      return 0;
    }
  }

  getValorRiesgoPublicos(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorRiesgoPublicosMTO = this.dataSourceMTO.data.map(t => t.aportesRiesgoPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorRiesgoPublicosMTO >> 0.00) {
          return this.valorRiesgoPublicosMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorRiesgoPublicosTCO = this.dataSourceTCO.data.map(t => t.aportesRiesgoPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorRiesgoPublicosTCO >> 0.00) {
          return this.valorRiesgoPublicosTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorRiesgoPublicosPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesRiesgoPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorRiesgoPublicosPrestacional >> 0.00) {
          return this.valorRiesgoPublicosPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      return 0;
    }
  }

  getValorRiesgoPrivados(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorRiesgoPrivadosMTO = this.dataSourceMTO.data.map(t => t.aportesRiesgoPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorRiesgoPrivadosMTO >> 0.00) {
          return this.valorRiesgoPrivadosMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorRiesgoPrivadosTCO = this.dataSourceTCO.data.map(t => t.aportesRiesgoPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorRiesgoPrivadosTCO >> 0.00) {
          return this.valorRiesgoPrivadosTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorRiesgoPrivadosPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesRiesgoPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorRiesgoPrivadosPrestacional >> 0.00) {
          return this.valorRiesgoPrivadosPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      return 0;
    }
  }

  getValorICBF(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorICBFMTO = this.dataSourceMTO.data.map(t => t.aportesICBF).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorICBFMTO >> 0.00) {
          return this.valorICBFMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorICBFTCO = this.dataSourceTCO.data.map(t => t.aportesICBF).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorICBFTCO >> 0.00) {
          return this.valorICBFTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorICBFPrestacional = this.dataSourcePrestacional.data.map(t => t.aportesICBF).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorICBFPrestacional >> 0.00) {
          return this.valorICBFPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      return 0;
    }
  }

  //Total por registro
  getTotal(element, rowIndex, tipo): number {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorMTO = parseFloat((element.sueldoBasico + element.primaNavidad + element.primaVacaciones + element.totalAportesPensiones + element.aportesSaludPrivada + element.totalAportesCesantias +
          element.totalAportesRiesgos + element.aportesICBF).toFixed(2))
        if (this.valorMTO >> 0.00) {
          this.dataSourceMTO.data[rowIndex].total = this.valorMTO;
          return this.valorMTO;
        } else {
          this.dataSourceMTO.data[rowIndex].total = this.valorMTO;
          return 0
        }
      } else {
        return 0;
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorTCO = parseFloat((element.sueldoBasico + element.primaNavidad + element.primaVacaciones + element.aportesPensionesPublicas +
          element.aportesPensionesPrivadas + element.aportesSaludPrivada + element.aportesCesantiasPublicos + element.aportesCesantiasPrivados +
          element.aportesRiesgoPublicos + element.aportesRiesgoPrivados + element.aportesICBF).toFixed(2))
        if (this.valorTCO >> 0.00) {
          this.dataSourceTCO.data[rowIndex].total = this.valorTCO;
          return this.valorTCO;
        } else {
          this.dataSourceTCO.data[rowIndex].total = this.valorTCO;
          return 0;
        }
      } else {
        return 0;
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorPrestacional = parseFloat((element.sueldoBasico + element.primaNavidad + element.primaVacaciones + element.aportesPensionesPublicas +
          element.aportesPensionesPrivadas + element.aportesSaludPrivada + element.aportesCesantiasPublicos + element.aportesCesantiasPrivados +
          element.aportesRiesgoPublicos + element.aportesRiesgoPrivados + element.aportesICBF).toFixed(2))
        if (this.valorPrestacional >> 0.00) {
          this.dataSourcePrestacional.data[rowIndex].total = this.valorPrestacional;
          return this.valorPrestacional;
        } else {
          this.dataSourcePrestacional.data[rowIndex].total = this.valorPrestacional;
          return 0;
        }
      } else {
        return 0;
      }
    }
    if (tipo == 'Honorarios') {
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorHonorarios = parseFloat((element.sueldoBasico).toFixed(2))
        if (this.valorHonorarios >> 0.00) {
          this.dataSourceHonorarios.data[rowIndex].total = this.valorHonorarios;
          return this.valorHonorarios;
        } else {
          this.dataSourceHonorarios.data[rowIndex].total = this.valorHonorarios;
          return 0;
        }
      } else {
        return 0;
      }
    }
  }

  guardarRecursos() {

    if (this.verificarSumasPensiones()) {
      let arreglo: string[] = [];
      this.accionBoton = 'guardar';
      this.tipoIdenti = 'docentes';
      let accion = this.accionBoton;
      let identi = this.tipoIdenti;
      var identificaciones: any;
      let data = this.dataSourceMTO.data;
  
      for (var i in data) {
        var obj = data[i];
        obj["activo"] = true;
        var num = +i + 1;
        obj["index"] = num.toString();
      }
      let dataMtoS = JSON.stringify(Object.assign({}, data));
  
      data = this.dataSourceTCO.data
      for (var i in data) {
        var obj = data[i];
        obj["activo"] = true;
        var num = +i + 1;
        obj["index"] = num.toString();
      }
      let dataTcoS = JSON.stringify(Object.assign({}, data));
  
  
      data = this.dataSourcePrestacional.data
      for (var i in data) {
        var obj = data[i];
        obj["activo"] = true;
        var num = +i + 1;
        obj["index"] = num.toString();
      }
      let dataPrestacionalS = JSON.stringify(Object.assign({}, data));
  
  
      data = this.dataSourceHonorarios.data
      for (var i in data) {
        var obj = data[i];
        obj["activo"] = true;
        var num = +i + 1;
        obj["index"] = num.toString();
      }
      let dataHonorariosS = JSON.stringify(Object.assign({}, data));
      identificaciones = {
        "mto": dataMtoS,
        "tco": dataTcoS,
        "prestacional": dataPrestacionalS,
        "honorarios": dataHonorariosS
      }
      let aux = JSON.stringify(Object.assign({}, identificaciones));
  
      this.request.put(environment.PLANES_MID, `formulacion/guardar_identificacion`, aux, this.plan + `/61897518f6fc97091727c3c3`).subscribe((data: any) => {
        if (data) {
          Swal.fire({
            title: 'Guardado exitoso',
            icon: 'success',
            showConfirmButton: false,
            timer: 3500
          })
          this.acciones.emit({ aux, accion, identi });
        }
      })
      Swal.fire({
        title: 'Guardado exitoso',
        icon: 'success',
        showConfirmButton: false,
        timer: 3500
      })
      this.acciones.emit({ data, accion, identi });
    } else {
      Swal.fire({
        title: 'Error en la operación',
        text: `Por favor verifique los datos ingresados en pensiones, cesantias  y riesgos.`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 3500
      })
    }

  }

  ocultarRecursos() {
    this.accionBoton = 'ocultar';
    this.tipoIdenti = 'docentes';
    let data = this.dataSource.data;
    let accion = this.accionBoton;
    let identi = this.tipoIdenti;
    this.acciones.emit({ data, accion, identi });
  }

  sumasTotales(tipo) {
    if (tipo == 'cantidad') {
      this.totalCantidad = parseFloat((this.cantidadMTO + this.cantidadTCO + this.cantidadPrestacional + this.cantidadHonorarios).toFixed(2))
      return this.totalCantidad
    }
    if (tipo == 'sueldo') {
      this.totalSueldo = parseFloat((this.valorSueldoMTO + this.valorSueldoTCO + this.valorSueldoPrestacional + this.valorSueldoHonorarios).toFixed(2))
      return this.totalSueldo
    }
    if (tipo == 'primaNavidad') {
      this.totalPrimaNavidad = parseFloat((this.valorPrimaNavidadMTO + this.valorPrimaNavidadTCO + this.valorPrimaNavidadPrestacional).toFixed(2))
      return this.totalPrimaNavidad
    }
    if (tipo == 'primaVacaciones') {
      this.totalPrimaVacaciones = parseFloat((this.valorPrimaVacacionesMTO + this.valorPrimaVacacionesTCO + this.valorPrimaVacacionesPrestacional).toFixed(2))
      return this.totalPrimaVacaciones
    }
    if (tipo == 'pensionesPublicas') {
      this.totalPensionesPublicas = parseFloat((this.valorPensionesPublicasMTO + this.valorPensionesPublicasTCO + this.valorPensionesPublicasPrestacional).toFixed(2))
      return this.totalPensionesPublicas
    }
    if (tipo == 'pensionesPrivadas') {
      this.totalPensionesPrivadas = parseFloat((this.valorPensionesPrivadasMTO + this.valorPensionesPrivadasTCO + this.valorPensionesPrivadasPrestacional).toFixed(2))
      return this.totalPensionesPrivadas
    }
    if (tipo == 'saludPrivada') {
      this.totalSaludPrivada = parseFloat((this.valorSaludPrivadaMTO + this.valorSaludPrivadaTCO + this.valorSaludPrivadaPrestacional).toFixed(2))
      return this.totalSaludPrivada
    }
    if (tipo == 'cesantiasPublicos') {
      this.totalCesantiasPublicos = parseFloat((this.valorCesantiasPublicosMTO + this.valorCesantiasPublicosTCO + this.valorCesantiasPublicosPrestacional).toFixed(2))
      return this.totalCesantiasPublicos
    }
    if (tipo == 'cesantiasPrivados') {
      this.totalCesantiasPrivados = parseFloat((this.valorCesantiasPrivadosMTO + this.valorCesantiasPrivadosTCO + this.valorCesantiasPrivadosPrestacional).toFixed(2))
      return this.totalCesantiasPrivados
    }
    if (tipo == 'riesgoPublico') {
      this.totalRiesgoPublicos = parseFloat((this.valorRiesgoPublicosMTO + this.valorRiesgoPublicosTCO + this.valorRiesgoPublicosPrestacional).toFixed(2))
      return this.totalRiesgoPublicos
    }
    if (tipo == 'riesgoPrivado') {
      this.totalRiesgoPrivados = parseFloat((this.valorSaludPrivadaMTO + this.valorSaludPrivadaTCO + this.valorSaludPrivadaPrestacional).toFixed(2))
      return this.totalRiesgoPrivados
    }
    if (tipo == 'icbf') {
      this.totalIcfb = parseFloat((this.valorICBFMTO + this.valorICBFTCO + this.valorICBFPrestacional).toFixed(2))
      return this.totalIcfb
    }
    if (tipo == 'total') {
      this.totalTotal = parseFloat((this.totalMTO + this.totalTCO + this.totalPrestacional + this.totalHonorarios).toFixed(2))
      return this.totalTotal
    }
  }

  verificarSumasPensiones(): boolean {
    for (let i = 0; i < 4; i++) {
      if (Number((this.dataSourceMTO.data[i].aportesPensionesPublicas).toFixed(0)) + Number((this.dataSourceMTO.data[i].aportesPensionesPrivadas).toFixed(0)) != Number((this.dataSourceMTO.data[i].totalAportesPensiones).toFixed(0))) {
        return false
      }
    }
    for (let i = 0; i < 4; i++) {
      if (Number((this.dataSourceTCO.data[i].aportesPensionesPublicas).toFixed(0)) + Number((this.dataSourceTCO.data[i].aportesPensionesPrivadas).toFixed(0)) != Number((this.dataSourceTCO.data[i].totalAportesPensiones).toFixed(0))) {
        return false
      }
    }
    for (let i = 0; i < 4; i++) {
      if (Number((this.dataSourcePrestacional.data[i].aportesPensionesPublicas).toFixed(0)) + Number((this.dataSourcePrestacional.data[i].aportesPensionesPrivadas).toFixed(0)) != Number((this.dataSourcePrestacional.data[i].totalAportesPensiones).toFixed(0))) {
        return false
      }
    }
    return true;
  }

  verificarSumasCesantias(): boolean {
    for (let i = 0; i < 4; i++) {
      if (Number((this.dataSourceMTO.data[i].aportesCesantiasPublicos).toFixed(0)) + Number((this.dataSourceMTO.data[i].aportesCesantiasPrivados).toFixed(0)) != Number((this.dataSourceMTO.data[i].totalAportesCesantias).toFixed(0))) {
        return false
      }
    }
    for (let i = 0; i < 4; i++) {
      if (Number((this.dataSourceTCO.data[i].aportesCesantiasPublicos).toFixed(0)) + Number((this.dataSourceTCO.data[i].aportesPensionesPrivadas).toFixed(0)) != Number((this.dataSourceTCO.data[i].totalAportesCesantias).toFixed(0))) {
          return false
      }
    }
    for (let i = 0; i < 4; i++) {
      if (Number((this.dataSourcePrestacional.data[i].aportesCesantiasPublicos).toFixed(0)) + Number((this.dataSourcePrestacional.data[i].aportesCesantiasPrivados).toFixed(0)) != Number((this.dataSourcePrestacional.data[i].totalAportesCesantias).toFixed(0))) {
        return false
      }
    }
    return true;
  }

  verificarSumasRiesgos(): boolean {
    for (let i = 0; i < 4; i++) {
      if (Number((this.dataSourceMTO.data[i].aportesRiesgoPublicos).toFixed(0)) + Number((this.dataSourceMTO.data[i].aportesRiesgoPrivados).toFixed(0)) != Number((this.dataSourceMTO.data[i].totalAportesRiesgos).toFixed(0))) {
        return false
      }
    }
    for (let i = 0; i < 4; i++) {
      if (Number((this.dataSourceTCO.data[i].aportesRiesgoPublicos).toFixed(0)) + Number((this.dataSourceTCO.data[i].aportesRiesgoPrivados).toFixed(0)) != Number((this.dataSourceTCO.data[i].totalAportesRiesgos).toFixed(0))) {
          return false
      }
    }
    for (let i = 0; i < 4; i++) {
      if (Number((this.dataSourcePrestacional.data[i].aportesRiesgoPublicos).toFixed(0)) + Number((this.dataSourcePrestacional.data[i].aportesRiesgoPrivados).toFixed(0)) != Number((this.dataSourcePrestacional.data[i].totalAportesRiesgos).toFixed(0))) {
        return false
      }
    }
    return true;
  }

  inicializarTabla() {
   this.dataSourceMTO.data = [
      {
        docente: "Auxiliar MTO",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesSaludPrivada: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
      {
        docente: "Asistente MTO",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
      {
        docente: "Asociado MTO",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
      {
        docente: "Titular MTO",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesSaludPrivada: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
    ]
    this.dataSourceTCO.data = [
      {
        docente: "Auxiliar TCO",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesSaludPrivada: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
      {
        docente: "Asistente TCO",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesSaludPrivada: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
      {
        docente: "Asociado TCO",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesSaludPrivada: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
      {
        docente: "Titular TCO",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesSaludPrivada: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
    ]
    this.dataSourcePrestacional.data = [
      {
        docente: "Hora Catedra Auxiliar",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesSaludPrivada: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
      {
        docente: "Hora Catedra Asistente",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesSaludPrivada: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
      {
        docente: "Hora Catedra Asociado",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesSaludPrivada: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
      {
        docente: "Hora Catedra Titular",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 0,
        primaNavidad: 0,
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 0,
        aportesSaludPrivada: 0,
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 0,
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 0,
        aportesICBF: 0,
        total: 0
      },
    ]
    this.dataSourceHonorarios.data = [
      {
        docente: "Hora Catedra Auxiliar",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 'N/A',
        primaNavidad: 'N/A',
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 'N/A',
        aportesSaludPrivada: 'N/A',
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 'N/A',
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 'N/A',
        aportesICBF: 'N/A',
        total: 0
      },
      {
        docente: "Hora Catedra Asistente",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 'N/A',
        primaNavidad: 'N/A',
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 'N/A',
        aportesSaludPrivada: 'N/A',
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 'N/A',
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 'N/A',
        aportesICBF: 'N/A',
        total: 0
      },
      {
        docente: "Hora Catedra Asociado",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 'N/A',
        primaNavidad: 'N/A',
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 'N/A',
        aportesSaludPrivada: 'N/A',
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 'N/A',
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 'N/A',
        aportesICBF: 'N/A',
        total: 0
      },
      {
        docente: "Hora Catedra Titular",
        cantidad: 0,
        sueldoBasico: 0,
        cantidadHoras: 0,
        interesesCesantias: 'N/A',
        primaNavidad: 'N/A',
        primaVacaciones: 0,
        aportesPensionesPublicas: 0,
        aportesPensionesPrivadas: 0,
        totalAportesPensiones: 'N/A',
        aportesSaludPrivada: 'N/A',
        aportesCesantiasPublicos: 0,
        aportesCesantiasPrivados: 0,
        totalAportesCesantias: 'N/A',
        aportesRiesgoPublicos: 0,
        aportesRiesgoPrivados: 0,
        totalAportesRiesgos: 'N/A',
        aportesICBF: 'N/A',
        total: 0
      },
    ]


    this.steps = [
      {
        "nombre": "Docentes Ocasionales de Medio Tiempo (MTO)",
        "descripcion": "Recuerde que según el árticulo 01 del Acuerdo 008/2001 del Consejo Superior Universitario, el número máximo de Docentes MTO a contratar es 25",
        "footer": "Total Recursos Medio Tiempo Ocasional",
        "tipo": "MTO",
        "maxHoras": 20,
        "minHoras": 16,
        "data": this.dataSourceMTO
      },
      {
        "nombre": "Docentes Ocasionales de  Tiempo Completo (TCO)",
        "descripcion": "NA",
        "footer": "Total Recursos Tiempo Completo Ocasional",
        "tipo": 'TCO',
        "maxHoras": 40,
        "minHoras": 24,
        "data": this.dataSourceTCO
      },
      {
        "nombre": "Docentes Hora Cátedra Prestacional",
        "descripcion": "NA",
        "footer": "Total Recursos Hora Cátedra prestacional",
        "tipo": "Prestacional",
        "maxHoras": 16,
        "minHoras": 2,
        "data": this.dataSourcePrestacional
      },
      {
        "nombre": "Docentes Hora Cátedra por Honorarios",
        "descripcion": "NA",
        "footer": "Total Recursos Hora Cátedra por Honorarios",
        "tipo": "Honorarios",
        "maxHoras": 8,
        "minHoras": 4,
        "data": this.dataSourceHonorarios
      }
    ]


  }
}
