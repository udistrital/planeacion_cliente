import { Component, OnInit, ViewChild } from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AgregarMetaDialogComponent } from '../agregar-meta-dialog/agregar-meta-dialog.component';
import { CargarSoportesDialogComponent } from '../cargar-soportes-dialog/cargar-soportes-dialog.component';
import { Documento } from 'src/app/@core/models/documento';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import { EditarFuenteComponent } from '../editar-fuente/editar-fuente.component';
import Swal from 'sweetalert2';
import { EditarApropiacionFuenteDialogComponent } from '../editar-apropiacion-fuente-dialog/editar-apropiacion-fuente-dialog.component';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';
import { VisualizarSoportesDialogComponent } from '../visualizar-soportes-dialog/visualizar-soportes-dialog.component';

export interface Fuentes {
  Posicion: string;
  Nombre: string;
  Presupuesto: number;
  iconSelected: string;
}
// export class InputClearableExample {
//   value = 'Clear me';
// }

const INFO: Fuentes[] = [
  {Posicion: '1', Nombre: 'Ejemplo', Presupuesto: 20000, iconSelected: 'done'},
  
]

export interface Soportes {
  posicion: string;
  nombre: string;
  actions: string;  
  //iconSelected: string;
}

const SOPORTES: Soportes[] = [
  {posicion: '1', nombre: 'Ejemplo', actions: 'done'},  
]

export interface Metas {
  posicion: string;
  nombre: string;
  presupuesto: number;
  //iconSelected: string;
}

const METAS: Metas[] = [
  {posicion: '1', nombre: 'Ejemplo', presupuesto: 20000},  
]

@Component({
  selector: 'app-agregar-proyecto-vigente',
  templateUrl: './agregar-proyecto-vigente.component.html',
  styleUrls: ['./agregar-proyecto-vigente.component.scss']
})



export class AgregarProyectoVigenteComponent implements OnInit {
 
