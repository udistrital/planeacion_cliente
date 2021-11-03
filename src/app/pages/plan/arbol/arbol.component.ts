import { Component, Input, Output, EventEmitter, OnInit, ViewChild, AfterViewInit, OnChanges, ElementRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { FlatTreeControl } from '@angular/cdk/tree';
import {MatPaginator} from '@angular/material/paginator';
import {Observable} from 'rxjs'
import {MatSort} from '@angular/material/sort';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

interface Subgrupo {
  activo: string;
  nombre: string;
  descripcion: string;
  id: string;
  children?: Subgrupo[];
}

// Objeto fila

interface Nodo {
  expandable: boolean;
  activo: string;
  nombre: string;
  descripcion: string;
  id: string;
  level: number;
}

@Component({
  selector: 'app-arbol',
  templateUrl: './arbol.component.html',
  styleUrls: ['./arbol.component.scss'],
})
export class ArbolComponent implements OnInit {

  selectedFiles: any;
  dataRow: any;
  formConstruirPUI: FormGroup;
  displayedColumns: string[] = ['nombre', 'descripcion', 'activo', 'actions'];
  displayedColumnsView: string[] = ['nombre', 'descripcion', 'activo'];
  mostrar: boolean = false;
  planActual: string;
  icon : string
  idIcon : string

  private transformer = (node: Subgrupo, level: number) => {
    if (this.armonizacion){
      return {
        expandable: !!node.children && node.children.length > 0 && level < 2,
        activo: node.activo,
        nombre: node.nombre,
        descripcion: node.descripcion,
        id: node.id,
        level: level,
        icon: this.iconArmonizacion(node.id)
      };
    }else{
      return {
        expandable: !!node.children && node.children.length > 0,
        activo: node.activo,
        nombre: node.nombre,
        descripcion: node.descripcion,
        id: node.id,
        level: level,
      };
    }

  };

  treeControl = new FlatTreeControl<Nodo>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() tipoPlanId: string;
  @Input() idPlan: string;
  @Input() consulta: boolean;
  @Input() armonizacion: boolean;
  @Input() dataArmonizacion : any [];
  @Input() updateSignal: Observable<String[]>;
  @Output() grupo = new EventEmitter<any>();
  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
  ) {}

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required', )) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  ngOnChanges(changes){
    if (this.tipoPlanId !== '611af8464a34b3599e3799a2'){
      if (this.idPlan !== this.planActual){
        this.loadArbolMid();
        this.planActual = this.idPlan;
      }
    }
    if (changes['updateSignal'] && this.updateSignal){
      this.updateSignal.subscribe(() => {
        this.loadArbolMid();
      });
    }
  }

  loadArbolMid(){
    this.mostrar = false;
    this.request.get(environment.PLANES_MID, `arbol/`+this.idPlan).subscribe((data: any) => {
      this.mostrar = true;
      if (data !== null){
        this.dataSource.data = data;
      } else {
        this.mostrar = false;
        this.dataSource.data = [];
      }
      if (this.armonizacion){
        this.expandNodes()
      }
    }
    ,(error) => {
      Swal.fire({
        title: 'Error en la operación', 
        text: 'No se encontraron datos registrados',
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    }
    )
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles.length == 0){
      return this.selectedFiles = false;
    }
  }


  editar(fila, bandera){
    this.grupo.emit({fila, bandera})
  }

  agregar(fila, bandera){
    this.grupo.emit({fila, bandera})
  }

  armonizar(fila, bandera){
    this.changeIcon(fila)
    this.grupo.emit({fila, bandera})
  }

  iconArmonizacion(id):string{
    if(this.dataArmonizacion.length != 0){
      const found = this.dataArmonizacion.find(element => element === id);
      if(id === found){
        return 'done'
      }else{
        return 'compare_arrows'
      }      
    }else{
      return 'compare_arrows'
    }
  }

  changeIcon(fila){
    if (!fila.expandable){
      if (fila.icon == 'compare_arrows'){
        fila.icon = 'done'
      }else{
        fila.icon = 'compare_arrows'
      }
    }
  }

  expandNodes(){
    for (let nodo of this.dataArmonizacion){
      let found = this.treeControl.dataNodes.find(element => element.id == nodo)
      let index = this.treeControl.dataNodes.indexOf(found)
      this.treeControl.expand(this.treeControl.dataNodes[index-2])
      this.treeControl.expand(this.treeControl.dataNodes[index-1])
      this.treeControl.expand(this.treeControl.dataNodes[index])
    }
  }

  hasChild = (_: number, node: Nodo) => node.expandable;

  ngOnInit(): void {

    this.formConstruirPUI = this.formBuilder.group({
      infoControl: ['', Validators.required],
      requiredfile: ['', Validators.required]
    });
    
    this.planActual = '';
  }
}
