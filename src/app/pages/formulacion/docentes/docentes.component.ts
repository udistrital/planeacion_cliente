import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';
import { FormControl, Validators } from '@angular/forms';
import { isNumeric } from 'rxjs/internal-compatibility';
import { formatCurrency, getCurrencySymbol } from '@angular/common';
import { rubros_aux } from '../recursos/rubros';

@Component({
  selector: 'app-docentes',
  templateUrl: './docentes.component.html',
  styleUrls: ['./docentes.component.scss']
})
export class DocentesComponent implements OnInit {

  steps: any[];
  rubros: any[];
  displayedColumns: string[];
  displayedHeaders: string[];
  activedStep = 0;
  dataSourceRHF: MatTableDataSource<any>;
  dataSourceRHVPRE: MatTableDataSource<any>;
  dataSourceRHVPOS: MatTableDataSource<any>;
  dataSourceRubros: MatTableDataSource<any>;
  vigenciaConsulta: any;
  banderaCerrar: boolean = false;
  banderaEsperaRubros: boolean = false;

  accionBoton: string;
  tipoIdenti: string;
  Plan: any;
  estadoPlan: string;
  readonlyObs: boolean;
  readonlyTable: boolean = false;
  mostrarObservaciones: boolean;

  data: any;
  banderaSumasPensiones: boolean = false;

  //valores desagregado
  titularMTO: any;
  titularTCO: any;
  titularPrestacional: any;
  titularHonorarios: any;
  titularPrestacionalPOS: any;
  titularHonorariosPOS: any;
  titularUDPrestacionalPOS: any;
  titularUDHonorariosPOS: any;

  auxiliarMTO: any;
  auxiliarTCO: any;
  auxiliarPrestacional: any;
  auxiliarHonorarios: any;

  asistenteMTO: any;
  asistenteTCO: any;
  asistentePrestacional: any;
  asistenteHonorarios: any;
  asistentePrestacionalPOS: any;
  asistenteHonorariosPOS: any;
  asistenteUDPrestacionalPOS: any;
  asistenteUDHonorariosPOS: any;

  asociadoMTO: any;
  asociadoTCO: any;
  asociadoPrestacional: any;
  asociadoHonorarios: any;
  asociadoPrestacionalPOS: any;
  asociadoHonorariosPOS: any;
  asociadoUDPrestacionalPOS: any;
  asociadoUDHonorariosPOS: any;

  incrementoInput = new FormControl('9.5');
  incremento: number = 0.0;
  incrementoAnterior: number = 0.0;
  //
  @ViewChild(MatPaginator) paginatorRHF: MatPaginator;
  @ViewChild(MatPaginator) paginatorRHVPRE: MatPaginator;
  @ViewChild(MatPaginator) paginatorRHVPOS: MatPaginator;
  @ViewChild(MatSort) sortRHF: MatSort;
  @ViewChild(MatSort) sortRHVPRE: MatSort;
  @ViewChild(MatSort) sortRHVPOS: MatSort;
  @Input() dataTabla: boolean;
  @Input() plan: string;
  @Input() rol: string;
  @Input() versiones: any[];
  @Input() vigencia: any;
  @Output() acciones = new EventEmitter<any>();
  constructor(private request: RequestManager) {
    this.loadRubros();
  }

  ngOnInit(): void {
    this.dataSourceRHF = new MatTableDataSource<any>();
    this.dataSourceRHVPRE = new MatTableDataSource<any>();
    this.dataSourceRHVPOS = new MatTableDataSource<any>();
    this.dataSourceRubros = new MatTableDataSource<any>();
    this.loadPlan();
    this.loadVigenciaConsulta();
    this.loadTabla();
  }

  loadRubros() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.rubros = rubros_aux
    Swal.close();

