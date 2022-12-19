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
import { element } from 'protractor';
import { Location } from '@angular/common';
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
  tendencia: string;
  unidad: string;

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
    if (this.rol === 'PLANEACION') {
      if (this.estadoActividad === 'Actividad en reporte' || this.estadoActividad === 'Sin reporte') {
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = false;
      } else if (this.estadoActividad === 'Actividad reportada' || this.estadoActividad === 'Con observaciones') {
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
      } else if (this.estadoActividad === 'Con observaciones') {
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
    const dialogRef = this.dialog.open(EvidenciasDialogComponent, {
      width: '80%',
      height: '55%',
      data: [this.documentos, this.readonlyFormulario, this.readonlyObservacion],
    });

    dialogRef.afterClosed().subscribe(documentos => {
      if (documentos != undefined && JSON.stringify(this.documentos) != JSON.stringify(documentos)) {

        let documentoPorSubir = {
          documento: null,
          evidencia: documentos
        };

        this.request.put(environment.PLANES_MID, `seguimiento/guardar_documentos`, documentoPorSubir, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
          if (data) {
            this.documentos = documentos;
            Swal.fire({
              title: 'Documento(s) actualizado(s)',
              text: `Revise el campo de soportes para visualizar o eliminar`,
              icon: 'success',
              showConfirmButton: false,
              timer: 2000
            }).then(res => {
              this.loadData();
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

  async onChangeDocumento(event) {
    if (event != undefined) {
      let aux = event.files[0];
      const found = this.documentos.find(element => element.nombre == aux.name && element.Activo);
      if (found == undefined) {
        let documento = {
          IdTipoDocumento: 60,
          nombre: aux.name,
          metadatos: {
            dato_a: "Soporte planeacion"
          },
          descripcion: "Documento de soporte para seguimiento de plan de acción",
          file: await this.gestorDocumental.fileToBase64(aux),
          Activo: true
        }
        this.documentos.push(documento);

        let documentoPorSubir = {
          documento: this.documentos,
          evidencia: this.seguimiento.evidencia
        };

        this.request.put(environment.PLANES_MID, `seguimiento/guardar_documentos`, documentoPorSubir, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Documento Cargado',
              text: `Revise el campo de soportes para visualizar o eliminar`,
              icon: 'success',
              showConfirmButton: false,
              timer: 2000
            }).then(res => {
              this.loadData();
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
        this.tendencia = data.Data.cuantitativo.tendencia;
        this.datosCualitativo = data.Data.cualitativo;

        this.estadoActividad = this.seguimiento.estado.nombre;
        this.estadoSeguimiento = this.seguimiento.estadoSeguimiento;
        this.verificarFormulario();

        if (this.estadoActividad != "Sin reporte") {
          if (this.datosCualitativo.observaciones == "" || this.datosCualitativo.observaciones == undefined) {
            this.datosCualitativo.observaciones = "Sin observación"
          } else {
            this.mostrarObservaciones = true;
          }
        }

        if (data.Data.informacion.trimestre != "T1") {
          this.denominadorFijo = true;
        }

        for (let index = 0; index < this.datosIndicadores.length; index++) {
          const indicador = this.datosIndicadores[index];
          if (this.estadoActividad != "Sin reporte") {
            if ((indicador.observaciones == "" || indicador.observaciones == undefined) && this.rol != "JEFE_DEPENDENCIA") {
              this.datosIndicadores[index].observaciones = "Sin observación";
            }
          }
        }

        for (let index = 0; index < this.documentos.length; index++) {
          const documento = this.documentos[index];
          if (this.estadoActividad != "Sin reporte") {
            if (documento.Observacion == "") {
              this.documentos[index].Observacion = "Sin observación";
            } else {
              this.mostrarObservaciones = true;
            }
          }
        }

        Swal.close();
      }
    }, (error) => {
      Swal.fire({
        title: 'Error en la operación',
        text: `No se encontraron datos registrados`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    }, () => Swal.close())
  }

  guardarCualitativo() {
    var mensaje = `¿Desea guardar la información del componente cualitativo?`
    if (this.rol === 'PLANEACION') {
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
        this.request.put(environment.PLANES_MID, `seguimiento/guardar_cualitativo`, { "evidencias": this.seguimiento.evidencia, "cualitativo": this.seguimiento.cualitativo, "cuantitativo": this.seguimiento.cuantitativo, "dependencia": this.rol == 'JEFE_DEPENDENCIA' }, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
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
    if (this.rol === 'PLANEACION') {
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
        this.request.put(environment.PLANES_MID, `seguimiento/guardar_cuantitativo`, { "evidencias": this.seguimiento.evidencia, "cualitativo": this.seguimiento.cualitativo, "cuantitativo": this.seguimiento.cuantitativo, "dependencia": this.rol == 'JEFE_DEPENDENCIA' }, this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
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
      const element = this.datosIndicadores[index];
      if (element.reporteDenominador != "" || element.reporteNumerador != "") {
        var denominador = parseInt(element.reporteDenominador);
        var numerador = parseInt(element.reporteNumerador);
        this.datosIndicadores[index].reporteDenominador = denominador;
        this.datosIndicadores[index].reporteNumerador = numerador;
        if (denominador != NaN && numerador != NaN) {
          this.datosResultados[index].indicador = this.seguimiento.cuantitativo.resultados[index].indicador + Math.round(numerador / denominador * 10) / 10;
          if (!this.denominadorFijo) {
            denominador += this.datosResultados[index].acumuladoDenominador;
          }
          this.datosResultados[index].indicadorAcumulado = this.seguimiento.cuantitativo.resultados[index].indicadorAcumulado + Math.round((this.datosResultados[index].acumuladoNumerador + numerador) / denominador * 10) / 10;

          var meta = parseInt(element.meta);
          var indicadorAcumulado = this.datosResultados[index].indicadorAcumulado;
          if (this.tendencia = "Creciente") {
            this.datosResultados[index].avanceAcumulado = Math.round(indicadorAcumulado / meta * 100 * 10) / 10;
          } else if (this.tendencia = "Decreciente") {
            if (indicadorAcumulado < meta) {
              this.datosResultados[index].avanceAcumulado = Math.round(1 + ((meta - indicadorAcumulado) / meta) * 10) / 10;
            } else {
              this.datosResultados[index].avanceAcumulado = Math.round(1 - ((meta - indicadorAcumulado) / meta) * 10) / 10;
            }
          }
          this.datosResultados[index].brechaExistente = Math.round((meta - indicadorAcumulado) * 10) / 10;
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
}
