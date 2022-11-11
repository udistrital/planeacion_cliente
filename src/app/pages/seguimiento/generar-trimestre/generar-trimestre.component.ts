import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { element } from 'protractor';
import { Location } from '@angular/common';
import { VisualizarDocumentoDialogComponent } from './visualizar-documento-dialog/visualizar-documento-dialog.component';
import { UserService } from '../../services/userService';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';
import { EvidenciasDialogComponent } from '../evidencias/evidencias-dialog.component';

export interface Indicador {
  nombre: string;
  formula: string;
  meta: string;
  reporteNumerador: string;
  reporteDenominador: string;
  detalleReporte: string;
  observaciones: string;
}

export interface ResultadosIndicador {
  indicador: string;
  indicadorAcumulado: string;
  avanceAcumulado: string;
  brechaExistente: string;
}

//Data de prueba para tabla de indicadores:
const ELEMENT_DATA: Indicador[] = [
  { nombre: 'Ind. 1', formula: "a", meta: 'as', reporteNumerador: '1', reporteDenominador: '2', detalleReporte: "det", observaciones: 'No' },
  { nombre: 'Ind. 2', formula: "b", meta: 'ad', reporteNumerador: '1', reporteDenominador: '2', detalleReporte: "det", observaciones: 'No' },
  { nombre: 'Ind. 3', formula: "c", meta: 'df', reporteNumerador: '1', reporteDenominador: '2', detalleReporte: "det", observaciones: 'No' },
];

const ELEMENT_DATA2: ResultadosIndicador[] = [
  { indicador: 'Ind. 1', indicadorAcumulado: '30', avanceAcumulado: '50', brechaExistente: '20' },
  { indicador: 'Ind. 2', indicadorAcumulado: '30', avanceAcumulado: '50', brechaExistente: '20' },
  { indicador: 'Ind. 3', indicadorAcumulado: '30', avanceAcumulado: '50', brechaExistente: '20' },
];

@Component({
  selector: 'app-seguimiento',
  templateUrl: './generar-trimestre.component.html',
  styleUrls: ['./generar-trimestre.component.scss']
})
export class GenerarTrimestreComponent implements OnInit, AfterViewInit {
  columnasIndicadores: string[] = ['nombre', 'formula', 'meta', 'reporteNumerador', 'reporteDenominador', 'detalleReporte', 'observaciones'];
  datosIndicadores = new MatTableDataSource<Indicador>(ELEMENT_DATA);
  columnasResultados: string[] = ['indicador', 'indicadorAcumulado', 'avanceAcumulado', 'brechaExistente'];
  datosResultados = new MatTableDataSource<ResultadosIndicador>(ELEMENT_DATA2);
  displayedColumns: string[] = ['id', 'unidad', 'estado', 'vigencia', 'periodo', 'seguimiento', 'observaciones', 'enviar'];
  dataSource: MatTableDataSource<any>;
  selectedFiles: any;

  @ViewChild('MatPaginatorIndicadores') paginatorIndicadores: MatPaginator;
  @ViewChild('MatPaginatorResultados') paginatorResultados: MatPaginator;

  rol: string;
  planId: string;
  indexActividad: string;
  trimestreId: string;
  formGenerarTrimestre: FormGroup;
  indicadores: File[] = [];
  documentos: any[] = [];
  indicadorSelected: boolean;
  seguimiento: any = { 'informacion': '', 'estado': '' };
  indicadorActivo: string;
  documentoSeleccionado: File = null;
  trimestre: string = '';
  auxDocumentos: string[] = [];
  generalData: any = {};
  generalDatar: any = {};
  listIndicadores: any = {};
  textoDeInput: string = null
  mostrarObservaciones: boolean;
  documentoPlaneacion: any;
  estadoSeguimiento: string;
  estados: any[];
  readonlyFormulario: boolean;
  readonlyObservacion: boolean;
  unidad: string;

  constructor(
    private autenticationService: ImplicitAutenticationService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private gestorDocumental: GestorDocumentalService,
    private _location: Location,
    public dialog: MatDialog,
    private router: Router,
    private userService: UserService) {
    this.activatedRoute.params.subscribe(prm => {
      this.planId = prm['plan_id'];
      this.indexActividad = prm['index'];
      this.trimestreId = prm['trimestre_id'];
    });
    this.getRol();
    this.loadInidicadores();
    this.loadData();
    this.loadTrimestre();
    this.loadEstados();
  }

