import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AgregarDialogComponent } from './agregar-dialog/agregar-dialog.component';
import { EditarDialogComponent } from './editar-dialog/editar-dialog.component';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-construir-plan',
  templateUrl: './construir-plan.component.html',
  styleUrls: ['./construir-plan.component.scss']
})
export class ConstruirPlanComponent implements OnInit {
  
  formConstruirPlan: FormGroup;
  tipoPlanId: string; // id tipo plan
  nivel: number; // nivel objeto
  idPadre: string; // id padre del objeto
  uid: string; // id objeto
  uid_n: number; // nuevo nivel
  planes: any[];

  @Output() eventChange = new EventEmitter();
  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
    private request: RequestManager,
  ) { 
    this.idPadre = '';
    this.loadPlanes(); 
  }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(AgregarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: {nivel: this.uid_n}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined){
        return undefined;
      } else {
        this.postData(result);
      }
    });
  }

  postData(res){
    if (this.uid_n == 1){
      var dataSub = {
        nombre: res.nombre,
        descripcion: res.descripcion,
        padre: this.idPadre,
        activo: JSON.parse(res.activo),
        bandera_tabla: JSON.parse(res.bandera)
      } 
    } else if (this.uid_n > 1){
      var dataSub = {
        nombre: res.nombre,
        descripcion: res.descripcion,
        padre: this.uid,
        activo: JSON.parse(res.activo),
        bandera_tabla: JSON.parse(res.bandera)
      }
    }
    var dato = {
      type : res.tipoDato,
      required: res.requerido
    }
    let subgrupo
    
    this.request.post(environment.PLANES_CRUD, 'subgrupo/registrar_nodo', dataSub).subscribe(
      (data: any) => {
        if(data){   
           
          var dataSubDetalle ={
            nombre: "subgrupo detalle " + res.nombre,
            descripcion: res.nombre,
            subgrupo_id: ""+data.Data._id,
            dato: JSON.stringify(dato),
            activo: JSON.parse(res.activo)
          }
          if(dato.type != "" && dato.required != ""){
            this.request.post(environment.PLANES_CRUD, 'subgrupo-detalle', dataSubDetalle).subscribe(
              (data: any) =>{
                if(!data){
                  Swal.fire({
                    title: 'Error en la operación',
                    icon: 'error',
                    showConfirmButton: false,
                    timer: 2500
                  })
                }
              }
            )
          }

          subgrupo = data.Data    
          Swal.fire({
            
            title: 'Registro correcto',
            text: `Se ingresaron correctamente los datos del nivel`,
            icon: 'success',
          }).then((result) => {
            if (result.value) {
              this.eventChange.emit(true);
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
  };

  openDialogEditar(sub, subDetalle): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: {nivel: this.uid_n, ban: 'nivel', sub, subDetalle}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined){
        return undefined;
      } else {
        this.putData(result);
      }
    });
  }

  putData(res){
    let subgrupo = {
      nombre: res.nombre,
      descripcion: res.descripcion,
      activo: res.activo,
      bandera_tabla: res.banderaTabla
    }
    let dato = {
      type: res.tipoDato,
      required: res.requerido
    }
    let subgrupoDetalle = {
      dato: JSON.stringify(dato)
    }
    this.request.get(environment.PLANES_CRUD, `subgrupo-detalle/detalle/`+ this.uid).subscribe((data: any) => {
      if(data.Data.length > 0){ 
        this.request.put(environment.PLANES_CRUD, `subgrupo-detalle`, subgrupoDetalle, data.Data[0]._id).subscribe((data:any) =>{
          this.request.put(environment.PLANES_CRUD, `subgrupo`, subgrupo, this.uid).subscribe((data: any) => {
            if(data.Data.activo == false){
              this.request.put(environment.PLANES_CRUD, `subgrupo/delete_nodo`, subgrupo, this.uid).subscribe((data: any) => {
                if(data){
                  Swal.fire({
                    title: 'Actualización correcta',
                    text: `Se actualizaron correctamente los datos`,
                    icon: 'success',
                  }).then((result) => {
                    if (result.value) {
                      this.eventChange.emit(true);
                    }
                  })
                }
              }) 
            }else{
              if(data){
                Swal.fire({
                  title: 'Actualización correcta',
                  text: `Se actualizaron correctamente los datos`,
                  icon: 'success',
                }).then((result) => {
                  if (result.value) {
                    this.eventChange.emit(true);
                  }
                })
              }
            } 
           
          }),
          (error) => {
            Swal.fire({
              title: 'Error en la operación',
                icon: 'error',
                showConfirmButton: false,
                timer: 2500
            })
          };
        })
      }else{
        this.request.put(environment.PLANES_CRUD, `subgrupo`, subgrupo, this.uid).subscribe((data: any) => {
          if(data){
            Swal.fire({
              title: 'Actualización correcta',
              text: `Se actualizaron correctamente los datos`,
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.eventChange.emit(true);
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
        };
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

  onChange(plan){
    if (plan == undefined){
      this.tipoPlanId = undefined;
    } else {
      this.tipoPlanId = plan.tipo_plan_id;
      this.idPadre = plan._id; // id plan
    }
  }

   receiveMessage(event){
    if (event.bandera == 'editar'){
      this.uid_n = event.fila.level + 1;
      this.uid = event.fila.id; // id del nivel a editar
      this.request.get(environment.PLANES_CRUD, `subgrupo/`+this.uid).subscribe((data: any) => {
        if (data){
          this.request.get(environment.PLANES_CRUD, 'subgrupo-detalle/detalle/' + this.uid).subscribe((dataDetalle: any) => {
            if (dataDetalle){
              if(dataDetalle.Data.length > 0 ){
                let auxiliar = JSON.parse(dataDetalle.Data[0].dato)
                let subDataDetalle = {
                  type: auxiliar.type,
                  required: auxiliar.required
                }
                let subData = {
                  nombre: data.Data.nombre,
                  descripcion: data.Data.descripcion,
                  activo: data.Data.activo,
                  banderaTabla: data.Data.bandera_tabla
                }
                this.openDialogEditar(subData, subDataDetalle); 
              }else{
                let subDataDetalle = {
                  type: "",
                  required: ""
                }
                let subData = {
                  nombre: data.Data.nombre,
                  descripcion: data.Data.descripcion,
                  activo: data.Data.activo,
                  banderaTabla: data.Data.bandera_tabla
                }
                this.openDialogEditar(subData, subDataDetalle); 
              }
            }
          })
        }
      }),
      (error) => {
        Swal.fire({
          title: 'Error en la operación', 
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      } 
    } else if (event.bandera == 'agregar'){
      this.uid_n = event.fila.level + 2; // el nuevo nivel
      this.uid = event.fila.id; // será el padre del nuevo nivel
      if (event.fila.activo == true || event.fila.activo == 'activo' || event.fila.activo == 'Activo'){
        this.openDialogAgregar();
      } else {
        Swal.fire({
          title: '¡Error en la creación!', 
          text: 'No es posible agregar un nuevo nivel sobre un nivel inactivo',
          icon: 'warning',
          showConfirmButton: false,
          timer: 3200
        })
      }

    }
  }
  
  agregarSub(niv: number){
    this.uid_n = niv;
    this.openDialogAgregar()
  }

  loadPlanes(){
    this.request.get(environment.PLANES_CRUD, `plan?query=formato:true`).subscribe((data: any) => {
      if (data){
        this.planes = data.Data;
        this.planes = this.filterActivos(this.planes);
      }
      this.request.get(environment.PLANES_CRUD, `plan?query=nombre:Plan%20Estrategico%20de%20Desarrollo`).subscribe((data : any)=>{
        this.planes = this.planes.concat(data.Data);
        this.planes = this.filterActivos(this.planes);
      })
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
    this.formConstruirPlan = this.formBuilder.group({
      planControl: ['', Validators.required],
    });
  }
}