import { Component, OnInit } from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

export interface Fuentes {
  index: number;
  fuente: string;
  valor: string;
  disponible: string;
  estimado: number;
}

const INFO: Fuentes[] = [
   {index: 1, fuente: 'Fuente 1', valor: '$ Valor que se extrae del valor de la apropiación', disponible: 'valor apropiación global- Valor estimado', estimado: 0},
   {index: 2, fuente: 'Fuente 2', valor: '$ Valor que se extrae del valor de la apropiación', disponible: 'valor apropiación global- Valor estimado', estimado: 0},
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
  valor: number;
  toppingList: string[] = ['Extra cheese', 'Mushroom', 'Onion', 'Pepperoni', 'Sausage', 'Tomato'];
  constructor() { }

  ngOnInit(): void {
    valor: [this.valor, Validators.required]
  }
  getTotalPresupuesto() {    
    return this.totalPresupuesto = this.dataFuentes.map(t => t.estimado).reduce((acc, value) => acc + value, 0);
    
  }
  guardar() {
    console.log("funciones por hacer");
  }

}