  ngOnInit(): void {
    this.formGenerarTrimestre = this.formBuilder.group({
      indicador: ['', Validators.required],
      avancePeriodo: ['', Validators.required],
      avanceAcumulado: ['', Validators.required],
      producto: ['', Validators.required],
      evidencia: ['', Validators.required],
      logros: ['', Validators.required],
      dificultades: ['', Validators.required],
      observaciones: ['', Validators.required],
      documentos: ['',],
      autor: ['',],
      observacionesP: ['',],
      estadoActividad: ['',]
    });
    this.indicadorSelected = false;
    this.mostrarObservaciones = false;
  }

  ngAfterViewInit() {
    this.datosIndicadores.paginator = this.paginatorIndicadores;
    this.datosResultados.paginator = this.paginatorResultados;
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA';
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  getDataUser() {
    this.userService.user$.subscribe((data) => {
      this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion/?query=Numero:` + data['userService']['documento'])
        .subscribe((datosInfoTercero: any) => {
          this.formGenerarTrimestre.get('autor').setValue(datosInfoTercero[0].TerceroId.NombreCompleto);
        })

    })
  }

  loadTrimestre() {
    this.request.get(environment.PLANES_CRUD, `periodo-seguimiento/` + this.trimestreId).subscribe((data: any) => {
      if (data) {
        let periodoId = data.Data.periodo_id;

        this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=Id:` + periodoId).subscribe((data: any) => {
          if (data) {
            this.trimestre = data.Data[0].ParametroId.Nombre;
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

  loadEstados() {
    this.request.get(environment.PLANES_CRUD, `estado-seguimiento`).subscribe((data: any) => {
      if (data.Data.length != 0) {
        this.estados = data.Data;
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


  getEstado() {
    this.request.get(environment.PLANES_CRUD, `estado-seguimiento/` + this.seguimiento.estado_seguimiento_id).subscribe((data: any) => {
      if (data) {
        this.estadoSeguimiento = data.Data.nombre;
        this.verificarFormulario();
      }
    }),
      (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
  }

  verificarFormulario() {
    if (this.rol === 'PLANEACION') {
      if (this.estadoSeguimiento === 'En Reporte' || this.estadoSeguimiento === 'Aprobado para evaluación') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = false;
      } else if (this.estadoSeguimiento === 'Generado') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = false;
        this.mostrarObservaciones = true;
      } else if (this.estadoSeguimiento === 'Observación') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = true;
      } else if (this.estadoSeguimiento === 'Ajustado') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = false;
        this.mostrarObservaciones = true;
      }
      // else if (this.estadoSeguimiento === 'Aprobado para evaluación'){
      //   this.readonlyFormulario = true;
      //   this.readonlyObservacion = true;
      //   this.mostrarObservaciones = false;
      // }
    } else if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoSeguimiento === 'En Reporte') {
        this.readonlyFormulario = false;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = false;
      } else if (this.estadoSeguimiento === 'Generado') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = false;
      } else if (this.estadoSeguimiento === 'Observación') {
        this.readonlyFormulario = false;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = true;
      } else if (this.estadoSeguimiento === 'Ajustado') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = true;
      } else if (this.estadoSeguimiento === 'Aprobado para evaluación') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = false;
      }
    }
  }

  backClicked() {
    this._location.back();
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles.length == 0) {
      return this.selectedFiles = false;
    }
  }

  evidencias() {
    window.location.href = '#/pages/seguimiento/app-evidencias';
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onChangeD(event) {
    if (event != null) {
      this.documentoSeleccionado = event;
    } else {
      this.documentoSeleccionado = null;
    }

  }

  onSeeDocumentos(event) {
    const dialogRef = this.dialog.open(EvidenciasDialogComponent, {
      width: '80%',
      height: '55%',
      data: this.documentos
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result == undefined) {
        return undefined;
      }
    });
  }

  async onChangeDocumento(event) {
    if (event != undefined) {
      let aux = event.files[0];

      const found = this.documentos.find(element => element.name == aux.name);
      if (found == undefined) {
        let documento = {
          IdTipoDocumento: 60,
          nombre: aux.name,
          metadatos: {
            dato_a: "Soporte planeacion"
          },
          descripcion: "Documento de soporte para seguimiento de plan de acción",
          file: await this.gestorDocumental.fileToBase64(aux)
        }
        this.documentos.push(documento);
        this.seguimiento.documento = this.documentos;
        Swal.fire({
          title: 'Documento Cargado',
          text: `Revise el campo de soportes para visualizar o eliminar`,
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        })
      } else {
        Swal.fire({
          title: 'Error en la operación',
          text: `El documento ya se encuentra cargado`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2000
        })
      }

    } else {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se pudo subir el documento`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    }
  }

  generarAvance() {
    this.request.get(environment.PLANES_MID, `seguimiento/get_indicadores/` + this.planId).subscribe((data: any) => {
      if (data) {
        this.listIndicadores = data.Data;
        let testSuma = 0;
        for (let indicador of this.listIndicadores) {
          let reg = / /g;
          let primerDatoAcumu = indicador.nombre;
          let datoIdentir = {
            "plan_id": this.planId,
            "periodo_seguimiento_id": this.trimestreId,
            "index": this.indexActividad,
            "Nombre_del_indicador": primerDatoAcumu.replace(reg, '_'),
            "avancePeriodo": "2"
          }
          this.request.post(environment.PLANES_MID, `seguimiento/get_avance/`, datoIdentir).subscribe((dataPr: any) => {
            if (dataPr) {
              this.generalDatar = dataPr.Data;
              testSuma = testSuma + parseFloat(this.generalDatar.avanceAcumuladoPrev)
            } else {
              Swal.fire({
                title: 'Error al crear identificación. Intente de nuevo',
                icon: 'warning',
                showConfirmButton: false,
                timer: 2500
              })
            }
          })
        }
      }
      let datoIdenti = {
        "plan_id": this.planId,
        "periodo_seguimiento_id": this.trimestreId,
        "index": this.indexActividad,
        "Nombre_del_indicador": this.indicadorActivo,
        "avancePeriodo": this.formGenerarTrimestre.get('avancePeriodo').value
      }
      this.request.post(environment.PLANES_MID, `seguimiento/get_avance/`, datoIdenti).subscribe((dataP: any) => {
        if (dataP) {
          this.generalData = dataP.Data;
          this.formGenerarTrimestre.get('avanceAcumulado').setValue(this.generalData.avanceAcumulado);
        } else {
          Swal.fire({
            title: 'Error al crear identificación. Intente de nuevo',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        }
      })
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

  loadInidicadores() {
    this.request.get(environment.PLANES_MID, `seguimiento/get_indicadores/` + this.planId).subscribe((data: any) => {
      if (data) {
        this.indicadores = data.Data;
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

  loadData() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    this.request.get(environment.PLANES_MID, `seguimiento/get_seguimiento/` + this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
      if (data.Data != '') {
        this.seguimiento = data.Data;
        this.unidad = this.seguimiento.informacion.unidad;
        this.documentos = data.Data.evidencia;
        Swal.close();
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

  guardarSeguimiento() {
    this.request.post(environment.PLANES_MID, `seguimiento/guardar_seguimiento/` + this.planId + `/` + this.indexActividad + `/` + this.trimestreId, this.seguimiento).subscribe((data: any) => {
      if (data) {
        Swal.fire({
          title: 'Información de seguimiento actualizada',
          text: 'El seguimiento se ha guardado satisfactoriamente',
          icon: 'success'
        }).then(res => {
          this.loadData();
        });
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No fue posible guardar el seguimiento`,
        icon: 'error',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  eliminarDocumento() {
    for (let i = 0; i < this.documentos.length; i++) {
      if (this.documentos[i].name == this.documentoSeleccionado.name) {

        for (let index = 0; index < this.seguimiento.evidencia.length; index++) {
          const evidencia = this.seguimiento.evidencia[index];
          if (evidencia.Nombre == this.documentoSeleccionado.name) {
            this.seguimiento.evidencia[index].Activo = false;
            break;
          }
        }
        this.documentos.splice(i, 1);
        this.documentoSeleccionado = null;
        Swal.fire({
          title: 'Documento Eliminado',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        })
        break;
      }
    }
  }

  eliminarDocumentoP() {
    this.documentoPlaneacion = undefined;
  }


  loadDocumentos(docs: string) {
    let auxDocs = docs.split(",");
    for (let i = 0; i < auxDocs.length; i++) {
      this.request.get(environment.GESTOR_DOCUMENTAL_MID, `document/` + auxDocs[i]).subscribe((data: any) => {
        if (data) {
          this.documentos.push({
            name: data["dc:title"],
            size: data["file:content"]["length"],
            type: data["file:content"]["mime-type"],
            uid: auxDocs[i],
            file: data["file"]
          })

        } else {
          Swal.fire({
            title: 'Error al crear identificación. Intente de nuevo',
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        }
      })
    }
  }


  loadDocumentoP(docs: string) {
    this.request.get(environment.GESTOR_DOCUMENTAL_MID, `document/` + docs).subscribe((data: any) => {
      if (data) {
        this.documentoPlaneacion = {
          name: data["dc:title"],
          size: data["file:content"]["length"],
          type: data["file:content"]["mime-type"],
          uid: docs,
          file: data["file"]
        }

      } else {
        Swal.fire({
          title: 'Error al crear identificación. Intente de nuevo',
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    })

  }

  generarReporte() {
    Swal.fire({
      title: 'Generar Reporte',
      text: `Esta a punto de generar el reporte para la revisión del seguimiento.`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        const auxEstado = this.estados.find(element => element.nombre === 'Generado');
        let mod = {
          estado_seguimiento_id: auxEstado._id
        }
        this.seguimiento.estado_plan_id = auxEstado._id
        this.request.put(environment.PLANES_CRUD, `seguimiento`, mod, this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Seguimiento Generado',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.verificarFormulario();
              }
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Generación de reporte cancelada',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }),
      (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
  }

  enviarObservacion() {
    Swal.fire({
      title: 'Enviar Observacion',
      text: `Desea enviar las observaciones realizadas para este reporte`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        const auxEstado = this.estados.find(element => element.nombre === 'Observación');
        let mod = {
          estado_seguimiento_id: auxEstado._id
        }
        this.seguimiento.estado_plan_id = auxEstado._id
        this.request.put(environment.PLANES_CRUD, `seguimiento`, mod, this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Observación Cancelada',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.verificarFormulario();
              }
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Generación de observación cancelada',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }),
      (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
  }

  aprobarReporte() {
    Swal.fire({
      title: 'Aprobar Reporte',
      text: `Esta a punto de aprobar este reporte de seguimiento`,
      icon: 'warning',
      confirmButtonText: `Continuar`,
      cancelButtonText: `Cancelar`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        const auxEstado = this.estados.find(element => element.nombre === 'Aprobado para evaluación');
        let mod = {
          estado_seguimiento_id: auxEstado._id
        }
        this.seguimiento.estado_plan_id = auxEstado._id
        this.request.put(environment.PLANES_CRUD, `seguimiento`, mod, this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Reporte Aprobado',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.verificarFormulario();
              }
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Aprobación cancelada',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }),
      (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
  }


  ajustarReporte() {
    Swal.fire({
      title: 'Reenviar Reporte',
      text: `Desea enviar este reporte con los ajustes realizados`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        const auxEstado = this.estados.find(element => element.nombre === 'Ajustado');
        let mod = {
          estado_seguimiento_id: auxEstado._id
        }
        this.seguimiento.estado_plan_id = auxEstado._id
        this.request.put(environment.PLANES_CRUD, `seguimiento`, mod, this.seguimiento._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Reporte reenviado correctamente',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.verificarFormulario();
              }
            })
          }
        })
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Ajustes de reporte cancelados',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }),
      (error) => {
        Swal.fire({
          title: 'Error en la operación',
          icon: 'error',
          text: `${JSON.stringify(error)}`,
          showConfirmButton: false,
          timer: 2500
        })
      }
  }
}
