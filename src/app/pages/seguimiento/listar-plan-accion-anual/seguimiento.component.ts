import { Component, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

import datosTest from 'src/assets/json/data.json';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';

@Component({
  selector: 'app-seguimiento',
  templateUrl: './seguimiento.component.html',
  styleUrls: ['./seguimiento.component.scss']
})
export class SeguimientoComponentList implements OnInit {
  displayedColumns: string[] = ['unidad', 'estado', 'vigencia', 'periodo', 'seguimiento', 'observaciones', 'enviar'];
  displayedColumnsPL: string[] = ['unidad', 'estado', 'vigencia', 'periodo', 'seguimiento'];
  dataSource: MatTableDataSource<any>;
  planes: any[];
  unidades: any[];
  unidadSelected: boolean;
  unidad: any;
  vigencias : any[];
  vigenciaSelected : boolean;
  vigencia: any;
  testDatos: any = datosTest;
  rol: string;
  periodoHabilitado : boolean;

  constructor(
    public dialog: MatDialog,
    private request: RequestManager,
    private router: Router,
    private autenticationService: ImplicitAutenticationService
  ) {
    this.unidadSelected = false;
    this.getRol();
    if(this.rol != undefined && this.rol=='PLANEACION'){
      this.loadPeriodos();
    }else if(this.rol != undefined && this.rol=='JEFE_DEPENDENCIA'){
      this.loadUnidades();
    }
    this.dataSource = new MatTableDataSource<any>();
  }

  ngOnInit(): void {
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  gestion() {
    window.location.href = '#/pages/seguimiento/gestion-seguimiento';
  }

  traerDatos() {
    //console.log('si entra en traer datos');
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadUnidades() {
    this.request.get(environment.PLANES_MID, `formulacion/get_unidades`).subscribe((data: any) => {
      if (data) {
        this.unidades = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  loadPeriodos() {
    this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG`).subscribe((data: any) => {
      if (data) {
        this.vigencias = data.Data;
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  onChangeU(unidad) {
    if (unidad == undefined) {
      this.unidadSelected = false;
      this.dataSource.data = [];
    } else {
      this.unidadSelected = true;
      this.unidad = unidad;
      this.dataSource.data = [];
      this.loadPlanes("unidad");
    }
  }

  onChangeV(vigencia) {
    if (vigencia == undefined) {
      this.vigenciaSelected = false;
    } else {
      this.vigenciaSelected = true;
      this.vigencia = vigencia;
      this.dataSource.data = [];
      this.loadPlanes("vigencia");
    }
  }


  loadPlanes(tipo) {
    if (tipo == "unidad"){
      this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,estado_plan_id:6153355601c7a2365b2fb2a1,dependencia_id:` + this.unidad.Id).subscribe((data: any) => {
        if (data) {
          if (data.Data.length != 0) {
            this.planes = data.Data;
            this.getUnidades();
            this.getEstados();
            this.getVigencias();
            this.getPeriodos();
            this.dataSource.data = this.planes;
          } else {
            this.unidadSelected = false;
            Swal.fire({
              title: 'No se encontraron planes',
              icon: 'error',
              text: `No se encontraron planes para realizar el seguimiento`,
              showConfirmButton: false,
              timer: 2500
            })
          }
  
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
  
      })
    }else if(tipo == 'vigencia'){
      this.request.get(environment.PLANES_CRUD, `plan?query=activo:true,estado_plan_id:6153355601c7a2365b2fb2a1,vigencia` + this.vigencia.Id).subscribe((data: any) => {
        if (data) {
          if (data.Data.length != 0) {
            this.planes = data.Data;
            this.getUnidades();
            this.getEstados();
            this.getVigencias();
            this.getPeriodos();
            this.dataSource.data = this.planes;
          } else {
            this.unidadSelected = false;
            Swal.fire({
              title: 'No se encontraron planes',
              icon: 'error',
              text: `No se encontraron planes para realizar el seguimiento`,
              showConfirmButton: false,
              timer: 2500
            })
          }
  
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
  
      })
    }

  }

  getUnidades() {
    for (let i = 0; i < this.planes.length; i++) {
      this.request.get(environment.OIKOS_SERVICE, `dependencia?query=Id:` + this.planes[i].dependencia_id).subscribe((data: any) => {
        if (data) {
          let unidad: any = data[0];
          this.planes[i].unidad = unidad.Nombre;
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })

      })
    }
  }

  getEstados() {
    for (let i = 0; i < this.planes.length; i++) {
      this.request.get(environment.PLANES_CRUD, `estado-plan?query=_id:` + this.planes[i].estado_plan_id).subscribe((data: any) => {
        if (data) {
          let estado: any = data.Data[0];
          this.planes[i].estado = estado.nombre;
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })

      })
    }
  }

  getVigencias() {
    for (let i = 0; i < this.planes.length; i++) {
      this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=Id:` + this.planes[i].vigencia).subscribe((data: any) => {
        if (data) {
          let vigencia: any = data.Data[0];
          this.planes[i].vigencia = vigencia.Nombre;
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })

      })
    }
  }

  getPeriodos() {
    for (let i = 0; i < this.planes.length; i++) {
      this.request.get(environment.PLANES_CRUD, `seguimiento?query=plan_id:` + this.planes[i]._id + `,activo:true`).subscribe((data: any) => {
        if (data) {
          if (data.Data.length != 0) {
            let seguimiento: any = data.Data[data.Data.length - 1];
            this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=Id:` + seguimiento.periodo_id).subscribe((data: any) => {
              if (data) {
                let aux = data.Data[0]
                this.planes[i].periodo = aux.ParametroId.Nombre;
                this.periodoHabilitado = true;
              }
            }, (error) => {
              Swal.fire({ 
                title: 'Error en la operación',
                text: 'No se encontraron datos registrados',
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              })
            })
          } else {
            this.periodoHabilitado = false;
            this.planes[i].periodo = "No disponible";
          }
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: 'No se encontraron datos registrados',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })

      })
    }
  }

  gestionSeguimiento(plan_id) {
    this.router.navigate(['pages/seguimiento/gestion-seguimiento/' + plan_id])
  }


}
