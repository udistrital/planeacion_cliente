import { Component, ViewChild, OnInit, DoCheck } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import { ActivatedRoute } from '@angular/router';

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
  readOnlyAll: boolean = false;
  planId: string;
  indexMeta: string;
  idProyectoInversion: string;
  banderaEdit: boolean;
  idSubDetMetasProI: string;
  metas: any[];
  actividades: boolean = false;
  metaSelected: boolean = false;
  meta: any;

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
  ) { 
    activatedRoute.params.subscribe(prm => {

      this.planId = prm['idPlan']; 
      this.indexMeta = prm['indexMeta']  
      this.idProyectoInversion = prm['idProyectoInversion']
      //console.log(this.id_formato);
    });
    //this.cargaFormato();
  }

  ngOnInit(): void {
    this.editar()
    this.programarMetas()
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
      this.request.get(environment.PLANES_MID, `formulacion/get_plan/` + this.planId + `/` + this.indexMeta).subscribe((data: any) => {
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
    this.request.put(environment.PLANES_MID, `inversion/actualizar_meta`, actividad, this.planId + `/` + this.indexMeta).subscribe((data: any) => {      
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
  
}
