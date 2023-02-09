import { Component, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formular-proyecto-inversion',
  templateUrl: './formular-proyecto-inversion.component.html',
  styleUrls: ['./formular-proyecto-inversion.component.scss']
})
export class FormularProyectoInversionComponent implements OnInit {
  vigencias: any[];
  vigencia: any;
  unidades: any[];
  unidad: any;
  planes: any[];
  plan: any;
  vigenciaSelected: boolean;
  unidadSelected: boolean;
  planSelected: boolean;
  guardarDisabled: boolean;  
  constructor(
    private request: RequestManager,
    private formBuilder: FormBuilder,
    private router: Router,
  ) {
    this.loadVigencias();
    this.loadUnidades();
    this.loadPlanes();
    this.vigenciaSelected = false;
    this.unidadSelected = false;
    this.guardarDisabled = false;
   }

  ngOnInit(): void {
  }

  loadVigencias() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,activo:true`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data; 
        //console.log(this.vigencias, "vigencias")       
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

  onChangeV(vigencia: any) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;  
      //console.log(this.vigencia, "valor vigencia", this.vigenciaSelected); 
    }
  }

  loadUnidades() {
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {          
          this.unidades = data.Data;
          //console.log(this.unidades, "unidades")
        }
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

  onChangeU(unidad: any) {
    if (unidad == undefined) {
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;  
      //console.log(this.unidad, "valor unidad", this.unidadSelected);    
    }
  }

  loadPlanes() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:63cfc000b6c0e58878981535,formato:true`).subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {
          this.planes = data.Data;
          //console.log(this.planes, "planes");
        }
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

  onChangeP(plan: any) {
    if (plan == undefined) {
      this.planSelected = false;
    } else {
      this.planSelected = true;
      this.plan = plan; 
      //console.log(this.plan, "valor plan", this.planSelected);     
    }
  }

  formular() {
    if(this.vigenciaSelected == true && this.unidadSelected == true && this.planSelected == true){
      //console.log(this.plan, "plan");      
      this.router.navigate(['/pages/proyectos-macro/formulacion-plan-inversion/' + this.plan._id]);
    }else{
      Swal.fire({
        title: 'Debe seleccionar todos los criterios',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    };
  }

  formularPlan() {
    let parametros = {
      "dependencia_id": String(this.unidad.Id),
      "vigencia": String(this.vigencia.Id)
    }
    this.request.post(environment.PLANES_MID, `formulacion/clonar_formato/` + this.plan._id, parametros).subscribe((data: any) => {
      if (data) {
        this.plan.estado_plan_id = "614d3ad301c7a200482fabfd";
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, data.Data._id).subscribe((dataPut: any) => {
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
            //this.getVersiones(this.plan);
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

}