  displayedColumns: string[] = ['index','nombre', 'presupuesto', 'actions'];
  documentos: any[] = [];
  renderDocs: any[] = [];
  dataFuentes = [];
  dataSource = new MatTableDataSource<Fuentes>(INFO);
  displayedColumnSoportes: string[] = ['index', 'nombre', 'actions'];  
  dataSourceSoportes = new MatTableDataSource<Soportes>(SOPORTES);
  displayedColumnsMetas: string[] = ['index','nombre', 'presupuesto', 'actions'];
  dataSourceMetas = new MatTableDataSource<Metas>(METAS);
  fuentes = INFO;
  metasPresupuesto = METAS; 
  soportes: any[] = [];
  dataApropiacion: any[] = []
  metas: any[] = [];  
  docs: any;
  dataNewProyect: object = {};
  indice: number;
  posicionFuente: number;
  formProyect: FormGroup;
  
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(CargarSoportesDialogComponent) child: any;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private gestorDocumental: GestorDocumentalService,
    //private dialogRef: MatDialogRef<EvidenciasDialogComponent>,
  ) { }

  ngOnInit(): void {
    this.formProyect = this.formBuilder.group({
      name: ['',],
      codigo: ['',]
    });
    this.getFuentesApropiacion()
  }

  cancelar() {
    this.router.navigate(['pages/proyectos-macro/proyectos-de-inversion-vigentes']);
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  loadSoportes(): void {
    const dialogRef = this.dialog.open(CargarSoportesDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: { name: this.documentos },
    });
    dialogRef.afterClosed().subscribe(result => {      
      this.docs = result;
      result[0].posicion = this.soportes.length + 1;
      this.soportes.push(result[0]); 
      this.dataSourceSoportes = new MatTableDataSource<Soportes>(this.soportes);
      //this.readSoportes();      
    });
  }

  apropiacionFuentesEdit(row): void {
    this.posicionFuente = row.posicion;
    let aux = row.nombre;
        const isElementFind = (element) => element.nombre == aux;
        this.indice = this.dataFuentes.findIndex(isElementFind);
    const dialogRef = this.dialog.open(EditarApropiacionFuenteDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      data: {row}      
    });

    dialogRef.afterClosed().subscribe(result => {  
      this.dataFuentes[this.indice].posicion = this.posicionFuente; 
      this.dataFuentes[this.indice].presupuesto = parseInt(result.valor);
      this.dataFuentes[this.indice].nombre = result.nombre;
      this.dataSource = new MatTableDataSource<Fuentes>(this.dataFuentes);
      this.getTotalPresupuestoMetas()     
    });
  }

  getFuentesApropiacion() {
    this.request.get(environment.PLANES_CRUD, 'fuentes-apropiacion').subscribe((data: any) => {
      if(data) {
        if (data.Data.length != 0) {         
          for(let i = 0; i < data.Data.length; i++) { 
            if( data.Data[i].activo == true ) {  
              this.dataFuentes.push(data.Data[i]);
            }
          }
          for(let i = 0; i < this.dataFuentes.length; i++) {
            this.dataFuentes[i].posicion = i + 1;
          }
          this.dataSource = new MatTableDataSource<Fuentes>(this.dataFuentes);
          this.getTotalPresupuesto();
        }
      }
    })
  }
  getTotalPresupuesto() {    
    return this.dataFuentes.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);
  }

  async revisarDocumento(row) {    
      if (row.file != undefined) {
        let header = "data:application/pdf;base64,";
        const dialogRef = this.dialog.open(VisualizarSoportesDialogComponent, {
          width: '1200',
          minHeight: 'calc(100vh - 90px)',
          height: '80%',
          data: { "url": header + row.file}
        });
      } else {
        Swal.fire({
          title: 'Cargando información',
          timerProgressBar: true,
          showConfirmButton: false,
          willOpen: () => {
            Swal.showLoading();
          },
        })
  
        await this.gestorDocumental.get([row]).subscribe(
          (documentos) => {
            Swal.close();
            const dialogRef = this.dialog.open(VisualizarSoportesDialogComponent, {
              width: '1200px',
              minHeight: 'calc(100vh - 90px)',
              height: '800px',
              data: { ...documentos[0] }
            });
  
            dialogRef.afterClosed().subscribe(result => {
              if (result == undefined) {
                return undefined;
              } else {
                for (let index = 0; index < this.dataSource.data.length; index++) {
                  if (this.dataSource.data[index]["Id"] == result["Id"]) {
                    this.dataSource.data[index]["Observacion"] = result["Observacion"];
                  };
                };
              };
            });
          }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              text: `No se pudo cargar el documento ${JSON.stringify(error)}`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            });
          })
        Swal.close();
      }    
  }
  
  postDataProyect() {    
    this.dataNewProyect["nombre_proyecto"] = this.formProyect.get('name').value//.toISOString();
    this.dataNewProyect["codigo_proyecto"] = this.formProyect.get('codigo').value//.toISOString();
    this.dataNewProyect["soportes"] = this.soportes;
    this.dataNewProyect["fuentes"] = this.dataFuentes;
    this.dataNewProyect["metas"] = this.metas;
    this.request.post(environment.PLANES_MID, 'inversion/addProyecto', this.dataNewProyect).subscribe((data: any) => {
      if (data) {
        Swal.fire({
          title: 'Proyecto Registrado con Exito',
          icon: 'success',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `Por favor intente de nuevo`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    }) 
    this.router.navigate(['pages/proyectos-macro/proyectos-de-inversion-vigentes']);  
  }  
  


  ngAfterViewInit() {
  }
  addMeta(): void {
    const dialogRef = this.dialog.open(AgregarMetaDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(40vw - 60px)',
      //data: { ban: 'plan', sub, subDetalle }
    });
    dialogRef.afterClosed().subscribe(result => { 
      result.posicion = this.metas.length + 1;      
      this.metas.push({nombre: result.nombre, presupuesto: parseInt(result.valor), posicion: result.posicion});
      this.dataSourceMetas = new MatTableDataSource<Metas>(this.metas);
      this.getTotalPresupuestoMetas();     
    });
  }
  inactivarSoporte(row) {
    Swal.fire({
      title: 'Inhabilitar Soporte',
      text: `¿Está seguro de inhabilitar el soporte?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {            
        let aux = row.nombre;
        const isElementFind = (element) => element.nombre == aux;
        let indice = this.soportes.findIndex(isElementFind);
        this.soportes.splice(indice, 1);
        for(let i = 0; i < this.soportes.length; i++) {
          this.soportes[i].posicion = i + 1;
        }    
        this.dataSourceSoportes = new MatTableDataSource<Soportes>(this.soportes);        
    })    
  }

  inactivarMeta(row) {
    Swal.fire({
      title: 'Inhabilitar Meta',
      text: `¿Está seguro de inhabilitar la meta?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {            
        let aux = row.nombre;
        const isElementFind = (element) => element.nombre == aux;
        let indice = this.metas.findIndex(isElementFind);
        this.metas.splice(indice, 1);
        for(let i = 0; i < this.metas.length; i++) {
          this.metas[i].posicion = i + 1;
        }    
        this.dataSourceMetas = new MatTableDataSource<Metas>(this.metas);        
    })    
  }
  
  getTotalPresupuestoMetas() {    
    return this.metas.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);
  }
}
