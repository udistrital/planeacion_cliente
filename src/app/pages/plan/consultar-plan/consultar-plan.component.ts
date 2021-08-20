import { Component, OnInit } from '@angular/core';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-consultar-plan',
  templateUrl: './consultar-plan.component.html',
  styleUrls: ['./consultar-plan.component.scss']
})
export class ConsultarPlanComponent implements OnInit {

  tipoPlanId: string; // id tipo plan
  idPadre: string; // id padre del objeto
  planes: any[];

  constructor(
    private request: RequestManager,
  ) {
    this.loadPlanes(); 
   }

  onChange(plan){
    if (plan == undefined){
      this.tipoPlanId = undefined;
    } else {
      this.tipoPlanId = plan.tipo_plan_id;
      this.idPadre = plan._id; // id plan
    }
  }

  loadPlanes(){
    this.request.get(environment.PLANES_CRUD, `plan`).subscribe((data: any) => {
      if (data){
        this.planes = data.Data;
        this.planes = this.filterActivos(this.planes);
      }
    },(error) => {
      Swal.fire({
        title: 'Error en la operación', 
        text: 'No se encontraron datos registrados',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  filterActivos(data) {
    return data.filter(e => e.activo == true);
  }

  ngOnInit(): void {
  }

}
