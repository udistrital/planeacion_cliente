import { Component, ElementRef, Input, OnInit, Output, ViewChild, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable, MatTableDataSource } from '@angular/material/table';
import Swal from 'sweetalert2';
import { isNumeric } from "rxjs/internal-compatibility";
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-contratistas',
  templateUrl: './contratistas.component.html',
  styleUrls: ['./contratistas.component.scss']
})
export class ContratistasComponent implements OnInit {

  displayedColumns: string[];
  columnsToDisplay: string[];
  dataSource: MatTableDataSource<any>;
  total: number;
  contratistas: any[];
  actividades: any[];
  perfiles : any[];
  accionBoton: string;
  tipoIdenti: string;
  selectedActividades;
  errorDataSource: boolean = false;
  contador: number = 0;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() dataSourceActividades: MatTableDataSource<any>;
  @Output() acciones = new EventEmitter<any>();
  constructor(private request: RequestManager){
    
    this.displayedColumns = ['descripcionNecesidad','perfil','cantidad','meses','dias','valorUnitario','valorTotal','actividades', 'acciones'];
    this.dataSource = new MatTableDataSource<any>();
  }

  

  ngOnInit(): void {
    this.loadPerfiles();
    this.actividades = this.dataSourceActividades.data;
    
  }

  loadPerfiles(){
    this.request.get(environment.PARAMETROS_SERVICE, `parametro?query=TipoParametroId:36`).subscribe((data: any) => {
      if(data){
        this.perfiles = data.Data
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

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  getValorTotal(){
    if (this.dataSource.data.length !== 0) {
      this.total = this.dataSource.data.map(t => t.valorTotal).reduce((acc, value) => parseFloat(acc) + parseFloat(value));
      if (this.total >> 0.00) {
        return this.total;
      } else {
        return '0';
      }
    } else {
      return '0';
    }
  }

  getTotal(element, rowIndex): number{
    let valor  = parseFloat(((element.valorUnitario * element.meses + (element.dias*(element.valorUnitario/30)))*element.cantidad).toFixed(2))
    this.dataSource.data[rowIndex].valorTotal = valor;
    return valor
  }
  
  addContratista(){
    this.dataSource.data.unshift({
        descripcionNecesidad: '',
        perfil: '',
        cantidad: 0,
        meses: 0,
        dias: 0,
        valorUnitario: 0,
        valorTotal: 0,
        actividades: ''
        });
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  deleteContratista(index){
    Swal.fire({
      title: 'Eliminar Contratista',
      text: `¿Está seguro de eliminar este contratista?`,
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
    //console.log(event)
  }

  onSelected(event, rowIndex) {
    if (event.value == undefined){
      this.dataSource.data[rowIndex].valorUnitario = '';
    } else {
      this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=ParametroId:`+event.value).subscribe((data: any) => {
        if(data){
          let elemento = data.Data
          let valor = JSON.parse(elemento[0].Valor);
          this.dataSource.data[rowIndex].valorUnitario = valor.ValorMensual;
        }
      })

    }
  }

  ocultarContratistas(){
    this.accionBoton = 'ocultar';
    this.tipoIdenti = 'contratistas'
    let data = this.dataSource.data;
    let accion = this.accionBoton;
    let identi = this.tipoIdenti;
    this.acciones.emit({data, accion, identi});
  }

  guardarContratistas(){
    this.accionBoton = 'guardar';
    this.tipoIdenti = 'contratistas'
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
      this.acciones.emit({dataS, accion, identi});
    }
  }

  submit(data) {
    
  }

  validarDataSource(data){
    this.contador = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i].descripcionNecesidad == '' || data[i].perfil == '' || data[i].cantidad == null || data[i].meses == null || data[i].dias == null
      || data[i].valorUnitario == null || data[i].valorTotal == null || data[i].actividades == "" || data[i].actividades == null){
        this.contador++;
      } 
      if (this.contador > 0) {
        this.errorDataSource = true; 
      }
      else {
        this.errorDataSource = false;
      }
    }
  }
}
