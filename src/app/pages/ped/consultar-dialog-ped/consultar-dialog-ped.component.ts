import { Component, OnInit, Inject, } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';


@Component({
  selector: 'app-consultar-dialog-ped',
  templateUrl: './consultar-dialog-ped.component.html',
  styleUrls: ['./consultar-dialog-ped.component.scss']
})
export class ConsultarDialogPedComponent implements OnInit {

  formConsultar: FormGroup;
  nombre: string;
  descripcion: string;
  tipoPlan: string;
  planId: string;

  tipoPlanId: string; // id tipo plan
  idPadre: string; // id padre del objeto
  planes: any[];

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    @Inject(MAT_DIALOG_DATA) public data: any 
  ) {
    this.nombre = data.sub.nombre;
    this.descripcion = data.sub.descripcion;
    this.tipoPlan = data.sub.tipo_plan_id;
    this.planId = data.sub._id;
  }

  filterActivos(data) {
    return data.filter(e => e.activo == true);
  }

  ngOnInit(): void {
    this.formConsultar = this.formBuilder.group({
      descripcion: [this.descripcion, Validators.required],
      nombre: [this.nombre, Validators.required],
      tipo_plan_id: [this.tipoPlan, Validators.required],
      plan_id: [this.planId, Validators.required]
    });
  }

}
