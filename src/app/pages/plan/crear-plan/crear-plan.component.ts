import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { UserService } from '../../services/userService';
import { UtilService } from '../../services/utilService';
import { RequestManager } from '../../services/requestManager';
import { Router } from '@angular/router';

interface Tipo {
  name: string;
}

@Component({
  selector: 'app-crear-plan',
  templateUrl: './crear-plan.component.html',
  styleUrls: ['./crear-plan.component.scss']
})
export class CrearPlanComponent implements OnInit {
  formCrearPlan: FormGroup;
  tipos: Tipo[] = [
    {name: 'Plan'},
    {name: 'Proyecto'},
  ];

  constructor(
    private request: RequestManager,
    private userService: UserService,
    private utilService: UtilService,
    private router: Router,
    private formBuilder: FormBuilder
  ) { }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required', )) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  async createPlan() {
    
  }

  ngOnInit(): void {
    this.formCrearPlan = this.formBuilder.group({
      nombreControl: ['', Validators.required],
      descControl: ['', Validators.required],
      tipoControl: ['', Validators.required],
      radioEstado: ['', Validators.required],
    });
  }

}
