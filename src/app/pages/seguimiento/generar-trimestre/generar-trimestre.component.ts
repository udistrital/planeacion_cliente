import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import { Location, registerLocaleData } from '@angular/common';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';
import { EvidenciasDialogComponent } from '../evidencias/evidencias-dialog.component';
import es from '@angular/common/locales/es';

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

@Component({
  selector: 'app-seguimiento',
  templateUrl: './generar-trimestre.component.html',
  styleUrls: ['./generar-trimestre.component.scss']
})
export class GenerarTrimestreComponent implements OnInit, AfterViewInit {
  columnasIndicadores: string[] = ['nombre', 'formula', 'meta', 'reporteNumerador', 'reporteDenominador', 'detalleReporte', 'observaciones'];
  datosIndicadores: any[];
  columnasResultados: string[] = ['indicador', 'indicadorAcumulado', 'avanceAcumulado', 'brechaExistente'];
  datosResultados: MatTableDataSource<any>;
  displayedColumns: string[] = ['id', 'unidad', 'estado', 'vigencia', 'periodo', 'seguimiento', 'observaciones', 'enviar'];
  dataSource: MatTableDataSource<any>;
  selectedFiles: any;
  datosCualitativo: any = { 'reporte': '', 'productos': '', 'dificultades': '', 'observaciones': '' };
  formCualitativo: FormGroup;
  FORMATOS = ["application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel", "application/vnd.ms-powerpoint", "application/msword",
    "application/pdf", "audio/x-m4a", "audio/webm", "audio/x-wav",
    "audio/ogg", "audio/aac", "image/png", "image/jpeg"]

  @ViewChild('MatPaginatorIndicadores') paginatorIndicadores: MatPaginator;
  @ViewChild('MatPaginatorResultados') paginatorResultados: MatPaginator;

  rol: string;
  planId: string;
  indexActividad: string;
  trimestreId: string;
  codigoTrimestre: string;
  formGenerarTrimestre: FormGroup;
  indicadores: File[] = [];
  documentos: any[] = [];
  indicadorSelected: boolean;
  seguimiento: any = { 'informacion': '', 'estado': '', 'cualitativo': '', 'cuantitativo': '', 'evidencia': '' };
  indicadorActivo: string;
  documentoSeleccionado: File = null;
  trimestre: string = '';
  trimestreAbr: string = '';
  auxDocumentos: string[] = [];
  generalData: any = {};
  generalDatar: any = {};
  listIndicadores: any = {};
  textoDeInput: string = null
  mostrarObservaciones: boolean;
  documentoPlaneacion: any;
  estadoActividad: string;
  estadoSeguimiento: string;
  estados: any[];
  readonlyFormulario: boolean;
  readonlyObservacion: boolean;
  denominadorFijo: boolean;
  unidad: string;
  numeradorOriginal: number[] = [];
  denominadorOriginal: number[] = [];
  calcular: boolean = true;
  abrirDocs: boolean = true;

  constructor(
    private autenticationService: ImplicitAutenticationService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private router: Router,
    private request: RequestManager,
    private gestorDocumental: GestorDocumentalService,
    private _location: Location,
    public dialog: MatDialog) {
    this.datosResultados = new MatTableDataSource();
    this.activatedRoute.params.subscribe(prm => {
      this.planId = prm['plan_id'];
      this.indexActividad = prm['index'];
      this.trimestreId = prm['trimestre_id'];
    });
    this.getRol();
    this.loadData();
    this.loadTrimestre();
    this.loadEstados();
  }

  ngOnInit(): void {
    registerLocaleData(es)
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
    this.formCualitativo = this.formBuilder.group(this.datosCualitativo)
    this.indicadorSelected = false;
    this.mostrarObservaciones = false;
  }

