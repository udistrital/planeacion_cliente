import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';

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

  valorPrimaServiciosMTO: number;
  valorPrimaServiciosTCO: number;
  valorPrimaServiciosPrestacional: number;
  valorPrimaServiciosHonorarios: number;

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
  totalPrimaServicios: number;
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
    this.loadPlan();
    this.dataSource = new MatTableDataSource<any>();
    this.dataSourceMTO = new MatTableDataSource<any>();
    this.dataSourceTCO = new MatTableDataSource<any>();
    this.dataSourcePrestacional = new MatTableDataSource<any>();
    this.dataSourceHonorarios = new MatTableDataSource<any>();
  }

  loadPlan() {
    this.request.get(environment.PLANES_CRUD, `plan/` + this.plan).subscribe((data: any) => {
      if (data.Data != null) {
        console.log("error? load plan");
        this.Plan = data.Data;
        this.getEstado();
      }
    })
  }

  getEstado() {
    console.log("error?get estado");
    this.request.get(environment.PLANES_CRUD, `estado-plan/` + this.Plan.estado_plan_id).subscribe((data: any) => {
      if (data) {
        this.estadoPlan = data.Data.nombre;
        this.displayedColumns = this.visualizarColumnas();
        this.inicializarTabla();

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
    console.log("error?vc");
    if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = this.verificarVersiones();
        return ['docente', 'cantidad', 'sueldoBasico', 'cantidadHoras', 'interesesCesantias', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total'];
      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente', 'cantidad', 'sueldoBasico', 'cantidadHoras', 'interesesCesantias', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        console.log("deberia entrar aca");
        console.log(this.readonlyTable);
        return ['docente', 'cantidad', 'sueldoBasico', 'cantidadHoras', 'interesesCesantias', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total'];
      }
    }

    if (this.rol == 'PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente', 'cantidad', 'sueldoBasico', 'cantidadHoras', 'interesesCesantias', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total'];
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['docente', 'cantidad', 'sueldoBasico', 'cantidadHoras', 'interesesCesantias', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente', 'cantidad', 'sueldoBasico', 'cantidadHoras', 'interesesCesantias', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
          'aportesPensionesPrivadas', 'totalAportesPensiones', 'aportesSaludPrivada', 'aportesCesantiasPublicos', 'aportesCesantiasPrivados', 'totalAportesCesantias', 'aportesRiesgoPublicos',
          'aportesRiesgoPrivados', 'totalAportesRiesgos', 'aportesICBF', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['docente', 'cantidad', 'sueldoBasico', 'cantidadHoras', 'interesesCesantias', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'aportesPensionesPublicas',
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

  getValorPrimaServicios(tipo) {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorPrimaServiciosMTO = this.dataSourceMTO.data.map(t => t.primaServicios).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaServiciosMTO >> 0.00) {
          return this.valorPrimaServiciosMTO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorPrimaServiciosTCO = this.dataSourceTCO.data.map(t => t.primaServicios).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaServiciosTCO >> 0.00) {
          return this.valorPrimaServiciosTCO;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Prestacional') {
      if (this.dataSourcePrestacional.data.length !== 0) {
        this.valorPrimaServiciosPrestacional = this.dataSourcePrestacional.data.map(t => t.primaServicios).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaServiciosPrestacional >> 0.00) {
          return this.valorPrimaServiciosPrestacional;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
    if (tipo == 'Honorarios') {
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorPrimaServiciosHonorarios = this.dataSourceHonorarios.data.map(t => t.primaServicios).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaServiciosHonorarios >> 0.00) {
          return this.valorPrimaServiciosHonorarios;
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
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorPrimaNavidadHonorarios = this.dataSourceHonorarios.data.map(t => t.primaNavidad).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaNavidadHonorarios >> 0.00) {
          return this.valorPrimaNavidadHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
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
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorPrimaVacacionesHonorarios = this.dataSourceHonorarios.data.map(t => t.primaVacaciones).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPrimaVacacionesHonorarios >> 0.00) {
          return this.valorPrimaVacacionesHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
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
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorPensionesPublicasHonorarios = this.dataSourceHonorarios.data.map(t => t.aportesPensionesPublicas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPensionesPublicasHonorarios >> 0.00) {
          return this.valorPensionesPublicasHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
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
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorPensionesPrivadasHonorarios = this.dataSourceHonorarios.data.map(t => t.aportesPensionesPrivadas).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorPensionesPrivadasHonorarios >> 0.00) {
          return this.valorPensionesPrivadasHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
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
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorSaludPrivadaHonorarios = this.dataSourceHonorarios.data.map(t => t.aportesSaludPrivada).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorSaludPrivadaHonorarios >> 0.00) {
          return this.valorSaludPrivadaHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
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
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorCesantiasPublicosHonorarios = this.dataSourceHonorarios.data.map(t => t.aportesCesantiasPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorCesantiasPublicosHonorarios >> 0.00) {
          return this.valorCesantiasPublicosHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
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
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorCesantiasPrivadosHonorarios = this.dataSourceHonorarios.data.map(t => t.aportesCesantiasPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorCesantiasPrivadosHonorarios >> 0.00) {
          return this.valorCesantiasPrivadosHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
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
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorRiesgoPublicosHonorarios = this.dataSourceHonorarios.data.map(t => t.aportesRiesgoPublicos).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorRiesgoPublicosHonorarios >> 0.00) {
          return this.valorRiesgoPublicosHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
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
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorRiesgoPrivadosHonorarios = this.dataSourceHonorarios.data.map(t => t.aportesRiesgoPrivados).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorRiesgoPrivadosHonorarios >> 0.00) {
          return this.valorRiesgoPrivadosHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
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
      if (this.dataSourceHonorarios.data.length !== 0) {
        this.valorICBFHonorarios = this.dataSourceHonorarios.data.map(t => t.aportesICBF).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
        if (this.valorICBFHonorarios >> 0.00) {
          return this.valorICBFHonorarios;
        } else {
          return '0';
        }
      } else {
        return '0';
      }
    }
  }

  //Total por registro
  getTotal(element, rowIndex, tipo): number {
    if (tipo == 'MTO') {
      if (this.dataSourceMTO.data.length !== 0) {
        this.valorMTO = parseFloat((element.sueldoBasico + element.primaServicios + element.primaNavidad + element.primaVacaciones + element.aportesPensionesPublicas +
          element.aportesPensionesPrivadas + element.aportesSaludPrivada + element.aportesCesantiasPublicos + element.aportesCesantiasPrivados +
          element.aportesRiesgoPublicos + element.aportesRiesgoPrivados + element.aportesICBF).toFixed(2))
        if (this.valorMTO >> 0.00) {
          this.dataSourceMTO.data[rowIndex].total = this.valorMTO;
          return this.valorMTO;
        } else {
          this.dataSourceMTO.data[rowIndex].total = this.valorMTO;
          return 0;
        }
      } else {
        return 0;
      }
    }
    if (tipo == 'TCO') {
      if (this.dataSourceTCO.data.length !== 0) {
        this.valorTCO = parseFloat((element.sueldoBasico + element.primaServicios + element.primaNavidad + element.primaVacaciones + element.aportesPensionesPublicas +
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
        this.valorPrestacional = parseFloat((element.sueldoBasico + element.primaServicios + element.primaNavidad + element.primaVacaciones + element.aportesPensionesPublicas +
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
        this.valorHonorarios = parseFloat((element.sueldoBasico + element.primaServicios + element.primaNavidad + element.primaVacaciones + element.aportesPensionesPublicas +
          element.aportesPensionesPrivadas + element.aportesSaludPrivada + element.aportesCesantiasPublicos + element.aportesCesantiasPrivados +
          element.aportesRiesgoPublicos + element.aportesRiesgoPrivados + element.aportesICBF).toFixed(2))
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
    this.accionBoton = 'guardar';
    this.tipoIdenti = 'docentes';
    let data = this.dataSource.data;
    let accion = this.accionBoton;
    let identi = this.tipoIdenti;
    Swal.fire({
      title: 'Guardado exitoso',
      icon: 'success',
      showConfirmButton: false,
      timer: 3500
    })
    this.acciones.emit({ data, accion, identi });
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
    if (tipo == 'primaServicios') {
      this.totalPrimaServicios = parseFloat((this.valorPrimaServiciosMTO + this.valorPrimaServiciosTCO + this.valorPrimaServiciosPrestacional + this.valorPrimaServiciosHonorarios).toFixed(2))
      return this.totalPrimaServicios
    }
    if (tipo == 'primaNavidad') {
      this.totalPrimaNavidad = parseFloat((this.valorPrimaNavidadMTO + this.valorPrimaNavidadTCO + this.valorPrimaNavidadPrestacional + this.valorPrimaNavidadHonorarios).toFixed(2))
      return this.totalPrimaNavidad
    }
    if (tipo == 'primaVacaciones') {
      this.totalPrimaVacaciones = parseFloat((this.valorPrimaVacacionesMTO + this.valorPrimaVacacionesTCO + this.valorPrimaVacacionesPrestacional + this.valorPrimaVacacionesHonorarios).toFixed(2))
      return this.totalPrimaVacaciones
    }
    if (tipo == 'pensionesPublicas') {
      this.totalPensionesPublicas = parseFloat((this.valorPensionesPublicasMTO + this.valorPensionesPublicasTCO + this.valorPensionesPublicasPrestacional + this.valorPensionesPublicasHonorarios).toFixed(2))
      return this.totalPensionesPublicas
    }
    if (tipo == 'pensionesPrivadas') {
      this.totalPensionesPrivadas = parseFloat((this.valorPensionesPrivadasMTO + this.valorPensionesPrivadasTCO + this.valorPensionesPrivadasPrestacional + this.valorPensionesPrivadasHonorarios).toFixed(2))
      return this.totalPensionesPrivadas
    }
    if (tipo == 'saludPrivada') {
      this.totalSaludPrivada = parseFloat((this.valorSaludPrivadaMTO + this.valorSaludPrivadaTCO + this.valorSaludPrivadaPrestacional + this.valorSaludPrivadaHonorarios).toFixed(2))
      return this.totalSaludPrivada
    }
    if (tipo == 'cesantiasPublicos') {
      this.totalCesantiasPublicos = parseFloat((this.valorCesantiasPublicosMTO + this.valorCesantiasPublicosTCO + this.valorCesantiasPublicosPrestacional + this.valorCesantiasPublicosHonorarios).toFixed(2))
      return this.totalCesantiasPublicos
    }
    if (tipo == 'cesantiasPrivados') {
      this.totalCesantiasPrivados = parseFloat((this.valorCesantiasPrivadosMTO + this.valorCesantiasPrivadosTCO + this.valorCesantiasPrivadosPrestacional + this.valorCesantiasPrivadosHonorarios).toFixed(2))
      return this.totalCesantiasPrivados
    }
    if (tipo == 'riesgoPublico') {
      this.totalRiesgoPublicos = parseFloat((this.valorRiesgoPublicosMTO + this.valorRiesgoPublicosTCO + this.valorRiesgoPublicosPrestacional + this.valorRiesgoPublicosHonorarios).toFixed(2))
      return this.totalRiesgoPublicos
    }
    if (tipo == 'riesgoPrivado') {
      this.totalRiesgoPrivados = parseFloat((this.valorSaludPrivadaMTO + this.valorSaludPrivadaTCO + this.valorSaludPrivadaPrestacional + this.valorSaludPrivadaHonorarios).toFixed(2))
      return this.totalRiesgoPrivados
    }
    if (tipo == 'icbf') {
      this.totalIcfb = parseFloat((this.valorICBFMTO + this.valorICBFTCO + this.valorICBFPrestacional + this.valorICBFHonorarios).toFixed(2))
      return this.totalIcfb
    }
    if (tipo == 'total') {
      this.totalTotal = parseFloat((this.totalMTO + this.totalTCO + this.totalPrestacional + this.totalHonorarios).toFixed(2))
      return this.totalTotal
    }
  }

  inicializarTabla() {
    if (this.rol == 'PLANEACION') {
      console.log("entra a planeacion")
      this.dataTableMTO = [
        {
          docente: "Auxiliar MTO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Asistente MTO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Asociado MTO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Titular MTO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
      ]
      this.dataTableTCO = [
        {
          docente: "Auxiliar TCO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Asistente TCO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Asociado TCO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Titular TCO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
      ]
      this.dataTablePrestacional = [
        {
          docente: "Hora Catedra Auxiliar",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Hora Catedra Asistente",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Hora Catedra Asociado",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Hora Catedra Titular",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
      ]
      this.dataTableHonorarios = [
        {
          docente: "Hora Catedra Auxiliar",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Hora Catedra Asistente",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Hora Catedra Asociado",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
        {
          docente: "Hora Catedra Titular",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0,
          observaciones: ''
        },
      ]
    } else {
      this.dataTableMTO = [
        {
          docente: "Auxiliar MTO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Asistente MTO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Asociado MTO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Titular MTO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
      ]
      this.dataTableTCO = [
        {
          docente: "Auxiliar TCO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Asistente TCO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Asociado TCO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Titular TCO",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
      ]
      this.dataTablePrestacional = [
        {
          docente: "Hora Catedra Auxiliar",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Hora Catedra Asistente",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Hora Catedra Asociado",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Hora Catedra Titular",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
      ]
      this.dataTableHonorarios = [
        {
          docente: "Hora Catedra Auxiliar",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Hora Catedra Asistente",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Hora Catedra Asociado",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
        {
          docente: "Hora Catedra Titular",
          cantidad: 0,
          sueldoBasico: 0,
          primaServicios: 0,
          primaNavidad: 0,
          primaVacaciones: 0,
          aportesPensionesPublicas: 0,
          aportesPensionesPrivadas: 0,
          aportesSaludPrivada: 0,
          aportesCesantiasPublicos: 0,
          aportesCesantiasPrivados: 0,
          aportesRiesgoPublicos: 0,
          aportesRiesgoPrivados: 0,
          aportesICBF: 0,
          total: 0
        },
      ]
    }



    console.log("error aui seguro");
    this.dataSourceMTO.data = this.dataTableMTO;
    this.dataSourceTCO.data = this.dataTableTCO;
    this.dataSourcePrestacional.data = this.dataTablePrestacional;
    this.dataSourceHonorarios.data = this.dataTableHonorarios;
    console.log("error aui seguro");
    this.steps = [
      {
        "nombre": "Docentes Ocasionales de Medio Tiempo (MTO)",
        "descripcion": "Recuerde que según el árticulo 01 del Acuerdo 008/2001 del Consejo Superior Universitario, el número máximo de Docentes MTO a contratar es 25",
        "footer": "Total Recursos Medio Tiempo Ocasional",
        "tipo": "MTO",
        "data": this.dataSourceMTO
      },
      {
        "nombre": "Docentes Ocasionales de  Tiempo Completo (TCO)",
        "descripcion": "NA",
        "footer": "Total Recursos Tiempo Completo Ocasional",
        "tipo": 'TCO',
        "data": this.dataSourceTCO
      },
      {
        "nombre": "Docentes Hora Cátedra Prestacional",
        "descripcion": "NA",
        "footer": "Total Recursos Hora Cátedra prestacional",
        "tipo": "Prestacional",
        "data": this.dataSourcePrestacional
      },
      {
        "nombre": "Docentes Hora Cátedra por Honorarios",
        "descripcion": "NA",
        "footer": "Total Recursos Hora Cátedra por Honorarios",
        "tipo": "Honorarios",
        "data": this.dataSourceHonorarios
      }
    ]
  }
}
