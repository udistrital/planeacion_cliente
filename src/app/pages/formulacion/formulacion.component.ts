import { Component, ViewChild, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormArray, FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import {MatTableDataSource} from '@angular/material/table';
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
  unidades: any[];
  vigencias: any[];
  planSelected: boolean;
  planAsignado: boolean;
  unidadSelected: boolean;
  vigenciaSelected: boolean;
  addActividad: boolean;
  plan: any;
  unidad: any;
  vigencia: any;
  steps: any[];
  json: any;
  estado: string = "1";
  clonar: boolean;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
  ) {
    this.loadPlanes();
    this.loadPeriodos();
    this.loadUnidades();
    this.addActividad = false;
    this.planSelected = false;
    this.unidadSelected = false;
    this.vigenciaSelected = false;
    this.clonar = false;
   }

   applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadUnidades(){
    this.request.get(environment.OIKOS_SERVICE, `dependencia?limit=0`).subscribe((data: any) => {
      if (data){
        this.unidades = data;
      }
    },(error) => {
      Swal.fire({
        title: 'Error en la operación', 
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  loadPeriodos(){
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG`).subscribe((data: any) => {
      if (data){
        this.vigencias = data.Data;
      }
    },(error) => {
      Swal.fire({
        title: 'Error en la operación', 
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
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
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
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

  displayedColumns: string[] = ['numero', 'nombre', 'rubro', 'valor', 'observacion', 'activo', 'actions'];
  dataSource: MatTableDataSource<any>;

  ngOnInit(): void {
    
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

  infoPlan: any[] = [
    {
      numero: "1",
      nombre: "Nombre 1",
      rubro: "Rubro 1",
      valor: "Valor 1",
      observacion: "Existe",
      activo: true
    },
    {
      numero: "2",
      nombre: "Nombre 2",
      rubro: "Rubro 2",
      valor: "Valor 2",
      observacion: "Existe",
      activo: true
    },
    {
      numero: "3",
      nombre: "Nombre 3",
      rubro: "Rubro 3",
      valor: "Valor 3",
      observacion: "No existe",
      activo: true
    }
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
    Swal.fire({
      title: 'Registro agregado', 
      text: `Acción generada: ${JSON.stringify(this.form.value)}`,
      icon: 'success'
    }).then((result) => {
      if (result.value) {
        this.infoPlan.push({
          numero: "4",
          nombre: "Nombre 4",
          rubro: "Rubro 4",
          valor: "Valor 4",
          observacion: "No Existe",
          activo: true
        })
        this.loadData()
        this.form.reset();
        this.addActividad = false;
        //window.location.reload();
      }
    })
    //alert(JSON.stringify(this.form.value));
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

  onChangeU(unidad){
    if (unidad == undefined){
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
    }
  }

  onChangeV(vigencia){
    if (vigencia == undefined){
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      console.log(this.vigencia)
      //this.cargaFormato(this.plan);
      //this.loadData();
    }
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
      this.busquedaPlanes(plan);
      //this.planSelected = true;
      //this.plan = plan;
      //this.addActividad = false;
      //this.cargaFormato(this.plan);
    }
  }

  //'sintomas?limit=1&order=desc&sortby=fecha_creacion&query=terceroId:'+ this.tercero.Id

  busquedaPlanes(planB){
    this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:`+this.unidad.Id+`,vigencia:`+
    this.vigencia.Id+`,formato:false,nombre:`+planB.nombre).subscribe((data: any) => {
      if (data.Data.length > 0){
        this.plan = data.Data;
        this.planAsignado = true;
      } else if (data.Data.length == 0) {
        this.clonar = true;
        this.plan = planB;
      }
    },(error) => {
      Swal.fire({
        title: 'Error en la operación', 
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  loadData(){
    // carga de la tabla
    this.ajustarData();
  }

  ajustarData(){
    this.cambiarValor("activo", true, "Activo")
    this.cambiarValor("activo", false, "Inactivo")
    this.dataSource = new MatTableDataSource(this.infoPlan); // this.data de la consulta (!)
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  cargaFormato(plan){
    this.request.get(environment.PLANES_MID, `formato/` + plan._id).subscribe((data: any) => {
      if (data){
        this.steps = data[0]
        //this.json = data[1][0]
        //console.log(this.json)
        //this.json.push

        this.json = {
          "6139894fdf020f41fc56e5af": "",
          "613991a6df020f6a5556e5b7": "",
          "613991d1df020ff74556e5c2": "",
          "613991e3df020f680656e5cf": "",
          "613991f4df020fd61956e5de": "",
          "61399208df020f3fea56e5ef": "",
          "613acf8edf020f82a056eb2b": "",
          "613ad17adf020f2d0f56eb70": "",
          "613ad189df020f10fb56eb85": "",
          "613ad1a3df020f474756ebb0": "",
          "613ad1b4df020f3f0d56ebc9": "",
          "613ad1cfdf020f4e0156ebe4": "",
          "613ad1eadf020f305a56ec01": "",
          "613ad203df020f799a56ec20": "",
          "613ad21adf020f6fc156ec41": "",
          "613ad22fdf020fd90856ec78": "",
          "613ad247df020f2ea656ec9d": "",
          "613ad25cdf020fd15156ecc4": "",
          "613ad46edf020fed5256edd8": "",
          "613adb88df020fdb1e56edfe": "",
          "613adb9cdf020f00f656ee29": "",
          "613adbcadf020f74af56ee56": "",
          "613adc09df020f83dd56ee8a": "",
          "613b4b71df020f6c0456f06f": "",
          "613b4cf0df020f4f1156f19f": "", 
          // "6139894fdf020f41fc56e5afo": "",
          // "613991a6df020f6a5556e5b7o": "",
          // "613991d1df020ff74556e5c2o": "",
          // "613991e3df020f680656e5cfo": "",
          // "613991f4df020fd61956e5deo": "",
          // "61399208df020f3fea56e5efo": "",
          // "613acf8edf020f82a056eb2bo": "",
          // "613ad17adf020f2d0f56eb70o": "",
          // "613ad189df020f10fb56eb85o": "",
          // "613ad1a3df020f474756ebb0o": "",
          // "613ad1b4df020f3f0d56ebc9o": "",
          // "613ad1cfdf020f4e0156ebe4o": "",
          // "613ad1eadf020f305a56ec01o": "",
          // "613ad203df020f799a56ec20o": "",
          // "613ad21adf020f6fc156ec41o": "",
          // "613ad22fdf020fd90856ec78o": "",
          // "613ad247df020f2ea656ec9do": "",
          // "613ad25cdf020fd15156ecc4o": "",
          // "613ad46edf020fed5256edd8o": "",
          // "613adb88df020fdb1e56edfeo": "",
          // "613adb9cdf020f00f656ee29o": "",
          // "613adbcadf020f74af56ee56o": "",
          // "613adc09df020f83dd56ee8ao": "",
          // "613b4b71df020f6c0456f06fo": "",
          // "613b4cf0df020f4f1156f19fo": ""
          }
        this.form = this.formBuilder.group(this.json);
        // this.form = this.formBuilder.group({
        //   "613991a6df020f6a5556e5b7": "3"
        // });
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

  editar(fila): void {
    this.cargaFormato(this.plan);
    this.addActividad = true;
  }

  agregarActividad() {
    this.cargaFormato(this.plan);
    this.addActividad = true;
  }

  culminarPlan() {
    Swal.fire({
      title: 'Envío de Plan',
      text: `¿Está seguro de enviar plan para revisión?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
            Swal.fire({
              title: 'Plan enviado', 
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.loadData()
                this.addActividad = false;
              }
            })
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: 'Envío cancelado', 
              icon: 'error',
              showConfirmButton: false,
              timer: 2500
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

  cambiarValor(valorABuscar, valorViejo, valorNuevo) {
    this.infoPlan.forEach(function(elemento) {
      elemento[valorABuscar] = elemento[valorABuscar] == valorViejo ? valorNuevo : elemento[valorABuscar]
    })
  }

  formularPlan(){
    // CLONAR
    this.clonar = false;
    this.planAsignado = true;
  }

  ocultar() {
    Swal.fire({
      title: 'Registro de la actividad',
      text: `¿Desea cancelar el registro de la actividad?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
            this.addActividad = false;
            Swal.fire({
              title: 'Registro cancelado', 
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          } else if (result.dismiss === Swal.DismissReason.cancel) {
            
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
