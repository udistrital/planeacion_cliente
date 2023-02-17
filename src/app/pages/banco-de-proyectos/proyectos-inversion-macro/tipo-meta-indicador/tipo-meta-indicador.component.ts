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
  id_formato: string;
  banderaEdit: boolean;

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
  ) { 
    activatedRoute.params.subscribe(prm => {

      this.id_formato = prm['id_formato'];   
      console.log(this.id_formato);
    });
    this.cargaFormato();
  }

  ngOnInit(): void {
  }

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
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
    this.request.get(environment.PLANES_MID, `formato/` + this.id_formato).subscribe((data: any) => {
      if (data) {
        Swal.close();
        //this.estado = plan.estado_plan_id;
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
