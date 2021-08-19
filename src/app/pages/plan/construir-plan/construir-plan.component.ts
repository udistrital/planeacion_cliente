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
      } 
    } else if (this.uid_n > 1){
      var dataSub = {
        nombre: res.nombre,
        descripcion: res.descripcion,
        padre: this.uid,
        activo: JSON.parse(res.activo),
      }
    }
    this.request.post(environment.PLANES_CRUD, 'subgrupo/registrar_nodo', dataSub).subscribe(
      (data: any) => {
        if(data){         
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

  openDialogEditar(sub): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: {nivel: this.uid_n, ban: 'nivel', sub}
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
    this.request.put(environment.PLANES_CRUD, `subgrupo`, res, this.uid).subscribe((data: any) => {
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
          console.log(data)
          let subData = {
            nombre: data.Data.nombre,
            descripcion: data.Data.descripcion,
            activo: data.Data.activo,
          }
          this.openDialogEditar(subData); 
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
      this.openDialogAgregar();
    }
  }

  agregarSub(niv: number){
    this.uid_n = niv;
    this.openDialogAgregar()
  }

  loadPlanes(){
    this.request.get(environment.PLANES_CRUD, `plan`).subscribe((data: any) => {
      if (data){
        this.planes = data.Data;
        this.planes = this.filterActivos(this.planes);
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

  filterActivos(data) {
    return data.filter(e => e.activo == true);
  }

  ngOnInit(): void {
    this.formConstruirPlan = this.formBuilder.group({
      planControl: ['', Validators.required],
    });
  }
}