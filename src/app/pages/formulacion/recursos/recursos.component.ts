import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import Swal from 'sweetalert2';
import { isNumeric } from 'rxjs/internal-compatibility';
import { FormArray, FormBuilder, FormGroup, NgForm, FormControl, Validators, AbstractControl } from '@angular/forms';
import { Console } from 'console';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-recursos',
  templateUrl: './recursos.component.html',
  styleUrls: ['./recursos.component.scss']
})
export class RecursosComponent implements OnInit {

  displayedColumns: string[];
  columnsToDisplay: string[];
  dataSource: MatTableDataSource<any>;
  total: number;
  actividades: any[];
  accionBoton: string;
  selectedActividades;
  tipoIdenti: string;
  errorDataSource: boolean = false;
  contador: number = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() dataSourceActividades: MatTableDataSource<any>;
  @Input() dataTabla: boolean;
  @Input() plan: string;
  @Output() acciones = new EventEmitter<any>();
  constructor(private request: RequestManager,) {
    this.displayedColumns = ['codigo','nombre','valor','descripcion', 'actividades', 'acciones']
    this.dataSource = new MatTableDataSource<any>();
  }

  rubros: any [] = [
    {
      id: '1',
      codigo: '3-01-001-01-01-01-0010-029',
      nombre: 'Prima de Navidad Docentes'
    },
    {
      id: '2',
      codigo: '3-01-001-01-01-02-0002-01',
      nombre: 'Prima Técnica Administrativos'
    },
    {
      id: '3',
      codigo: '3-01-001-01-02-01-0002-025',
      nombre: 'Pensiones Privadas Docentes'
    }
  ]

  ngOnInit(): void {
    this.actividades = this.dataSourceActividades.data;
    this.loadTabla();
  }

  loadTabla(){
    if (this.dataTabla){
      this.request.get(environment.PLANES_MID, `formulacion/get_all_identificacion/`+this.plan+`/617b6630f6fc97b776279afa`).subscribe((dataG: any) => {
        if (dataG.Data != null){
          this.dataSource.data = dataG.Data
        }
      })
    }
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getValorTotal(){
    if (this.dataSource.data.length !== 0) {
      this.total = this.dataSource.data.map(t => t.valor).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
      if (this.total >> 0.00) {
        return this.total;
      } else {
        return '0';
      }
    } else {
      return '0';
    }
  }

  addElement(){
    this.dataSource.data.unshift({
        codigo: '',
        nombre: '',
        valor: 0,
        descripcion: '',
        actividades: ''
        });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  deleteElement(index){
    Swal.fire({
      title: 'Eliminar recurso',
      text: `¿Está seguro de eliminar este recurso?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
        if (result.isConfirmed) {
          this._deleteElemento(index);
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          Swal.fire({
            title: 'Cambio cancelado', 
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          })
        }
    });
  }

  private _deleteElemento(index) {
    const indices = isNumeric(index) ? [index] : (Array.isArray(index) ? index : undefined);
    if (indices) {
      const data = this.dataSource.data;
      indices.sort((a, b) => b - a);
      for (let i = 0; i < indices.length; i++) {
        data.splice((this.paginator.pageIndex * this.paginator.pageSize) + indices[i], 1);
      }
      this.dataSource.data = data;
    }
  }

  onChange(event) {
    
  }

  onSelected(event, rowIndex) {
    if (event == undefined){
      this.dataSource.data[rowIndex].codigo = '';
    } else {
      let elemento = this.rubros.find(el => el.nombre === event.value); 
      this.dataSource.data[rowIndex].codigo = elemento.codigo;
    }
  }

  ocultarRecursos(){
    this.accionBoton = 'ocultar';
    this.tipoIdenti = 'recursos';
    let data = this.dataSource.data;
    let accion = this.accionBoton;
    let identi = this.tipoIdenti;
    this.acciones.emit({data, accion, identi});
  }

  guardarRecursos(){
    this.accionBoton = 'guardar';
    this.tipoIdenti = 'recursos';
    let data = this.dataSource.data;
    this.validarDataSource(data);
    if (this.errorDataSource){
      Swal.fire({
        title: 'Tiene datos sin completar. Por favor verifique', 
        icon: 'error',
        showConfirmButton: false,
        timer: 3500
      })
    } else if (!this.errorDataSource) {
      let accion = this.accionBoton;
      let identi = this.tipoIdenti;
      for (var i in data){
        var obj = data[i];
        obj["activo"] = true;
        var num = +i+1;
        obj["index"] = num.toString();
      }
      let dataS = JSON.stringify(Object.assign({}, data))
      this.request.put(environment.PLANES_MID, `formulacion/guardar_identificacion`, dataS, this.plan+`/617b6630f6fc97b776279afa`).subscribe((data: any) => {
        if (data){
          Swal.fire({
            title: 'Guardado exitoso', 
            icon: 'success',
            showConfirmButton: false,
            timer: 3500
          })
          this.acciones.emit({dataS, accion, identi});
        }
      })
    }
  }

  submit(data) {
    
  }
  
  validarDataSource(data){
    this.contador = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].codigo == '' || data[i].nombre == '' || data[i].valor == null || data[i].descripcion == '' || data[i].actividades == "" 
      || data[i].actividades == null){
        this.contador++;
      }
    }
    if (this.contador > 0){
      this.errorDataSource = true;
    }
    else {
      this.errorDataSource = false;
    }
  }
}