  ngAfterViewInit() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA';
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION';
    } else if (roles.__zone_symbol__value.find(x => x == 'JEFE_UNIDAD_PLANEACION')) {
      this.rol = 'JEFE_UNIDAD_PLANEACION';
    }
  }

  loadTrimestre() {
    this.request.get(environment.PLANES_CRUD, `periodo-seguimiento/` + this.trimestreId).subscribe((data: any) => {
      if (data) {
        let periodoId = data.Data.periodo_id;

        this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=Id:` + periodoId).subscribe((data: any) => {
          if (data) {
            this.trimestre = data.Data[0].ParametroId.Nombre;
            this.codigoTrimestre = data.Data[0].ParametroId.CodigoAbreviacion
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No se encontraron datos del trimestre`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2500
          })
        })
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos del periodo`,
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
        text: `No se encontraron datos del estado}`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  verificarFormulario() {
    if (this.rol === 'PLANEACION' || this.rol === 'JEFE_UNIDAD_PLANEACION') {
      if (this.estadoActividad === 'Actividad en reporte' || this.estadoActividad === 'Sin reporte') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = false;
      } else if (this.estadoActividad === 'Actividad reportada' || this.estadoActividad === 'Con observaciones' /*|| this.estadoActividad === 'Actividad Verificada'*/) {
        this.readonlyFormulario = true;
        this.readonlyObservacion = !(this.estadoSeguimiento === 'En revisión OAPC');
        this.mostrarObservaciones = true;
      } else if (this.estadoActividad === 'Actividad avalada') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = true;
      }
    } else if (this.rol == 'JEFE_DEPENDENCIA') {
      if (this.estadoActividad === 'Actividad en reporte' || this.estadoActividad === 'Habilitado' || this.estadoActividad === 'Sin reporte') {
        this.readonlyFormulario = false;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = false;
      } else if (this.estadoActividad === 'Actividad reportada') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = false;
      } else if (this.estadoActividad === 'Con observaciones'/* || this.estadoActividad === 'Actividad Verificada'*/) {
        this.readonlyFormulario = this.estadoSeguimiento != 'Con observaciones';
        this.readonlyObservacion = true;
        this.mostrarObservaciones = true;
      } else if (this.estadoActividad === 'Actividad avalada') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = true;
      }
    }
  }

  backClicked() {
    this.router.navigate(['pages/seguimiento/gestion-seguimiento/' + this.planId + '/' + this.codigoTrimestre])
  }

  onSeeDocumentos() {
    if (this.abrirDocs) {
      const dialogRef = this.dialog.open(EvidenciasDialogComponent, {
        width: '80%',
        height: '55%',
        data: [this.documentos, this.readonlyFormulario, this.readonlyObservacion, this.unidad],
      });

      dialogRef.afterClosed().subscribe(documentos => {
        if (documentos != undefined && JSON.stringify(this.documentos) != JSON.stringify(documentos)) {

          let documentoPorSubir = {
            documento: null,
            evidencia: documentos,
            unidad: this.rol != 'PLANEACION' && this.rol != 'JEFE_UNIDAD_PLANEACION',
            _id: this.seguimiento.id
          };

          Swal.fire({
            title: 'Guardando cambios',
            timerProgressBar: true,
            showConfirmButton: false,
            willOpen: () => {
              Swal.showLoading();
            },
          })
          this.request.put(environment.PLANES_MID, `seguimiento/guardar_documentos`, documentoPorSubir, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
            if (data) {
              this.documentos = data.Data.seguimiento
              this.seguimiento.evidencia = this.documentos
              this.estadoActividad = data.Data.estadoActividad.nombre;
              this.verificarFormulario();
              Swal.fire({
                title: 'Documento(s) actualizado(s)',
                text: `Revise el campo de soportes para visualizar o eliminar`,
                icon: 'success',
                showConfirmButton: false,
                timer: 2000
              });
            }
          }, (error) => {
            Swal.fire({
              title: 'Error en la operación',
              text: `No se pudo aplicar los cambios`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          })
        }
      });
    }
  }

  async onChangeDocumento(event) {
    if (event != undefined) {
      let aux = event.files[0];
      if (!this.FORMATOS.includes(aux.type)) {
        Swal.fire({
          title: 'Archivo no válido',
          text: `No se admite el tipo de archivo que selecciono`,
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      } else {
        const found = this.documentos.find(element => element.nombre == aux.name && element.Activo);
        if (found == undefined) {
          Swal.fire({
            title: 'Guardando documento',
            timerProgressBar: true,
            showConfirmButton: false,
            willOpen: () => {
              Swal.showLoading();
            },
          })

          let documento = [{
            IdTipoDocumento: 60,
            nombre: aux.name,
            metadatos: {
              dato_a: "Soporte planeacion"
            },
            descripcion: "Documento de soporte para seguimiento de plan de acción",
            file: await this.gestorDocumental.fileToBase64(aux),
            Activo: true
          }];

          let documentoPorSubir = {
            documento: documento,
            evidencia: this.documentos,
            unidad: this.rol != 'PLANEACION' && this.rol != 'JEFE_UNIDAD_PLANEACION',
            _id: this.seguimiento.id
          };

          this.request.put(environment.PLANES_MID, `seguimiento/guardar_documentos`, documentoPorSubir, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
            if (data) {
              this.estadoActividad = data.Data.estadoActividad.nombre;
              this.documentos = data.Data.seguimiento
              this.seguimiento.evidencia = this.documentos
              this.verificarFormulario();

              Swal.fire({
                title: 'Documento Cargado',
                text: `Revise el campo de soportes para visualizar o eliminar`,
                icon: 'success',
                showConfirmButton: false,
                timer: 2000
              });
            }
          }, (error) => {
            this.documentos.pop();
            Swal.fire({
              title: 'Error en la operación',
              text: `No se pudo subir el documento`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
          })
        } else {
          Swal.fire({
            title: 'Error en la operación',
            text: `Ya existe un documento con el mismo nombre`,
            icon: 'warning',
            showConfirmButton: false,
            timer: 2000
          })
        }
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

  async loadData() {
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    await this.request.get(environment.PLANES_MID, `seguimiento/get_seguimiento/` + this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe(async (data: any) => {
      if (data.Data != '') {
        this.seguimiento = data.Data;
        this.unidad = this.seguimiento.informacion.unidad;
        this.documentos = JSON.parse(JSON.stringify(data.Data.evidencia));
        this.datosIndicadores = data.Data.cuantitativo.indicadores;
        this.datosResultados = JSON.parse(JSON.stringify(data.Data.cuantitativo.resultados));

        this.numeradorOriginal = [];
        this.denominadorOriginal = [];
        let resultados = JSON.parse(JSON.stringify(data.Data.cuantitativo.indicadores));
        resultados.forEach(indicador => {
          this.numeradorOriginal.push(indicador.reporteNumerador ? indicador.reporteNumerador : 0);
          this.denominadorOriginal.push(indicador.reporteDenominador ? indicador.reporteDenominador : 0);
        });

        this.datosCualitativo = data.Data.cualitativo;

        this.estadoActividad = this.seguimiento.estado.nombre;
        this.estadoSeguimiento = this.seguimiento.estadoSeguimiento;
        this.verificarFormulario();

        if (this.estadoActividad != "Sin reporte") {
          if (this.datosCualitativo.observaciones == "" || this.datosCualitativo.observaciones == undefined || this.datosCualitativo.observaciones == "Sin observación") {
            this.datosCualitativo.observaciones = ""
          } else {
            this.mostrarObservaciones = true;
          }
        }

        this.trimestreAbr = data.Data.informacion.trimestre;
        if (data.Data.informacion.trimestre != "T1") {
          this.calcular = true;

          if (this.datosResultados[0].indicador != 0) {
            this.calcular = false;
          }
        }

        for (let index = 0; index < this.datosIndicadores.length; index++) {
          const indicador = this.datosIndicadores[index];
          if (this.estadoActividad != "Sin reporte") {
            if ((indicador.observaciones == "" || indicador.observaciones == undefined) && this.rol != "JEFE_DEPENDENCIA") {
              this.datosIndicadores[index].observaciones = "";
            }
          }
        }

        if (this.documentos == null) {
          this.documentos = [];
        }

        for (let index = 0; index < this.documentos.length; index++) {
          const documento = this.documentos[index];
          if (this.estadoActividad != "Sin reporte") {
            if (documento.Observacion == "") {
              this.documentos[index].Observacion = "";
            } else {
              this.mostrarObservaciones = true;
            }
          }
        }

        Swal.close();
      }
    }, (error) => {
      console.error(error)
      Swal.close();
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    })
  }

  guardarCualitativo() {
    var mensaje = `¿Desea guardar la información del componente cualitativo?`
    if (this.rol === 'PLANEACION'/* && this.estadoActividad === 'Actividad Verificada'*/) {
      mensaje = `¿Desea avalar la actividad?`
      if (this.veririficarObservaciones()) {
        mensaje = `¿Desea guardar las observaciones del componente cualitativo?`
      }
    }

    Swal.fire({
      title: 'Guardar seguimiento',
      text: mensaje,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/guardar_cualitativo`, { "_id": this.seguimiento.id, "informacion": this.seguimiento.informacion, "evidencias": this.seguimiento.evidencia, "cualitativo": this.seguimiento.cualitativo, "cuantitativo": this.seguimiento.cuantitativo, "dependencia": this.rol == 'JEFE_DEPENDENCIA' }, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Información de seguimiento actualizada',
              text: 'El seguimiento del componente cualitativo se ha guardado satisfactoriamente',
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
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Generación de seguimiento cancelado',
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

  guardarCuantitativo() {
    var mensaje = `¿Desea guardar la información del componente cuantitativo?`
    if (this.rol === 'PLANEACION'/* && this.estadoActividad === 'Actividad Verificada'*/) {
      mensaje = `¿Desea avalar la actividad?`
      if (this.veririficarObservaciones()) {
        mensaje = `¿Desea guardar las observaciones del componente cuantitativo?`
      }
    }

    Swal.fire({
      title: 'Guardar seguimiento',
      text: mensaje,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/guardar_cuantitativo`, { "_id": this.seguimiento.id, "informacion": this.seguimiento.informacion, "evidencias": this.seguimiento.evidencia, "cualitativo": this.seguimiento.cualitativo, "cuantitativo": this.seguimiento.cuantitativo, "dependencia": this.rol == 'JEFE_DEPENDENCIA' }, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Información de seguimiento actualizada',
              text: 'El seguimiento del componente cuantitativo se ha guardado satisfactoriamente',
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
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Generación de seguimiento cancelado',
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

  guardarSeguimiento() {
    Swal.fire({
      title: 'Guardar seguimiento',
      text: `¿Desea guardar todos los componentes del seguimiento?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/guardar_seguimiento`, this.seguimiento, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
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
          });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Generación de seguimiento cancelado',
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
        let mod = {
          SeguimientoId: this.seguimiento._id
        };

        this.request.put(environment.PLANES_MID, `seguimiento/reportar_actividad`, mod, this.indexActividad).subscribe((data: any) => {
          if (data) {
            if (data.Success) {
              Swal.fire({
                title: 'Seguimiento Generado',
                icon: 'success',
              }).then((result) => {
                if (result.value) {
                  this.loadData();
                }
              });
            } else {
              Swal.fire({
                title: 'No es posible generar el reporte',
                icon: 'error',
                showConfirmButton: false,
                text: data.Data.motivo,
                timer: 4000
              })
            }
          }
        });
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

  calcularResultado() {
    for (let index = 0; index < this.datosIndicadores.length; index++) {
      const indicador = this.datosIndicadores[index];

      if (indicador.reporteDenominador != null && indicador.reporteNumerador != null) {
        const denominador = parseFloat(indicador.reporteDenominador);
        const numerador = parseFloat(indicador.reporteNumerador);
        const meta = parseFloat(this.datosIndicadores[index].meta);
        this.calcular = false;

        if (denominador == 0.0) {
          if (numerador == 0.0) {
            if (indicador.denominador != "Denominador variable") {
              Swal.fire({
                title: 'Error en la operación',
                text: `No es posible la división entre cero para denominador fijo`,
                icon: 'warning',
                showConfirmButton: false,
                timer: 3500
              })
              indicador.reporteDenominador = null;
              indicador.reporteNumerador = null;
            } else {
              if (this.trimestreAbr == "T1" || this.datosResultados[index].divisionCero) {
                this.datosResultados[index].divisionCero = true;
                this.datosResultados[index].indicadorAcumulado = 1;
                this.datosResultados[index].acumuladoNumerador = 0;
                this.datosResultados[index].acumuladoDenominador = 0;
                this.datosResultados[index].indicador = 0;
                this.numeradorOriginal = [];
                this.denominadorOriginal = [];
                this.calcular = true;

                var indicadorAcumulado = this.datosResultados[index].indicadorAcumulado;
                var metaEvaluada = meta / 100;

                this.datosResultados[index].avanceAcumulado = this.datosResultados[index].indicadorAcumulado / metaEvaluada;

                if (indicador.tendencia == "Creciente") {
                  if (this.datosResultados[index].indicadorAcumulado > metaEvaluada) {
                    this.datosResultados[index].brechaExistente = 0;
                  } else {
                    this.datosResultados[index].brechaExistente = metaEvaluada - indicadorAcumulado;
                  }
                } else {
                  if (this.datosResultados[index].indicadorAcumulado < metaEvaluada) {
                    this.datosResultados[index].brechaExistente = 0;
                  } else {
                    this.datosResultados[index].brechaExistente = indicadorAcumulado - metaEvaluada;
                  }
                }
                this.seguimiento.cuantitativo.resultados[index] = this.datosResultados[index];
              } else {
                this.calcularBase(indicador, denominador, numerador, meta, index, true)
              }
            }
          } else {
            Swal.fire({
              title: 'Error en la operación',
              text: `No es posible la división entre cero`,
              icon: 'warning',
              showConfirmButton: false,
              timer: 3500
            })
          }
        } else {
          if (this.trimestreAbr == "T1") {
            this.datosResultados[index].indicadorAcumulado = 0;
            this.datosResultados[index].acumuladoNumerador = 0;
            this.datosResultados[index].acumuladoDenominador = 0;
            this.datosResultados[index].indicador = 0;
            this.datosResultados[index].avanceAcumulado = 0;
            this.datosResultados[index].brechaExistente = 0;
            this.numeradorOriginal = [];
            this.denominadorOriginal = [];
            this.calcular = true;
          }
          this.calcularBase(indicador, denominador, numerador, meta, index, false)
        }
      } else {
        Swal.fire({
          title: 'Error en la operación',
          text: `Los datos de numerador y denominador no pueden estar vacios`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
      }
    }
  }

  calcularBase(indicador, denominador, numerador, meta, index, ceros) {
    this.datosResultados[index].divisionCero = false;
    this.denominadorFijo = indicador.denominador != "Denominador variable"
    if (!Number.isNaN(denominador) && !Number.isNaN(numerador)) {
      this.datosIndicadores[index].reporteDenominador = denominador;
      this.datosIndicadores[index].reporteNumerador = numerador;

      if (!this.calcular) {
        this.datosResultados[index].acumuladoNumerador -= this.numeradorOriginal[index];
        if (!this.denominadorFijo) {
          this.datosResultados[index].acumuladoDenominador -= this.denominadorOriginal[index];
        }
        this.datosResultados[index].indicadorAcumulado -= this.datosResultados[index].indicador;
        this.datosResultados[index].indicador = 0;
      }

      this.datosResultados[index].acumuladoNumerador += numerador;
      if (!this.denominadorFijo) {
        this.datosResultados[index].acumuladoDenominador += denominador;
      } else {
        this.datosResultados[index].acumuladoDenominador = denominador;
      }

      if (denominador != 0) {
        if (this.datosIndicadores[index].unidad == "Unidad") {
          this.datosResultados[index].indicador = Math.round((numerador / denominador));
        } else {
          this.datosResultados[index].indicador = Math.round((numerador / denominador) * 10000) / 10000;
        }
      } else {
        this.datosResultados[index].indicador = this.datosIndicadores[index].unidad == "Unidad" ? meta : meta / 100;
      }

      if (this.datosResultados[index].divisionCero && ceros) {
        this.datosResultados[index].indicador = 0;
      }

      if (this.datosResultados[index].acumuladoDenominador != 0) {
        if (this.datosIndicadores[index].unidad == "Unidad") {
          this.datosResultados[index].indicadorAcumulado = Math.round(this.datosResultados[index].acumuladoNumerador / this.datosResultados[index].acumuladoDenominador * 100) / 100;
        } else {
          this.datosResultados[index].indicadorAcumulado = Math.round((this.datosResultados[index].acumuladoNumerador / this.datosResultados[index].acumuladoDenominador) * 10000) / 10000;
        }
      } else {
        this.datosResultados[index].indicadorAcumulado = this.datosIndicadores[index].unidad == "Unidad" ? meta : meta / 100;
      }

      var indicadorAcumulado = this.datosResultados[index].indicadorAcumulado;
      var metaEvaluada = this.datosIndicadores[index].unidad == "Unidad" || this.datosIndicadores[index].unidad == "Tasa" ? meta : meta / 100;
      if (indicador.tendencia == "Creciente") {
        if (this.datosIndicadores[index].unidad == "Unidad" || this.datosIndicadores[index].unidad == "Tasa") {
          this.datosResultados[index].avanceAcumulado = Math.round(indicadorAcumulado / metaEvaluada * 1000) / 1000;
        } else {
          this.datosResultados[index].avanceAcumulado = Math.round(indicadorAcumulado / metaEvaluada * 10000) / 10000;
        }
      } else if (indicador.tendencia == "Decreciente") {
        if (indicadorAcumulado < metaEvaluada) {
          this.datosResultados[index].avanceAcumulado = Math.round((1 + ((metaEvaluada - indicadorAcumulado) / metaEvaluada)) * 10000) / 10000;
        } else {
          this.datosResultados[index].avanceAcumulado = Math.round((1 - ((metaEvaluada - indicadorAcumulado) / metaEvaluada)) * 10000) / 10000;
        }
      }

      if (indicador.tendencia == "Creciente") {
        if (indicadorAcumulado > metaEvaluada) {
          this.datosResultados[index].brechaExistente = 0;
        } else {
          this.datosResultados[index].brechaExistente = Math.round((metaEvaluada - indicadorAcumulado) * 10000) / 10000;
        }
      } else if (indicador.tendencia == "Decreciente") {
        if (indicadorAcumulado < metaEvaluada) {
          this.datosResultados[index].brechaExistente = 0;
        } else {
          this.datosResultados[index].brechaExistente = Math.round((indicadorAcumulado - metaEvaluada) * 10000) / 10000;
        }
      }
      this.seguimiento.cuantitativo.resultados[index] = this.datosResultados[index];
    }
    this.numeradorOriginal[index] = numerador;
    this.denominadorOriginal[index] = denominador;
    indicador.reporteDenominador = String(denominador);
    indicador.reporteNumerador = String(numerador);
  }

  onEnter() {
    this.abrirDocs = false;
  }

  offEnter() {
    this.abrirDocs = true;
  }

  guardarRevision() {
    var mensaje = `¿Desea avalar la actividad?`
    if (this.veririficarObservaciones()) {
      mensaje = `¿Desea enviar las observaciones realizadas para este reporte?`
    }

    Swal.fire({
      title: 'Guardar seguimiento',
      text: mensaje,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/revision_actividad`, this.seguimiento, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
          if (data) {

            if (data.Data.Observación) {
              Swal.fire({
                title: 'Información de seguimiento actualizada',
                text: 'Las observaciones hechas al seguimiento se ha guardado satisfactoriamente',
                icon: 'success'
              }).then(res => {
                this.loadData();
              });
            } else {
              Swal.fire({
                title: 'Información de seguimiento actualizada',
                text: 'La actividad ha sido avalada satisfactoriamente',
                icon: 'success'
              }).then(res => {
                this.loadData();
              });
            }
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No fue posible guardar el seguimiento`,
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Generación de seguimiento cancelado',
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

  veririficarObservaciones() {
    if (this.seguimiento.cualitativo.observaciones != "" && this.seguimiento.cualitativo.observaciones != "Sin observación") {
      return true;
    }

    for (let index = 0; index < this.seguimiento.cuantitativo.indicadores.length; index++) {
      const indicador = this.seguimiento.cuantitativo.indicadores[index];
      if (indicador.observaciones != "" && indicador.observaciones != "Sin observación") {
        return true;
      }
    }

    for (let index = 0; index < this.seguimiento.evidencia.length; index++) {
      const evidencia = this.seguimiento.evidencia[index];
      if (evidencia.Observacion != "" && evidencia.Observacion != "Sin observación") {
        return true;
      }
    }

    return false
  }

  retornarRevision() {
    Swal.fire({
      title: 'Retornar estado',
      text: `¿Desea retornar la actividad al estado Actividad reportada?`,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/retornar_actividad`, this.seguimiento, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Información de seguimiento actualizada',
              text: 'Se ha actualizado el estado de la actividad satisfactoriamente',
              icon: 'success'
            }).then(res => {
              this.loadData();
            });
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No fue posible retornar el estado`,
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio de estado cancelado',
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

  /*verificarActividad() {
    var mensaje = `¿Desea verificar la actividad?`
    if (this.veririficarObservaciones()) {
      mensaje = `¿Desea enviar las observaciones realizadas para este reporte?`
    }

    Swal.fire({
      title: 'Guardar seguimiento',
      text: mensaje,
      icon: 'warning',
      confirmButtonText: `Sí`,
      cancelButtonText: `No`,
      showCancelButton: true
    }).then((result) => {
      if (result.isConfirmed) {
        this.request.put(environment.PLANES_MID, `seguimiento/verificar_actividad`, this.seguimiento, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
          if (data) {

            if (data.Data.Observación) {
              Swal.fire({
                title: 'Información de seguimiento actualizada',
                text: 'Las observaciones hechas al seguimiento se ha guardado satisfactoriamente',
                icon: 'success'
              }).then(res => {
                this.loadData();
              });
            } else {
              Swal.fire({
                title: 'Información de seguimiento actualizada',
                text: 'La actividad ha sido verificada satisfactoriamente',
                icon: 'success'
              }).then(res => {
                this.loadData();
              });
            }
          }
        }, (error) => {
          Swal.fire({
            title: 'Error en la operación',
            text: `No fue posible guardar el seguimiento`,
            icon: 'error',
            showConfirmButton: false,
            timer: 2500
          });
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Generación de seguimiento cancelado',
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
  }*/
}
