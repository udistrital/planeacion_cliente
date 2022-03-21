import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-seguimiento',
  templateUrl: './generar-trimestre.component.html',
  styleUrls: ['./generar-trimestre.component.scss']
})
export class GenerarTrimestreComponent implements OnInit {
  displayedColumns: string[] = ['id', 'unidad', 'estado', 'vigencia', 'periodo', 'seguimiento', 'observaciones', 'enviar'];
  dataSource: MatTableDataSource<any>;
  selectedFiles: any;

  rol: string;
  planId: string;
  indexActividad: string;
  trimestreId: string;
  formGenerarTrimestre: FormGroup;
  indicadores: File[] = [];
  documentos: any[] = [];
  indicadorSelected: boolean;
  seguimiento: any = {};
  indicadorActivo: string;
  documentoSeleccionado: File = null;
  trimestre: string = '';
  auxDocumentos: string[] = [];
  auxDocumentosP: string;
  generalData: any = {};
  generalDatar: any = {};
  listIndicadores: any = {};
  textoDeInput: string = null
  mostrarObservaciones: boolean;
  documentoPlaneacion: any;
  seguimientoCompleto: any;
  estadoSeguimiento : string;
  estados : any[];
  readonlyFormulario: boolean;
  readonlyObservacion: boolean;


