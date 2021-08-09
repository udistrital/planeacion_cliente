import { Component, Inject, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { AgregarDialogComponent } from './agregar-dialog/agregar-dialog.component'
import { EditarDialogComponent } from './editar-dialog/editar-dialog.component'
 
interface Plan {
  id: number;
  name: string;
}

export interface Subgrupo{
  id: number;
  nombre: string;
  descripcion: string;
  estado: boolean;
}

@Component({
  selector: 'app-construir-plan',
  templateUrl: './construir-plan.component.html',
  styleUrls: ['./construir-plan.component.scss']
})
export class ConstruirPlanComponent implements OnInit {
  
  formConstruirPlan: FormGroup;
  planId: number; // id plan
  nivel: number; // nivel objeto
  idPadre: number; // id padre del objeto
  nivelHijo: number; // nivel hijo objeto
  uid: number; // id objeto
  uid_n: number; // nuevo nivel

  id: number;
  nombre: string;
  descripcion: string;
  estado: boolean;

  planes: Plan[] = [
    {name: 'Proyecto Universitario Institucional', id: 1},
    {name: 'Plan Estratégico de Desarrollo', id: 2},
  ];

  @Output() eventChange = new EventEmitter();
  constructor(
    private formBuilder: FormBuilder,
    public dialog: MatDialog,
  ) { }

  openDialogAgregar(): void {
    const dialogRef = this.dialog.open(AgregarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: {nivel: this.uid_n}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      if (result == undefined){
        return undefined;
      } else {
        this.postData(result);
      }
      //console.log(JSON.stringify(this.sub));
    });
  }

  postData(res){
    let sub = {} as Subgrupo;
    sub.id = 1;
    sub.nombre = res.nombre;
    sub.descripcion = res.descripcion;
    sub.estado = res.estado;
    // OTROS PARA SUB 
    if (this.uid_n == 1){
      // (PADRE ES sub.padre = this.planId -- Editar padre)
      console.log('Post nivel 1')
    } else if (this.uid_n > 1){
      // (PADRE ES sub.padre = this.uid -- Editar padre)
      console.log('Post nivel '+this.uid_n)
    }
    // POST
    // RECARGAR
    this.eventChange.emit(true);
  };

  openDialogEditar(sub): void {
    const dialogRef = this.dialog.open(EditarDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: {nivel: this.uid_n, sub}
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      console.log(result);
      if (result == undefined){
        return undefined;
      } else {
        this.putData(result);
      }
      //console.log(JSON.stringify(this.sub));
    });
  }

  putData(res){
    console.log('Hace put');
    // PUT
    // RECARGAR
    this.eventChange.emit(true);
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required', )) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  async buildPlan() {
    
  }

  select(plan){
    this.planId = plan;
    console.log(this.planId)
  }

  receiveMessage(event){
    console.log(event)
    console.log('llego a construir')
    if (event.bandera == 'editar'){
      console.log('llego a editar ' + (event.fila.level + 1))
      this.uid_n = event.fila.level + 1;
      this.uid = event.fila.id; // id del nivel a editar
      // GET BY ID
      let sub = {} as Subgrupo;
      sub.id = 20000;
      sub.nombre = 'nombre consultado';
      sub.descripcion = 'descripcion consultada';
      sub.estado = false; // boolean consultado ¿String?
      this.openDialogEditar(sub);
    } else if (event.bandera == 'agregar'){
      console.log('llego a agregar ' + (event.fila.level + 2))
      this.uid_n = event.fila.level + 2; // el nuevo nivel
      this.uid = event.fila.id; // será el padre del nuevo nivel
      this.openDialogAgregar();
    }
  }

  agregarSub(niv: number){
    this.uid_n = niv;
    console.log("llega a agregar 1")
    this.openDialogAgregar()
  }

  ngOnInit(): void {
    this.formConstruirPlan = this.formBuilder.group({
      planControl: ['', Validators.required],
    });
  }

}

// @Component({
//   selector: 'agregar-dialog',
//   templateUrl: './agregar-dialog.html',
// })
// export class AgregarDialog {

//   constructor(
//     public dialogRef: MatDialogRef<AgregarDialog>,
//     @Inject(MAT_DIALOG_DATA) public data: Subgrupo) {}

//   onNoClick(): void {
//     this.dialogRef.close();
//   }

// }