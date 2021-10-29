import { Component, ViewChild, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { FormArray, FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { RequestManager } from '../services/requestManager';
import { environment } from '../../../environments/environment';
import {MatTableDataSource} from '@angular/material/table';
import Swal from 'sweetalert2';
import { ArbolComponent } from '../plan/arbol/arbol.component';
import { element } from 'protractor';

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
  identContratistas : boolean;
  plan: any;
  planAux: any;
  unidad: any;
  vigencia: any;
  steps: any[];
  json: any;
  estado: string;
  clonar: boolean;
  panelOpenState = true;
  dataT: boolean;
  banderaEdit: boolean;
  rowActividad: string;
  banderaRecursos: boolean;
  existAct: boolean;

  tipoPlanId: string;
  idPadre: string;
  planesDesarrollo: any[];
  planDSelected: boolean;
  dataArmonizacion : string[] = [];

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
    this.banderaRecursos = false;
    this.existAct = false;
   }

  //displayedColumns: string[] = ['numero', 'nombre', 'rubro', 'valor', 'observacion', 'activo'];
  //columnsToDisplay: string[] = this.displayedColumns.slice();

  displayedColumns: string[];
  columnsToDisplay: string[]
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

  prevStep(step) {
    this.activedStep = step - 1;
  }

  nextStep(step) {
    this.activedStep = step + 1;
  }

  submit() {
    if (!this.banderaEdit){ // ADD NUEVA ACTIVIDAD
    var formValue = this.form.value;
    var actividad = {
            armo: this.dataArmonizacion.toString(),
            entrada: formValue
    }
          this.request.put(environment.PLANES_MID, `formulacion/guardar_actividad`, actividad, this.plan._id).subscribe((data : any) => {
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
                  this.dataArmonizacion = [];
                  this.banderaRecursos = false;
                  this.idPadre = '';
                  this.tipoPlanId = '';
                }
              })
            }
          })
        
      
    
    } else { // EDIT ACTIVIDAD
      var aux = this.dataArmonizacion.toString()
      var formValue = this.form.value;
      var actividad = {
        entrada: formValue,
        armo : aux
      } 
      this.request.put(environment.PLANES_MID, `formulacion/actualizar_actividad`, actividad, this.plan._id+`/`+this.rowActividad).subscribe((data: any) => {
        if (data){
          Swal.fire({
            title: 'Información de actividad actualizada', 
            //text: `Acción generada: ${JSON.stringify(this.form.value)}`,
            text: 'La actividad se ha actualizado satisfactoriamente',
            icon: 'success'
          }).then((result) => {
            if (result.value) {
              this.form.reset();
              this.addActividad = false;
              this.loadData();
              this.banderaRecursos = false;
              this.idPadre = '';
              this.tipoPlanId = '';
            }
          })
        }
      })
    }
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
      this.addActividad = false;
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
      this.addActividad = false;
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
      this.addActividad = false;
      this.busquedaPlanes(plan);
    }
  }

  onChangeSelect(opcion) {
    
  }


  onChangePD(planD){
    if (planD == undefined){
    } else {
      this.idPadre = planD._id
      this.tipoPlanId = planD.tipo_plan_id
    }
  }

  busquedaPlanes(planB){
    this.request.get(environment.PLANES_CRUD, `plan?query=dependencia_id:`+this.unidad.Id+`,vigencia:`+
    this.vigencia.Id+`,formato:false,nombre:`+planB.nombre).subscribe((data: any) => {
      if (data.Data.length > 0){
        this.plan = data.Data[0];
        this.planAsignado = true;
        this.clonar = false;
        this.loadData();
        this.existAct = true;
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
        this.existAct = false;
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
    this.request.get(environment.PLANES_MID, `formulacion/get_all_actividades/`+this.plan._id+`?order=asc&sortby=index`).subscribe((data: any) => {
      if (data.Data.data_source != null){
        this.dataSource = new MatTableDataSource(data.Data.data_source);
        this.cambiarValor("activo", true, "Activo", this.dataSource.data)
        this.cambiarValor("activo", false, "Inactivo", this.dataSource.data)
        this.displayedColumns = data.Data.displayed_columns;
        this.columnsToDisplay = this.displayedColumns.slice();
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
        this.dataT = true;
      } else if (data.Data.data_source == null){
        this.dataT = false;
        Swal.fire({
          title: 'Atención en la operación', 
          text: `No hay actividades registradas para el plan`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 3500
        })
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
    if (fila.activo == 'Inactivo'){
      Swal.fire({
        title: 'Actividad inactiva',
        text: `No puede editar una actividad en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 3500
      });
    } else {
      if (this.planesDesarrollo == undefined){
        this.cargarPlanesDesarrollo()
      }
      this.addActividad = true;
      this.banderaEdit = true;
      this.rowActividad = fila.index;
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
      })
      this.request.get(environment.PLANES_MID, `formulacion/get_plan/`+this.plan._id+`/`+fila.index).subscribe((data: any) => {

        if (data){
          Swal.close();
          this.estado = this.plan.estado_plan_id;
          this.steps = data.Data[0]
          this.json = data.Data[1][0]
          this.form = this.formBuilder.group(this.json);
          var strAmonizacion = data.Data[2][0]
          var arrArmonizacion = strAmonizacion.armo
          var len  = (arrArmonizacion.split(",").length)
          this.dataArmonizacion = strAmonizacion.split(",", len)
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
  }

  inhabilitar(fila): void{
    if (fila.activo == 'Inactivo'){
      Swal.fire({
        title: 'Actividad ya inactiva',
        text: `La actividad ya se encuentra en estado inactivo`,
        icon: 'info',
        showConfirmButton: false,
        timer: 2500
      });
    } else {
      this.inactivar(fila);
    }
  }

  inactivar(fila): void{
    Swal.fire({
      title: 'Inhabilitar actividad',
      text: `¿Está seguro de inhabilitar esta actividad?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
        if (result.isConfirmed) {
          this.request.put(environment.PLANES_MID, `formulacion/delete_actividad`, `null`, this.plan._id+`/`+fila.index).subscribe((data: any) => {
            if(data){
              Swal.fire({
                title: 'Cambio realizado', 
                icon: 'success',
              }).then((result) => {
                if (result.value) {
                  this.loadData()
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
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: 'Cambio cancelado', 
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          })
        }
    })
  }

  agregarActividad() {
    if(this.tipoPlanId === undefined && this.idPadre === undefined){
      this.cargarPlanesDesarrollo();
    }
    this.cargaFormato(this.plan);
    this.addActividad = true;
    this.banderaEdit = false;

  }

  identificarContratistas(){
    this.identContratistas = true;
  }

  cargarPlanesDesarrollo(){
    this.request.get(environment.PLANES_CRUD, `plan?query=tipo_plan_id:616513b91634adfaffed52bf`).subscribe((data: any) => {
      if(data){
        this.planesDesarrollo = data.Data
      }
    })
  }

  receiveMessage(event){
    if (event.bandera == 'armonizar'){
      var uid_n = event.fila.level;
      var uid = event.fila.id; // id del nivel a editar
      if (!event.fila.expandable){
        if (uid != this.dataArmonizacion.find(id => id === uid)){
          this.dataArmonizacion.push(uid)
        }else{
          const index = this.dataArmonizacion.indexOf(uid, 0);
          if (index > -1) {
            this.dataArmonizacion.splice(index, 1);
          }
        }
      }
    } 
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
        let mod ={
          estado_plan_id: "614d3aeb01c7a245952fabff"
        }
        // this.plan.estado_plan_id = "614d3aeb01c7a245952fabff"
        // this.request.put(environment.PLANES_CRUD, `plan`, mod, this.plan._id).subscribe((data:any) =>{
        //   if(data){
        //     Swal.fire({
        //       title: 'Plan enviado', 
        //       icon: 'success',
        //     }).then((result) => {
        //       if (result.value) {
        //         this.loadData()
        //         this.addActividad = false;
        //       }
        //     })
        //   }
        // })
        Swal.fire({
          title: 'Envío realizado (SIN CAMBIOS)', 
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
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

  cambiarValor(valorABuscar, valorViejo, valorNuevo, dataS) {
    dataS.forEach(function(elemento) {
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


  guardarIdentContratistas(){
    //console.log("Guardar Identificacion Contratistas")
  }

  ocultarIdentContratistas(){
    Swal.fire({
      title: 'Identificación de Contratistas',
      text: `¿Desea cancelar la identificación de contratistas?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      if (result.isConfirmed) {
            this.identContratistas = false;
            Swal.fire({
              title: 'Identificación cancelada', 
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
  identificacionRecursos(){
    this.banderaRecursos = true;
  }

}
