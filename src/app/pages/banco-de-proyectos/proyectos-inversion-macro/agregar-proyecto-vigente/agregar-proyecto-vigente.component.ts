import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { AgregarMetaDialogComponent } from '../agregar-meta-dialog/agregar-meta-dialog.component';
import { CargarSoportesDialogComponent } from '../cargar-soportes-dialog/cargar-soportes-dialog.component';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';
import { VisualizarSoportesDialogComponent } from '../visualizar-soportes-dialog/visualizar-soportes-dialog.component';
import { CurrencyPipe } from '@angular/common';

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
  posicion: string;
  nombre: string;
  actions: string;
}

export interface Metas {
  posicion: string;
  descripcion: string;
  id: string;
}

@Component({
  selector: 'app-agregar-proyecto-vigente',
  templateUrl: './agregar-proyecto-vigente.component.html',
  styleUrls: ['./agregar-proyecto-vigente.component.scss']
})

export class AgregarProyectoVigenteComponent implements OnInit {
  displayedColumnSoportes: string[] = ['index', 'nombre', 'actions'];
  displayedColumns: string[] = ['index', 'nombre', 'presupuestoGlobal', 'disponible', 'presupuesto'];
  displayedColumnsMetas: string[] = ['index', 'descripcion', 'actions'];
  documentos: any[] = [];
  renderDocs: any[] = [];
  dataFuentes = [];
  dataSource = new MatTableDataSource<Fuentes>();
  dataSourceSoportes = new MatTableDataSource<Soportes>();
  dataSourceMetas = new MatTableDataSource<Metas>();
  soportes: any[] = [];
  fuentes: Fuentes;
  metas: any[] = [];
  idMetas: string;
  idFuentes: string;
  idSoportes: string;
  docs: any;
  name: string = "";
  codigo: string = "";
  metasPresupuesto: Metas;
  dataApropiacion: any[] = []
  dataNewProyect: object = {};
  indice: number;
  posicionFuente: number;
  formProyect: FormGroup;
  totalPresupuestoTemp: number = 0;
  id: string;
  selectedFuentes: any[] = [];
  editar: boolean = false;
  selectFuente = new FormControl();

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(CargarSoportesDialogComponent) child: any;
  constructor(
    public dialog: MatDialog,
    private router: Router,
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private activatedRoute: ActivatedRoute,
    private currencyPipe: CurrencyPipe,
    private gestorDocumental: GestorDocumentalService,
  ) {
    activatedRoute.params.subscribe(prm => {
      this.id = prm['id'];
    });
  }

  ngOnInit(): void {
    this.formProyect = this.formBuilder.group({
      name: [this.name,],
      codigo: [this.codigo,]
    });
    this.getFuentesApropiacion();

    if (this.id != undefined) {
      this.getDataProyect();
      this.editar = true;
    }
  }

