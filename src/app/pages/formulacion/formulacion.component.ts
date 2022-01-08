import { Component, ViewChild, OnInit, DoCheck } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormArray, FormBuilder, FormGroup, FormControl, Validators, AbstractControl, ControlContainer } from '@angular/forms';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import { MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { ArbolComponent } from '../plan/arbol/arbol.component';
import { element } from 'protractor';
import { stringify } from 'querystring';
import { timeStamp } from 'console';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';

@Component({
  selector: 'app-formulacion',
  templateUrl: './formulacion.component.html',
  styleUrls: ['./formulacion.component.scss']
})
export class FormulacionComponent implements OnInit {

  activedStep = 0;
  form: FormGroup;
  planes: any[];
  unidades: any[];
  vigencias: any[];
  planSelected: boolean;
  planAsignado: boolean;
  unidadSelected: boolean;
  vigenciaSelected: boolean;
  addActividad: boolean;
  identContratistas: boolean;
  plan: any;
  planAux: any;
  unidad: any;
  vigencia: any;
  steps: any[];
  json: any;
  estado: string;
  clonar: boolean;
  panelOpenState = true;
  dataT: boolean;
  banderaEdit: boolean;
  rowActividad: string;
  identRecursos: boolean;
  identDocentes: boolean;
  banderaIdentDocentes: boolean;

  tipoPlanId: string;
  idPadre: string;
  planesDesarrollo: any[];
  planDSelected: boolean;
  dataArmonizacion: string[] = [];
  estadoPlan: string;
  iconEstado: string;
  versionPlan: string;
  versiones: any[];
  controlVersion = new FormControl();
  readonlyObs: boolean;
  hiddenObs: boolean;
  readOnlyAll: boolean;
  ponderacionCompleta: boolean;
  ponderacionActividades: string;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService
  ) {
    this.loadPlanes();
    this.loadPeriodos();
    this.loadUnidades();
    this.addActividad = false;
    this.planSelected = false;
    this.unidadSelected = false;
    this.vigenciaSelected = false;
    this.clonar = false;
    this.identRecursos = false;
    this.identContratistas = false;
    this.identDocentes = false;
    this.dataT = false;
  }

  //displayedColumns: string[] = ['numero', 'nombre', 'rubro', 'valor', 'observacion', 'activo'];
  //columnsToDisplay: string[] = this.displayedColumns.slice();

  displayedColumns: string[];
  columnsToDisplay: string[]
  dataSource: MatTableDataSource<any>;

  ngOnInit(): void { }


  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadUnidades() {
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) => {
      if (data) {
        this.unidades = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  loadPeriodos() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  loadPlanes() {
    this.request.get(environment.PLANES_CRUD, `plan?query=formato:true`).subscribe((data: any) => {
      if (data) {
        this.planes = data.Data;
        this.planes = this.filterPlanes(this.planes);
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
  }

  submit() {
    if (!this.banderaEdit) { // ADD NUEVA ACTIVIDAD
      if (this.dataArmonizacion.length != 0) {

        var formValue = this.form.value;
        var actividad = {
          armo: this.dataArmonizacion.toString(),
          entrada: formValue
        }
        //console.log(actividad)
        this.request.put(environment.PLANES_MID, `formulacion/guardar_actividad`, actividad, this.plan._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Actividad agregada',
              //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
              text: 'La actividad se ha registrado satisfactoriamente',
              icon: 'success'
            }).then((result) => {
              if (result.value) {
                this.loadData()
                this.form.reset();
                this.addActividad = false;
                this.dataArmonizacion = [];
                this.idPadre = '';
                this.tipoPlanId = '';
              }
            })
          }
        })
      } else {
        Swal.fire({
          title: 'Por favor complete la armonización para continuar',
          text: `No se encontraron datos registrados`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }

    } else { // EDIT ACTIVIDAD
      if (this.dataArmonizacion.length != 0) {
        var aux = this.dataArmonizacion.toString()
        var formValue = this.form.value;
        var actividad = {
          entrada: formValue,
          armo: aux
        }
        //console.log(actividad)
        this.request.put(environment.PLANES_MID, `formulacion/actualizar_actividad`, actividad, this.plan._id + `/` + this.rowActividad).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Información de actividad actualizada',
              //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
              text: 'La actividad se ha actualizado satisfactoriamente',
              icon: 'success'
            }).then((result) => {
              if (result.value) {
                this.form.reset();
                this.addActividad = false;
                this.loadData();
                this.idPadre = '';
                this.tipoPlanId = '';
              }
            })
          }
        })
      } else {
        Swal.fire({
          title: 'Por favor complete la armonización para continuar',
          text: `No se encontraron datos registrados`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }

    }
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  filterPlanes(data) {
    var dataAux = data.filter(e => e.tipo_plan_id != "611af8464a34b3599e3799a2");
    return dataAux.filter(e => e.activo == true);
  }

  onChangeU(unidad) {
    if (unidad == undefined) {
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
      this.addActividad = false;
      this.identRecursos = false;
      this.identContratistas = false;
      this.banderaIdentDocentes = true;
      this.estadoPlan = "";
      this.iconEstado = "";
      this.versionPlan = "";
      if (this.vigenciaSelected && this.planSelected) {
        this.busquedaPlanes(this.planAux);
      }
    }
  }
  // this.mostrarIdentDocente(unidad.DependenciaTipoDependencia)
  mostrarIdentDocente(tipoDependencias: any[]): boolean {
    for (let element of tipoDependencias) {
      if (element.TipoDependenciaId.Id === 2 || element.DependenciaId.Id === 67) return true
      else return false
    }
  }

  onChangeV(vigencia) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      this.addActividad = false;
      this.identRecursos = false;
      this.identContratistas = false;
      this.estadoPlan = "";
      this.iconEstado = "";
      this.versionPlan = "";
      if (this.unidadSelected && this.planSelected) {
        this.busquedaPlanes(this.planAux);
      }
    }
  }

  onChangeP(plan) {
    if (plan == undefined) {
      this.planSelected = false;
    } else {
      this.planAux = plan;
      this.planSelected = true;
      this.addActividad = false;
      this.identRecursos = false;
      this.identContratistas = false;
      this.estadoPlan = "";
      this.iconEstado = "";
      this.versionPlan = "";
      this.busquedaPlanes(plan);
    }
  }

  onChangeSelect(opcion) {

  }

  onChangePD(planD) {
    if (planD == undefined) {
    } else {
      this.idPadre = planD._id
      this.tipoPlanId = planD.tipo_plan_id
    }
  }

  onChangeVersion(version) {
    this.plan = version;
    this.versionPlan = this.plan.numero;
    this.controlVersion = new FormControl(this.plan);
    this.getEstado();
    this.planAsignado = true;
    this.clonar = false;
    this.loadData();
    this.addActividad = false;
  }

  rol: string;

  visualizeObs() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
    if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoPlan == 'En formulación') {
        if (this.versiones.length == 1) {
          this.hiddenObs = true;
        } else if (this.versiones.length > 1 && this.banderaEdit && this.addActividad) {
          this.hiddenObs = false;
        } else if (this.versiones.length > 1 && !this.banderaEdit && this.addActividad) {
          this.hiddenObs = true;
        }
        this.readonlyObs = true;
        this.readOnlyAll = false;
      }
      if (this.estadoPlan == 'Formulado' || this.estadoPlan == 'En revisión' || this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = true;
      }
    }

    if (this.rol == 'PLANEACION') {
      if (this.estadoPlan == 'En formulación') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'En revisión') {
        this.readOnlyAll = true;
        this.readonlyObs = false;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Revisado' || this.estadoPlan == 'Ajuste Presupuestal') {
        this.readOnlyAll = true;
        this.readonlyObs = true;
        this.hiddenObs = false;
      }
      if (this.estadoPlan == 'Pre Aval' || this.estadoPlan == 'Aval' || this.estadoPlan == 'Formulado') {
        this.readonlyObs = true;
        this.readOnlyAll = true;
        this.hiddenObs = true;
      }
    }
  }

  getEstado() {
    this.request.get(environment.PLANES_CRUD, `estado-plan/` + this.plan.estado_plan_id).subscribe((data: any) => {
      if (data) {
        this.estadoPlan = data.Data.nombre;
        this.getIconEstado();
        this.visualizeObs();
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

  getIconEstado(){
    if (this.plan.estado_plan_id == '614d3ad301c7a200482fabfd'){
      this.iconEstado = "create";
    }else if (this.plan.estado_plan_id == '614d3aeb01c7a245952fabff'){
      this.iconEstado = "assignment_turned_in";
    }else if (this.plan.estado_plan_id == '614d3b0301c7a2a44e2fac01'){
      this.iconEstado = "pageview";
    }else if (this.plan.estado_plan_id == '614d3b1e01c7a265372fac03'){
      this.iconEstado = "assignment_return";
    }else if (this.plan.estado_plan_id == '614d3b4401c7a222052fac05'){
      this.iconEstado = "done";
    }else if (this.plan.estado_plan_id == '6153355601c7a2365b2fb2a1'){
      this.iconEstado = "done_all"
    }else if (this.plan.estado_plan_id == '615335c501c7a213a12fb2a3'){
      this.iconEstado = "build";
    }
  }

  getVersiones(planB) {
    this.request.get(environment.PLANES_MID, `formulacion/get_plan_versiones/` + this.unidad.Id + `/` + this.vigencia.Id +
      `/` + planB.nombre).subscribe((data: any) => {
        if (data) {
          this.versiones = data;
          //console.log(data)
          for (var i in this.versiones) {
            var obj = this.versiones[i];
            var num = +i + 1;
            obj["numero"] = num.toString();
          }
          var len = this.versiones.length;
          var pos = +len - 1;
          //console.log(this.versiones)
          this.plan = this.versiones[pos];
          this.planAsignado = true;
          this.clonar = false;
          this.loadData();
          this.controlVersion = new FormControl(this.plan);
          this.versionPlan = this.plan.numero;
          this.getEstado();
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

  busquedaPlanes(planB) {
    this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:` + this.unidad.Id + `,vigencia:` +
      this.vigencia.Id + `,formato:false,nombre:` + planB.nombre).subscribe((data: any) => {
        if (data.Data.length > 0) {
          this.getVersiones(planB);
        } else if (data.Data.length == 0) {
          Swal.fire({
            title: 'Formulación nuevo plan',
            html: 'No existe plan <b>' + planB.nombre + '</b> <br>' +
              'para la dependencia <b>' + this.unidad.Nombre + '</b> y la <br>' +
              'vigencia <b>' + this.vigencia.Nombre + '</b><br></br>' +
              '<i>Deberá formular el plan</i>',
            // text: `No existe plan ${planB.nombre} para la dependencia ${this.unidad.Nombre} y la vigencia ${this.vigencia.Nombre}. 
            // Deberá formular un nuevo plan`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 7000
          })
          this.clonar = true;
          this.plan = planB;
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
  }

  loadData() {
    this.ajustarData();
  }

  ajustarData() {
    this.request.get(environment.PLANES_MID, `formulacion/get_all_actividades/` + this.plan._id + `?order=asc&sortby=index`).subscribe((data: any) => {
      if (data.Data.data_source != null) {
        this.dataSource = new MatTableDataSource(data.Data.data_source);
        this.cambiarValor("activo", true, "Activo", this.dataSource.data)
        this.cambiarValor("activo", false, "Inactivo", this.dataSource.data)
        this.displayedColumns = data.Data.displayed_columns;
        this.columnsToDisplay = this.displayedColumns.slice();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataT = true;
      } else if (data.Data.data_source == null) {
        this.dataT = false;
        Swal.fire({
          title: 'Atención en la operación',
          text: `No hay actividades registradas para el plan`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 3500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  cargaFormato(plan) {
    Swal.fire({
      title: 'Cargando formato',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `formato/` + plan._id).subscribe((data: any) => {
      if (data) {
        Swal.close();
        this.estado = plan.estado_plan_id;
        this.steps = data[0]
        this.json = data[1][0]
        this.form = this.formBuilder.group(this.json);
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  editar(fila): void {
    if (fila.activo == 'Inactivo') {
      Swal.fire({
        title: 'Actividad inactiva',
        text: `No puede editar una actividad en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 3500
      });
    } else {
      if (this.planesDesarrollo == undefined) {
        this.cargarPlanesDesarrollo()
      }
      this.addActividad = true;
      this.banderaEdit = true;
      this.visualizeObs();
      this.rowActividad = fila.index;
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
      this.request.get(environment.PLANES_MID, `formulacion/get_plan/` + this.plan._id + `/` + fila.index).subscribe((data: any) => {
        if (data) {
          Swal.close();
          this.estado = this.plan.estado_plan_id;
          this.steps = data.Data[0]
          this.json = data.Data[1][0]
          this.form = this.formBuilder.group(this.json);
          var auxAmonizacion = data.Data[2][0]
          var strArmonizacion = auxAmonizacion.armo
          var len = (strArmonizacion.split(",").length)
          this.dataArmonizacion = strArmonizacion.split(",", len)
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
    }
  }

  inhabilitar(fila): void {
    if (fila.activo == 'Inactivo') {
      Swal.fire({
        title: 'Actividad ya inactiva',
        text: `La actividad ya se encuentra en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    } else {
      this.inactivar(fila);
    }
  }

  inactivar(fila): void {
    Swal.fire({
      title: 'Inhabilitar actividad',
      text: `¿Está seguro de inhabilitar esta actividad?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `formulacion/delete_actividad`, `null`, this.plan._id + `/` + fila.index).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Cambio realizado',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.loadData()
              }
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
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    })
  }

  agregarActividad() {
    if (this.tipoPlanId === undefined && this.idPadre === undefined) {
      this.cargarPlanesDesarrollo();
    }
    this.cargaFormato(this.plan);
    this.addActividad = true;
    this.banderaEdit = false;
    this.visualizeObs();
    this.dataArmonizacion = []
  }

  identificarContratistas() {
    this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:` + this.plan._id + `,tipo_identificacion_id:6184b3e6f6fc97850127bb68`).subscribe((data: any) => {
      if (data.Data.length == 0) {
        var str1 = 'Identificación de Contratistas ' + this.plan.nombre
        var str2 = 'Identificación de Contratistas ' + this.plan.nombre + ' ' + this.unidad.Nombre
        let datoIdenti = {
          "nombre": String(str1),
          "descripcion": String(str2),
          "plan_id": String(this.plan._id),
          "dato": "{}",
          "tipo_identificacion_id": "6184b3e6f6fc97850127bb68",
          "activo": true
        }
        this.request.post(environment.PLANES_CRUD, `identificacion`, datoIdenti).subscribe((dataP: any) => {
          if (dataP) {
            this.identContratistas = true;
          } else {
            Swal.fire({
              title: 'Error al crear identificación. Intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        })
      } else {
        this.identContratistas = true;
      }
    })
  }

  identificarRecursos() {
    this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:` + this.plan._id + `,tipo_identificacion_id:617b6630f6fc97b776279afa`).subscribe((data: any) => {
      if (data.Data.length == 0) {
        var str1 = 'Identificación de Recursos ' + this.plan.nombre
        var str2 = 'Identificación de Recursos ' + this.plan.nombre + ' ' + this.unidad.Nombre
        let datoIdenti = {
          "nombre": String(str1),
          "descripcion": String(str2),
          "plan_id": String(this.plan._id),
          "dato": "{}",
          "tipo_identificacion_id": "617b6630f6fc97b776279afa",
          "activo": true
        }
        this.request.post(environment.PLANES_CRUD, `identificacion`, datoIdenti).subscribe((dataP: any) => {
          if (dataP) {
            this.identRecursos = true;
          } else {
            Swal.fire({
              title: 'Error al crear identificación. Intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        })
      } else {
        this.identRecursos = true;
      }
    })
  }

  identificarDocentes() {
    
    this.request.get(environment.PLANES_CRUD, `identificacion?query=plan_id:`+this.plan._id+`,tipo_identificacion_id:61897518f6fc97091727c3c3`).subscribe((data: any) => {
      if (data.Data.length == 0){
        var str1 = 'Identificación de Docentes '+this.plan.nombre
        var str2 = 'Identificación de Docentes '+this.plan.nombre+' '+this.unidad.Nombre
        let datoIdenti = {
          "nombre": String(str1),
          "descripcion": String(str2),
          "plan_id": String(this.plan._id),
          "dato": "{}",
          "tipo_identificacion_id": "61897518f6fc97091727c3c3",
          "activo": false
        }
        this.request.post(environment.PLANES_CRUD, `identificacion`, datoIdenti).subscribe((dataP: any) => {
          if (dataP){
            this.identDocentes = true;
          } else {
            Swal.fire({
              title: 'Error al crear identificación. Intente de nuevo', 
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        })
      } else {
        this.identDocentes = true;
      }
    })
  }

  cargarPlanesDesarrollo() {
    this.request.get(environment.PLANES_CRUD, `plan?query=tipo_plan_id:616513b91634adfaffed52bf`).subscribe((data: any) => {
      if (data) {
        this.planesDesarrollo = data.Data
      }
    })
  }

  receiveMessage(event) {
    if (event.bandera == 'armonizar') {
      var uid_n = event.fila.level;
      var uid = event.fila.id; // id del nivel a editar
      if (!event.fila.expandable) {
        if (uid != this.dataArmonizacion.find(id => id === uid)) {
          this.dataArmonizacion.push(uid)
        } else {
          const index = this.dataArmonizacion.indexOf(uid, 0);
          if (index > -1) {
            this.dataArmonizacion.splice(index, 1);
          }
        }
      }
    }
  }

  cambiarValor(valorABuscar, valorViejo, valorNuevo, dataS) {
    dataS.forEach(function (elemento) {
      elemento[valorABuscar] = elemento[valorABuscar] == valorViejo ? valorNuevo : elemento[valorABuscar]
    })
  }

  formularPlan() {
    let parametros = {
      "dependencia_id": String(this.unidad.Id),
      "vigencia": String(this.vigencia.Id)
    }
    this.request.post(environment.PLANES_MID, `formulacion/clonar_formato/` + this.plan._id, parametros).subscribe((data: any) => {
      if (data) {
        let upd = {
          estado_plan_id: "614d3ad301c7a200482fabfd"
        }
        this.request.put(environment.PLANES_CRUD, `plan`, upd, data.Data._id).subscribe((dataPut: any) => {
          if (dataPut) {
            this.plan = dataPut.Data;
            Swal.fire({
              title: 'Formulación nuevo plan',
              text: `Plan creado satisfactoriamente`,
              icon: 'success',
              showConfirmButton: false,
              timer: 4000
            })
            // this.clonar = false;
            // this.planAsignado = true;
            // //CARGA TABLA
            // this.loadData();
            this.getVersiones(this.plan);
          }
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

  ocultar() {
    Swal.fire({
      title: 'Registro de la actividad',
      text: `¿Desea cancelar el registro de la actividad?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.addActividad = false;
        this.dataArmonizacion = []
        Swal.fire({
          title: 'Registro cancelado',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {

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

  messageIdentificacion(event) {
    if (event.accion == 'ocultar') {
      Swal.fire({
        title: `Identificación de ${event.identi}`,
        text: `¿Desea cerrar la identificación de ${event.identi}?`,
        showCancelButton: true,
        confirmButtonText: `Si`,
        cancelButtonText: `No`,
      }).then((result) => {
        if (result.isConfirmed) {
          if (event.identi == 'contratistas') {
            this.identContratistas = false;
          } else if (event.identi == 'recursos') {
            this.identRecursos = false;
          } else if (event.identi == 'docentes') {
            this.identDocentes = false;
          }
          Swal.fire({
            title: 'Cierre exitoso.',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        } else if (result.dismiss === Swal.DismissReason.cancel) {

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
    } else if (event.accion == 'guardar') {
      if (event.identi == 'contratistas') {
        this.identContratistas = false;
      } else if (event.identi == 'recursos') {
        this.identRecursos = false;
      } else if (event.identi == 'docentes') {
        this.identDocentes = false;
      }
    }
  }

  culminarPlan() {
    // Revisar si tiene actividades (!)
    this.getPoderacionActividades().then(() => {
      if (this.ponderacionCompleta != true) {
        Swal.fire({
          icon: 'error',
          title: 'Ponderación Incorrecta',
          html: this.ponderacionActividades
        })
      } else {
        Swal.fire({
          title: 'Culminar Plan',
          text: `¿Está seguro de enviar este Plan Culminado?`,
          icon: 'warning',
          confirmButtonText: `Si`,
          cancelButtonText: `No`,
          showCancelButton: true
        }).then((result) => {
          if (result.isConfirmed) {
            let mod = {
              estado_plan_id: "614d3aeb01c7a245952fabff"
            }
            this.plan.estado_plan_id = "614d3aeb01c7a245952fabff"
            this.request.put(environment.PLANES_CRUD, `plan`, mod, this.plan._id).subscribe((data:any) =>{
              if(data){
                Swal.fire({
                  title: 'Plan enviado', 
                  icon: 'success',
                }).then((result) => {
                  if (result.value) {
                    this.busquedaPlanes(data.Data);
                    this.loadData();
                    this.addActividad = false;
                  }
                })
              }
            })
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: 'Envío cancelado',
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
    })

  }

  getPoderacionActividades(): Promise<string> {
    let message: string = '';
    let resolveRef;
    let rejectRef;

    let dataPromise: Promise<string> = new Promise((resolve, reject) => {
      resolveRef = resolve;
      rejectRef = reject;
    });
    this.request.get(environment.PLANES_MID, `formulacion/ponderacion_actividades/` + this.plan._id).subscribe((data: any) => {
      if (data) {
        let aux: object = data.Data
        let keys: string[];

        keys = Object.keys(aux)
        for (let key of keys) {
          message = message + key + ' : ' + aux[key] + "<br/>"
        }
        if (data.Data.Total === 100) {
          this.ponderacionCompleta = true
        } else {
          this.ponderacionCompleta = false
        }
        this.ponderacionActividades = message
        resolveRef(message)
      }
    })
    return dataPromise
  }

  iniciarRevision() {
    Swal.fire({
      title: 'Iniciar Revisión',
      text: `Esta a punto de iniciar la revisión para este Plan`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        let mod = {
          estado_plan_id: "614d3b0301c7a2a44e2fac01"
        }
        this.plan.estado_plan_id = "614d3b0301c7a2a44e2fac01"
        this.request.put(environment.PLANES_CRUD, `plan`, mod, this.plan._id).subscribe((data:any) =>{
          if(data){
            Swal.fire({
              title: 'Plan En Revisión', 
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.busquedaPlanes(data.Data);
                this.loadData();
                this.addActividad = false;
              }
            })
          }
        })
        Swal.fire({
          title: 'Estado actualizado (SIN CAMBIOS)',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Inicio de Revisión Cancelado',
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

  enviarRevision() {
    Swal.fire({
      title: 'Iniciar Revisión',
      text: `¿Desea enviar la revisión?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        let mod = {
          estado_plan_id: "614d3b1e01c7a265372fac03"
        }
        this.plan.estado_plan_id = "614d3b1e01c7a265372fac03"
        this.request.put(environment.PLANES_CRUD, `plan`, mod, this.plan._id).subscribe((data:any) =>{
          if(data){
            Swal.fire({
              title: 'Plan En Revisión', 
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.busquedaPlanes(data.Data);
                this.loadData();
                this.addActividad = false;
              }
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Revisión Cancelado',
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

  realizarAjustes(){
    Swal.fire({
      title: 'Realizar Ajustes',
      text: `¿Desea realizar ajustes a el Plan?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.post(environment.PLANES_MID, `formulacion/versionar_plan/`+this.plan._id, this.plan).subscribe((data: any) => {
          if (data) {
            this.getVersiones(data.Data);
            Swal.fire({
              title: 'Nueva Versión',
              text: 'Nueva versión del plan creada, ya puede realizar los ajustes al plan.',
              icon: 'success',
              showConfirmButton: false,
              timer: 2500
            })
          } else {
            Swal.fire({
              title: 'Error al versionar el plan. Por favor intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          }
        })

      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Revisión Cancelado',
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

  preAval() {
    Swal.fire({
      title: 'Pre Aval',
      text: `¿Desea darle pre aval a este plan?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        let mod = {
          estado_plan_id: "614d3b4401c7a222052fac05"
        }
        this.plan.estado_plan_id = "614d3b4401c7a222052fac05"
        this.request.put(environment.PLANES_CRUD, `plan`, mod, this.plan._id).subscribe((data:any) =>{
          if(data){
            Swal.fire({
              title: 'Plan pre avalado', 
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.busquedaPlanes(data.Data);
                this.loadData();
                this.addActividad = false;
              }
            })
          }
        })
        Swal.fire({
          title: 'Revision Enviada (SIN CAMBIOS)',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Pre Aval Cancelado',
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


  avalar() {
    Swal.fire({
      title: 'Pre Aval',
      text: `¿Desea darle Aval a este plan?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        let mod = {
          estado_plan_id: "6153355601c7a2365b2fb2a1"
        }
        this.plan.estado_plan_id = "6153355601c7a2365b2fb2a1"
        this.request.put(environment.PLANES_CRUD, `plan`, mod, this.plan._id).subscribe((data:any) =>{
          if(data){
            Swal.fire({
              title: 'Plan Avalado', 
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.busquedaPlanes(data.Data);
                this.loadData();
                this.addActividad = false;
              }
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Envio de Aval Cancelado',
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
