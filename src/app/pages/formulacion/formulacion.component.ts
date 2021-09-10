import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormArray, FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-formulacion',
  templateUrl: './formulacion.component.html',
  styleUrls: ['./formulacion.component.scss']
})
export class FormulacionComponent implements OnInit {

  activedStep = 0;

  form: FormGroup;
  planes: any[];
  planSelected: boolean;
  unidadSelected: boolean;
  vigenciaSelected: boolean;
  plan: any;
  steps: any[];
  json: any;

  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
  ) {
    this.loadPlanes(); 
   }

  loadPlanes(){
    this.request.get(environment.PLANES_CRUD, `plan`).subscribe((data: any) => {
      if (data){
        this.planes = data.Data;
        this.planes = this.filterPlanes(this.planes);
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

  // json: any = {
  //   "Meta_Plan_de_Accion_2022": "",
  //   //"Meta_SEGPLAN": "",
  //   "Tipo_Meta": "",
  //   "Descripcion_Meta": "",
  //   "Formula_indicador": "",
  //   "Some_Value": "",
  //   "Some_Value_2": "",
  // }



  ngOnInit(): void {
    
  }

  unidades: any[] = [{
    id: "131",
    nombre: "Unidad nombre 1",
  },
  {
    id: "121",
    nombre: "Unidad nombre 2",
  },
  {
    id: "111",
    nombre: "Unidad nombre 3",
  }
  ]

  vigencias: any[] = [{
    id: "131",
    nombre: "Vigencia 2021",
  },
  {
    id: "121",
    nombre: "Vigencia 2022",
  },
  {
    id: "111",
    nombre: "Vigencia 2023",
  }
  ]

  planes1: any[] = [
    {
      nombre: "Primera",
      descripcion: "d"
    },
    {
      nombre: "Segunda",
      descripcion: "d"
    },
    {
      nombre: "Tercera",
      descripcion: "d"
    },
    {
      nombre: "Cuarta",
      descripcion: "d"
    },
  ] 

  planes2: any[] = [
    {
      nombre: "Primera Otra",
      descripcion: "d"
    },
    {
      nombre: "Segunda Otra",
      descripcion: "d"
    },
  ]

  // steps: any[] = [
  //   {
  //     id: 'Meta - Some Value',
  //     sub: [
  //       {id: 'Meta Plan de Accion 2022', type: 'input', key: "Meta_Plan_de_Accion_2022", required: "true"},
  //       {id: 'Meta SEGPLAN', type: 'input', key: "Meta_SEGPLAN", required: "false"},
  //       {id: 'Tipo Meta', type: 'select', key: "Tipo_Meta", options: this.planes1, required: "true"},
  //       {id: 'Descripcion Meta', type: 'input', key: "Descripcion_Meta", required: "true"},
  //       {id: 'Formula indicador', type: 'number', key: "Formula_indicador", required: "true"},
  //     ],
  //   },{
  //     id: 'Programación de Magnitudes',
  //     sub: [
  //       {id: 'Some Value', type: 'button', key: "Some_Value", required: "true"},
  //       {id: 'Some Value 2', type: 'select', key: "Some_Value_2", options: this.planes2, required: "true"},
  //     ]
  //   },{
  //     id: 'Programación de Presupuestal',
  //     sub: [
  //       {id: 'Maybe Some Value'},
  //     ]
  //   }
  // ]

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
  }

  submit() {
    alert(JSON.stringify(this.form.value));
    this.form.reset();
  }

  but() {
    alert("Hola");
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required', )) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  filterPlanes(data) {
    var dataAux = data.filter(e => e.tipo_plan_id == "611af8364a34b3b2df3799a0");
    return dataAux.filter(e => e.activo == true);
  }  

  onChangeP(plan){
    // if (plan == undefined){
    //   this.tipoPlanId = undefined;
    // } else {
    //   this.tipoPlanId = plan.tipo_plan_id;
    //   this.idPadre = plan._id; // id plan
    // }
    if (plan == undefined){
      this.planSelected = false;
    } else {
      this.planSelected = true;
      this.plan = plan;
      this.cargaFormato(this.plan);
    }
  }

  onChangeU(unidad){
    if (unidad == undefined){
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
    }
  }

  onChangeV(vigencia){
    if (vigencia == undefined){
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
    }
  }

  cargaFormato(plan){
    this.request.get(environment.PLANES_MID, `formato/` + plan._id).subscribe((data: any) => {
      if (data){
        this.steps = data[0]
        this.json = data[1][0]
        //console.log(this.json)
        this.form = this.formBuilder.group(this.json);
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

  panelOpenState = true;

  // accordions = [
  //   {
  //     title: 'Meta Plan de Accion 2022', 
  //     description: 'you can reorder this list easily',
  //     subAccordion: [{
  //       title: 'item 1',
  //       description: 'description',
  //       content: 'Content of subpanel 01',
  //     },
  //     {
  //       title: 'item 2',
  //       description: '',
  //       content: 'Content of subpanel 02',
  //     }]
  //   },
  //   {
  //     title: 'Meta SEGPLAN', 
  //     description: 'simply click, drag & drop one of us around',
  //     subAccordion: [{
  //       title: 'item 1', 
  //       description: 'description',
  //       content: 'Content of subpanel 01',
  //     }]
  //   },
  //   {
  //     title: 'Tipo Meta', 
  //     description: 'You will see, it\'s very easy!',
  //     subAccordion: [{
  //       title: 'item 1', 
  //       description: 'description',
  //       content: 'Content of subpanel 01',
  //     }]
  //   },
  //   {
  //     title: 'Descripcion Meta', 
  //     description: 'Try it now, go ahead',
  //     subAccordion: [{
  //       title: 'item 1', 
  //       description: 'description',
  //       content: 'Content of subpanel 01',
  //     }]
  //   },
  //   {
  //     title: 'Formula indicador', 
  //     description: 'Try it now, go ahead',
  //     subAccordion: [{
  //       title: 'item 1', 
  //       description: 'description',
  //       content: 'Content of subpanel 01',
  //     }]
  //   }
  // ]
  
  // drop(event: CdkDragDrop<string[]>) {
  //   moveItemInArray(this.accordions, event.previousIndex, event.currentIndex);
  // }

  //form = new FormArray(this.steps.map(() => new FormGroup({})));

}
