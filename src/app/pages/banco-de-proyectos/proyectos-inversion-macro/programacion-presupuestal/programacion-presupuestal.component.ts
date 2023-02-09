import { Component, OnInit } from '@angular/core';
import {FormControl} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

export interface Fuentes {
  index: number;
  fuente: string;
  valor: string;
  disponible: string;
  estimado: string;
}

const INFO: Fuentes[] = [
   {index: 1, fuente: 'Fuente 1', valor: '$ Valor que se extrae del valor de la apropiación', disponible: 'valor apropiación global- Valor estimado', estimado: '$ Valor que ingresa la unidad'},
   {index: 2, fuente: 'Fuente 2', valor: '$ Valor que se extrae del valor de la apropiación', disponible: 'valor apropiación global- Valor estimado', estimado: '$ Valor que ingresa la unidad'},
]

@Component({
  selector: 'app-programacion-presupuestal',
  templateUrl: './programacion-presupuestal.component.html',
  styleUrls: ['./programacion-presupuestal.component.scss']
})
export class ProgramacionPresupuestalComponent implements OnInit {
  displayedColumns: string[] = ['index','fuente', 'valor', 'disponible', 'estimado'];
  dataSource = new MatTableDataSource<Fuentes>(INFO);
  dataFuentes = [];
  fuente: any;
  totalPresupuesto: any;
  toppings = new FormControl('');
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  constructor() { }

  ngOnInit(): void {
  }
  getTotalPresupuesto() {    
    return this.totalPresupuesto = this.dataFuentes.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);
    
  }
  guardar() {
    console.log("funciones por hacer");
  }

}
