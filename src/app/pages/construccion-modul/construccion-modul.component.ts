import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-construccion-modul',
  templateUrl: './construccion-modul.component.html',
  styleUrls: ['./construccion-modul.component.scss']
})
export class ConstruccionModulComponent implements OnInit {

  @Input() nombreComponent: string;

  constructor() { }

  ngOnInit(): void {
  }

}
