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
import {Location} from '@angular/common';

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
  indexActividad : string;
  trimestreId : string;
  formGenerarTrimestre : FormGroup;
  files: any[]  = [];
  indicadores : File[] = [];
  documentos : any[] = [];
  indicadorSelected: boolean;
  seguimiento : any = {};
  indicadorActivo : string;
  documentoSeleccionado : File = null;

  constructor(
    private autenticationService: ImplicitAutenticationService,
    private activatedRoute: ActivatedRoute,
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private _location: Location,
    private router: Router) {
    this.activatedRoute.params.subscribe(prm => {
      this.planId = prm['plan_id'];
      this.indexActividad = prm['index'];
      this.trimestreId = prm['trimestre_id'];
    });
    this.getRol();
    this.loadInidicadores();
    this.loadData();
    this.indicadorSelected = false;

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
      observaciones: ['', Validators.required]
    });
  }

  getRol() {
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

  onChangeI(event: string){
    if (event == undefined){
      this.indicadorSelected = false;
    }else{
      let reg = / /g;
      this.indicadorActivo = event.replace(reg, '_');
      this.indicadorSelected = true;

      if (this.seguimiento[this.indicadorActivo] != null){
        this.formGenerarTrimestre.get('avancePeriodo').setValue(this.seguimiento[this.indicadorActivo].avancePeriodo);
        this.formGenerarTrimestre.get('avanceAcumulado').setValue(this.seguimiento[this.indicadorActivo].avanceAcumulado);
        this.formGenerarTrimestre.get('producto').setValue(this.seguimiento[this.indicadorActivo].producto);
        this.formGenerarTrimestre.get('evidencia').setValue(this.seguimiento[this.indicadorActivo].evidencia);
        this.formGenerarTrimestre.get('logros').setValue(this.seguimiento[this.indicadorActivo].logros);
        this.formGenerarTrimestre.get('dificultades').setValue(this.seguimiento[this.indicadorActivo].dificultades);
        this.formGenerarTrimestre.get('observaciones').setValue(this.seguimiento[this.indicadorActivo].observaciones);
      }else{
        this.formGenerarTrimestre.get('avancePeriodo').setValue('');
        this.formGenerarTrimestre.get('avanceAcumulado').setValue('');
        this.formGenerarTrimestre.get('producto').setValue('');
        this.formGenerarTrimestre.get('evidencia').setValue('');
        this.formGenerarTrimestre.get('logros').setValue('');
        this.formGenerarTrimestre.get('dificultades').setValue('');
        this.formGenerarTrimestre.get('observaciones').setValue('');
      }
    }
  }

  onChangeD(event){
    if (event != null){
      console.log(event)
      this.documentoSeleccionado = event;
    }else{
      this.documentoSeleccionado = null;
    }

  }

  onChangeDocumento(event){
    console.log(event)
    if (event != undefined){
      let aux = event.files[0];
      const found = this.documentos.find(element => element.name == aux.name);
      if (found == undefined){
        this.documentos.push(aux);
        Swal.fire({
          title: 'Documento Cargado',
          text: `Revise el campo de soportes para visualizar o eliminar`,
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        })
      }else{
        Swal.fire({
          title: 'Error en la operación',
          text: `El documento ya se encuentra cargado`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2000
        })
      }

    }else{
      Swal.fire({
        title: 'Error en la operación',
        text: `No se pudo subir el documento`,
        icon: 'warning',
        showConfirmButton: false,
        timer: 2500
      })
    }

    console.log(this.documentos)
  }

  loadInidicadores(){
    this.request.get(environment.PRUEBA, `seguimiento/get_indicadores/`+ this.planId).subscribe((data: any) => {
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

  guardarDataIndicador(){
    let documentos  = this.convertirDocumentos();

    this.seguimiento[this.indicadorActivo] = {
      avancePeriodo : this.formGenerarTrimestre.get('avancePeriodo').value,
      avanceAcumulado : this.formGenerarTrimestre.get('avanceAcumulado').value,
      producto : this.formGenerarTrimestre.get('producto').value,
      evidencia : this.formGenerarTrimestre.get('evidencia').value,
      logros : this.formGenerarTrimestre.get('logros').value,
      dificultades : this.formGenerarTrimestre.get('dificultades').value,
      observaciones : this.formGenerarTrimestre.get('observaciones').value,
      
    }
  }


  loadData(){
    this.request.get(environment.PRUEBA, `seguimiento/get_seguimiento/`+ this.planId+ `/`+ this.indexActividad +`/`+this.trimestreId).subscribe((data: any) => {
      if (data.Data != '') {
        this.seguimiento = data.Data;
        // this.formGenerarTrimestre.get('avancePeriodo').setValue(this.seguimiento.avancePeriodo);
        // this.formGenerarTrimestre.get('avanceAcumulado').setValue(this.seguimiento.avanceAcumulado);
        // this.formGenerarTrimestre.get('producto').setValue(seguimiento.producto);
        // //this.formGenerarTrimestre.get('evidencia').setValue(seguimiento.evidencia);
        // this.formGenerarTrimestre.get('logros').setValue(seguimiento.logros);
        // this.formGenerarTrimestre.get('dificultades').setValue(seguimiento.dificultades);
        // this.formGenerarTrimestre.get('observaciones').setValue(seguimiento.observaciones);
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

  guardarSeguimiento(){

    this.convertirDocumentos();

    let seg = {
      avancePeriodo : this.formGenerarTrimestre.get('avancePeriodo').value,
      avanceAcumulado : this.formGenerarTrimestre.get('avanceAcumulado').value,
        
    }



    this.request.post(environment.PRUEBA, `seguimiento/guardar_seguimiento/`+ this.planId + `/` + this.indexActividad + `/` + this.trimestreId, this.seguimiento).subscribe((data: any) => {
      if (data) {
        Swal.fire({
          title: 'Información de seguimiento actualizada',
          text: 'El seguimiento se ha guardado satisfactoriamente',
          icon: 'success'
        })
      }
    })
  }

  eliminarDocumento(){
    for (let i = 0; i<this.documentos.length; i++){
      if (this.documentos[i].name == this.documentoSeleccionado.name){
        this.documentos.splice(i,1);
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


  convertirDocumentos() {
    let header = "data:application/pdf;base64,";
    let documentosPost : any[]= this.documentos;
    let documentoBase64 : string;

    for (let i =0; i<this.documentos.length; i++){
      const file = this.documentos[i];
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        let aux = new String (reader.result);
        documentoBase64= aux.replace(header, "")   
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
        console.log(body)
        this.request.post(environment.GESTO_DOCUMENTAL_MID, `document/upload`, body).subscribe((data: any) => {
          if (data) {
            console.log(data);
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
    }
    console.log(documentosPost);
  }

}
