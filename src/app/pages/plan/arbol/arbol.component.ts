import { Component, Input, Output, EventEmitter, OnInit, ViewChild, AfterViewInit, OnChanges } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup,FormControl,Validators, AbstractControl } from '@angular/forms';
import { FlatTreeControl } from '@angular/cdk/tree';
import {MatPaginator} from '@angular/material/paginator';
import {Observable} from 'rxjs'
import {MatSort} from '@angular/material/sort';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';

interface Subgrupo {
  id: number;
  nombre: string;
  descripcion: string;
  hijos?: Subgrupo[];
}

interface Subgrupo2 {
  nombre: string;
  descripcion: string;
  children?: Subgrupo2[];
}

interface SubgrupoArbol {
  id: number;
  nombre: string;
  descripcion: string;
}

const TREE_DATA_V: Subgrupo2[] = [
  {
    "children": [
      {
        "children": [
          {
            "descripcion": "descripcion indicador 1",
            "nombre": "Indicador 1"
          },
          {
            "descripcion": "descripcion indicador 2",
            "nombre": "Indicador 2"
          }
        ],
        "descripcion": "descripcion meta 1",
        "nombre": "Meta 1"
      },
      {
        "descripcion": "descripcion meta 2",
        "nombre": "Meta 2"
      }
    ],
    "descripcion": "Lineamiento estrategico 1 actualizado",
    "nombre": "Lineamiento 1"
  },
  {
    "descripcion": "descripcion linemiento 2",
    "nombre": "Lineamiento 2"
  }
]

const TREE_DATA: Subgrupo[] = [
  {
    id: 1,
    nombre: 'N1',
    hijos: [
      { id: 11, nombre: 'N11', descripcion: 'D11' },
      { id: 12, nombre: 'N12', descripcion: 'D12' },
      { id: 13, nombre: 'N13', descripcion: 'D13' },
      { id: 14, nombre: 'N14', descripcion: 'D14', hijos: [{ id: 141, nombre: 'N141', descripcion: 'D141'}]}
    ],
    descripcion: 'D1'
  },
  {
    id: 2,
    nombre: 'N2',
    hijos: [
      {
        id: 21,
        nombre: 'N21',
        hijos: [
          { id: 211, nombre: 'N211', descripcion: 'D211' },
          { id: 212, nombre: 'N212', descripcion: 'D212' }
        ], descripcion: 'D21',
      },
      {
        id: 22,
        nombre: 'N22',
        hijos: [
          { id: 221, nombre: 'N221', descripcion: 'D221' },
          { id: 222, nombre: 'N222', descripcion: 'D222' }
        ], descripcion: 'D22',
      }
    ],
    descripcion: 'D2'
  }
];

const TREE_DATA_: Subgrupo[] = [
  {
    id: 1,
    nombre: 'N1',
    hijos: [
      { id: 11, nombre: 'N11', descripcion: 'D11' },
      { id: 12, nombre: 'N12', descripcion: 'D12' },
      { id: 13, nombre: 'N13', descripcion: 'D13' },
      { id: 14, nombre: 'N14', descripcion: 'D14', hijos: [{ id: 141, nombre: 'N141', descripcion: 'D141'}]}
    ],
    descripcion: 'D1'
  },
  {
    id: 2,
    nombre: 'N2',
    hijos: [
      {
        id: 21,
        nombre: 'N21',
        hijos: [
          { id: 211, nombre: 'N211', descripcion: 'D211' },
          { id: 212, nombre: 'N212', descripcion: 'D212' }
        ], descripcion: 'D21',
      },
      {
        id: 22,
        nombre: 'N22',
        hijos: [
          { id: 221, nombre: 'N221', descripcion: 'D221' },
          { id: 222, nombre: 'N222', descripcion: 'D222' }
        ], descripcion: 'D22',
      }
    ],
    descripcion: 'D2'
  },
  {
    id: 3,
    nombre: 'N3',
    descripcion: 'D3'
  }
];

// Objeto fila
interface Nodo {
  expandable: boolean;
  id: number;
  nombre: string;
  descripcion: string;
  level: number;
}

interface Nodo2 {
  expandable: boolean;
  nombre: string;
  descripcion: string;
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
  displayedColumns: string[] = ['nombre', 'descripcion', 'id', 'actions'];
  mostrar: boolean = false;

  private transformer = (node: Subgrupo, level: number) => {
    return {
      expandable: !!node.hijos && node.hijos.length > 0,
      id: node.id,
      nombre: node.nombre,
      descripcion: node.descripcion,
      level: level
    };
  };

  private transformer2 = (node: Subgrupo2, level: number) => {
    return {
      expandable: !!node.children && node.children.length > 0,
      nombre: node.nombre,
      descripcion: node.descripcion,
      level: level
    };
  };

  treeControl = new FlatTreeControl<Nodo>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.hijos
  );

  treeFlattener2 = new MatTreeFlattener(
    this.transformer2,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);
  dataSource2 = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener2);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() planId: string;
  @Input() updateSignal: Observable<String[]>;
  @Output() grupo = new EventEmitter<any>();
  constructor(
    private formBuilder: FormBuilder
  ) {
    this.loadArbol();
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required', )) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  // getSelectedRow(selectedRow) {
  //   this.grupo.emit(selectedRow);
  // }

  ngOnChanges(changes){
    if (changes['updateSignal'] && this.updateSignal){
      this.updateSignal.subscribe(() => {
        this.loadArbol2();
      })
    }
  }

  ngOnInit(): void {
    this.formConstruirPUI = this.formBuilder.group({
      infoControl: ['', Validators.required],
      requiredfile: ['', Validators.required]
    });
  }

  loadArbol(){
    // GET ARBOL CATALOGO
    this.mostrar = true;
    //this.dataSource.data = TREE_DATA;
    this.dataSource2.data = TREE_DATA_V;
  }

  loadArbol2(){
    // GET ARBOL CATALOGO
    this.mostrar = true;
    this.dataSource.data = TREE_DATA_;
  }

  // ngAfterViewInit() {
  //   this.dataSource.filter = this.paginator;
  //   this.dataSource.sort = this.sort;
  // }

  selectFile(event) {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles.length == 0){
      return this.selectedFiles = false;
    }
    console.log(this.selectedFiles)
  }

  upload(file:any){
    console.log(file)
  }

  buildPUI(){

  }

  editar(fila, bandera){
    console.log('Está en editar')
    console.log(fila)
    this.grupo.emit({fila, bandera})
  }

  agregar(fila, bandera){
    console.log('Está en agregar')
    console.log(fila)
    this.grupo.emit({fila, bandera})
  }

  hasChild = (_: number, node: Nodo) => node.expandable;

  //  applyFilter(event: Event) {
  //    const filterValue = (event.target as HTMLInputElement).value;
  //    this.dataSource.filter = filterValue.trim().toLowerCase();
  //  }

}