  cancelar() {
    this.router.navigate(['pages/proyectos-macro/proyectos-de-inversion-vigentes']);
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  loadSoportes(): void {
    const dialogRef = this.dialog.open(CargarSoportesDialogComponent, {
      width: 'calc(80vw - 60px)',
      height: 'calc(20vw - 60px)',
      data: { name: this.documentos },
    });
    dialogRef.afterClosed().subscribe(result => {
      this.docs = result;
      result[0].posicion = this.soportes.length + 1;
      this.soportes.push(result[0]);
      this.dataSourceSoportes = new MatTableDataSource<Soportes>(this.soportes);
    });
  }

  async revisarDocumento(row) {
    Swal.fire({
      title: 'Cargando Proyectos',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
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

  onChangeF(fuentes) {
    this.dataSource = new MatTableDataSource<Fuentes>(fuentes);
  }

  getTotalPresupuesto() {
    return this.dataSource.data.map(t => t.presupuesto).reduce((acc, value) => acc + value, 0);
  }

  getTotalPresupuestoDisponible() {
    return this.dataSource.data.map(t => t.presupuestoDisponible).reduce((acc, value) => acc + value, 0);
  }

  getTotalPresupuestoProyecto() {
    return this.dataSource.data.map(t => t.presupuestoProyecto).reduce((acc, value) => acc + value, 0);
  }

  blurPresupuesto(element, rowIndex) {
    if (String(element.target.value).includes("$")) {
      this.dataSource.data[rowIndex]["presupuestoProyecto"] = parseInt(element.target.value.replaceAll("$", "").replaceAll(",", "").replace(".00", ""));
    } else {
      if (element.target.value == "") {
        this.dataSource.data[rowIndex]["presupuestoProyecto"] = this.totalPresupuestoTemp;
        element.target.value = this.currencyPipe.transform(this.dataSource.data[rowIndex]["presupuestoProyecto"]);
        this.dataSource.data[rowIndex]["presupuestoDisponible"] -= this.dataSource.data[rowIndex]["presupuestoProyecto"];
      } else {
        this.dataSource.data[rowIndex]["presupuestoProyecto"] = parseInt(element.target.value.replaceAll(",", "").replace(".00", ""));
        this.dataSource.data[rowIndex]["presupuestoDisponible"] -= this.dataSource.data[rowIndex]["presupuestoProyecto"];
      }
    }
    this.getTotalPresupuestoProyecto();
  }

  focusPresupuesto(element, rowIndex) {
    this.totalPresupuestoTemp = this.dataSource.data[rowIndex]["presupuestoProyecto"].toString() == "" ? 0 : this.dataSource.data[rowIndex]["presupuestoProyecto"];
    this.dataSource.data[rowIndex]["presupuestoDisponible"] += this.totalPresupuestoTemp;
    element.target.value = "";
  }

  addMeta(): void {
    const dialogRef = this.dialog.open(AgregarMetaDialogComponent, {
      width: 'calc(80vw - 60px)',
      maxHeight: 'calc(100vh - 90px)',
      data: { estado: "agregar" }
    });
    dialogRef.afterClosed().subscribe(result => {
      result.posicion = this.metas.length + 1;
      this.metas.push(result);
      this.dataSourceMetas = new MatTableDataSource<Metas>(this.metas);
    });
  }

  searchMeta(meta): void {
    const dialogRef = this.dialog.open(AgregarMetaDialogComponent, {
      width: 'calc(80vw - 60px)',
      maxHeight: 'calc(100vh - 90px)',
      data: { estado: "consultar", meta: meta }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result.posicion == undefined) {
        result.posicion = this.metas.length + 1;
        this.metas.push(result);
      } else {
        this.metas[result.posicion - 1] = result;
      }
      this.dataSourceMetas = new MatTableDataSource<Metas>(this.metas);
    });
  }

  inactivarSoporte(row) {
    Swal.fire({
      title: 'Inactivar soporte',
      text: `¿Desea inactivar el soporte seleccionado?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      let aux = row.nombre;
      const isElementFind = (element) => element.nombre == aux;
      let indice = this.soportes.findIndex(isElementFind);
      this.soportes.splice(indice, 1);
      for (let i = 0; i < this.soportes.length; i++) {
        this.soportes[i].posicion = i + 1;
      }
      this.dataSourceSoportes = new MatTableDataSource<Soportes>(this.soportes);
    })
  }

  inactivarMeta(row) {
    Swal.fire({
      title: 'Inactivar Meta',
      text: `¿Deseas inactivar la meta seleccionada?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
    }).then((result) => {
      let aux = row.descripcion;
      const isElementFind = (element) => element.descripcion == aux;
      let indice = this.metas.findIndex(isElementFind);
      this.metas.splice(indice, 1);
      for (let i = 0; i < this.metas.length; i++) {
        this.metas[i].posicion = i + 1;
      }
      this.dataSourceMetas = new MatTableDataSource<Metas>(this.metas);
    })
  }

  getDataProyect() {
    this.request.get(environment.PLANES_MID, 'inversion/proyecto/' + this.id).subscribe((data: any) => {
      if (data) {
        this.formProyect.setValue({
          name: data["Data"]["nombre_proyecto"],
          codigo: data["Data"]["codigo_proyecto"],
        });

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

        this.idFuentes = data["Data"]["id_detalle_fuentes"]
        this.idMetas = data["Data"]["id_detalle_metas"]
        this.idSoportes = data["Data"]["id_detalle_soportes"]
      }
    })
  }

  postDataProyect() {
    Swal.fire({
      title: 'Cargando',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })

    this.dataNewProyect["nombre_proyecto"] = this.formProyect.get('name').value;
    this.dataNewProyect["codigo_proyecto"] = this.formProyect.get('codigo').value;
    this.dataNewProyect["soportes"] = this.soportes;
    this.dataNewProyect["metas"] = this.metas;
    var fuentes = [];
    this.dataSource.data.forEach(fuente => {
      if (typeof fuente.presupuestoProyecto == "number") {
        fuentes.push({
          id: fuente._id,
          presupuestoProyecto: fuente.presupuestoProyecto,
          posicion: fuente.posicion,
          presupuestoDisponible: fuente.presupuestoDisponible
        });
      }
    });
    this.dataNewProyect["fuentes"] = fuentes;

    if (this.editar) {
      this.dataNewProyect["id_detalle_fuentes"] = this.idFuentes;
      this.dataNewProyect["id_detalle_metas"] = this.idMetas;
      this.dataNewProyect["id_detalle_soportes"] = this.idSoportes;
      this.request.put(environment.PLANES_MID, 'inversion/proyecto', this.dataNewProyect, this.id).subscribe((data) => {
        if (data) {
          Swal.fire({
            title: 'Proyecto Actualizado con Exito',
            icon: 'success',
            showConfirmButton: false,
            timer: 2500
          }).then(e => this.router.navigate(['pages/proyectos-macro/proyectos-de-inversion-vigentes']))
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `Por favor intente de nuevo`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
    } else {
      this.request.post(environment.PLANES_MID, 'inversion/proyecto', this.dataNewProyect).subscribe((data: any) => {
        if (data) {
          Swal.fire({
            title: 'Proyecto Registrado con Exito',
            icon: 'success',
            showConfirmButton: false,
            timer: 2500
          }).then(e => this.router.navigate(['pages/proyectos-macro/proyectos-de-inversion-vigentes']))
        }
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `Por favor intente de nuevo`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      })
    }
  }
}
