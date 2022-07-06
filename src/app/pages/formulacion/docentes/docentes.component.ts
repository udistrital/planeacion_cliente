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
import { formatCurrency, getCurrencySymbol } from '@angular/common';

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
    this.request.get(environment.PLANES_MID, `formulacion/get_rubros`).subscribe((data: any) => {
      this.rubros = data.Data;
      Swal.close();
    })

  }

  loadTabla() {
    if (this.dataTabla) {
      this.dataSourceRubros.data =  [
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
      this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:` + this.plan + `,tipo_identificacion_id:61897518f6fc97091727c3c3`).subscribe((data: any) => {
        if (data) {
          let identificacion = data.Data[0];
          if (identificacion.activo === false) {
            this.dataSourceRHF.data = [];
            this.dataSourceRHVPRE.data = [];
            this.dataSourceRHVPOS.data = [];
            this.steps = [
              {
                "nombre": "Recurso horas fijas - Pregrado",
                "tipo": "RHF",
                "nivel": "Pregrado",
                "data": this.dataSourceRHF,
                "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Completo" }],
                "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
              },
              {
                "nombre": "Recurso horas variable - Pregrado",
                "tipo": 'RHVPRE',
                "nivel": "Pregrado",
                "data": this.dataSourceRHVPRE,
                "tipos": [{ "nombre": "H. Catedra Honorarios" }, { "nombre": "H. Catedra Prestacional" }],
                "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
              },
              {
                "nombre": "Recurso horas variable - Posgrado",
                "tipo": "RHVPOS",
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
                if (this.data.rhf != "{}")
                  this.dataSourceRHF.data = this.data.rhf;
                if (this.data.rhv_pre != "{}")
                  this.dataSourceRHVPOS.data = this.data.rhv_pos;
                if (this.data.rhv_pos != "{}")
                  this.dataSourceRHVPRE.data = this.data.rhv_pre;
                if (this.data.rubros != "{}" && this.data.rubros != null){
                  this.dataSourceRubros.data = this.data.rubros
                }
              }
              this.steps = [
                {
                  "nombre": "Recurso horas fijas - Pregrado",
                  "tipo": "RHF",
                  "nivel": "Pregrado",
                  "data": this.dataSourceRHF,
                  "tipos": [{ "nombre": "Medio Tiempo" }, { "nombre": "Tiempo Completo" }],
                  "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
                },
                {
                  "nombre": "Recurso horas variable - Pregrado",
                  "tipo": 'RHVPRE',
                  "nivel": "Pregrado",
                  "data": this.dataSourceRHVPRE,
                  "tipos": [{ "nombre": "H. Catedra Honorarios" }, { "nombre": "H. Catedra Prestacional" }],
                  "categorias": [{ "nombre": "Auxiliar" }, { "nombre": "Asistente" }, { "nombre": "Asociado" }, { "nombre": "Titular" }]
                },
                {
                  "nombre": "Recurso horas variable - Posgrado",
                  "tipo": "RHVPOS",
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

  loadVigenciaConsulta(){
    let aux : number = + this.vigencia.Nombre;
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=Nombre:`+(aux-1).toString()).subscribe((data: any) => {
      if (data) {
        let auxVigencia = data.Data[0];
        if (auxVigencia.Id != null){
          this.vigenciaConsulta = auxVigencia;
          this.loadDesagregado();
        }else{
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
        if (this.readonlyTable != true){ //Se tiene en cuenta vigencia para la consulta --  loadVigenciaConsulta()
          this.readonlyTable = this.verificarVersiones();
        }
        this.mostrarObservaciones = this.verificarObservaciones();
        if (this.mostrarObservaciones) {
          return ['acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'total', 'observaciones'];
        } else {
          return ['acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'total'];
        }

      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'total'];
      }
    }

    if (this.rol == 'PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'total'];
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'total', 'observaciones'];
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['acciones', 'tipo', 'categoria', 'semanas', 'horas', 'totalHoras', 'meses', 'sueldoBasico', 'sueldoMensual', 'primaServicios', 'primaNavidad', 'primaVacaciones', 'bonificacion', 'cesantiasPublico', 'cesantiasPrivado', 'interesesCesantias', 'cesantias', 'totalCesantias', 'totalSalud', 'pensionesPublico', 'pensionesPrivado', 'totalPensiones', 'totalArl', 'caja', 'icbf', 'total'];
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
          return ['accionesP','tipoP','categoriaP','semanasP','horasP','totalHorasP','mesesP','sueldoBasicoP','sueldoMensualP','prestacionesSociales','seguridadSocial','parafiscales','totalRecursoP', 'observacionesP']
        } else {
          return ['accionesP','tipoP','categoriaP','semanasP','horasP','totalHorasP','mesesP','sueldoBasicoP','sueldoMensualP','prestacionesSociales','seguridadSocial','parafiscales','totalRecursoP']
        }

      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['accionesP','tipoP','categoriaP','semanasP','horasP','totalHorasP','mesesP','sueldoBasicoP','sueldoMensualP','prestacionesSociales','seguridadSocial','parafiscales','totalRecursoP', 'observacionesP']
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['accionesP','tipoP','categoriaP','semanasP','horasP','totalHorasP','mesesP','sueldoBasicoP','sueldoMensualP','prestacionesSociales','seguridadSocial','parafiscales','totalRecursoP']
      }
    }

    if (this.rol == 'PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['accionesP','tipoP','categoriaP','semanasP','horasP','totalHorasP','mesesP','sueldoBasicoP','sueldoMensualP','prestacionesSociales','seguridadSocial','parafiscales','totalRecursoP']
      }
      if (this.estadoPlan == 'En revisión') {
        this.readonlyObs = false;
        this.readonlyTable = true;
        return ['accionesP','tipoP','categoriaP','semanasP','horasP','totalHorasP','mesesP','sueldoBasicoP','sueldoMensualP','prestacionesSociales','seguridadSocial','parafiscales','totalRecursoP', 'observacionesP']
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['accionesP','tipoP','categoriaP','semanasP','horasP','totalHorasP','mesesP','sueldoBasicoP','sueldoMensualP','prestacionesSociales','seguridadSocial','parafiscales','totalRecursoP', 'observacionesP']
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readonlyTable = true;
        return ['accionesP','tipoP','categoriaP','semanasP','horasP','totalHorasP','mesesP','sueldoBasicoP','sueldoMensualP','prestacionesSociales','seguridadSocial','parafiscales','totalRecursoP']
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
        total: ''
      });
      this.dataSourceRHF.paginator = this.paginatorRHF;
      this.dataSourceRHF.sort = this.sortRHF;
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
        privaServicios: '',
        primaNavidad: '',
        primaVacaciones: '',
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
        total: ''
      });
      this.dataSourceRHVPRE.paginator = this.paginatorRHVPRE;
      this.dataSourceRHVPRE.sort = this.sortRHVPRE;
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
        privaServicios: '',
        primaNavidad: '',
        primaVacaciones: '',
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
        total: ''
      });
      this.dataSourceRHVPOS.paginator = this.paginatorRHVPOS;
      this.dataSourceRHVPOS.sort = this.sortRHVPOS;
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
        this.dataSourceRHVPOS.data = data;
      }
    }

  }


  onChangeTipo(element, rowIndex, tipo) {
    if (tipo === 'RHF') {
      if (element.tipo === "Medio Tiempo") {
        this.dataSourceRHF.data[rowIndex].horas = 20;
      } else if (element.tipo === "Tiempo Completo") {
        this.dataSourceRHF.data[rowIndex].horas = 40;
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
            let sueldoBasico = ((this.auxiliarMTO.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistenteMTO.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoMTO.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularMTO.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let sueldoBasico = ((this.auxiliarTCO.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistenteTCO.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoTCO.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularTCO.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          if (element.categoria === "Auxiliar") {
            let sueldoBasico = ((this.auxiliarHonorarios.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistenteHonorarios.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoHonorarios.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularHonorarios.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let sueldoBasico = ((this.auxiliarPrestacional.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistentePrestacional.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoPrestacional.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularPrestacional.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistenteHonorariosPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoHonorariosPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularHonorariosPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          //
          if (element.categoria === "Asistente UD") {
            let sueldoBasico = ((this.asistenteUDHonorariosPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let sueldoBasico = ((this.asociadoUDHonorariosPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let sueldoBasico = ((this.titularUDHonorariosPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let sueldoBasico = ((this.asistentePrestacionalPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let sueldoBasico = ((this.asociadoPrestacionalPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let sueldoBasico = ((this.titularPrestacionalPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let sueldoBasico = ((this.asistenteUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let sueldoBasico = ((this.asociadoUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].sueldoBasico = formatCurrency(parseInt(sueldoBasico), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let sueldoBasico = ((this.titularUDPrestacionalPOS.salarioBasico * element.horas) * element.semanas).toFixed(0);
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
        if (element.tipo === "Medio Tiempo") {
          if (element.categoria === "Auxiliar") {
            let primaServicios = ((this.auxiliarMTO.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaServicios = ((this.asistenteMTO.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaServicios = ((this.asociadoMTO.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaServicios = ((this.titularMTO.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let primaServicios = ((this.auxiliarTCO.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaServicios = ((this.asistenteTCO.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaServicios = ((this.asociadoTCO.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaServicios = ((this.titularTCO.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].primaServicios = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let primaServicios = ((this.auxiliarPrestacional.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaServicios = ((this.asistentePrestacional.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaServicios = ((this.asociadoPrestacional.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaServicios = ((this.titularPrestacional.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].primaServicios = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let primaServicios = ((this.asistentePrestacionalPOS.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaServicios = ((this.asociadoPrestacionalPOS.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaServicios = ((this.titularPrestacionalPOS.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let primaServicios = ((this.asistenteUDPrestacionalPOS.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let primaServicios = ((this.asociadoUDPrestacionalPOS.prima_servicios * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaServicios = formatCurrency(parseInt(primaServicios), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let primaServicios = ((this.titularUDPrestacionalPOS.prima_servicios * element.horas) * element.semanas).toFixed(0);
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
            let primaNavidad = ((this.auxiliarMTO.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaNavidad = ((this.asistenteMTO.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaNavidad = ((this.asociadoMTO.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaNavidad = ((this.titularMTO.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let primaNavidad = ((this.auxiliarTCO.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaNavidad = ((this.asistenteTCO.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaNavidad = ((this.asociadoTCO.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaNavidad = ((this.titularTCO.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].primaNavidad = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let primaNavidad = ((this.auxiliarPrestacional.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaNavidad = ((this.asistentePrestacional.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaNavidad = ((this.asociadoPrestacional.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaNavidad = ((this.titularPrestacional.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].primaNavidad = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let primaNavidad = ((this.asistentePrestacionalPOS.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaNavidad = ((this.asociadoPrestacionalPOS.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaNavidad = ((this.titularPrestacionalPOS.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let primaNavidad = ((this.asistenteUDPrestacionalPOS.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let primaNavidad = ((this.asociadoUDPrestacionalPOS.primaNavidad * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaNavidad = formatCurrency(parseInt(primaNavidad), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let primaNavidad = ((this.titularUDPrestacionalPOS.primaNavidad * element.horas) * element.semanas).toFixed(0);
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
            let primaVacaciones = ((this.auxiliarMTO.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaVacaciones = ((this.asistenteMTO.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaVacaciones = ((this.asociadoMTO.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaVacaciones = ((this.titularMTO.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let primaVacaciones = ((this.auxiliarTCO.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaVacaciones = ((this.asistenteTCO.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaVacaciones = ((this.asociadoTCO.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaVacaciones = ((this.titularTCO.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].primaVacaciones = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let primaVacaciones = ((this.auxiliarPrestacional.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let primaVacaciones = ((this.asistentePrestacional.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaVacaciones = ((this.asociadoPrestacional.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaVacaciones = ((this.titularPrestacional.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let primaVacaciones = ((this.asistentePrestacionalPOS.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let primaVacaciones = ((this.asociadoPrestacionalPOS.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let primaVacaciones = ((this.titularPrestacionalPOS.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let primaVacaciones = ((this.asistenteUDPrestacionalPOS.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let primaVacaciones = ((this.asociadoUDPrestacionalPOS.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let primaVacaciones = ((this.titularUDPrestacionalPOS.primaVacaciones * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].primaVacaciones = formatCurrency(parseInt(primaVacaciones), 'en-US', getCurrencySymbol('USD', 'wide'));
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
            let interesesCesantias = ((this.auxiliarMTO.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let interesesCesantias = ((this.asistenteMTO.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let interesesCesantias = ((this.asociadoMTO.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let interesesCesantias = ((this.titularMTO.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let interesesCesantias = ((this.auxiliarTCO.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let interesesCesantias = ((this.asistenteTCO.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let interesesCesantias = ((this.asociadoTCO.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let interesesCesantias = ((this.titularTCO.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].interesesCesantias = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let interesesCesantias = ((this.auxiliarPrestacional.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let interesesCesantias = ((this.asistentePrestacional.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let interesesCesantias = ((this.asociadoPrestacional.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let interesesCesantias = ((this.titularPrestacional.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let interesesCesantias = ((this.asistentePrestacionalPOS.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let interesesCesantias = ((this.asociadoPrestacionalPOS.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let interesesCesantias = ((this.titularPrestacionalPOS.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let interesesCesantias = ((this.asistenteUDPrestacionalPOS.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let interesesCesantias = ((this.asociadoUDPrestacionalPOS.interesCesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].interesesCesantias = formatCurrency(parseInt(interesesCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let interesesCesantias = ((this.titularUDPrestacionalPOS.interesCesantias * element.horas) * element.semanas).toFixed(0);
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
            let cesantias = ((this.auxiliarMTO.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let cesantias = ((this.asistenteMTO.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let cesantias = ((this.asociadoMTO.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let cesantias = ((this.titularMTO.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let cesantias = ((this.auxiliarTCO.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let cesantias = ((this.asistenteTCO.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let cesantias = ((this.asociadoTCO.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let cesantias = ((this.titularTCO.cesantias * element.horas) * element.semanas).toFixed(0);
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
            let cesantias = ((this.auxiliarPrestacional.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let cesantias = ((this.asistentePrestacional.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let cesantias = ((this.asociadoPrestacional.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let cesantias = ((this.titularPrestacional.cesantias * element.horas) * element.semanas).toFixed(0);
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
            let cesantias = ((this.asistentePrestacionalPOS.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let cesantias = ((this.asociadoPrestacionalPOS.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let cesantias = ((this.titularPrestacionalPOS.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let cesantias = ((this.asistenteUDPrestacionalPOS.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let cesantias = ((this.asociadoUDPrestacionalPOS.cesantias * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].cesantias = formatCurrency(parseInt(cesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let cesantias = ((this.titularUDPrestacionalPOS.cesantias * element.horas) * element.semanas).toFixed(0);
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
        }else{
          this.dataSourceRHVPRE.data[rowIndex].totalCesantias = "N/A";
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo != "H. Catedra Honorarios") {
          let interesesCesantias = parseInt(element.interesesCesantias.replace(/\$|,/g, ''));
          let cesantias = parseInt(element.cesantias.replace(/\$|,/g, ''));
          let totalCesantias = (interesesCesantias + cesantias).toFixed(0);
          this.dataSourceRHVPOS.data[rowIndex].totalCesantias = formatCurrency(parseInt(totalCesantias), 'en-US', getCurrencySymbol('USD', 'wide'));
        }else{
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
            let salud = ((((this.auxiliarMTO.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let salud = ((((this.asistenteMTO.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let salud = ((((this.asociadoMTO.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let salud = ((((this.titularMTO.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let salud = ((((this.auxiliarTCO.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let salud = ((((this.asistenteTCO.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let salud = ((((this.asociadoTCO.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let salud = ((((this.titularTCO.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].totalSalud = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let salud = ((((this.auxiliarPrestacional.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let salud = ((((this.asistentePrestacional.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let salud = ((((this.asociadoPrestacional.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let salud = ((((this.titularPrestacional.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].totalSalud = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let salud = ((((this.asistentePrestacionalPOS.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let salud = ((((this.asociadoPrestacionalPOS.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let salud = ((((this.titularPrestacionalPOS.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let salud = ((((this.asistenteUDPrestacionalPOS.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let salud = ((((this.asociadoUDPrestacionalPOS.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalSalud = formatCurrency(parseInt(salud), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let salud = ((((this.titularUDPrestacionalPOS.salud * element.horas) * element.semanas)/0.04)*0.085).toFixed(0);
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
            let pension = ((((this.auxiliarMTO.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let pension = ((((this.asistenteMTO.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let pension = ((((this.asociadoMTO.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let pension = ((((this.titularMTO.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let pension = ((((this.auxiliarTCO.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let pension = ((((this.asistenteTCO.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let pension = ((((this.asociadoTCO.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let pension = ((((this.titularTCO.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
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
            let pension = ((((this.auxiliarPrestacional.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let pension = ((((this.asistentePrestacional.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let pension = ((((this.asociadoPrestacional.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let pension = ((((this.titularPrestacional.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
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
            let pension = ((((this.asistentePrestacionalPOS.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let pension = ((((this.asociadoPrestacionalPOS.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let pension = ((((this.titularPrestacionalPOS.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let pension = ((((this.asistenteUDPrestacionalPOS.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let pension = ((((this.asociadoUDPrestacionalPOS.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalPensiones = formatCurrency(parseInt(pension), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let pension = ((((this.titularUDPrestacionalPOS.pension * element.horas) * element.semanas)/0.04)*0.12).toFixed(0);
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
            let arl = ((this.auxiliarMTO.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let arl = ((this.asistenteMTO.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let arl = ((this.asociadoMTO.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let arl = ((this.titularMTO.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let arl = ((this.auxiliarTCO.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let arl = ((this.asistenteTCO.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let arl = ((this.asociadoTCO.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let arl = ((this.titularTCO.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].totalArl = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let arl = ((this.auxiliarPrestacional.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let arl = ((this.asistentePrestacional.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let arl = ((this.asociadoPrestacional.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let arl = ((this.titularPrestacional.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].totalArl = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let arl = ((this.asistentePrestacionalPOS.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let arl = ((this.asociadoPrestacionalPOS.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let arl = ((this.titularPrestacionalPOS.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let arl = ((this.asistenteUDPrestacionalPOS.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let arl = ((this.asociadoUDPrestacionalPOS.arl * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].totalArl = formatCurrency(parseInt(arl), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let arl = ((this.titularUDPrestacionalPOS.arl * element.horas) * element.semanas).toFixed(0);
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
            let caja = ((this.auxiliarMTO.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let caja = ((this.asistenteMTO.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let caja = ((this.asociadoMTO.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let caja = ((this.titularMTO.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let caja = ((this.auxiliarTCO.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let caja = ((this.asistenteTCO.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let caja = ((this.asociadoTCO.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let caja = ((this.titularTCO.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].caja = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let caja = ((this.auxiliarPrestacional.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let caja = ((this.asistentePrestacional.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let caja = ((this.asociadoPrestacional.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let caja = ((this.titularPrestacional.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].caja = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let caja = ((this.asistentePrestacionalPOS.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let caja = ((this.asociadoPrestacionalPOS.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let caja = ((this.titularPrestacionalPOS.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let caja = ((this.asistenteUDPrestacionalPOS.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let caja = ((this.asociadoUDPrestacionalPOS.caja * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].caja = formatCurrency(parseInt(caja), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let caja = ((this.titularUDPrestacionalPOS.caja * element.horas) * element.semanas).toFixed(0);
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
            let icbf = ((this.auxiliarMTO.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let icbf = ((this.asistenteMTO.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let icbf = ((this.asociadoMTO.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let icbf = ((this.titularMTO.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }

        } else if (element.tipo === "Tiempo Completo") {
          if (element.categoria === "Auxiliar") {
            let icbf = ((this.auxiliarTCO.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let icbf = ((this.asistenteTCO.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let icbf = ((this.asociadoTCO.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let icbf = ((this.titularTCO.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHF.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPRE") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPRE.data[rowIndex].icbf = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Auxiliar") {
            let icbf = ((this.auxiliarPrestacional.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente") {
            let icbf = ((this.asistentePrestacional.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let icbf = ((this.asociadoPrestacional.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let icbf = ((this.titularPrestacional.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPRE.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
      }
      if (tipo === "RHVPOS") {
        if (element.tipo === "H. Catedra Honorarios") {
          this.dataSourceRHVPOS.data[rowIndex].icbf = "N/A";

        } else if (element.tipo === "H. Catedra Prestacional") {
          if (element.categoria === "Asistente") {
            let icbf = ((this.asistentePrestacionalPOS.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado") {
            let icbf = ((this.asociadoPrestacionalPOS.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular") {
            let icbf = ((this.titularPrestacionalPOS.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asistente UD") {
            let icbf = ((this.asistenteUDPrestacionalPOS.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Asociado UD") {
            let icbf = ((this.asociadoUDPrestacionalPOS.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
          if (element.categoria === "Titular UD") {
            let icbf = ((this.titularUDPrestacionalPOS.icbf * element.horas) * element.semanas).toFixed(0);
            this.dataSourceRHVPOS.data[rowIndex].icbf = formatCurrency(parseInt(icbf), 'en-US', getCurrencySymbol('USD', 'wide'));
          }
        }
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
        let bonificacion;
        if (element.bonificacion != ""  && element.bonificacion != "N/A") {
          bonificacion = parseInt(element.bonificacion.replace(/\$|,/g, ''));
        } else {
          bonificacion = 0;
        }
        let totalCesantias = parseInt(element.totalCesantias.replace(/\$|,/g, ''));
        let totalSalud = parseInt(element.totalSalud.replace(/\$|,/g, ''));
        let totalArl = parseInt(element.totalArl.replace(/\$|,/g, ''));
        let caja = parseInt(element.caja.replace(/\$|,/g, ''));
        let icbf = parseInt(element.icbf.replace(/\$|,/g, ''));

        let total = (sueldoBasico + primaServicios + primaNavidad + primaVacaciones + bonificacion + totalCesantias + totalSalud + totalArl + caja + icbf).toFixed(0);
        this.dataSourceRHF.data[rowIndex].total = formatCurrency(parseInt(total), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPRE") {
        let total;
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
        let totalSalud = parseInt(element.totalSalud.replace(/\$|,/g, ''));
        let totalArl = parseInt(element.totalArl.replace(/\$|,/g, ''));
        let caja = parseInt(element.caja.replace(/\$|,/g, ''));
        let icbf = parseInt(element.icbf.replace(/\$|,/g, ''));
        if (element.tipo === "H. Catedra Honorarios")
          total = (sueldoBasico).toFixed(0)
        else
          total = (sueldoBasico + primaServicios + primaNavidad + primaVacaciones + bonificacion + totalCesantias + totalSalud + totalArl + caja + icbf).toFixed(0);
        this.dataSourceRHVPRE.data[rowIndex].total = formatCurrency(parseInt(total), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
      if (tipo === "RHVPOS") {
        let total;
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
        let totalSalud = parseInt(element.totalSalud.replace(/\$|,/g, ''));
        let totalArl = parseInt(element.totalArl.replace(/\$|,/g, ''));
        let caja = parseInt(element.caja.replace(/\$|,/g, ''));
        let icbf = parseInt(element.icbf.replace(/\$|,/g, ''));
        if (element.tipo === "H. Catedra Honorarios")
          total = (sueldoBasico).toFixed(0)
        else
          total = (sueldoBasico + primaServicios + primaNavidad + primaVacaciones + bonificacion + totalCesantias + totalSalud + totalArl + caja + icbf).toFixed(0);
        this.dataSourceRHVPOS.data[rowIndex].total = formatCurrency(parseInt(total), 'en-US', getCurrencySymbol('USD', 'wide'));
      }
    }
  }

  guardarRecursos() {
    let arreglo: string[] = [];
    this.accionBoton = 'guardar';
    this.tipoIdenti = 'docentes';
    let accion = this.accionBoton;
    let identi = this.tipoIdenti;
    var identificaciones: any;
    let data = this.dataSourceRHF.data;

    for (var i in data) {
      var obj = data[i];
      obj["activo"] = true;
      var num = +i + 1;
    }
    let dataStrRHF = JSON.stringify(Object.assign({}, data));

    data = this.dataSourceRHVPRE.data
    for (var i in data) {
      var obj = data[i];
      obj["activo"] = true;
      var num = +i + 1;
    }
    let dataStrRHVPRE = JSON.stringify(Object.assign({}, data));


    data = this.dataSourceRHVPOS.data
    for (var i in data) {
      var obj = data[i];
      obj["activo"] = true;
      var num = +i + 1;
    }
    let dataStrRHVPOS = JSON.stringify(Object.assign({}, data));

    data = this.dataSourceRubros.data
    for (var i in data) {
      var obj = data[i];
      obj["activo"] = true;
      var num = +i + 1;
    }
    let dataRubros = JSON.stringify(Object.assign({}, data))

    identificaciones = {
      "rhf": dataStrRHF,
      "rhv_pre": dataStrRHVPRE,
      "rhv_pos": dataStrRHVPOS,
      "rubros": dataRubros
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




}

var dataRubros : any[] = [
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