  constructor(
    private autenticationService: ImplicitAutenticationService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request: RequestManager,
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
    this.getSeguimiento();
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
      observacionesP: ['',]
    });
    this.indicadorSelected = false;
    this.mostrarObservaciones = false;
  }

  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA')) {
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
    this.request.get(environment.PARAMETROS_SERVICE, `parametro_periodo?query=Id:` + this.trimestreId).subscribe((data: any) => {
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

  loadEstados(){
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

  getSeguimiento() {
    this.request.get(environment.PLANES_CRUD, `seguimiento?query=plan_id:` + this.planId + `,periodo_id:` + this.trimestreId).subscribe((data: any) => {
      if (data.Data) {
        this.seguimientoCompleto = data.Data[0];
        this.getEstado();
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
    this.request.get(environment.PLANES_CRUD, `estado-seguimiento/` + this.seguimientoCompleto.estado_seguimiento_id).subscribe((data: any) => {
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

  verificarFormulario(){
    if (this.rol === 'PLANEACION'){
      if (this.estadoSeguimiento === 'En Reporte' ||this.estadoSeguimiento === 'Aprobado para evaluación' ){
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = false;
      }else if (this.estadoSeguimiento === 'Generado'){
        this.readonlyFormulario = true;
        this.readonlyObservacion = false;
        this.mostrarObservaciones = true;
      }else if (this.estadoSeguimiento === 'Observación'){
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = true;
      }else if (this.estadoSeguimiento === 'Ajustado'){
        this.readonlyFormulario = true;
        this.readonlyObservacion = false;
        this.mostrarObservaciones = true;
      }
      // else if (this.estadoSeguimiento === 'Aprobado para evaluación'){
      //   this.readonlyFormulario = true;
      //   this.readonlyObservacion = true;
      //   this.mostrarObservaciones = false;
      // }
    }else if (this.rol == 'JEFE_DEPENDENCIA'){
      if (this.estadoSeguimiento === 'En Reporte'){
        this.readonlyFormulario = false;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = false;
      }else if (this.estadoSeguimiento === 'Generado'){
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = false;
      }else if (this.estadoSeguimiento === 'Observación'){
        this.readonlyFormulario = false;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = true;
      }else if (this.estadoSeguimiento === 'Ajustado'){
        this.readonlyFormulario = true;
        this.readonlyObservacion = true;
        this.mostrarObservaciones = true;
      }else if (this.estadoSeguimiento === 'Aprobado para evaluación'){
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

  onChangeI(event: string) {
    this.documentoSeleccionado= null;
    if (event == undefined) {
      this.indicadorSelected = false;
      this.auxDocumentos = [];
      this.documentos = [];
      this.documentoPlaneacion = undefined;
      this.formGenerarTrimestre.get('avancePeriodo').setValue('');
      this.formGenerarTrimestre.get('avanceAcumulado').setValue('');
      this.formGenerarTrimestre.get('producto').setValue('');
      this.formGenerarTrimestre.get('evidencia').setValue('');
      this.formGenerarTrimestre.get('logros').setValue('');
      this.formGenerarTrimestre.get('dificultades').setValue('');
      this.formGenerarTrimestre.get('observaciones').setValue('');
      this.formGenerarTrimestre.get('observacionesP').setValue('');
      this.formGenerarTrimestre.get('autor').setValue('');
    } else {
      let reg = / /g;
      this.indicadorActivo = event.replace(reg, '_');
      this.indicadorSelected = true;

      if (this.seguimiento[this.indicadorActivo] != null) {
        this.auxDocumentos = [];
        this.documentos = [];
        this.formGenerarTrimestre.get('avancePeriodo').setValue(this.seguimiento[this.indicadorActivo].avancePeriodo);
        this.formGenerarTrimestre.get('avanceAcumulado').setValue(this.seguimiento[this.indicadorActivo].avanceAcumulado);
        this.formGenerarTrimestre.get('producto').setValue(this.seguimiento[this.indicadorActivo].producto);
        this.formGenerarTrimestre.get('evidencia').setValue(this.seguimiento[this.indicadorActivo].evidencia);
        this.formGenerarTrimestre.get('logros').setValue(this.seguimiento[this.indicadorActivo].logros);
        this.formGenerarTrimestre.get('dificultades').setValue(this.seguimiento[this.indicadorActivo].dificultades);
        this.formGenerarTrimestre.get('observaciones').setValue(this.seguimiento[this.indicadorActivo].observaciones);
        if (this.seguimiento[this.indicadorActivo]["documentos"] != "" && this.seguimiento[this.indicadorActivo]["documentos"] != undefined) {
          this.loadDocumentos(this.seguimiento[this.indicadorActivo]["documentos"]);
        }
        if (this.seguimiento[this.indicadorActivo]["observacionesP"] != "") {
          this.formGenerarTrimestre.get('observacionesP').setValue(this.seguimiento[this.indicadorActivo].observacionesP);
          this.formGenerarTrimestre.get('autor').setValue(this.seguimiento[this.indicadorActivo].autor);
        } else {
          this.getDataUser();
        }
        if (this.seguimiento[this.indicadorActivo]["documentoP"] != "" && this.seguimiento[this.indicadorActivo]["documentoP"] != undefined) {
          this.loadDocumentoP(this.seguimiento[this.indicadorActivo]["documentoP"]);
        }
        else {
          this.documentoPlaneacion = undefined;
        }
      } else {
        this.auxDocumentos = [];
        this.documentos = [];
        this.documentoPlaneacion = undefined;
        this.formGenerarTrimestre.get('avancePeriodo').setValue('');
        this.formGenerarTrimestre.get('avanceAcumulado').setValue('');
        this.formGenerarTrimestre.get('producto').setValue('');
        this.formGenerarTrimestre.get('evidencia').setValue('');
        this.formGenerarTrimestre.get('logros').setValue('');
        this.formGenerarTrimestre.get('dificultades').setValue('');
        this.formGenerarTrimestre.get('observaciones').setValue('');
        this.formGenerarTrimestre.get('observacionesP').setValue('');
        this.formGenerarTrimestre.get('autor').setValue('');

      }
    }
  }

  onChangeD(event) {
    if (event != null) {
      this.documentoSeleccionado = event;
    } else {
      this.documentoSeleccionado = null;
    }

  }

  onChangeDocumento(event) {
    if (event != undefined) {
      let aux = event.files[0];
      const found = this.documentos.find(element => element.name == aux.name);
      if (found == undefined) {
        this.documentos.push(aux);
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

  onChangeDocumentoP(event) {
    if (event != undefined) {
      let aux = event.files[0];
      const found = this.documentos.find(element => element.name == aux.name);
      if (this.documentoPlaneacion == undefined || this.documentoPlaneacion.name != aux.name) {
        this.documentoPlaneacion = aux;
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
            "periodo_id": this.trimestreId,
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
        "periodo_id": this.trimestreId,
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

  guardarDataIndicador() {
    this.convertirDocumentos().then(() => {
      let aux = this.auxDocumentos.toString();
      this.seguimiento[this.indicadorActivo] = {
        avancePeriodo: this.formGenerarTrimestre.get('avancePeriodo').value,
        avanceAcumulado: this.formGenerarTrimestre.get('avanceAcumulado').value,
        producto: this.formGenerarTrimestre.get('producto').value,
        evidencia: this.formGenerarTrimestre.get('evidencia').value,
        logros: this.formGenerarTrimestre.get('logros').value,
        dificultades: this.formGenerarTrimestre.get('dificultades').value,
        observaciones: this.formGenerarTrimestre.get('observaciones').value,
        documentos: this.auxDocumentos.toString(),
        observacionesP: this.formGenerarTrimestre.get('observacionesP').value,
        autor: this.formGenerarTrimestre.get('autor').value,
        documentoP: this.auxDocumentosP
      };
    })
    Swal.fire({
      title: 'Informacion de indicador actualizada',
      text: `Para guardar los cambios oprima el boton Guardar`,
      icon: 'success',
      showConfirmButton: false,
      timer: 2000
    })
  }


  loadData() {
    this.request.get(environment.PLANES_MID, `seguimiento/get_seguimiento/` + this.planId + `/` + this.indexActividad + `/` + this.trimestreId).subscribe((data: any) => {
      if (data.Data != '') {
        this.seguimiento = data.Data;
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
        })
      }
    })
  }

  eliminarDocumento() {
    for (let i = 0; i < this.documentos.length; i++) {
      if (this.documentos[i].name == this.documentoSeleccionado.name) {
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


  revisarDocumento(bandera: string): void {

    let header = "data:application/pdf;base64,";
    let documentoBase64: string;

    if (bandera === 'documento') {
      if (this.documentoSeleccionado["file"] == undefined) {
        const file = this.documentoSeleccionado;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          let aux = new String(reader.result);
          documentoBase64 = aux.replace(header, "");
          const dialogRef = this.dialog.open(VisualizarDocumentoDialogComponent, {
            width: '1200',
            minHeight: 'calc(100vh - 90px)',
            height: '80%',
            data: documentoBase64
          });
        }

      } else {
        const dialogRef = this.dialog.open(VisualizarDocumentoDialogComponent, {
          width: '1200',
          minHeight: 'calc(100vh - 90px)',
          height: '80%',
          data: this.documentoSeleccionado["file"]
        });
      }
    } else if ('documentoP') {
      if (this.documentoPlaneacion["file"] == undefined) {
        const file = this.documentoPlaneacion;
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
          let aux = new String(reader.result);
          documentoBase64 = aux.replace(header, "");
          const dialogRef = this.dialog.open(VisualizarDocumentoDialogComponent, {
            width: '1200',
            minHeight: 'calc(100vh - 90px)',
            height: '80%',
            data: documentoBase64
          });
        }

      } else {
        const dialogRef = this.dialog.open(VisualizarDocumentoDialogComponent, {
          width: '1200',
          minHeight: 'calc(100vh - 90px)',
          height: '80%',
          data: this.documentoPlaneacion["file"]
        });
      }
    }



    // dialogRef.afterClosed().subscribe(result => {
    //   if (result == undefined){
    //     return undefined;
    //   } else {
    //     this.postData(result);
    //   }
    // });
  }


  convertirDocumentos() {
    let message: string = '';
    let resolveRef;
    let rejectRef;
    let dataPromise: Promise<string> = new Promise((resolve, reject) => {
      resolveRef = resolve;
      rejectRef = reject;
    });
    let header = "data:application/pdf;base64,";
    let documentosPost: any[] = this.documentos;
    let documentoBase64: string;
    this.cargarDocumentoPlaneacion().then(() => {
      if (this.documentos.length > 0) {
        for (let i = 0; i < this.documentos.length; i++) {
          if (this.documentos[i]["file"] == undefined) {
            const file = this.documentos[i];
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
              let aux = new String(reader.result);
              documentoBase64 = aux.replace(header, "")
              let bodyPost = {
                IdTipoDocumento: 60,
                nombre: this.documentos[i].name,
                metadatos: {
                  dato_a: "Soporte planeacion"
                },
                descripcion: "Documento de soporte para seguimiento de plan de acción",
                file: documentoBase64
              }
              let body: any[] = [];
              body.push(bodyPost);
              this.request.post(environment.GESTOR_DOCUMENTAL_MID, `document/upload`, body).subscribe((data: any) => {
                if (data) {
                  this.auxDocumentos.push(data.res.Enlace)
                  if (i == this.documentos.length - 1)
                    resolveRef(message)
                } else {
                  Swal.fire({
                    title: 'Error al crear identificación. Intente de nuevo',
                    icon: 'warning',
                    showConfirmButton: false,
                    timer: 2500
                  })
                }
              })

            };
          } else {
            this.auxDocumentos.push(this.documentos[i]["uid"]);
            resolveRef(message);
          }
        }
      } else {
        resolveRef(message);
      }
    })
    return dataPromise;
  }

  cargarDocumentoPlaneacion() {
    let message: string = '';
    let resolveRef;
    let rejectRef;
    let dataPromise: Promise<string> = new Promise((resolve, reject) => {
      resolveRef = resolve;
      rejectRef = reject;
    });

    if (this.documentoPlaneacion != undefined) {
      let header = "data:application/pdf;base64,";
      let documentoBase64: string;
      const file = this.documentoPlaneacion;
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let aux = new String(reader.result);
        documentoBase64 = aux.replace(header, "")
        let bodyPost = {
          IdTipoDocumento: 60,
          nombre: this.documentoPlaneacion.name,
          metadatos: {
            dato_a: "Soporte Observaciones planeacion"
          },
          descripcion: "Documento de soporte para seguimiento del plan de acción",
          file: documentoBase64
        }
        let body: any[] = [];
        body.push(bodyPost);
        this.request.post(environment.GESTOR_DOCUMENTAL_MID, `document/upload`, body).subscribe((data: any) => {
          if (data) {
            this.auxDocumentosP = data.res.Enlace;
            resolveRef(message);
          } else {
            Swal.fire({
              title: 'Error al cargar documento. Intente de nuevo',
              icon: 'warning',
              showConfirmButton: false,
              timer: 2500
            })
            resolveRef(message);

          }
        })
      };
    } else {
      this.auxDocumentosP = '';
      resolveRef(message);
    }
    return dataPromise;
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
        this.request.put(environment.PLANES_CRUD, `seguimiento`, mod, this.seguimientoCompleto._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Seguimiento Generado',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.getSeguimiento();
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
        this.request.put(environment.PLANES_CRUD, `seguimiento`, mod, this.seguimientoCompleto._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Observación Cancelada',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.getSeguimiento();
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
        this.request.put(environment.PLANES_CRUD, `seguimiento`, mod, this.seguimientoCompleto._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Reporte Aprobado',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.getSeguimiento();
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
        this.request.put(environment.PLANES_CRUD, `seguimiento`, mod, this.seguimientoCompleto._id).subscribe((data: any) => {
          if (data) {
            Swal.fire({
              title: 'Reporte reenviado correctamente',
              icon: 'success',
            }).then((result) => {
              if (result.value) {
                this.getSeguimiento();
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


