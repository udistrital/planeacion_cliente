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
  planAux: any;
  unidad: any;
  vigencia: any;
  steps: any[];
  json: any;
  estado: string;
  clonar: boolean;
  panelOpenState = true;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
  ) {
    this.loadPlanes();
    this.loadPeriodos();
    this.loadUnidades();
    // IMPORTANTE CUANDO CARGUE PLAN
    this.loadData();
    this.addActividad = false;
    this.planSelected = false;
    this.unidadSelected = false;
    this.vigenciaSelected = false;
    this.clonar = false;
   }

  displayedColumns: string[] = ['numero', 'nombre', 'rubro', 'valor', 'observacion', 'activo'];
  columnsToDisplay: string[] = this.displayedColumns.slice();
  dataSource: MatTableDataSource<any>;

  ngOnInit(): void {}

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
    this.request.get(environment.PLANES_CRUD, `plan?query=formato:true`).subscribe((data: any) => {
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

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
  }

  submit() {
    this.request.put(environment.PLANES_MID, `formulacion/guardar_actividad`, this.form.value, this.plan._id).subscribe((data : any) => {
      if (data){
        Swal.fire({
          title: 'Actividad agregada', 
          //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
          text: 'La actividad se ha registrado satisfactoriamente',
          icon: 'success'
        }).then((result) => {
          if (result.value) {
            this.loadData()
            this.form.reset();
            this.addActividad = false;
          }
        })
      }
    })
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required', )) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  filterPlanes(data) {
    var dataAux = data.filter(e => e.tipo_plan_id != "611af8464a34b3599e3799a2");
    return dataAux.filter(e => e.activo == true);
  }  

  onChangeU(unidad){
    if (unidad == undefined){
      this.unidadSelected = false;
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
      if (this.vigenciaSelected && this.planSelected){
        this.busquedaPlanes(this.planAux);
      }
    }
  }

  onChangeV(vigencia){
    if (vigencia == undefined){
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      if (this.unidadSelected && this.planSelected){
        this.busquedaPlanes(this.planAux);
      }
    }
  }

  onChangeP(plan){
    if (plan == undefined){
      this.planSelected = false;
    } else {
      this.planAux = plan;
      this.planSelected = true;
      this.busquedaPlanes(plan);
    }
  }

  busquedaPlanes(planB){
    this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:`+this.unidad.Id+`,vigencia:`+
    this.vigencia.Id+`,formato:false,nombre:`+planB.nombre).subscribe((data: any) => {
      if (data.Data.length > 0){
        this.plan = data.Data[0];
        this.planAsignado = true;
        this.clonar = false;
      } else if (data.Data.length == 0) {
        Swal.fire({
          title: 'Formulación nuevo plan', 
          html:'No existe plan <b>'+planB.nombre+'</b> <br>' +
              'para la dependencia <b>'+this.unidad.Nombre+'</b> y la <br>' +
              'vigencia <b>'+this.vigencia.Nombre+'</b><br></br>'+
              '<i>Deberá formular el plan</i>',
          // text: `No existe plan ${planB.nombre} para la dependencia ${this.unidad.Nombre} y la vigencia ${this.vigencia.Nombre}. 
          // Deberá formular un nuevo plan`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 7000
        })
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
    Swal.fire({
      title: 'Cargando formato',
      timerProgressBar: true,
      showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
    })
    this.request.get(environment.PLANES_MID, `formato/` + plan._id).subscribe((data: any) => {
      if (data){
        Swal.close();
        this.estado = plan.estado_plan_id;
        this.steps = data[0]
        this.json = data[1][0]
        this.form = this.formBuilder.group(this.json);
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
    //GET ACTIVIDAD
    this.cargaFormato(this.plan);
    this.addActividad = true;
  }

  agregarActividad() {
    this.cargaFormato(this.plan);
    this.addActividad = true;
  }

  culminarPlan() {
    // Revisar si tiene actividades (!)
    Swal.fire({
      title: 'Envío de Plan',
      text: `¿Está seguro de enviar plan para revisión?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
        this.plan.estado_plan_id = "614d3aeb01c7a245952fabff"
        this.request.put(environment.PLANES_CRUD, `plan`, this.plan, this.plan._id).subscribe((data:any) =>{
          if(data){
            Swal.fire({
              title: 'Plan enviado', 
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.loadData()
                this.addActividad = false;
              }
            })
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
    let parametros = {
      "dependencia_id": String(this.unidad.Id),
      "vigencia": String(this.vigencia.Id)
    }
    this.request.post(environment.PLANES_MID, `formulacion/clonar_formato/`+this.plan._id, parametros).subscribe((data: any) => {
      if (data){
          let upd = {
            estado_plan_id:"614d3ad301c7a200482fabfd"
          }
          this.request.put(environment.PLANES_CRUD, `plan`, upd, data.Data._id).subscribe((dataPut: any) => {
            if(dataPut){
              this.plan = dataPut.Data;
              Swal.fire({
                title: 'Formulación nuevo plan', 
                text: `Plan creado satisfactoriamente`,
                icon: 'success',
                showConfirmButton: false,
                timer: 4000
              })
              this.clonar = false;
              this.planAsignado = true;
              //CARGA TABLA
              this.loadData();
            }
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
}
