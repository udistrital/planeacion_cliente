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
  dataSource: any;
  displayedColumns: string[] = ['index', 'dato', 'activo', 'gestion'];
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
        console.log(this.vigencias, "vigencias")       
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
      console.log(this.vigencia, "valor vigencia", this.vigenciaSelected); 
    }
  }

  loadUnidades() {
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {          
          this.unidades = data.Data;
          console.log(this.unidades, "unidades")
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
      console.log(this.unidad, "valor unidad", this.unidadSelected);    
    }
  }

  loadPlanes() {
    this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,tipo_plan_id:63cfc000b6c0e58878981535,formato:true`).subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {
          this.planes = data.Data;
          console.log(this.planes, "planes");
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
      console.log(this.plan, "valor plan", this.planSelected);     
    }
  }

  formular() {
    if(this.vigenciaSelected == true && this.unidadSelected == true && this.planSelected == true){
      console.log("entró al if");      
      this.router.navigate(['/pages/proyectos-macro/formulacion-plan-inversion']);
    }else{
      Swal.fire({
        title: 'Debe seleccionar todos los criterios',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    };
  }

}
