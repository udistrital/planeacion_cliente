import { Component, OnInit } from '@angular/core';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-consultar-plan',
  templateUrl: './consultar-plan.component.html',
  styleUrls: ['./consultar-plan.component.scss']
})
export class ConsultarPlanComponent implements OnInit {

  formConsultar: FormGroup;
  tipoPlanId: string; // id tipo plan
  idPadre: string; // id padre del objeto
  planes: any[];
  planId: string;
  nombrePlan : string;
  tipo_plan_id: string;

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
    private router: Router,
  ) {
    activatedRoute.params.subscribe(prm => {
      this.planId = prm['plan_id'];
      this.nombrePlan = prm['nombrePlan'];
      this.tipo_plan_id = prm['tipo_plan_id'];
    });
    // this.loadPlanes(); 
   }

  // onChange(plan){
  //   if (plan == undefined){
  //     this.tipoPlanId = undefined;
  //   } else {
  //     this.tipoPlanId = plan.tipo_plan_id;
  //     this.idPadre = plan._id; // id plan
  //   }
  // }

  // loadPlanes(){
  //   this.request.get(environment.PLANES_CRUD, `plan?query=formato:true`).subscribe((data: any) => {
  //     if (data){
  //       this.planes = data.Data;
  //       this.planes = this.filterActivos(this.planes);
  //     }
  //   },(error) => {
  //     Swal.fire({
  //       title: 'Error en la operación', 
  //       text: 'No se encontraron datos registrados',
  //       icon: 'warning',
  //       showConfirmButton: false,
  //       timer: 2500
  //     })
  //   })
  // }

  filterActivos(data) {
    return data.filter(e => e.activo == true);
  }

  volver(){
    this.router.navigate(['pages/plan/listar-plan']);
  }

  ngOnInit(): void {
    this.formConsultar = this.formBuilder.group({
      nombre: [this.nombrePlan, Validators.required],
      tipo_plan_id: [this.tipo_plan_id, Validators.required],
      plan_id: [this.planId, Validators.required]
    });
  }

}
