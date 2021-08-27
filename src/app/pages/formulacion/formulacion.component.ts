import { Component, OnInit } from '@angular/core';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormArray, FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-formulacion',
  templateUrl: './formulacion.component.html',
  styleUrls: ['./formulacion.component.scss']
})
export class FormulacionComponent implements OnInit {

  activedStep = 0;

  form: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  json: any = {
    "Meta_Plan_de_Accion_2022": "",
    //"Meta_SEGPLAN": "",
    "Tipo_Meta": "",
    "Descripcion_Meta": "",
    "Formula_indicador": "",
    "Some_Value": "",
    "Some_Value_2": "",
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group(this.json);
  }

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

  steps: any[] = [
    {
      id: 'Meta - Some Value',
      sub: [
        {id: 'Meta Plan de Accion 2022', type: 'input', key: "Meta_Plan_de_Accion_2022", required: "true"},
        {id: 'Meta SEGPLAN', type: 'input', key: "Meta_SEGPLAN", required: "false"},
        {id: 'Tipo Meta', type: 'select', key: "Tipo_Meta", options: this.planes1, required: "true"},
        {id: 'Descripcion Meta', type: 'input', key: "Descripcion_Meta", required: "true"},
        {id: 'Formula indicador', type: 'number', key: "Formula_indicador", required: "true"},
      ],
    },{
      id: 'Programación de Magnitudes',
      sub: [
        {id: 'Some Value', type: 'button', key: "Some_Value", required: "true"},
        {id: 'Some Value 2', type: 'select', key: "Some_Value_2", options: this.planes2, required: "true"},
      ]
    },{
      id: 'Programación de Presupuestal',
      sub: [
        {id: 'Maybe Some Value'},
      ]
    }
  ]

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
