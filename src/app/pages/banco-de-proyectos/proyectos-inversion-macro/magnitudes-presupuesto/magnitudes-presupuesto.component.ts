import { Component, OnInit } from '@angular/core';
import {FormBuilder, Validators} from '@angular/forms';

export interface Tile {
  color: string;
  fuente: string;
  border: string
  cols: number;
  rows: number;
  text: string;
}

@Component({
  selector: 'app-magnitudes-presupuesto',
  templateUrl: './magnitudes-presupuesto.component.html',
  styleUrls: ['./magnitudes-presupuesto.component.scss']
})
export class MagnitudesPresupuestoComponent implements OnInit {
  firstFormGroup = this._formBuilder.group({
    firstCtrl: ['', Validators.required],
  });
  secondFormGroup = this._formBuilder.group({
    secondCtrl: ['', Validators.required],
  });
  isLinear = false;
  // tiles: Tile[] = [
  //   {text: 'Año 1', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: 'Año 2', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: 'Año 3', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: 'Año 4', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: 'Año 5', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: 'Formulación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Programación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Formulación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Programación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Formulación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Programación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Formulación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Programación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Formulación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Programación', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: '', cols: 1, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},
  //   {text: 'Total', cols: 2, rows: 1, color: 'rgb(145, 35, 35)', fuente: 'white', border: '1px solid white;'},
  //   {text: '$', cols: 2, rows: 1, color: 'white', fuente: 'rgb(145, 35, 35)', border: '1px solid rgb(145, 35, 35);'},

  // ];

  constructor(private _formBuilder: FormBuilder) { }

  ngOnInit(): void {
  }

  guardar() {
    console.log("funciones por hacer");
  }

}
