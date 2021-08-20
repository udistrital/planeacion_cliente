import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { UserService } from '../../services/userService';
import { UtilService } from '../../services/utilService';
import { RequestManager } from '../../services/requestManager';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment'
import Swal from 'sweetalert2';

@Component({
  selector: 'app-crear-plan',
  templateUrl: './crear-plan.component.html',
  styleUrls: ['./crear-plan.component.scss']
})
export class CrearPlanComponent implements OnInit {
  
  formCrearPlan: FormGroup;
  tipos: any[]
  tipoPlan: any;

  constructor(
    private request: RequestManager,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router,
    private formBuilder: FormBuilder
  ) { 
    this.loadTipos();
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required', )) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  createPlan() {
    let dataPlan = {
      nombre: this.formCrearPlan.get('nombre').value,
      descripcion: this.formCrearPlan.get('desc').value,
      tipo_plan_id: this.tipoPlan._id,
      aplicativo_id: "idPlaneacion", // Valor por revisar
      activo: JSON.parse(this.formCrearPlan.get('radioEstado').value)
    }
    this.request.post(environment.PLANES_CRUD, 'plan', dataPlan).subscribe(
      (data: any) => {
        if(data){         
          Swal.fire({
            title: 'Registro correcto',
            text: `Se ingresaron correctamente los datos`,
            icon: 'success',
          }).then((result) => {
            if (result.value) {
              this.router.navigate(['pages/plan/listar-plan']);
            }
          })
        }
      }),
      (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      } 
  }

  select(tipo){
    this.tipoPlan = tipo;
  }

  loadTipos(){
    this.request.get(environment.PLANES_CRUD, `tipo-plan`).subscribe((data: any) => {
      if (data){
        this.tipos = data.Data;
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

  ngOnInit(): void {
    this.formCrearPlan = this.formBuilder.group({
      nombre: ['', Validators.required],
      desc: ['', Validators.required],
      tipo: ['', Validators.required],
      radioEstado: ['', Validators.required],
    });
  }
}
