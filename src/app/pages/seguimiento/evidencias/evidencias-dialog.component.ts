import { Component, Inject, OnInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';
import { VisualizarDocumentoDialogComponent } from '../generar-trimestre/visualizar-documento-dialog/visualizar-documento-dialog.component';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-evidencias-dialog',
  templateUrl: './evidencias-dialog.component.html',
  styleUrls: ['./evidencias-dialog.component.scss']
})
export class EvidenciasDialogComponent implements OnInit {
  displayedColumns: string[] = ['index', 'nombre', 'actions'];
  dataSource: MatTableDataSource<any>;
  selectedFiles: any;
  rol: string;
  unidad: string;
  dataFiltered: Object[];
  readonlyFormulario: string;

  constructor(
    private autenticationService: ImplicitAutenticationService,
    private dialogRef: MatDialogRef<EvidenciasDialogComponent>,
    public dialog: MatDialog,
    private gestorDocumental: GestorDocumentalService,
    @Inject(MAT_DIALOG_DATA) public data: Object[]) {
    this.getRol();

    this.readonlyFormulario = JSON.parse(JSON.stringify(data[1]));
    this.dataFiltered = JSON.parse(JSON.stringify(data[0]));
    this.unidad = String(data[3]);
    this.dataSource = new MatTableDataSource(this.dataFiltered)
    this.filterActive();
  }

  ngOnInit(): void {
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles.length == 0) {
      return this.selectedFiles = false;
    }
  }

  cerrar() {
    if (this.rol == 'PLANEACION') {
      this.dialogRef.close(this.dataSource.data);
    } else {
      this.dialogRef.close(this.data[0]);
    }
  }

  async revisar(row) {
    if (row.file != undefined) {
      let header = "data:application/pdf;base64,";
      const dialogRef = this.dialog.open(VisualizarDocumentoDialogComponent, {
        width: '1200',
        minHeight: 'calc(100vh - 90px)',
        height: '80%',
        data: { "url": header + row.file, "editable": !this.data[2] }
      });
    } else {
      Swal.fire({
        title: 'Cargando información',
        timerProgressBar: true,
        showConfirmButton: false,
        allowOutsideClick: false,
        willOpen: () => {
          Swal.showLoading();
        },
      })

      await this.gestorDocumental.get([row]).subscribe(
        (documento) => {
          const dialogRef = this.dialog.open(VisualizarDocumentoDialogComponent, {
            width: '1200px',
            minHeight: 'calc(100vh - 90px)',
            height: '800px',
            data: { ...documento[0], "editable": !this.data[2] }
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
    }
  }

  inactivar(row) {
    for (let index = 0; index < this.dataFiltered.length; index++) {
      let doc = this.dataFiltered[index];
      if (doc["Id"] == row["Id"]) {
        this.dataFiltered[index]["Activo"] = false;
        break;
      }
    }
    this.filterActive();
  }

  filterActive() {
    this.dataSource.filterPredicate = function (data: any, filterValue: string) {
      return data.Activo == JSON.parse(filterValue);
    };
    this.dataSource.filter = "true";
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
