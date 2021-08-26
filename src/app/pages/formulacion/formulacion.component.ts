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

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      Meta_Plan_de_Accion_2022:['', Validators.required],
      Meta_SEGPLAN:['', Validators.required],
      Descripcion_Meta:['', Validators.required],
      cualquier: ['', Validators.required],
    });
  }

  steps: any[] = [
    {
      id: 'Meta - Some Value',
      sub: [
        {id: 'Meta Plan de Accion 2022', type: 'input', key: "Meta_Plan_de_Accion_2022"},
        {id: 'Meta SEGPLAN', type: 'input', key: "Meta_SEGPLAN"},
        {id: 'Tipo Meta', type: 'select', key: "Tipo_Meta"},
        {id: 'Descripcion Meta', type: 'input', key: "Descripcion_Meta"},
        {id: 'Formula indicador'},
        {id: 'Ejemplo', type: 'select', key: "ejemplo"},
      ],
    },{
      id: 'Programación de Magnitudes',
      sub: [
        {id: 'Some Value', type: 'input', key: "cualquier"},
        {id: 'Some Value 2'},
      ]
    },{
      id: 'Programación de Presupuestal',
      sub: [
        {id: 'Maybe Some Value'},
      ]
    },
    {
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
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required', )) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  planes: any[] = [
    {
      nombre: "abc",
      descripcion: "def"
    }
  ] 

  panelOpenState = true;

  accordions = [
    {
      title: 'Meta Plan de Accion 2022', 
      description: 'you can reorder this list easily',
      subAccordion: [{
        title: 'item 1',
        description: 'description',
        content: 'Content of subpanel 01',
      },
      {
        title: 'item 2',
        description: '',
        content: 'Content of subpanel 02',
      }]
    },
    {
      title: 'Meta SEGPLAN', 
      description: 'simply click, drag & drop one of us around',
      subAccordion: [{
        title: 'item 1', 
        description: 'description',
        content: 'Content of subpanel 01',
      }]
    },
    {
      title: 'Tipo Meta', 
      description: 'You will see, it\'s very easy!',
      subAccordion: [{
        title: 'item 1', 
        description: 'description',
        content: 'Content of subpanel 01',
      }]
    },
    {
      title: 'Descripcion Meta', 
      description: 'Try it now, go ahead',
      subAccordion: [{
        title: 'item 1', 
        description: 'description',
        content: 'Content of subpanel 01',
      }]
    },
    {
      title: 'Formula indicador', 
      description: 'Try it now, go ahead',
      subAccordion: [{
        title: 'item 1', 
        description: 'description',
        content: 'Content of subpanel 01',
      }]
    }
  ]
  
  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.accordions, event.previousIndex, event.currentIndex);
  }

  //form = new FormArray(this.steps.map(() => new FormGroup({})));

}
