import { Component, OnInit } from '@angular/core';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import datosPrueba from 'src/assets/json/data-gestion-seg.json';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import {Location} from '@angular/common';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './gestion-seguimiento.component.html',
  styleUrls: ['./gestion-seguimiento.component.scss']
})
export class SeguimientoComponentGestion implements OnInit {
  displayedColumns: string[] = ['id', 'actividad', 'estado', 'fecha', 'gestion'];
  dataSource: MatTableDataSource<any>;
  gestionJson: any = datosPrueba;
  rol: string;

  constructor(
    private autenticationService: ImplicitAutenticationService,
    private _location: Location
  ) { }

  ngOnInit(): void {
    this.getRol();
  }

  getRol(){
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  backClicked() {
    this._location.back();
  }

  reportar(){
    window.location.href = '#/pages/seguimiento/reportar-periodo';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

}