    /*this.request.get(environment.PLANES_MID, `formulacion/get_rubros`).subscribe((data: any) => {
      this.rubros = data.Data;
      Swal.close();
      Swal.fire({
        icon: 'info',
        text: 'La selección de rubros ha cargado correctamente.',
        showConfirmButton: true
      })
      this.banderaEsperaRubros = false;
    })*/

  }

  loadTabla() {
    if (this.dataTabla) {
      this.dataSourceRubros.data = [
        {
          "categoria": "Salario básico",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Prima de Servicios",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Prima de navidad",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Prima de vacaciones",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Bonificación por servicios",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte cesantías público",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte cesantías privado",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte salud",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Fondo pensiones público",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Fondo pensiones privado",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte ARL",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte CCF",
          "rubro": "",
          "codigo": ""
        },
        {
          "categoria": "Aporte ICBF",
          "rubro": "",
          "codigo": ""
        }];
      this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:` + this.plan + `,tipo_identificacion_id:61897518f6fc97091727c3c3`).subscribe((data: any) => {
        if (data) {
          let identificacion = data.Data[0];
          if (identificacion.activo === false) {
            this.dataSourceRHF.data = [];
            this.dataSourceRHVPRE.data = [];
            this.dataSourceRHVPOS.data = [];
            this.steps = [
              {
                "nombre": "Docentes V.E Ocasionales",
                "tipo": "RHF",
                "descripcion": "Administración de valores pregrado",
                "nivel": "Pregrado",
                "data": this.dataSourceRHF,
                "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Completo" }],
                "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
              },
              {
                "nombre": "Docentes V.E Hora Cátedra",
                "tipo": 'RHVPRE',
                "descripcion": 'Administración de valores pregrado',
                "nivel": "Pregrado",
                "data": this.dataSourceRHVPRE,
                "tipos": [{ "nombre": "H. Catedra Honorarios" }, { "nombre": "H. Catedra Prestacional" }],
                "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
              },
              {
                "nombre": "Docentes V.E Hora Cátedra",
                "tipo": "RHVPOS",
                "descripcion": "Administración de valores posgrado",
                "nivel": "Posgrado",
                "data": this.dataSourceRHVPOS,
                "tipos": [{ "nombre": "H. Catedra Honorarios" }, { "nombre": "H. Catedra Prestacional" }],
                "categorias": [{ "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }, { "nombre": "Asistente UD" }, { "nombre": "Asociado UD" }, { "nombre": "Titular UD" }]
              },
              {
                "nombre": "Selección de rubros",
                "tipo": "rubros",
                "data": this.dataSourceRubros,
              }
            ];
            let datoIdenti = {
              "activo": true
            }
            this.request.put(environment.PLANES_CRUD, `identificacion`, datoIdenti, identificacion._id).subscribe();
          } else {
            this.dataSourceRubros.data = dataRubros;
            this.getData().then(() => {
              if (this.data != "") {
                console.log("Get datos: ", this.data);
                if (this.data.rhf != "{}") {
                  this.dataSourceRHF.data = this.data.rhf;
                  this.dataSourceRHF.data.sort((a: any, b: any) => {
                    if (parseInt(a.index) < parseInt(b.index)) {
                      return -1;
                    } else if (parseInt(a.index) > parseInt(b.index)) {
                      return 1;
                    }
                    return 0;
                  })
                  this.checkIncremento(this.data.rhf);
                }
                if (this.data.rhv_pre != "{}") {
                  this.dataSourceRHVPRE.data = this.data.rhv_pre;
                  this.dataSourceRHVPRE.data.sort((a: any, b: any) => {
                    if (parseInt(a.index) < parseInt(b.index)) {
                      return -1;
                    } else if (parseInt(a.index) > parseInt(b.index)) {
                      return 1;
                    }
                    return 0;
                  })
                }
                if (this.data.rhv_pos != "{}") {
                  this.dataSourceRHVPOS.data = this.data.rhv_pos;
                  this.dataSourceRHVPOS.data.sort((a: any, b: any) => {
                    if (parseInt(a.index) < parseInt(b.index)) {
                      return -1;
                    } else if (parseInt(a.index) > parseInt(b.index)) {
                      return 1;
                    }
                    return 0;
                  })
                }
                if (this.data.rubros != "{}" && this.data.rubros != null) {
                  let filtradoManual = this.data.rubros.filter((rubro) => !rubro.hasOwnProperty('bonificacion'));
                  this.dataSourceRubros.data = filtradoManual;
                }
              }
              this.steps = [
                {
                  "nombre": "Docentes V.E Ocasionales",
                  "tipo": "RHF",
                  "descripcion": "Administración de valores pregrado",
                  "nivel": "Pregrado",
                  "data": this.dataSourceRHF,
                  "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Completo" }],
                  "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
                },
                {
                  "nombre": "Docentes V.E Hora Cátedra",
                  "tipo": 'RHVPRE',
                  "descripcion": 'Administración de valores pregrado',
                  "nivel": "Pregrado",
                  "data": this.dataSourceRHVPRE,
                  "tipos": [{ "nombre": "H. Catedra Honorarios" }, { "nombre": "H. Catedra Prestacional" }],
                  "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
                },
                {
                  "nombre": "Docentes V.E Hora Cátedra",
                  "tipo": "RHVPOS",
                  "descripcion": "Administración de valores posgrado",
                  "nivel": "Posgrado",
                  "data": this.dataSourceRHVPOS,
                  "tipos": [{ "nombre": "H. Catedra Honorarios" }, { "nombre": "H. Catedra Prestacional" }],
                  "categorias": [{ "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }, { "nombre": "Asistente UD" }, { "nombre": "Asociado UD" }, { "nombre": "Titular UD" }]
                },
                {
                  "nombre": "Selección de rubros",
                  "tipo": "Rubros",
                  "data": this.dataSourceRubros,
                }
              ];
              let sueldo = true;
              this.dataSourceRubros.data.forEach(rubro => {
                if (rubro.categoria == 'Salario básico') {
                  sueldo = false
                }
              });
              if (sueldo) {
                let datos = this.dataSourceRubros.data;
                datos.push({
                  "activo": true,
                  "categoria": "Salario básico",
                  "rubro": "",
                  "codigo": ""
                });
                this.dataSourceRubros.data = datos;
              }
              this.OnPageChangeRHF({ length: 0, pageIndex: 0, pageSize: 10 });
              this.OnPageChangeRHVPOS({ length: 0, pageIndex: 0, pageSize: 10 });
              this.OnPageChangeRHVPRE({ length: 0, pageIndex: 0, pageSize: 10 });
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

  loadVigenciaConsulta() {
    let aux: number = + this.vigencia.Nombre;
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=Nombre:` + (aux - 1).toString()).subscribe((data: any) => {
      if (data) {
        let auxVigencia = data.Data[0];
        if (auxVigencia.Id != null) {
          this.vigenciaConsulta = auxVigencia;
          this.loadDesagregado();
        } else {
          this.readonlyTable = true;
          Swal.fire({
            title: 'Error en la operación',
            icon: 'error',
            text: `No se encuentran datos registrados para la vigencia actual`,
            showConfirmButton: false,
            timer: 2500
          })
        }
      }
    })
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
        this.displayedHeaders = this.visualizarHeaders();
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
        if (this.readonlyTable != true) { //Se tiene en cuenta vigencia para la consulta --  loadVigenciaConsulta()
          this.readonlyTable = this.verificarVersiones();
        }
        this.mostrarObservaciones = this.verificarObservaciones();
        if (this.mostrarObservaciones) {
          return ['index', 'acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'totalBasico', 'totalAportes', 'total', 'observaciones'];
        } else {
          return ['index', 'acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'totalBasico', 'totalAportes', 'total'];
        }

      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'totalBasico', 'totalAportes', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'totalBasico', 'totalAportes', 'total'];
      }
    }

    if (this.rol == 'PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'totalBasico', 'totalAportes', 'total'];
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'totalBasico', 'totalAportes', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'totalBasico', 'totalAportes', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['index', 'acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'vacacionesProyeccion', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'totalBasico', 'totalAportes', 'total'];
      }
    }
  }

  visualizarHeaders(): string[] {
    if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = this.verificarVersiones();
        this.mostrarObservaciones = this.verificarObservaciones();
        if (this.mostrarObservaciones) {
          return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'semanasP', 'horasP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoMensualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP', 'observacionesP']
        } else {
          return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'semanasP', 'horasP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoMensualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP']
        }

      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'semanasP', 'horasP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoMensualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP', 'observacionesP']
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'semanasP', 'horasP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoMensualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP']
      }
    }

    if (this.rol == 'PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'semanasP', 'horasP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoMensualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP']
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'semanasP', 'horasP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoMensualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP', 'observacionesP']
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'semanasP', 'horasP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoMensualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP', 'observacionesP']
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['indexP', 'accionesP', 'tipoP', 'categoriaP', 'semanasP', 'horasP', 'totalHorasP', 'mesesP', 'sueldoBasicoP', 'sueldoMensualP', 'prestacionesSociales', 'seguridadSocial', 'parafiscales', 'totalRecursoP']
      }
    }
  }

  verificarVersiones(): boolean {
    let preAval = this.versiones.filter(group => group.estado_plan_id.match('614d3b4401c7a222052fac05'));
    if (preAval.length != 0) {
      return true;
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
        "Vigencia": this.vigenciaConsulta.Year,
        "Dedicacion": "MTO",
        "Categoria": "Titular",
        "NivelAcademico": "PREGRADO"
      },
      {
        "Vigencia": this.vigenciaConsulta.Year,
        "Dedicacion": "MTO",
        "Categoria": "Auxiliar",
        "NivelAcademico": "PREGRADO"
      },
      {
        "Vigencia": this.vigenciaConsulta.Year,
        "Dedicacion": "MTO",
        "Categoria": "Asistente",
        "NivelAcademico": "PREGRADO"
      },
      {
        "Vigencia": this.vigenciaConsulta.Year,
        "Dedicacion": "MTO",
        "Categoria": "Asociado",
        "NivelAcademico": "PREGRADO"
      }
    ]
    let bodyTCO = [{
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "TCO",
      "Categoria": "Titular",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "TCO",
      "Categoria": "Auxiliar",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "TCO",
      "Categoria": "Asistente",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "TCO",
      "Categoria": "Asociado",
      "NivelAcademico": "PREGRADO"
    }
    ]
    let bodyPrestacional = [{
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCP",
      "Categoria": "Titular",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCP",
      "Categoria": "Auxiliar",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCP",
      "Categoria": "Asistente",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCP",
      "Categoria": "Asociado",
      "NivelAcademico": "PREGRADO"
    }
    ]
    let bodyHonorarios = [{
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCH",
      "Categoria": "Titular",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCH",
      "Categoria": "Auxiliar",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCH",
      "Categoria": "Asistente",
      "NivelAcademico": "PREGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCH",
      "Categoria": "Asociado",
      "NivelAcademico": "PREGRADO"
    }
    ];
    let bodyPrestacionalPOS = [{
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCP",
      "Categoria": "Titular",
      "NivelAcademico": "POSGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCP",
      "Categoria": "Asistente",
      "NivelAcademico": "POSGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCP",
      "Categoria": "Asociado",
      "NivelAcademico": "POSGRADO"
    }, {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCP",
      "Categoria": "Titular",
      "NivelAcademico": "POSGRADO",
      "EsDePlanta": true

    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCP",
      "Categoria": "Asistente",
      "NivelAcademico": "POSGRADO",
      "EsDePlanta": true
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCP",
      "Categoria": "Asociado",
      "NivelAcademico": "POSGRADO",
      "EsDePlanta": true
    }
    ];
    let bodyHonorariosPOS = [{
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCH",
      "Categoria": "Titular",
      "NivelAcademico": "POSGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCH",
      "Categoria": "Asistente",
      "NivelAcademico": "POSGRADO"
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCH",
      "Categoria": "Asociado",
      "NivelAcademico": "POSGRADO"
    }, {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCH",
      "Categoria": "Titular",
      "NivelAcademico": "POSGRADO",
      "EsDePlanta": true
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCH",
      "Categoria": "Asistente",
      "NivelAcademico": "POSGRADO",
      "EsDePlanta": true
    },
    {
      "Vigencia": this.vigenciaConsulta.Year,
      "Dedicacion": "HCH",
      "Categoria": "Asociado",
      "NivelAcademico": "POSGRADO",
      "EsDePlanta": true
    },
    ];
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

    this.request.post(environment.RESOLUCIONES_DOCENTES_SERVICE, "services/desagregado_planeacion", bodyHonorariosPOS).subscribe((data: any) => {
      if (data) {
        this.titularHonorariosPOS = data.Data[0];
        this.asistenteHonorariosPOS = data.Data[1];
        this.asociadoHonorariosPOS = data.Data[2];
        this.titularUDHonorariosPOS = data.Data[3];
        this.asistenteUDHonorariosPOS = data.Data[4];
        this.asociadoUDHonorariosPOS = data.Data[5];
      }
    })

    this.request.post(environment.RESOLUCIONES_DOCENTES_SERVICE, "services/desagregado_planeacion", bodyPrestacionalPOS).subscribe((data: any) => {
      if (data) {
        this.titularPrestacionalPOS = data.Data[0];
        this.asistentePrestacionalPOS = data.Data[1];
        this.asociadoPrestacionalPOS = data.Data[2];
        this.titularUDPrestacionalPOS = data.Data[3];
        this.asistenteUDPrestacionalPOS = data.Data[4];
        this.asociadoUDPrestacionalPOS = data.Data[5];
      }
    })
  }

  addElement(tipo) {
    if (tipo === 'RHF') {
      this.dataSourceRHF.data.unshift({
        nivel: 'Pregrado',
        tipo: '',
        categoria: '',
        semanas: 0,
        horas: 0,
        totalHoras: 0,
        meses: 0,
        sueldoBasico: '',
        sueldoMensual: '',
        primaServicios: '',
        primaNavidad: '',
        primaVacaciones: '',
        vacaciones: '',
        bonificacion: 'N/A',
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
        totalBasico: '',
        totalAportes: '',
        total: ''
      });

      for (let index = 0; index < this.dataSourceRHF.data.length; index++) {
        this.dataSourceRHF.data[index].index = index + 1;
      }

      this.dataSourceRHF.paginator = this.paginatorRHF;
      this.dataSourceRHF.sort = this.sortRHF;
      this.OnPageChangeRHF({ pageIndex: 0, length: 0, pageSize: this.paginatorRHF.pageSize })
    } else if (tipo == 'RHVPRE') {
      this.dataSourceRHVPRE.data.unshift({
        nivel: 'Pregrado',
        tipo: '',
        categoria: '',
        semanas: 0,
        horas: 0,
        totalHoras: 0,
        meses: 0,
        sueldoBasico: '',
        sueldoMensual: '',
        primaServicios: '',
        primaNavidad: '',
        primaVacaciones: '',
        vacaciones: '',
        bonificacion: 'N/A',
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
        totalBasico: '',
        totalAportes: '',
        total: ''
      });

      for (let index = 0; index < this.dataSourceRHVPRE.data.length; index++) {
        this.dataSourceRHVPRE.data[index].index = index + 1;
      }

      this.dataSourceRHVPRE.paginator = this.paginatorRHVPRE;
      this.dataSourceRHVPRE.sort = this.sortRHVPRE;
      this.OnPageChangeRHVPRE({ pageIndex: 0, length: 0, pageSize: this.paginatorRHF.pageSize })
    } else if (tipo == 'RHVPOS') {
      this.dataSourceRHVPOS.data.unshift({
        nivel: 'Posgrado',
        tipo: '',
        categoria: '',
        semanas: 0,
        horas: 0,
        totalHoras: 0,
        meses: 0,
        sueldoBasico: '',
        sueldoMensual: '',
        primaServicios: '',
        primaNavidad: '',
        primaVacaciones: '',
        vacaciones: '',
        bonificacion: 'N/A',
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
        totalBasico: '',
        totalAportes: '',
        total: ''
      });

      for (let index = 0; index < this.dataSourceRHVPOS.data.length; index++) {
        this.dataSourceRHVPOS.data[index].index = index + 1;
      }

      this.dataSourceRHVPOS.paginator = this.paginatorRHVPOS;
      this.dataSourceRHVPOS.sort = this.sortRHVPOS;
      this.OnPageChangeRHVPOS({ pageIndex: 0, length: 0, pageSize: this.paginatorRHF.pageSize })
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
          data.splice((this.paginatorRHF.pageIndex * this.paginatorRHF.pageSize) + indices[i], 1);
        }

        for (let index = 0; index < data.length; index++) {
          data[index].index = index + 1;
        }

        this.dataSourceRHF.data = data;
      }
    } else if (tipo == 'RHVPRE') {
      const indices = isNumeric(index) ? [index] : (Array.isArray(index) ? index : undefined);
      if (indices) {
        const data = this.dataSourceRHVPRE.data;
        indices.sort((a, b) => b - a);
        for (let i = 0; i < indices.length; i++) {
          data.splice((this.paginatorRHVPRE.pageIndex * this.paginatorRHVPRE.pageSize) + indices[i], 1);
        }

        for (let index = 0; index < data.length; index++) {
          data[index].index = index + 1;
        }

        this.dataSourceRHVPRE.data = data;
      }
    } else if (tipo == 'RHVPOS') {
      const indices = isNumeric(index) ? [index] : (Array.isArray(index) ? index : undefined);
      if (indices) {
        const data = this.dataSourceRHVPOS.data;
        indices.sort((a, b) => b - a);
        for (let i = 0; i < indices.length; i++) {
          data.splice((this.paginatorRHVPOS.pageIndex * this.paginatorRHVPOS.pageSize) + indices[i], 1);
        }

        for (let index = 0; index < data.length; index++) {
          data[index].index = index + 1;
        }

        this.dataSourceRHVPOS.data = data;
      }
    }

  }

  onChangeRubro(event, rowIndex) {
    if (event == undefined) {
      this.dataSourceRubros.data[rowIndex].codigo = '';
    } else {
      this.dataSourceRubros.data[rowIndex].codigo = event.value;
    }
  }

  onChangeincremento() {
    let value = parseFloat(this.incrementoInput.value);
    if (value) {
      this.incremento = value / 100.0;
    } else {
      this.incremento = 0.0;
    }
    this.banderaCerrar = false;
    Swal.fire({
      icon: 'info',
      title: 'Identificación de Recurso Docente',
      text: 'El porcentaje de incremento asociado a la vigencia en cuestión ha sido aplicado a los valores presupuestados. Sin embargo, revisar que los valores tanto de cesantias como pensiones coincidan con los totales.',
      showConfirmButton: true
    })
  }

  checkIncremento(incrementoFromDB) {
    this.incrementoAnterior = incrementoFromDB[0].incremento ? parseFloat(incrementoFromDB[0].incremento) : 0.0;
    if (this.incrementoAnterior > 0.0) {
      this.incrementoInput.setValue(this.incrementoAnterior * 100.0);
      this.onChangeincremento();
      Swal.fire({
        icon: 'info',
        title: 'Identificación de Recurso Docente',
        text: 'El porcentaje de incremento asociado a la vigencia en cuestión ya se encuentra aplicado a los valores presupuestados. Sin embargo, revisar que los valores tanto de cesantias como pensiones coincidan con los totales.',
        showConfirmButton: true
      })
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Identificación de Recurso Docente',
        text: 'Por favor ingrese el porcentaje de incremento asociado a la vigencia en cuestión presionando el botón "Aplicar Incremento". Al ingresar este porcentaje se vera reflejado en todos los valores presupuestados para cada docente.',
        showConfirmButton: true
      })
    }
  }

  onChangeTipo(element, rowIndex, tipo) {
    if (element.tipo != "H. Catedra Honorarios") {
      Swal.fire({
        icon: 'warning',
        title: 'Por favor complete los campos de cesantias y pensiones',
        timer: 3500,
        showConfirmButton: false
      })
      if (tipo === 'RHF') {
        if (element.tipo === "Medio Tiempo") {
          this.dataSourceRHF.data[rowIndex].horas = 20;
        } else if (element.tipo === "Tiempo Completo") {
          this.dataSourceRHF.data[rowIndex].horas = 40;
        }
      }
    }
  }

  onChangeHoras(element, rowIndex, tipo) {
    if (tipo === "RHF") {
      if (element.tipo === "Medio Tiempo") {
        this.dataSourceRHF.data[rowIndex].horas = 20;
      } else if (element.tipo === "Tiempo Completo") {
        this.dataSourceRHF.data[rowIndex].horas = 40;
      }
    }
    if (tipo === "RHVPRE") {
      if (element.tipo === "H. Catedra Honorarios") {
        if (element.horas < 1)
          this.dataSourceRHVPRE.data[rowIndex].horas = 1;
        else if (element.horas > 8)
          this.dataSourceRHVPRE.data[rowIndex].horas = 8;
      } else if (element.tipo === "H. Catedra Prestacional") {
        if (element.horas < 1)
          this.dataSourceRHVPRE.data[rowIndex].horas = 1;
        else if (element.horas > 16)
          this.dataSourceRHVPRE.data[rowIndex].horas = 16;
      }
    }
    if (tipo === "RHVPOS") {
      if (element.tipo === "H. Catedra Honorarios") {
        if (element.horas < 1)
          this.dataSourceRHVPOS.data[rowIndex].horas = 1;
        else if (element.horas > 8)
          this.dataSourceRHVPOS.data[rowIndex].horas = 8;
      } else if (element.tipo === "H. Catedra Prestacional") {
        if (element.horas < 1)
          this.dataSourceRHVPOS.data[rowIndex].horas = 1;
        else if (element.horas > 16)
          this.dataSourceRHVPOS.data[rowIndex].horas = 16;
      }
    }

  }


  totalHoras(element, rowIndex, tipo) {
    if (element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        let totalHoras: number = parseInt(element.semanas) * parseInt(element.horas);
        this.dataSourceRHF.data[rowIndex].totalHoras = totalHoras.toString();
      }
      if (tipo === "RHVPRE") {
        let totalHoras: number = parseInt(element.semanas) * parseInt(element.horas);
        this.dataSourceRHVPRE.data[rowIndex].totalHoras = totalHoras.toString();
      }
      if (tipo === "RHVPOS") {
        let totalHoras: number = parseInt(element.semanas) * parseInt(element.horas);
        this.dataSourceRHVPOS.data[rowIndex].totalHoras = totalHoras.toString();
      }
    }
  }

  actualizarMeses(element, rowIndex, tipo) {
    if (element.semanas != "") {
      if (tipo === "RHF") {
        let meses = (parseInt(element.semanas) / 4).toFixed(2);
        this.dataSourceRHF.data[rowIndex].meses = meses.toString();
      }
      if (tipo === "RHVPRE") {
        let meses = (parseInt(element.semanas) / 4).toFixed(2);
        this.dataSourceRHVPRE.data[rowIndex].meses = meses.toString();
      }
      if (tipo === "RHVPOS") {
        let meses = (parseInt(element.semanas) / 4).toFixed(2);
        this.dataSourceRHVPOS.data[rowIndex].meses = meses.toString();
      }
    }
  }

  actualizarSueldoBasico(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            let sueldoBasico = ((this.auxiliarMTO.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistenteMTO.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoMTO.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularMTO.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let sueldoBasico = ((this.auxiliarTCO.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistenteTCO.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoTCO.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularTCO.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          if (element.categoria === "Auxiliar") {
            let sueldoBasico = ((this.auxiliarHonorarios.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistenteHonorarios.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoHonorarios.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularHonorarios.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let sueldoBasico = ((this.auxiliarPrestacional.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistentePrestacional.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoPrestacional.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularPrestacional.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistenteHonorariosPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoHonorariosPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularHonorariosPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          //
          if (element.categoria === "Asistente UD") {
            let sueldoBasico = ((this.asistenteUDHonorariosPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let sueldoBasico = ((this.asociadoUDHonorariosPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let sueldoBasico = ((this.titularUDHonorariosPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistentePrestacionalPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoPrestacionalPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularPrestacionalPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let sueldoBasico = ((this.asistenteUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let sueldoBasico = ((this.asociadoUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let sueldoBasico = ((this.titularUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarSueldoMensual(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let sueldoMensual = (sueldoBasico / element.meses).toFixed(0);
        this.dataSourceRHF.data[rowIndex].sueldoMensual = formatCurrency(parseInt(sueldoMensual), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPRE") {
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let sueldoMensual = (sueldoBasico / element.meses).toFixed(0);
        this.dataSourceRHVPRE.data[rowIndex].sueldoMensual = formatCurrency(parseInt(sueldoMensual), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPOS") {
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let sueldoMensual = (sueldoBasico / element.meses).toFixed(0);
        this.dataSourceRHVPOS.data[rowIndex].sueldoMensual = formatCurrency(parseInt(sueldoMensual), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
    }
  }

  actualizarPrimaServicios(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.meses < 6) {
          this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(0, 'en-US', getCurrencySymbol('USD', 'wide'));
        } else if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            let primaServicios = ((this.auxiliarMTO.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaServicios = ((this.asistenteMTO.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaServicios = ((this.asociadoMTO.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaServicios = ((this.titularMTO.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let primaServicios = ((this.auxiliarTCO.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaServicios = ((this.asistenteTCO.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaServicios = ((this.asociadoTCO.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaServicios = ((this.titularTCO.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].primaServicios = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.meses < 6) {
            this.dataSourceRHVPRE.data[rowIndex].primaServicios = formatCurrency(0, 'en-US', getCurrencySymbol('USD', 'wide'));
          } else if (element.categoria === "Auxiliar") {
            let primaServicios = ((this.auxiliarPrestacional.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          } else if (element.categoria === "Asistente") {
            let primaServicios = ((this.asistentePrestacional.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          } else if (element.categoria === "Asociado") {
            let primaServicios = ((this.asociadoPrestacional.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          } else if (element.categoria === "Titular") {
            let primaServicios = ((this.titularPrestacional.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].primaServicios = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.meses < 6) {
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(0, 'en-US', getCurrencySymbol('USD', 'wide'));
          } else if (element.categoria === "Asistente") {
            let primaServicios = ((this.asistentePrestacionalPOS.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }else if (element.categoria === "Asociado") {
            let primaServicios = ((this.asociadoPrestacionalPOS.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          } else if (element.categoria === "Titular") {
            let primaServicios = ((this.titularPrestacionalPOS.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          } else if (element.categoria === "Asistente UD") {
            let primaServicios = ((this.asistenteUDPrestacionalPOS.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          } else if (element.categoria === "Asociado UD") {
            let primaServicios = ((this.asociadoUDPrestacionalPOS.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          } else if (element.categoria === "Titular UD") {
            let primaServicios = ((this.titularUDPrestacionalPOS.prima_servicios * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarPrimaNavidad(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            let primaNavidad = ((this.auxiliarMTO.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaNavidad = ((this.asistenteMTO.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaNavidad = ((this.asociadoMTO.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaNavidad = ((this.titularMTO.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let primaNavidad = ((this.auxiliarTCO.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaNavidad = ((this.asistenteTCO.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaNavidad = ((this.asociadoTCO.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaNavidad = ((this.titularTCO.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].primaNavidad = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let primaNavidad = ((this.auxiliarPrestacional.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaNavidad = ((this.asistentePrestacional.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaNavidad = ((this.asociadoPrestacional.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaNavidad = ((this.titularPrestacional.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].primaNavidad = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let primaNavidad = ((this.asistentePrestacionalPOS.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaNavidad = ((this.asociadoPrestacionalPOS.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaNavidad = ((this.titularPrestacionalPOS.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let primaNavidad = ((this.asistenteUDPrestacionalPOS.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let primaNavidad = ((this.asociadoUDPrestacionalPOS.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let primaNavidad = ((this.titularUDPrestacionalPOS.primaNavidad * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarPrimaVacaciones(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            let primaVacaciones = ((this.auxiliarMTO.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaVacaciones = ((this.asistenteMTO.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaVacaciones = ((this.asociadoMTO.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaVacaciones = ((this.titularMTO.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let primaVacaciones = ((this.auxiliarTCO.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaVacaciones = ((this.asistenteTCO.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaVacaciones = ((this.asociadoTCO.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaVacaciones = ((this.titularTCO.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].primaVacaciones = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let primaVacaciones = ((this.auxiliarPrestacional.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaVacaciones = ((this.asistentePrestacional.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaVacaciones = ((this.asociadoPrestacional.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaVacaciones = ((this.titularPrestacional.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let primaVacaciones = ((this.asistentePrestacionalPOS.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaVacaciones = ((this.asociadoPrestacionalPOS.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaVacaciones = ((this.titularPrestacionalPOS.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let primaVacaciones = ((this.asistenteUDPrestacionalPOS.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let primaVacaciones = ((this.asociadoUDPrestacionalPOS.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let primaVacaciones = ((this.titularUDPrestacionalPOS.primaVacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarVacacionesProyeccion(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            let vacaciones = ((this.auxiliarMTO.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let vacaciones = ((this.asistenteMTO.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let vacaciones = ((this.asociadoMTO.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let vacaciones = ((this.titularMTO.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let vacaciones = ((this.auxiliarTCO.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let vacaciones = ((this.asistenteTCO.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let vacaciones = ((this.asociadoTCO.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let vacaciones = ((this.titularTCO.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].vacaciones = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let vacaciones = ((this.auxiliarPrestacional.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let vacaciones = ((this.asistentePrestacional.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let vacaciones = ((this.asociadoPrestacional.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let vacaciones = ((this.titularPrestacional.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].vacaciones = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let vacaciones = ((this.asistentePrestacionalPOS.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let vacaciones = ((this.asociadoPrestacionalPOS.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let vacaciones = ((this.titularPrestacionalPOS.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let vacaciones = ((this.asistenteUDPrestacionalPOS.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let vacaciones = ((this.asociadoUDPrestacionalPOS.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let vacaciones = ((this.titularUDPrestacionalPOS.vacaciones * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].vacaciones = formatCurrency(parseInt(vacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarBonificacion(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "" && element.meses > 12) {
      if (tipo === "RHF") {
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let bonificacion = ((sueldoBasico * 0.35) / element.meses).toFixed(0);
        this.dataSourceRHF.data[rowIndex].bonificacion = formatCurrency(parseInt(bonificacion), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPRE") {
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let bonificacion = ((sueldoBasico * 0.35) / element.meses).toFixed(0);
        this.dataSourceRHVPRE.data[rowIndex].bonificacion = formatCurrency(parseInt(bonificacion), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPOS") {
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let bonificacion = ((sueldoBasico * 0.35) / element.meses).toFixed(0);
        this.dataSourceRHVPOS.data[rowIndex].bonificacion = formatCurrency(parseInt(bonificacion), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
    }
  }

  actualizarInteresesCesantias(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            let interesesCesantias = ((this.auxiliarMTO.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let interesesCesantias = ((this.asistenteMTO.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let interesesCesantias = ((this.asociadoMTO.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let interesesCesantias = ((this.titularMTO.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let interesesCesantias = ((this.auxiliarTCO.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let interesesCesantias = ((this.asistenteTCO.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let interesesCesantias = ((this.asociadoTCO.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let interesesCesantias = ((this.titularTCO.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].interesesCesantias = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let interesesCesantias = ((this.auxiliarPrestacional.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let interesesCesantias = ((this.asistentePrestacional.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let interesesCesantias = ((this.asociadoPrestacional.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let interesesCesantias = ((this.titularPrestacional.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let interesesCesantias = ((this.asistentePrestacionalPOS.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let interesesCesantias = ((this.asociadoPrestacionalPOS.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let interesesCesantias = ((this.titularPrestacionalPOS.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let interesesCesantias = ((this.asistenteUDPrestacionalPOS.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let interesesCesantias = ((this.asociadoUDPrestacionalPOS.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let interesesCesantias = ((this.titularUDPrestacionalPOS.interesCesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarCesantias(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            let cesantias = ((this.auxiliarMTO.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let cesantias = ((this.asistenteMTO.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let cesantias = ((this.asociadoMTO.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let cesantias = ((this.titularMTO.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let cesantias = ((this.auxiliarTCO.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let cesantias = ((this.asistenteTCO.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let cesantias = ((this.asociadoTCO.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let cesantias = ((this.titularTCO.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].cesantias = "N/A";
          this.dataSourceRHVPRE.data[rowIndex].cesantiasPrivado = "N/A";
          this.dataSourceRHVPRE.data[rowIndex].cesantiasPublico = "N/A";
        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let cesantias = ((this.auxiliarPrestacional.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let cesantias = ((this.asistentePrestacional.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let cesantias = ((this.asociadoPrestacional.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let cesantias = ((this.titularPrestacional.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].cesantias = "N/A";
          this.dataSourceRHVPOS.data[rowIndex].cesantiasPrivado = "N/A";
          this.dataSourceRHVPOS.data[rowIndex].cesantiasPublico = "N/A";
        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let cesantias = ((this.asistentePrestacionalPOS.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let cesantias = ((this.asociadoPrestacionalPOS.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let cesantias = ((this.titularPrestacionalPOS.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let cesantias = ((this.asistenteUDPrestacionalPOS.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let cesantias = ((this.asociadoUDPrestacionalPOS.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let cesantias = ((this.titularUDPrestacionalPOS.cesantias * element.horas) * element.semanas * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarTotalCesantias(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        let interesesCesantias = parseInt(element.interesesCesantias.replace(/\$|,/g, ''));
        let cesantias = parseInt(element.cesantias.replace(/\$|,/g, ''));
        let totalCesantias = (interesesCesantias + cesantias).toFixed(0);
        this.dataSourceRHF.data[rowIndex].totalCesantias = formatCurrency(parseInt(totalCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPRE") {
        if (element.tipo != "H. Catedra Honorarios") {
          let interesesCesantias = parseInt(element.interesesCesantias.replace(/\$|,/g, ''));
          let cesantias = parseInt(element.cesantias.replace(/\$|,/g, ''));
          let totalCesantias = (interesesCesantias + cesantias).toFixed(0);
          this.dataSourceRHVPRE.data[rowIndex].totalCesantias = formatCurrency(parseInt(totalCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
        } else {
          this.dataSourceRHVPRE.data[rowIndex].totalCesantias = "N/A";
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo != "H. Catedra Honorarios") {
          let interesesCesantias = parseInt(element.interesesCesantias.replace(/\$|,/g, ''));
          let cesantias = parseInt(element.cesantias.replace(/\$|,/g, ''));
          let totalCesantias = (interesesCesantias + cesantias).toFixed(0);
          this.dataSourceRHVPOS.data[rowIndex].totalCesantias = formatCurrency(parseInt(totalCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
        } else {
          this.dataSourceRHVPOS.data[rowIndex].totalCesantias = "N/A";
        }
      }
    }
  }

  actualizarSalud(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            // let salud = (((((this.auxiliarMTO.salud * element.horas) * element.semanas)*0.085)/0.125)*(1+this.incremento)).toFixed(0);
            let salud = (((((this.auxiliarMTO.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let salud = (((((this.asistenteMTO.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let salud = (((((this.asociadoMTO.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let salud = (((((this.titularMTO.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let salud = (((((this.auxiliarTCO.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let salud = (((((this.asistenteTCO.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let salud = (((((this.asociadoTCO.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let salud = (((((this.titularTCO.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].totalSalud = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let salud = (((((this.auxiliarPrestacional.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let salud = (((((this.asistentePrestacional.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let salud = (((((this.asociadoPrestacional.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let salud = (((((this.titularPrestacional.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].totalSalud = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let salud = (((((this.asistentePrestacionalPOS.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let salud = (((((this.asociadoPrestacionalPOS.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let salud = (((((this.titularPrestacionalPOS.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let salud = (((((this.asistenteUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let salud = (((((this.asociadoUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let salud = (((((this.titularUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas) * 0.085)) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarTotalPension(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            let pension = (((((this.auxiliarMTO.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let pension = (((((this.asistenteMTO.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let pension = (((((this.asociadoMTO.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let pension = (((((this.titularMTO.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let pension = (((((this.auxiliarTCO.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let pension = (((((this.asistenteTCO.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let pension = (((((this.asociadoTCO.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let pension = (((((this.titularTCO.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].totalPensiones = "N/A";
          this.dataSourceRHVPRE.data[rowIndex].pensionesPrivado = "N/A";
          this.dataSourceRHVPRE.data[rowIndex].pensionesPublico = "N/A";
        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let pension = (((((this.auxiliarPrestacional.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let pension = (((((this.asistentePrestacional.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let pension = (((((this.asociadoPrestacional.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let pension = (((((this.titularPrestacional.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].totalPensiones = "N/A";
          this.dataSourceRHVPOS.data[rowIndex].pensionesPrivado = "N/A";
          this.dataSourceRHVPOS.data[rowIndex].pensionesPublico = "N/A";
        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let pension = (((((this.asistentePrestacionalPOS.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let pension = (((((this.asociadoPrestacionalPOS.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let pension = (((((this.titularPrestacionalPOS.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let pension = (((((this.asistenteUDPrestacionalPOS.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let pension = (((((this.asociadoUDPrestacionalPOS.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let pension = (((((this.titularUDPrestacionalPOS.pension * element.horas) * element.semanas) * 0.12) / 0.16) * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarTotalArl(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            // let arl = ((this.auxiliarMTO.arl * element.horas) * element.semanas * (1+this.incremento)).toFixed(0); // ajuste temporal
            let arl = ((this.auxiliarMTO.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let arl = ((this.asistenteMTO.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let arl = ((this.asociadoMTO.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let arl = ((this.titularMTO.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let arl = ((this.auxiliarTCO.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let arl = ((this.asistenteTCO.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let arl = ((this.asociadoTCO.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let arl = ((this.titularTCO.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].totalArl = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let arl = ((this.auxiliarPrestacional.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let arl = ((this.asistentePrestacional.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let arl = ((this.asociadoPrestacional.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let arl = ((this.titularPrestacional.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].totalArl = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let arl = ((this.asistentePrestacionalPOS.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let arl = ((this.asociadoPrestacionalPOS.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let arl = ((this.titularPrestacionalPOS.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let arl = ((this.asistenteUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let arl = ((this.asociadoUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let arl = ((this.titularUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas * 0.00522 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarCaja(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            // let caja = ((this.auxiliarMTO.caja * element.horas) * element.semanas * (1+this.incremento)).toFixed(0);
            let caja = ((((this.auxiliarMTO.salarioBasico + this.auxiliarMTO.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let caja = ((((this.asistenteMTO.salarioBasico + this.asistenteMTO.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let caja = ((((this.asociadoMTO.salarioBasico + this.asociadoMTO.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let caja = ((((this.titularMTO.salarioBasico + this.titularMTO.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let caja = ((((this.auxiliarTCO.salarioBasico + this.auxiliarTCO.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let caja = ((((this.asistenteTCO.salarioBasico + this.asistenteTCO.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let caja = ((((this.asociadoTCO.salarioBasico + this.asociadoTCO.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let caja = ((((this.titularTCO.salarioBasico + this.titularTCO.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].caja = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let caja = ((((this.auxiliarPrestacional.salarioBasico + this.auxiliarPrestacional.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let caja = ((((this.asistentePrestacional.salarioBasico + this.asistentePrestacional.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let caja = ((((this.asociadoPrestacional.salarioBasico + this.asociadoPrestacional.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let caja = ((((this.titularPrestacional.salarioBasico + this.titularPrestacional.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].caja = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let caja = ((((this.asistentePrestacionalPOS.salarioBasico + this.asistentePrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let caja = ((((this.asociadoPrestacionalPOS.salarioBasico + this.asociadoPrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let caja = ((((this.titularPrestacionalPOS.salarioBasico + this.titularPrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let caja = ((((this.asistenteUDPrestacionalPOS.salarioBasico + this.asistenteUDPrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let caja = ((((this.asociadoUDPrestacionalPOS.salarioBasico + this.asociadoUDPrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let caja = ((((this.titularUDPrestacionalPOS.salarioBasico + this.titularUDPrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.04 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarIcbf(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            // let icbf = ((this.auxiliarMTO.icbf * element.horas) * element.semanas * (1+this.incremento)).toFixed(0);
            let icbf = ((((this.auxiliarMTO.salarioBasico + this.auxiliarMTO.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let icbf = ((((this.asistenteMTO.salarioBasico + this.asistenteMTO.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let icbf = ((((this.asociadoMTO.salarioBasico + this.asociadoMTO.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let icbf = ((((this.titularMTO.salarioBasico + this.titularMTO.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let icbf = ((((this.auxiliarTCO.salarioBasico + this.auxiliarTCO.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let icbf = ((((this.asistenteTCO.salarioBasico + this.asistenteTCO.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let icbf = ((((this.asociadoTCO.salarioBasico + this.asociadoTCO.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let icbf = ((((this.titularTCO.salarioBasico + this.titularTCO.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].icbf = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let icbf = ((((this.auxiliarPrestacional.salarioBasico + this.auxiliarPrestacional.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let icbf = ((((this.asistentePrestacional.salarioBasico + this.asistentePrestacional.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let icbf = ((((this.asociadoPrestacional.salarioBasico + this.asociadoPrestacional.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let icbf = ((((this.titularPrestacional.salarioBasico + this.titularPrestacional.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].icbf = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let icbf = ((((this.asistentePrestacionalPOS.salarioBasico + this.asistentePrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let icbf = ((((this.asociadoPrestacionalPOS.salarioBasico + this.asociadoPrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let icbf = ((((this.titularPrestacionalPOS.salarioBasico + this.titularPrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let icbf = ((((this.asistenteUDPrestacionalPOS.salarioBasico + this.asistenteUDPrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let icbf = ((((this.asociadoUDPrestacionalPOS.salarioBasico + this.asociadoUDPrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let icbf = ((((this.titularUDPrestacionalPOS.salarioBasico + this.titularUDPrestacionalPOS.primaVacaciones) * element.horas) * element.semanas) * 0.03 * (1 + this.incremento)).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
    }
  }

  actualizarTotalBasico(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let primaServicios = parseInt(element.primaServicios.replace(/\$|,/g, ''));
        let primaNavidad = parseInt(element.primaNavidad.replace(/\$|,/g, ''));
        let primaVacaciones = parseInt(element.primaVacaciones.replace(/\$|,/g, ''));
        let bonificacion;
        if (element.bonificacion != "" && element.bonificacion != "N/A") {
          bonificacion = parseInt(element.bonificacion.replace(/\$|,/g, ''));
        } else {
          bonificacion = 0;
        }
        let totalCesantias = parseInt(element.totalCesantias.replace(/\$|,/g, ''));
        let vacaciones = parseInt(element.vacaciones.replace(/\$|,/g, ''));

        let totalBasico = (sueldoBasico + primaServicios + primaNavidad + primaVacaciones + bonificacion + totalCesantias + vacaciones).toFixed(0);
        this.dataSourceRHF.data[rowIndex].totalBasico = formatCurrency(parseInt(totalBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPRE") {
        let totalBasico;
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let primaServicios = parseInt(element.primaServicios.replace(/\$|,/g, ''));
        let primaNavidad = parseInt(element.primaNavidad.replace(/\$|,/g, ''));
        let primaVacaciones = parseInt(element.primaVacaciones.replace(/\$|,/g, ''));
        let vacaciones = parseInt(element.vacaciones.replace(/\$|,/g, ''));
        let totalCesantias = parseInt(element.totalCesantias.replace(/\$|,/g, ''));
        let bonificacion;
        if (element.bonificacion != "" && element.bonificacion != "N/A") {
          bonificacion = parseInt(element.bonificacion.replace(/\$|,/g, ''));
        } else {
          bonificacion = 0;
        }
        if (element.tipo === "H. Catedra Honorarios")
          totalBasico = (sueldoBasico).toFixed(0)
        else
          totalBasico = (sueldoBasico + primaServicios + primaNavidad + primaVacaciones + bonificacion + totalCesantias + vacaciones).toFixed(0);
        this.dataSourceRHVPRE.data[rowIndex].totalBasico = formatCurrency(parseInt(totalBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPOS") {
        let totalBasico;
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let primaServicios = parseInt(element.primaServicios.replace(/\$|,/g, ''));
        let primaNavidad = parseInt(element.primaNavidad.replace(/\$|,/g, ''));
        let primaVacaciones = parseInt(element.primaVacaciones.replace(/\$|,/g, ''));
        let vacaciones = parseInt(element.vacaciones.replace(/\$|,/g, ''));
        let totalCesantias = parseInt(element.totalCesantias.replace(/\$|,/g, ''));
        let bonificacion;
        if (element.bonificacion != "" && element.bonificacion != "N/A") {
          bonificacion = parseInt(element.bonificacion.replace(/\$|,/g, ''));
        } else {
          bonificacion = 0;
        }
        if (element.tipo === "H. Catedra Honorarios")
          totalBasico = (sueldoBasico).toFixed(0)
        else
          totalBasico = (sueldoBasico + primaServicios + primaNavidad + primaVacaciones + bonificacion + totalCesantias + vacaciones).toFixed(0);
        this.dataSourceRHVPOS.data[rowIndex].totalBasico = formatCurrency(parseInt(totalBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
    }
  }

  actualizarTotalAportes(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        let totalSalud = parseInt(element.totalSalud.replace(/\$|,/g, ''));
        let totalPension = parseInt(element.totalPensiones.replace(/\$|,/g, ''));
        let totalArl = parseInt(element.totalArl.replace(/\$|,/g, ''));
        let caja = parseInt(element.caja.replace(/\$|,/g, ''));
        let icbf = parseInt(element.icbf.replace(/\$|,/g, ''));

        let totalAportes = (totalSalud + totalPension + totalArl + caja + icbf).toFixed(0);
        this.dataSourceRHF.data[rowIndex].totalAportes = formatCurrency(parseInt(totalAportes), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPRE") {
        let totalAportes;
        let totalSalud = parseInt(element.totalSalud.replace(/\$|,/g, ''));
        let totalPension = parseInt(element.totalPensiones.replace(/\$|,/g, ''));
        let totalArl = parseInt(element.totalArl.replace(/\$|,/g, ''));
        let caja = parseInt(element.caja.replace(/\$|,/g, ''));
        let icbf = parseInt(element.icbf.replace(/\$|,/g, ''));

        if (element.tipo === "H. Catedra Honorarios")
          totalAportes = (0).toFixed(0)
        else
          totalAportes = (totalSalud + totalPension + totalArl + caja + icbf).toFixed(0);
        this.dataSourceRHVPRE.data[rowIndex].totalAportes = formatCurrency(parseInt(totalAportes), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPOS") {
        let totalAportes;
        let totalSalud = parseInt(element.totalSalud.replace(/\$|,/g, ''));
        let totalPension = parseInt(element.totalPensiones.replace(/\$|,/g, ''));
        let totalArl = parseInt(element.totalArl.replace(/\$|,/g, ''));
        let caja = parseInt(element.caja.replace(/\$|,/g, ''));
        let icbf = parseInt(element.icbf.replace(/\$|,/g, ''));

        if (element.tipo === "H. Catedra Honorarios")
          totalAportes = (0).toFixed(0)
        else
          totalAportes = (totalSalud + totalPension + totalArl + caja + icbf).toFixed(0);
        this.dataSourceRHVPOS.data[rowIndex].totalAportes = formatCurrency(parseInt(totalAportes), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
    }
  }

  actualizarTotalRecurso(element, rowIndex, tipo) {
    if (element.tipo != "" && element.categoria != "" && element.semanas != "" && element.horas != "") {
      if (tipo === "RHF") {
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let primaServicios = parseInt(element.primaServicios.replace(/\$|,/g, ''));
        let primaNavidad = parseInt(element.primaNavidad.replace(/\$|,/g, ''));
        let primaVacaciones = parseInt(element.primaVacaciones.replace(/\$|,/g, ''));
        let vacaciones = parseInt(element.vacaciones.replace(/\$|,/g, ''));
        let bonificacion;
        if (element.bonificacion != "" && element.bonificacion != "N/A") {
          bonificacion = parseInt(element.bonificacion.replace(/\$|,/g, ''));
        } else {
          bonificacion = 0;
        }
        let totalCesantias = parseInt(element.totalCesantias.replace(/\$|,/g, ''));
        let totalSalud = parseInt(element.totalSalud.replace(/\$|,/g, ''));
        let totalPension = parseInt(element.totalPensiones.replace(/\$|,/g, ''));
        let totalArl = parseInt(element.totalArl.replace(/\$|,/g, ''));
        let caja = parseInt(element.caja.replace(/\$|,/g, ''));
        let icbf = parseInt(element.icbf.replace(/\$|,/g, ''));

        let total = (sueldoBasico + primaServicios + primaNavidad + primaVacaciones + bonificacion + totalCesantias + totalSalud + totalArl + caja + icbf + vacaciones + totalPension).toFixed(0);
        this.dataSourceRHF.data[rowIndex].total = formatCurrency(parseInt(total), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPRE") {
        let total;
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let primaServicios = parseInt(element.primaServicios.replace(/\$|,/g, ''));
        let primaNavidad = parseInt(element.primaNavidad.replace(/\$|,/g, ''));
        let primaVacaciones = parseInt(element.primaVacaciones.replace(/\$|,/g, ''));
        let vacaciones = parseInt(element.vacaciones.replace(/\$|,/g, ''));
        let bonificacion;
        if (element.bonificacion != "" && element.bonificacion != "N/A") {
          bonificacion = parseInt(element.bonificacion.replace(/\$|,/g, ''));
        } else {
          bonificacion = 0;
        }
        let totalCesantias = parseInt(element.totalCesantias.replace(/\$|,/g, ''));
        let totalSalud = parseInt(element.totalSalud.replace(/\$|,/g, ''));
        let totalArl = parseInt(element.totalArl.replace(/\$|,/g, ''));
        let caja = parseInt(element.caja.replace(/\$|,/g, ''));
        let icbf = parseInt(element.icbf.replace(/\$|,/g, ''));
        if (element.tipo === "H. Catedra Honorarios")
          total = (sueldoBasico).toFixed(0)
        else
          total = (sueldoBasico + primaServicios + primaNavidad + primaVacaciones + bonificacion + totalCesantias + totalSalud + totalArl + caja + icbf + vacaciones).toFixed(0);
        this.dataSourceRHVPRE.data[rowIndex].total = formatCurrency(parseInt(total), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPOS") {
        let total;
        let sueldoBasico = parseInt(element.sueldoBasico.replace(/\$|,/g, ''));
        let primaServicios = parseInt(element.primaServicios.replace(/\$|,/g, ''));
        let primaNavidad = parseInt(element.primaNavidad.replace(/\$|,/g, ''));
        let primaVacaciones = parseInt(element.primaVacaciones.replace(/\$|,/g, ''));
        let vacaciones = parseInt(element.vacaciones.replace(/\$|,/g, ''));
        let bonificacion;
        if (element.bonificacion != "" && element.bonificacion != "N/A") {
          bonificacion = parseInt(element.bonificacion.replace(/\$|,/g, ''));
        } else {
          bonificacion = 0;
        }
        let totalCesantias = parseInt(element.totalCesantias.replace(/\$|,/g, ''));
        let totalSalud = parseInt(element.totalSalud.replace(/\$|,/g, ''));
        let totalArl = parseInt(element.totalArl.replace(/\$|,/g, ''));
        let caja = parseInt(element.caja.replace(/\$|,/g, ''));
        let icbf = parseInt(element.icbf.replace(/\$|,/g, ''));
        if (element.tipo === "H. Catedra Honorarios")
          total = (sueldoBasico).toFixed(0)
        else
          total = (sueldoBasico + primaServicios + primaNavidad + primaVacaciones + bonificacion + totalCesantias + totalSalud + totalArl + caja + icbf + vacaciones).toFixed(0);
        this.dataSourceRHVPOS.data[rowIndex].total = formatCurrency(parseInt(total), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
    }
  }
  checkGeneral_TotalCesantiasPensiones() {
    let modals = [];

    this.dataSourceRHF.data.forEach((data, i) => {
      let sumaC = (parseFloat(data.cesantiasPrivado.replace(/\$|,/g, '')) || 0.0) + (parseFloat(data.cesantiasPublico.replace(/\$|,/g, '')) || 0.0);
      let totalC = (parseFloat(data.totalCesantias.replace(/\$|,/g, '')) || 0.0);
      if (sumaC != totalC) {
        console.log(sumaC, '!=', totalC)
        this.banderaCerrar = true;
        modals.push({ icon: 'warning', title: 'Docentes V.E Ocasionales Pregrado', text: (i + 1) + ". " + data.tipo + ' ' + data.categoria + ' incongruencia en cesantias' })
      }
      let sumaP = (parseFloat(data.pensionesPrivado.replace(/\$|,/g, '')) || 0.0) + (parseFloat(data.pensionesPublico.replace(/\$|,/g, '')) || 0.0);
      let totalP = (parseFloat(data.totalPensiones.replace(/\$|,/g, '')) || 0.0);
      if (sumaP != totalP) {
        console.log(sumaP, '!=', totalP)
        this.banderaCerrar = true;
        modals.push({ icon: 'warning', title: 'Docentes V.E Ocasionales Pregrado', text: (i + 1) + ". " + data.tipo + ' ' + data.categoria + ' incongruencia en pensiones' })
      }
    })
    this.dataSourceRHVPRE.data.forEach((data, i) => {
      let sumaC = (parseFloat(data.cesantiasPrivado.replace(/\$|,/g, '')) || 0.0) + (parseFloat(data.cesantiasPublico.replace(/\$|,/g, '')) || 0.0);
      let totalC = (parseFloat(data.totalCesantias.replace(/\$|,/g, '')) || 0.0);
      if (sumaC != totalC) {
        console.log(sumaC, '!=', totalC)
        this.banderaCerrar = true;
        modals.push({ icon: 'warning', title: 'Docentes V.E Hora Cátedra Pregrado', text: (i + 1) + ". " + data.tipo + ' ' + data.categoria + ' incongruencia en cesantias' })
      }
      let sumaP = (parseFloat(data.pensionesPrivado.replace(/\$|,/g, '')) || 0.0) + (parseFloat(data.pensionesPublico.replace(/\$|,/g, '')) || 0.0);
      let totalP = (parseFloat(data.totalPensiones.replace(/\$|,/g, '')) || 0.0);
      if (sumaP != totalP) {
        console.log(sumaP, '!=', totalP)
        this.banderaCerrar = true;
        modals.push({ icon: 'warning', title: 'Docentes V.E Hora Cátedra Pregrado', text: (i + 1) + ". " + data.tipo + ' ' + data.categoria + ' incongruencia en pensiones' })
      }
    })
    this.dataSourceRHVPOS.data.forEach((data, i) => {
      let sumaC = (parseFloat(data.cesantiasPrivado.replace(/\$|,/g, '')) || 0.0) + (parseFloat(data.cesantiasPublico.replace(/\$|,/g, '')) || 0.0);
      let totalC = (parseFloat(data.totalCesantias.replace(/\$|,/g, '')) || 0.0);
      if (sumaC != totalC) {
        console.log(sumaC, '!=', totalC)
        this.banderaCerrar = true;
        modals.push({ icon: 'warning', title: 'Docentes V.E Hora Cátedra Posgrado', text: (i + 1) + ". " + data.tipo + ' ' + data.categoria + ' incongruencia en cesantias' })
      }
      let sumaP = (parseFloat(data.pensionesPrivado.replace(/\$|,/g, '')) || 0.0) + (parseFloat(data.pensionesPublico.replace(/\$|,/g, '')) || 0.0);
      let totalP = (parseFloat(data.totalPensiones.replace(/\$|,/g, '')) || 0.0);
      if (sumaP != totalP) {
        console.log(sumaP, '!=', totalP)
        this.banderaCerrar = true;
        modals.push({ icon: 'warning', title: 'Docentes V.E Hora Cátedra Posgrado', text: (i + 1) + ". " + data.tipo + ' ' + data.categoria + ' incongruencia en pensiones' })
      }
    })

    Swal.queue(modals)
    return this.banderaCerrar;
  }

  guardarRecursos() {
    if (this.checkGeneral_TotalCesantiasPensiones()) {
      // Swal.fire({
      //   icon: 'warning',
      //   title: 'Algunos aportes de cesantias o pensiones no coinciden con los totales, revise detenidamente cada uno de los campos.',
      //   showConfirmButton: true
      // })
    } else if (this.incremento == 0.0) {
      Swal.fire({
        icon: 'warning',
        text: 'El porcentaje de incremento asociado a la vigencia en cuestión aún no ha sido aplicado, por favor presione el botón "Aplicar Incremento" para actualizar los valores.',
        showConfirmButton: true
      })
    } else {
      if (this.verificarTablas()) {
        let arreglo: string[] = [];
        this.accionBoton = 'guardar';
        this.tipoIdenti = 'docentes';
        let accion = this.accionBoton;
        let identi = this.tipoIdenti;
        var identificaciones: any;

        let aux1 = this.dataSourceRHF.data;
        for (var i in aux1) {
          var obj = aux1[i];
          obj["activo"] = true;
          obj["incremento"] = this.incremento;
          var num = +i + 1;
          obj["index"] = num;
        }
        let dataStrRHF = JSON.stringify(Object.assign({}, aux1));

        let aux2 = this.dataSourceRHVPRE.data
        for (var i in aux2) {
          var obj = aux2[i];
          obj["activo"] = true;
          var num = +i + 1;
          obj["index"] = num;
        }
        let dataStrRHVPRE = JSON.stringify(Object.assign({}, aux2));


        let aux3 = this.dataSourceRHVPOS.data
        for (var i in aux3) {
          var obj = aux3[i];
          obj["activo"] = true;
          var num = +i + 1;
          obj["index"] = num;
        }
        let dataStrRHVPOS = JSON.stringify(Object.assign({}, aux3));

        let aux4 = this.dataSourceRubros.data
        for (var i in aux4) {
          var obj = aux4[i];
          obj["activo"] = true;
          var num = +i + 1;
        }
        let dataRubros = JSON.stringify(Object.assign({}, aux4))

        identificaciones = {
          "rhf": dataStrRHF,
          "rhv_pre": dataStrRHVPRE,
          "rhv_pos": dataStrRHVPOS,
          "rubros": dataRubros,
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
            if (!this.banderaCerrar) {
              this.acciones.emit({ aux, accion, identi });
            }
          }
        })
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Por favor complete todos los campos antes de continuar',
          timer: 3500,
        })
      }
    }

  }

  ocultarRecursos() {
    this.accionBoton = 'ocultar';
    this.tipoIdenti = 'docentes';
    let data = this.dataSourceRHF.data;
    let accion = this.accionBoton;
    let identi = this.tipoIdenti;
    this.acciones.emit({ data, accion, identi });
  }

  verificarCesantias(element, rowIndex, tipo) {
    if (element.tipo != "H. Catedra Honorarios")
      if (element.cesantiasPrivado != "" && element.cesantiasPublico != "") {
        let cesantiasPublico = parseInt(element.cesantiasPublico.replace(/\$|,/g, ''));
        let cesantiasPrivado = parseInt(element.cesantiasPrivado.replace(/\$|,/g, ''));
        let cesantias = parseInt(element.totalCesantias.replace(/\$|,/g, ''));
        if (tipo === "RHF") {
          this.dataSourceRHF.data[rowIndex].cesantiasPrivado = formatCurrency(cesantiasPrivado, 'en-US', getCurrencySymbol('USD', 'wide'));
          this.dataSourceRHF.data[rowIndex].cesantiasPublico = formatCurrency(cesantiasPublico, 'en-US', getCurrencySymbol('USD', 'wide'));
        }
        if (tipo === "RHVPRE") {
          this.dataSourceRHVPRE.data[rowIndex].cesantiasPrivado = formatCurrency(cesantiasPrivado, 'en-US', getCurrencySymbol('USD', 'wide'));
          this.dataSourceRHVPRE.data[rowIndex].cesantiasPublico = formatCurrency(cesantiasPublico, 'en-US', getCurrencySymbol('USD', 'wide'));
        }
        if (tipo === "RHVPOS") {
          this.dataSourceRHVPOS.data[rowIndex].cesantiasPrivado = formatCurrency(cesantiasPrivado, 'en-US', getCurrencySymbol('USD', 'wide'));
          this.dataSourceRHVPOS.data[rowIndex].cesantiasPublico = formatCurrency(cesantiasPublico, 'en-US', getCurrencySymbol('USD', 'wide'));
        }
        if (cesantiasPublico + cesantiasPrivado == cesantias) {
          this.banderaCerrar = false;
        } else {
          this.banderaCerrar = true;
          Swal.fire({
            icon: 'warning',
            title: 'Por favor verifique los campos de cesantias',
            showConfirmButton: true,
            timer: 2500,
          })
        }
      } else {
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: 'Por favor complete los campos de cesantias',
          showConfirmButton: false,
          timer: 2500,
        })
      }
  }

  verificarPensiones(element, rowIndex, tipo) {
    if (element.tipo != "H. Catedra Honorarios")
      if (element.pensionesPrivado != "" && element.pensionesPublico != "") {
        let pensionesPublico = parseInt(element.pensionesPublico.replace(/\$|,/g, ''));
        let pensionesPrivado = parseInt(element.pensionesPrivado.replace(/\$|,/g, ''));
        let pensiones = parseInt(element.totalPensiones.replace(/\$|,/g, ''));
        if (tipo === "RHF") {
          this.dataSourceRHF.data[rowIndex].pensionesPrivado = formatCurrency(pensionesPrivado, 'en-US', getCurrencySymbol('USD', 'wide'));
          this.dataSourceRHF.data[rowIndex].pensionesPublico = formatCurrency(pensionesPublico, 'en-US', getCurrencySymbol('USD', 'wide'));
        }
        if (tipo === "RHVPRE") {
          this.dataSourceRHVPRE.data[rowIndex].pensionesPrivado = formatCurrency(pensionesPrivado, 'en-US', getCurrencySymbol('USD', 'wide'));
          this.dataSourceRHVPRE.data[rowIndex].pensionesPublico = formatCurrency(pensionesPublico, 'en-US', getCurrencySymbol('USD', 'wide'));
        }
        if (tipo === "RHVPOS") {
          this.dataSourceRHVPOS.data[rowIndex].pensionesPrivado = formatCurrency(pensionesPrivado, 'en-US', getCurrencySymbol('USD', 'wide'));
          this.dataSourceRHVPOS.data[rowIndex].pensionesPublico = formatCurrency(pensionesPublico, 'en-US', getCurrencySymbol('USD', 'wide'));
        }
        if (pensionesPublico + pensionesPrivado == pensiones) {
          this.banderaCerrar = false;
        } else {
          this.banderaCerrar = true;
          Swal.fire({
            icon: 'warning',
            title: 'Por favor verifique los campos de pensiones',
            showConfirmButton: true,
            timer: 2500,
          })
        }
      } else {
        Swal.fire({
          position: 'top-end',
          icon: 'warning',
          title: 'Por favor complete los campos de pensiones',
          showConfirmButton: false,
          timer: 2500,
        })
      }
  }

  verificarTablas(): boolean {
    var bandera: boolean = false
    for (let i = 0; i < this.dataSourceRHF.data.length; i++) {
      let aux = this.dataSourceRHF.data[i];
      if (aux.pensionesPublico != "" && aux.pensionesPrivado != "" && aux.cesantiasPublico != "" && aux.cesantiasPrivado != "") {
        bandera = true;
      } else {
        return false;
        break
      }
    }
    for (let i = 0; i < this.dataSourceRHVPRE.data.length; i++) {
      let aux = this.dataSourceRHVPRE.data[i];
      if (aux.pensionesPublico != "" && aux.pensionesPrivado != "" && aux.cesantiasPublico != "" && aux.cesantiasPrivado != "") {
        bandera = true;
      } else {
        return false;
        break
      }
    }
    for (let i = 0; i < this.dataSourceRHVPOS.data.length; i++) {
      let aux = this.dataSourceRHVPOS.data[i];
      if (aux.pensionesPublico != "" && aux.pensionesPrivado != "" && aux.cesantiasPublico != "" && aux.cesantiasPrivado != "") {
        bandera = true;
      } else {
        return false;
        break
      }
    }
    return bandera
  }

  OnPageChangeRHF(event: PageEvent) {
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.dataSourceRHF.data.length) {
      endIndex = this.dataSourceRHF.data.length;
    }
    this.steps[0].data = this.dataSourceRHF.data.slice(startIndex, endIndex);
  }

  OnPageChangeRHVPRE(event: PageEvent) {
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.dataSourceRHVPRE.data.length) {
      endIndex = this.dataSourceRHVPRE.data.length;
    }
    this.steps[1].data = this.dataSourceRHVPRE.data.slice(startIndex, endIndex);
  }

  OnPageChangeRHVPOS(event: PageEvent) {
    let startIndex = event.pageIndex * event.pageSize;
    let endIndex = startIndex + event.pageSize;
    if (endIndex > this.dataSourceRHVPOS.data.length) {
      endIndex = this.dataSourceRHVPOS.data.length;
    }
    this.steps[2].data = this.dataSourceRHVPOS.data.slice(startIndex, endIndex);
  }
}

var dataRubros: any[] = [
  {
    "categoria": "Salario básico",
    "rubro": ""
  },
  {
    "categoria": "Prima de Servicios",
    "rubro": ""
  },
  {
    "categoria": "Prima de navidad",
    "rubro": ""
  },
  {
    "categoria": "Prima de vacaciones",
    "rubro": ""
  },
  {
    "categoria": "Bonificación por servicios",
    "rubro": ""
  },
  {
    "categoria": "Intereses cesantías",
    "rubro": ""
  },
  {
    "categoria": "Aporte cesantías público",
    "rubro": ""
  },
  {
    "categoria": "Aporte cesantías privado",
    "rubro": ""
  },
  {
    "categoria": "Aporte salud",
    "rubro": ""
  },
  {
    "categoria": "Fondo pensiones público",
    "rubro": ""
  },
  {
    "categoria": "Fondo pensiones privado",
    "rubro": ""
  },
  {
    "categoria": "Aporte ARL",
    "rubro": ""
  },
  {
    "categoria": "Aporte CCF",
    "rubro": ""
  },
  {
    "categoria": "Aporte ICBF",
    "rubro": ""
  }];
