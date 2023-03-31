import { Component, ViewChild, OnInit, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-tipo-meta-indicador',
  templateUrl: './tipo-meta-indicador.component.html',
  styleUrls: ['./tipo-meta-indicador.component.scss']
})
export class TipoMetaIndicadorComponent implements OnInit {

  activedStep = 0;
  form: FormGroup;
  steps: any[];
  json: any;
  estado: string;
  //readOnlyAll: boolean = false;
  planId: string;
  indexMeta: string;
  rowIndex: string;
  idProyectoInversion: string;
  banderaEdit: boolean;
  idSubDetMetasProI: string;
  metas: any[];
  actividades: boolean = false;
  metaSelected: boolean = false;
  meta: any;
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

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private autenticationService: ImplicitAutenticationService,
  ) { 
    activatedRoute.params.subscribe(prm => {

      this.planId = prm['idPlan']; 
      this.indexMeta = prm['indexMeta'];
      this.idProyectoInversion = prm['idProyectoInversion'];
      this.rowIndex = prm['rowIndex'];
      //console.log(this.id_formato);
    });
    //this.cargaFormato();
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'      
    } else if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
      //this.verificarFechas();
    }
    this.loadPlan();
  }

  ngOnInit(): void {
    this.editar()
    this.programarMetas()
  }

  loadPlan() {
    this.request.get(environment.PLANES_CRUD, `plan/` + this.planId).subscribe((data: any) => {
      if (data) {
        this.namePlan = data.Data.nombre;
        this.dependencia = data.Data.dependencia_id;
        this.vigencia = data.Data.vigencia;
        this.busquedaPlanes();
      }
    })
  }

  busquedaPlanes() {    
    console.log(this.namePlan, "nombre plan");    
    this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:` + this.dependencia + `,vigencia:` +
      this.vigencia + `,formato:false,nombre:` + this.namePlan).subscribe((data: any) => {
        if (data.Data.length > 0) {
          let i = data.Data.length - 1;
          console.log(data.Data, "info del plan");
          this.planId = data.Data[i]["_id"];          
          this.getVersiones();
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
    console.log(this.rol, "rol");
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
        // this.getIconEstado();
        // this.cargarPlanesDesarrolloDistrital();
        // this.cargarPlanesDesarrollo();
        // this.cargarPlanesIndicativos();
        // this.cargarProyectosInversion();

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

  programarMetas() {
    this.actividades = true;
    this.request.get(environment.PLANES_MID, `inversion/metaspro/` + this.idProyectoInversion).subscribe((data: any) => {      
      if (data.Data) {        
        this.metas = data.Data.metas;
        this.idSubDetMetasProI = data.Data.id_detalle_meta;
        console.log(data.Data, "Metas");
        //this.cargaFormato();
      }
    })    
  }
  onChangeM(meta) {
    if (meta == undefined) {
      this.metaSelected = false;
      //this.idPadre = undefined;
      //this.tipoPlanId = undefined;
    } else {
      this.metaSelected = true;
      this.meta = meta;
      this.indexMeta = this.meta.posicion;
      //this.tipoPlanId = meta.tipo_plan_id;
      console.log(this.indexMeta, 'metaSeleccionada');
    }
  } 

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
  }

  editar() {
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
      this.request.get(environment.PLANES_MID, `formulacion/get_plan/` + this.planId + `/` + this.rowIndex).subscribe((data: any) => {
        if (data) {
          Swal.close();
          //this.onChangePD(this.planesDesarrollo[0]);
          //this.onChangePI(this.planesIndicativos[0]);
          //this.estado = this.plan.estado_plan_id;
          this.steps = data.Data[0]
          this.json = data.Data[1][0]
          this.form = this.formBuilder.group(this.json);

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

  actualizarMeta() {
    Swal.fire({
      title: 'Actualizando Meta',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    if (this.metaSelected == true) {
      var formValue = this.form.value;
        var actividad = {
          idSubDetalle: this.idSubDetMetasProI,
          indexMetaSubPro: this.indexMeta,
          entrada: formValue
        }
    this.request.put(environment.PLANES_MID, `inversion/actualizar_meta`, actividad, this.planId + `/` + this.rowIndex).subscribe((data: any) => {      
      if (data) {
        Swal.close();
        Swal.fire({
          title: 'Información de actividad actualizada',
          //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
          text: 'La actividad se ha actualizado satisfactoriamente',
          icon: 'success'
        }).then((result) => {
          if (result.value) {
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
    } else {
      Swal.fire({
        title: 'Error en la operación',
        text: `Debe seleccionar una Meta del Proyecto de Inversión Vigente asociado`,
        icon: 'error',
        showConfirmButton: false,
        timer: 2500
      })
    }
    
  }
  
  // cargaFormato() {
  //   Swal.fire({
  //     title: 'Cargando formato',
  //     timerProgressBar: true,
  //     showConfirmButton: false,
  //     willOpen: () => {
  //       Swal.showLoading();
  //     },
  //   })
  //   this.request.get(environment.PLANES_MID, `formato/` + this.id_formato).subscribe((data: any) => {
  //     if (data) {
  //       Swal.close();
  //       //this.estado = plan.estado_plan_id;
  //       this.steps = data[0]
  //       this.json = data[1][0]
  //       this.form = this.formBuilder.group(this.json);
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

  submit() {
    // if (!this.banderaEdit) { // ADD NUEVA ACTIVIDAD     

         var formValue = this.form.value;
         console.log(formValue);
    //     var actividad = {
    //       //armo: this.dataArmonizacionPED.toString(),
    //       //armoPI: this.dataArmonizacionPI.toString(),
    //       entrada: formValue
    //     }
        // this.request.put(environment.PLANES_MID, `formulacion/guardar_actividad`, actividad, this.plan._id).subscribe((data: any) => {
        //   if (data) {
        //     Swal.fire({
        //       title: 'Actividad agregada',
        //       //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
        //       text: 'La actividad se ha registrado satisfactoriamente',
        //       icon: 'success'
        //     }).then((result) => {
        //       if (result.value) {
        //         //this.loadData()
        //         this.form.reset();
        //         //this.addActividad = false;
        //         //this.dataArmonizacionPED = [];
        //         //this.dataArmonizacionPI = [];
        //         //this.idPadre = undefined;
        //         //this.tipoPlanId = undefined;
        //         //this.tipoPlanIndicativo = undefined;
        //         //this.idPlanIndicativo = undefined;
        //       }
        //     })
        //   }
        // }, (error) => {
        //   Swal.fire({
        //     title: 'Error en la operación',
        //     text: 'No fue posible crear la actividad, por favor contactarse con el administrador del sistema',
        //     icon: 'error',
        //     showConfirmButton: false,
        //     timer: 2500
        //   })

        //   this.addActividad = false;
        //   this.dataArmonizacionPED = [];
        //   this.dataArmonizacionPI = [];
        // })
      

    // } else { // EDIT ACTIVIDAD
    //   if (this.dataArmonizacionPED.length != 0 && this.dataArmonizacionPI.length != 0) {
    //     var aux = this.dataArmonizacionPED.toString();
    //     let aux2 = this.dataArmonizacionPI.toString();
    //     var formValue = this.form.value;
    //     var actividad = {
    //       armo: aux,
    //       armoPI: aux2,
    //       entrada: formValue
    //     }
    //     this.request.put(environment.PLANES_MID, `formulacion/actualizar_actividad`, actividad, this.plan._id + `/` + this.rowActividad).subscribe((data: any) => {
    //       if (data) {
    //         Swal.fire({
    //           title: 'Información de actividad actualizada',
    //           //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
    //           text: 'La actividad se ha actualizado satisfactoriamente',
    //           icon: 'success'
    //         }).then((result) => {
    //           if (result.value) {
    //             this.form.reset();
    //             this.addActividad = false;
    //             this.loadData();
    //             this.idPadre = undefined;
    //             this.tipoPlanId = undefined;
    //             this.idPlanIndicativo = undefined;
    //             this.tipoPlanIndicativo = undefined;
    //           }
    //         })
    //       }
    //     }, (error) => {
    //       Swal.fire({
    //         title: 'Error en la operación',
    //         text: `No fue posible actualizar la actividad, por favor contactarse con el administrador del sistema`,
    //         icon: 'error',
    //         showConfirmButton: false,
    //         timer: 2500
    //       })

    //       this.addActividad = false;
    //       this.dataArmonizacionPED = [];
    //       this.dataArmonizacionPI = [];
    //     })
    //   } else {
    //     Swal.fire({
    //       title: 'Por favor complete la armonización para continuar',
    //       text: `No se encontraron datos registrados`,
    //       icon: 'warning',
    //       showConfirmButton: false,
    //       timer: 2500
    //     })
    //   }

    // }
  }

  cancelar() {
    this.router.navigate(['pages/proyectos-macro/formular-proyecto']);
  }
  
}
