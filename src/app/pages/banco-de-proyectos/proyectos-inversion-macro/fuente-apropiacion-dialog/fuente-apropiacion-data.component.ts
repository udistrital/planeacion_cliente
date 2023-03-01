import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AgregarFuenteDialogComponent } from '../agregar-fuente-dialog/agregar-fuente-dialog.component';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { VisualizarSoportesDialogComponent } from '../visualizar-soportes-dialog/visualizar-soportes-dialog.component';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';
import { FormControl } from '@angular/forms';
import { AgregarMetaDialogComponent } from '../agregar-meta-dialog/agregar-meta-dialog.component';

export interface Fuentes {
  _id: string;
  posicion: string;
  nombre: string;
  presupuesto: number;
  presupuestoDisponible: number;
  presupuestoProyecto: number;
  iconSelected: string;
}

export interface Soportes {
  posicion: number;
  nombre: string;
}

export interface Metas {
  posicion: string;
  descripcion: string;
  id: string;
}

@Component({
  selector: 'app-fuente-apropiacion-data',
  templateUrl: './fuente-apropiacion-data.component.html',
  styleUrls: ['./fuente-apropiacion-data.component.scss']
})
export class FuenteApropiacionDataComponent implements OnInit {
  displayedColumns: string[] = ['index', 'nombre', 'presupuesto'];
  displayedColumnSoportes: string[] = ['index', 'nombre', 'actions'];
  displayedColumnsMetas: string[] = ['index', 'descripcion', 'actions'];
  dataSource = new MatTableDataSource<Fuentes>();
  dataSourceSoportes = new MatTableDataSource<Soportes>();
  dataSourceMetas = new MatTableDataSource<Metas>();
  totalPresupuesto: any;
  dataFuentes = [];
  dataSoportes = [];
  id: string;
  idSoportes: string;
  selectFuente = new FormControl();
  selectedFuentes: any[] = [];
  soportes: any[] = [];
  fuentes: Fuentes;
  metas: any[] = [];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatTable) myTable!: MatTable<Fuentes>;

  constructor(
    public dialog: MatDialog,
    private router: Router,
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
    private gestorDocumental: GestorDocumentalService,
  ) {
    activatedRoute.params.subscribe(prm => {
      this.id = prm['id'];
    });
    this.getFuentesApropiacion();
    this.getDataProyect();
  }
  public dataFuentesApropiacion: Array<any> = [];

  ngOnInit(): void {

  }

  async revisarDocumento(row) {
    if (row.file != undefined) {
      let header = "data:application/pdf;base64,";
      const dialogRef = this.dialog.open(VisualizarSoportesDialogComponent, {
        width: '1200',
        minHeight: 'calc(100vh - 90px)',
        height: '80%',
        data: { "url": header + row.file }
      });
    } else {
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })

      await this.gestorDocumental.get([row]).subscribe(
        (documentos) => {
          Swal.close();
          const dialogRef = this.dialog.open(VisualizarSoportesDialogComponent, {
            width: '1200px',
            minHeight: 'calc(100vh - 90px)',
            height: '800px',
            data: { ...documentos[0] }
          });

          dialogRef.afterClosed().subscribe(result => {
            if (result == undefined) {
              return undefined;
            } else {
              for (let index = 0; index < this.dataSource.data.length; index++) {
                if (this.dataSource.data[index]["Id"] == result["Id"]) {
                  this.dataSource.data[index]["Observacion"] = result["Observacion"];
                };
              };
            };
          });
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se pudo cargar el documento ${JSON.stringify(error)}`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          });
        })
      Swal.close();
    }
  }

  getFuentesApropiacion() {
    this.request.get(environment.PLANES_CRUD, 'fuentes-apropiacion').subscribe((data: any) => {
      if (data) {
        if (data.Data.length != 0) {
          for (let i = 0; i < data.Data.length; i++) {
            if (data.Data[i].activo == true) {
              data.Data[i]["presupuestoProyecto"] = "";
              this.dataFuentes.push(data.Data[i]);
            }
          }
          for (let i = 0; i < this.dataFuentes.length; i++) {
            this.dataFuentes[i].posicion = i + 1;
          }
          this.getTotalPresupuesto();
        }
      }
    })
  }

  getTotalPresupuesto() {
    return this.totalPresupuesto = this.dataFuentes.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);

  }

  searchMeta(meta): void {
    const dialogRef = this.dialog.open(AgregarMetaDialogComponent, {
      width: 'calc(80vw - 60px)',
      maxHeight: 'calc(100vh - 90px)',
      data: { estado: "revision", meta: meta }
    });
  }

  regresar() {
    this.router.navigate(['pages/proyectos-macro/proyectos-de-inversion-vigentes']);
  }

  getTotalPresupuestoProyecto() {
    return this.dataSource.data.map(t => t.presupuestoProyecto).reduce((acc, value) => acc + value, 0);
  }

  getDataProyect() {
    this.request.get(environment.PLANES_MID, 'inversion/proyecto/' + this.id).subscribe((data: any) => {
      if (data) {
        var fuentes = data["Data"]["fuentes"];
        var fuentesTabla = []
        for (let i = 0; i < fuentes.length; i++) {
          const fuenteGEt = fuentes[i];
          for (let index = 0; index < this.dataFuentes.length; index++) {
            if (this.dataFuentes[index]["_id"] == fuenteGEt["id"]) {
              this.selectedFuentes.push(this.dataFuentes[index]);
              fuentesTabla.push(this.dataFuentes[index]);
              fuentesTabla[fuentesTabla.length - 1]["presupuestoProyecto"] = fuenteGEt["presupuestoProyecto"];
              break
            }
          }
        }

        this.selectFuente = new FormControl(this.selectedFuentes)
        this.dataSource = new MatTableDataSource<Fuentes>(fuentesTabla);

        this.soportes = data["Data"]["soportes"];
        this.dataSourceSoportes = new MatTableDataSource<Soportes>(this.soportes);

        this.metas = data["Data"]["metas"]
        this.dataSourceMetas = new MatTableDataSource<Metas>(this.metas);
      }
    })
  }
}
