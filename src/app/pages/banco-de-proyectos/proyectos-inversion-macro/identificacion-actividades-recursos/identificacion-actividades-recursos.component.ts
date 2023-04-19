import { CurrencyPipe, PercentPipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

export interface Actividad {
  numero: string;
  nombre: string;
  ponderacionV: number;
  presupuesto: number;
  descripcion: string;
}


// const INFO: Actividad[] = [
//   {posicion: '1', actividad: 'Actividad 1', ponderacion: 30000, presupuesto: 20000, iconSelected: 'done'},
//   {posicion: '2', actividad: 'Actividad 2', ponderacion: 70000, presupuesto: 40000, iconSelected: 'done'},
// ]
@Component({
  selector: 'app-identificacion-actividades-recursos',
  templateUrl: './identificacion-actividades-recursos.component.html',
  styleUrls: ['./identificacion-actividades-recursos.component.scss']
})
export class IdentificacionActividadesRecursosComponent implements OnInit {
  displayedColumns: string[] = ['posicion','actividad', 'ponderacion', 'presupuesto', 'actions'];
  dataSource = new MatTableDataSource<Actividad>();
  dataActividades: any[] = [];
  activedStep = 0;
  form: FormGroup;
  steps: any[];
  steps2: any[];
  json: any;
  jsonMeta: any[];
  estado: string;
  plantilla = false;
  plantillaActual = false;
  actividades: any[];
  actividad: any;
  actividadId: string;
  actividadSelected: boolean;
  totalPresupuesto: any;
  codigoProyect: string;
  nombreProyect: string;
  unidadId: string;
  vigenciaId: string;
  name: string = "";
  codigo: string = "";
  valorFuentes: string = "";
  totalFuentes = 0;
  metaSelected: string = "";
  indexMeta: string;
  planId: string;
  idProyectoInversion: string;
  posicionMetaPro: string;
  //readOnlyAll: boolean = false;
  actividadClone: any;   
  actividadesProg: any[];
  ponderacion: number;
  formProyect: FormGroup;
  rowIndex: string;
  edit: any;
  namePlan: string;
  dependencia: string;
  vigencia: string;
  formulacionState: boolean;
  plan: any;
  versiones: any[];
  planAsignado: boolean;
  clonar: boolean;
  banderaUltimaVersion: boolean;
  rol: string;
  versionPlan: string;
  estadoPlan: string;
  readonlyObs: boolean;
  hiddenObs: boolean;
  readOnlyAll: boolean;
  addActividad: boolean;
  banderaEdit: boolean;
  arbolPadreId: string;


  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private currencyPipe: CurrencyPipe,
    private percentagePipe: PercentPipe,
    private autenticationService: ImplicitAutenticationService,
  ) { 
    activatedRoute.params.subscribe(prm => {  
      this.planId = prm['idPlan'];    
      this.indexMeta = prm['indexMeta'];  
      this.idProyectoInversion = prm['idProyectoInversion'];  
      this.posicionMetaPro = prm['posicionMetaPro'];   
      this.edit = prm['edit'];
      //this.arbolPadreId = prm['idPlan'];
    });  
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'      
    } else if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
      //this.verificarFechas();
    }
    this.loadPlan();
    this.loadProyectI();
    this.loadActividades();
  }

  ngOnInit(): void {
    this.arbolPadreId = this.planId;
    this.unidadId = localStorage.getItem('dependencia_id'); 
    this.vigenciaId = localStorage.getItem('vigenciaId');
    console.log(this.unidadId, this.vigenciaId,  "entra a verificar");
    this.formProyect = this.formBuilder.group({
      name: [this.name,],
      codigo: [this.codigo,],
      valorFuentes: [this.valorFuentes],
      meta: [this.metaSelected]
    });
    this.editar2();
    this.ajustarData();
    this.getTotalPonderacion();
    this.getTotalPresupuesto();
  }

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
  }

  onChangeA(actividad: any) {
    if (actividad == undefined) {
      this.actividadSelected = false;
    } else {
      this.actividadSelected = true;
      this.actividad = actividad;
      this.actividadId = this.actividad._id;
      this.busquedaTipoMetas(actividad);
      //console.log(this.actividadId, "valor actividad", this.actividadSelected);  

    }
  }

  loadPlan() {
    this.request.get(environment.PLANES_CRUD, `plan/` + this.planId).subscribe((data: any) => {
      if (data) {
        this.plan = data.Data;
        this.namePlan = data.Data.nombre;
        this.dependencia = data.Data.dependencia_id;
        this.vigencia = data.Data.vigencia;
        this.busquedaPlanes();
      }
    })
  }

  busquedaPlanes() {    
    console.log(this.namePlan, "nombre plan");    
    this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:` + this.dependencia + `,vigencia:` + this.vigencia + `,formato:false,nombre:` + this.namePlan).subscribe((data: any) => {
        if (data.Data.length > 0) {
          let i = data.Data.length - 1;
          console.log(data.Data, "info del plan");
          this.getEstado();
          //this.planId = data.Data[i]["_id"];          
          //this.getVersiones();
          this.formulacionState = true;
        } else if (data.Data.length == 0) {
          Swal.fire({
            title: 'Información inconclusa',
            html: 'Falta inoformación del Plan y Meta a consultar',
            // text: `No existe plan ${planB.nombre} para la dependencia ${this.unidad.Nombre} y la vigencia ${this.vigencia.Nombre}.
            // Deberá formular un nuevo plan`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 7000
          })
          
          this.plan = data.Data;
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

  getVersiones() {
    let aux = this.namePlan.replace(/ /g, "%20");
    this.request.get(environment.PLANES_MID, `formulacion/get_plan_versiones/` + this.dependencia + `/` + this.vigencia +
    //this.request.get(environment.PLANES_MID, `formulacion/get_plan_versiones/` + this.unidad + `/` + this.vigencia.Id +
      `/` + aux).subscribe((data: any) => {
        if (data) {
          this.versiones = data;
          console.log(this.versiones, "versiones");
          for (var i in this.versiones) {
            var obj = this.versiones[i];
            var num = +i + 1;
            obj["numero"] = num.toString();
          }
          var len = this.versiones.length;
          var pos = +len - 1;
          this.plan = this.versiones[pos];
          console.log(this.plan, "this.plan");
          this.planAsignado = true;
          this.clonar = false;
          this.banderaUltimaVersion = true;
          //this.loadData();
          //this.controlVersion = new FormControl(this.plan);
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

  visualizeObs() {
    console.log(this.rol, this.estadoPlan, "rol");
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
        console.log("EstadoPlan", this.estadoPlan);
        // this.getIconEstado();
        // this.cargarPlanesDesarrolloDistrital();
        // this.cargarPlanesDesarrollo();
        // this.cargarPlanesIndicativos();
        // this.cargarProyectosInversion();

        this.visualizeObs();
      }
    }), (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
  }

  busquedaTipoMetas(actividad) {
    this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:` + this.unidadId + `,vigencia:` + this.vigenciaId + `,formato:false,arbol_padre_id:` + this.arbolPadreId + `,documento_id:` + this.indexMeta).subscribe((data: any) => {
        if (data.Data.length > 0) {  
          let i = data.Data.length - 1;
          console.log(data.Data, "info de la Meta");        
          this.actividadId = data.Data[i]["_id"];  
          console.log(this.actividadId, "id del grupo de actividades");  
          this.actividad =  data.Data[i];    
          this.ajustarData();
          //this.getDataPlan();
          //this.getVersiones(planB);
          //this.formulacionState = true;
        } else if (data.Data.length == 0) {
          // Swal.fire({
          //   title: 'Formulación nuevo plan',
          //   html: 'No existe plan <b>' + planB.nombre + '</b> <br>' +
          //     'para la dependencia <b>' + this.unidad.Nombre + '</b> y la <br>' +
          //     'vigencia <b>' + this.vigencia.Nombre + '</b><br></br>' +
          //     '<i>Deberá formular el plan</i>',
          //   // text: `No existe plan ${planB.nombre} para la dependencia ${this.unidad.Nombre} y la vigencia ${this.vigencia.Nombre}. 
          //   // Deberá formular un nuevo plan`,
          //   icon: 'warning',
          //   showConfirmButton: false,
          //   timer: 7000
          // })
          //this.clonar = true;
          this.actividad = actividad;
          this.formularPlan();
        }
      }), (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
  }

  formularPlan() {
    //if(this.vigenciaSelected == true && this.unidadSelected == true && this.planSelected == true) {
      let parametros = {
        "dependencia_id": this.unidadId,
        "vigencia": this.vigenciaId, 
        "id": String(this.actividadId),
        "indexMeta": this.indexMeta,    
        "arbol_padre_id":  this.arbolPadreId 
      }
      Swal.fire({
        title: 'Creando tipo actividad',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
      this.request.post(environment.PLANES_MID, `inversion/crear_grupo_meta`, parametros).subscribe((data: any) => {
        if (data) {
          Swal.close();
          console.log(data);
          this.actividad.estado_plan_id = "614d3ad301c7a200482fabfd";
          this.request.put(environment.PLANES_CRUD, `plan`, this.actividad, data.Data._id).subscribe((dataPut: any) => {
          if (dataPut) {
            this.actividadClone = dataPut.Data;
            Swal.fire({
              title: 'Tipo Meta',
              text: `Tipo Meta creado satisfactoriamente`,
              icon: 'success',
              showConfirmButton: false,
              timer: 4000
            })
            // this.clonar = false;
            // this.planAsignado = true;
            // //CARGA TABLA
            // this.loadData();
            //this.getVersiones(this.plan);
          }
        })
          //this.newPlanId = data.Data._id
          
          //this.formular = true;
          console.log(data.Data._id, "id");
          //this.plan.estado_plan_id = "614d3ad301c7a200482fabfd";
          //this.request.put(environment.PLANES_CRUD, `plan`, this.plan, data.Data._id).subscribe((dataPut: any) => {
            //if (dataPut) {
              //this.plan = dataPut.Data;
              Swal.fire({
                title: 'Formulación nuevo plan',
                text: `Plan creado satisfactoriamente`,
                icon: 'success',
                showConfirmButton: false,
                timer: 4000
              })
              //this.getVersiones(this.plan);
              //setTimeout(()=>(this.router.navigate(['/pages/proyectos-macro/formulacion-plan-inversion/' + this.plan._id + '/' + this.newPlanId])),50 );
            }
          }), (error) => {
            Swal.fire({
              title: 'Error en la operación',
              icon: 'error',
              text: `${JSON.stringify(error)}`,
              showConfirmButton: false,
              timer: 2500
            })
          }
    // } else{
    //   Swal.fire({
    //     title: 'Debe seleccionar todos los criterios',
    //     icon: 'warning',
    //     showConfirmButton: false,
    //     timer: 2500
    //   })
    // };
    
      
  }

  cargaFormato() {        
    Swal.fire({
      title: 'Cargando formato',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.plantilla = true;
    this.request.get(environment.PLANES_MID, `formato/` + this.actividadId).subscribe((data: any) => {
      if (data) {
        Swal.close();
        //this.estado = plan.estado_plan_id;
        this.steps = data[0]
        this.json = data[1][0]
        this.form = this.formBuilder.group(this.json);
      }
    }), (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    }
  }
 
 
  
  loadActividades() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:63e4f2bbccee4963a2841cb7,formato:true`).subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {
          this.actividades = data.Data;  
          console.log(this.actividades, "actividades")        
          //console.log(this.actividades, "actividades");
        }
      }
    }), (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    }
  }
  
  loadProyectI() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, 'inversion/proyecto/' + this.idProyectoInversion).subscribe((data: any) => {
      if (data) {
        Swal.close();     
        this.nombreProyect = data["Data"]["nombre_proyecto"];
        this.codigoProyect = data["Data"]["codigo_proyecto"];
        var fuentes = data["Data"]["fuentes"];
        //var fuentesTabla = []
        for (let i = 0; i < fuentes.length; i++) {
          const fuenteGEt = fuentes[i];          
          this.totalFuentes = this.totalFuentes + fuenteGEt["presupuestoProyecto"]
          console.log(this.totalFuentes, "totalFuentes"); 
          var metas = data["Data"]["metas"];
          for (let i = 0; i < metas.length; i++) {
            const metaGEt = metas[i];
            if (this.posicionMetaPro == metaGEt["posicion"]) {
              this.metaSelected = metaGEt["descripcion"];                   
            }
          }
          this.formProyect.setValue({
            name: data["Data"]["nombre_proyecto"],
            codigo: data["Data"]["codigo_proyecto"],
            valorFuentes: this.totalFuentes,
            meta: this.metaSelected
          });      
        }
      }  
    })
  }

  focusMagnitud(element) {
    element.target.value = element.target.value.replaceAll("%", "");
  }

  //blurMagnitud(element) {
    
      
    //     this.programacion_T -= this.programacion_1;
    //     if (element.target.value == "") {
    //       this.programacion_1 = 0;
    //     } else {
    //       this.programacion_1 = parseFloat(element.target.value) / 100;
    //       if (this.programacion_T + this.programacion_1 > 1) {
    //         Swal.fire({
    //           title: 'La magnitud total no puede ser mayor a 100%',
    //           text: "",
    //           icon: 'warning',
    //           showConfirmButton: false,
    //           timer: 2500
    //         });
    //         this.programacion_1 = 0;
    //       }
    //     }
    //     element.target.value = this.percentagePipe.transform(this.programacion_1, '1.2-2');
    //     break;
      
      
  
    // this.programacion_T = this.programacion_1 + this.programacion_2 + this.programacion_3 + this.programacion_4 + this.programacion_5;
  //}
  controlPonderación() {
    console.log(this.ponderacion, "ponderación");
    if (this.ponderacion != 100 ) {
      Swal.fire({
      title: 'La Ponderación Vertical debe ser igual a 100%',
      text: "Por favor ajuste los valores de ponderación de las actividades",
      icon: 'warning',
      showConfirmButton: false,
      timer: 4500
      });
  
    }
  }
  getTotalPonderacion() {  
    this.ponderacion = 0;  
    //return this.totalPresupuesto  = this.dataActividades.map(t => t.ponderacion ).reduce((acc, value) => acc + (value= this.percentagePipe.transform(value, '1.2-2')), 0);
    //this.ponderacion  = this.dataActividades.map(t => t.ponderacion ).reduce((acc, value) => acc + value, 0);
    for(let i = 0; i < this.dataActividades.length; i++) {
      let actividad = this.dataActividades[i];
      this.ponderacion += actividad.ponderacion;
    }
    return this.totalPresupuesto = this.percentagePipe.transform(this.ponderacion / 100, '1.2-2');
    
  }

  getTotalPresupuesto() {    
    return this.totalPresupuesto = this.dataActividades.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);
    
  }

  programacionPresupuestal(row) {
    //this.controlPonderación(); 
    this.rowIndex = row.posicion
    this.router.navigate(['/pages/proyectos-macro/programacion-presupuestal/' + this.idProyectoInversion + '/' + this.actividadId + '/' + this.planId + '/' + this.rowIndex]);    
  }

  submit() {
    var formValue = this.form.value;
    var actividad = {
    idProI: this.idProyectoInversion,
    //idSubDetalle: this.idSubDetMetasProI,
    indexMetaSubPro: this.posicionMetaPro,
    //totalPresupuesto: this.totalPresupuesto,
    entrada: formValue
    }
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.put(environment.PLANES_MID, `inversion/guardar_meta`, actividad, this.actividad._id).subscribe((data: any) => {
      if (data) {
        Swal.close();
        Swal.fire({
          title: 'Actividad agregada',
          //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
          text: 'La actividad se ha registrado satisfactoriamente',
          icon: 'success'
        }).then((result) => {
          if (result.value) {
            this.plantilla = false;
            this.actualizarPresupuestoMeta();
            this.ajustarData()
            this.form.reset();
            //this.addActividad = false;
            //this.dataArmonizacionPED = [];
            //this.dataArmonizacionPI = [];
            //this.idPadre = undefined;
            //this.tipoPlanId = undefined;
            //this.tipoPlanIndicativo = undefined;
            //this.idPlanIndicativo = undefined;
          }
        })
      }
    }), (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: 'No fue posible crear la actividad, por favor contactarse con el administrador del sistema',
        icon: 'error',
        showConfirmButton: false,
        timer: 2500
      })

      //this.addActividad = false;
      //this.dataArmonizacionPED = [];
      //this.dataArmonizacionPI = [];
    }
  }
   
  ajustarData() {
    // if (this.rol == 'PLANEACION' || this.plan.estado_plan_id != '614d3ad301c7a200482fabfd') {
    //   this.iconEditar = 'search'
    // } else if (this.rol == 'JEFE_DEPENDENCIA' || this.rol == 'JEFE_PLANEACION') {
    //   this.iconEditar = 'edit'
    // }
    this.dataActividades = [];
    this.request.get(environment.PLANES_MID, `inversion/all_metas/` + this.actividad._id + `?order=asc&sortby=index`).subscribe((data: any) => {
      if (data.Data != null) {        
        console.log(data.Data, "metas")
        this.actividadesProg = data.Data;
        for(let i = 0; i < this.actividadesProg.length; i++) {
          console.log("entra al For");
          let actividadP = {
            posicion: this.actividadesProg[i]["index"],
            actividad: this.actividadesProg[i]["Escriba nombre de la actividad correspondiente"],
            ponderacion: this.actividadesProg[i]["Ingresar valor ponderación vertical"],
            presupuesto: this.actividadesProg[i]["presupuesto"]
          }
          this.dataActividades.push(actividadP);
        }
        //{posicion: '1', actividad: 'Actividad 1', ponderacion: 30000, presupuesto: 20000, iconSelected: 'done'},
        console.log(this.dataActividades, "actividades 402");
        this.dataSource = new MatTableDataSource(this.dataActividades);
        
        // this.defaultFilterPredicate = this.dataSource.filterPredicate;
        // //this.cambiarValor("activo", true, "Activo", this.dataSource.data)
        // //this.cambiarValor("activo", false, "Inactivo", this.dataSource.data)
        // this.displayedColumns = data.Data.displayed_columns;
        // this.columnsToDisplay = this.displayedColumns.slice();
        // this.dataSource.paginator = this.paginator;
        // this.dataSource.sort = this.sort;
        // this.dataT = true;
        // this.filterActive()    
        this.getTotalPonderacion();
        if (this.ponderacion < 100 || this.ponderacion > 100  ) {
          console.log(this.ponderacion, "ponderación");
          Swal.fire({
          title: 'La Ponderación Vertical debe ser igual a 100%',
          text: "Por favor ajuste los valores de ponderación de las actividades",
          icon: 'warning',
          showConfirmButton: false,
          timer: 4500
          });
      
        }  
      } else if (data.Data.data_source == null) {
        //this.dataT = false;
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

  editar(row) {
    this.controlPonderación(); 
    this.rowIndex = row.posicion
    this.plantillaActual = true;
    
    // if (fila.activo == 'Inactivo') {
    //   Swal.fire({
    //     title: 'Actividad inactiva',
    //     text: `No puede editar una actividad en estado inactivo`,
    //     icon: 'info',
    //     showConfirmButton: false,
    //     timer: 3500
    //   });
    // } else {      
      //this.addActividad = true;
      //this.banderaEdit = true;
      //this.visualizeObs();
      //this.rowActividad = fila.index;
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
      this.request.get(environment.PLANES_MID, `formulacion/get_plan/` + this.actividadId + `/` + this.rowIndex).subscribe((data: any) => {
        if (data) {
          Swal.close();
          //this.onChangePD(this.planesDesarrollo[0]);
          //this.onChangePI(this.planesIndicativos[0]);
          //this.estado = this.plan.estado_plan_id;
          this.steps = data.Data[0]
          this.json = data.Data[1][0]
          this.form = this.formBuilder.group(this.json);
          console.log("entra a construir");
          // let auxAmonizacion = data.Data[2][0]
          // let strArmonizacion = auxAmonizacion.armo
          // let len = (strArmonizacion.split(",").length)
          // this.dataArmonizacionPED = strArmonizacion.split(",", len).filter(((item) => item != ""))
          // let strArmonizacion2 = auxAmonizacion.armoPI
          // let len2 = (strArmonizacion2.split(",").length)
          // this.dataArmonizacionPI = strArmonizacion2.split(",", len2).filter(((item) => item != ""))
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
    //}
  }

  editar2() {   
    
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })
      this.request.get(environment.PLANES_MID, `formulacion/get_plan/` + this.planId + `/` + this.indexMeta).subscribe((data: any) => {
        if (data) {
          Swal.close();          
          this.steps2 = data.Data[0]
          this.jsonMeta = data.Data[1][0]  
          console.log(this.jsonMeta)        
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
    //}
  }

  actualizarPresupuestoMeta() {
    Swal.fire({
      title: 'Actualizando Información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    var actividad = {      
      presupuesto_programado: this.totalPresupuesto,      
      //indexMetaSubProI: this.indexMetaSubPro,
      //idDetalleFuentesPro: this.idDetalleFuentesPro,      
      entrada: this.jsonMeta,
    }
    this.request.put(environment.PLANES_MID, `inversion/actualizar_presupuesto_meta`, actividad, this.planId + `/` + this.indexMeta).subscribe((data: any) => {
      if (data) {
        Swal.close();
        console.log(data)
        Swal.fire({
          title: 'Programación de Presupuestos  de Actividades Agregada',
          //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
          text: 'La programación de presupuestos  de actividades se ha registrado satisfactoriamente',
          icon: 'success'
        }).then((result) => {
          if (result.value) {  
            
          }
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: 'No fue posible actualizar aumatoria presupuesto',
        icon: 'error',
        showConfirmButton: false,
        timer: 2500
      })      
    })
  }

  actualizarActividad() {
    Swal.fire({
      title: 'Actualizando Meta',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    }) 
    
    // if (this.metaSelected == true) {
      var formValue = this.form.value;
        var actividad = {
          //idSubDetalle: this.idSubDetMetasProI,
          indexMetaSubPro: this.indexMeta,
          entrada: formValue
        }
    this.request.put(environment.PLANES_MID, `inversion/actualizar_tabla_actividad`, actividad, this.actividadId + `/` + this.rowIndex).subscribe((data: any) => {      
      if (data) {
        Swal.close();
        Swal.fire({
          title: 'Información de actividad actualizada',
          //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
          text: 'La actividad se ha actualizado satisfactoriamente',
          icon: 'success'
        }).then((result) => {
          if (result.value) {
            this.actualizarPresupuestoMeta();
            this.ajustarData();
            this.plantillaActual = false;
            this.form.reset();
            //this.addActividad = false;
            //this.loadData();
            //this.idPadre = undefined;
            //this.tipoPlanId = undefined;
            //this.idPlanIndicativo = undefined;
            //this.tipoPlanIndicativo = undefined;
          }
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No fue posible actualizar la actividad, por favor contactarse con el administrador del sistema`,
        icon: 'error',
        showConfirmButton: false,
        timer: 2500
      })
  
      //this.addActividad = false;
      //this.dataArmonizacionPED = [];
      //this.dataArmonizacionPI = [];
    })
    // } else {
    //   Swal.fire({
    //     title: 'Error en la operación',
    //     text: `Debe seleccionar una Meta del Proyecto de Inversión Vigente asociado`,
    //     icon: 'error',
    //     showConfirmButton: false,
    //     timer: 2500
    //   })
    // }
    
  }

  inactivar(row) {
    Swal.fire({
      title: 'Inhabilitar Meta',
      text: `¿Está seguro de inhabilitar esta actividad?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `inversion/inactivar_meta`, `null`, this.actividadId + `/` + row.posicion).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Cambio realizado',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.actualizarPresupuestoMeta();
                this.ajustarData();
                //this.loadData()
              }
            })
          }
        }), (error) => {
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

  cancelar() {
      this.actualizarPresupuestoMeta();
      this.router.navigate(['pages/proyectos-macro/formular-proyecto']);
    }
}
