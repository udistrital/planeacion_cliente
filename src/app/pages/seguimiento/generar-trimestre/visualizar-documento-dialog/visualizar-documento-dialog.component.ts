import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-visualizar-documento-dialog',
  templateUrl: './visualizar-documento-dialog.component.html',
  styleUrls: ['./visualizar-documento-dialog.component.scss']
})
export class VisualizarDocumentoDialogComponent implements OnInit {

  file: any;
  header = "data:application/pdf;base64,";
  rol: string;
  banderaPUI: boolean;
  readonlyObservacion: boolean;
  mostrar_Observaciones: boolean;
  observacion_dependencia: string;
  observaciones_dependencia: boolean;
  observacion_planeacion: string;
  observaciones_planeacion: boolean;
  observacionText: string;

  constructor(
    private autenticationService: ImplicitAutenticationService,
    public dialogRef: MatDialogRef<VisualizarDocumentoDialogComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.getRol();
    this.readonlyObservacion = data.editable;
    this.mostrar_Observaciones = data.mostrar_Observaciones;
    this.observacion_dependencia = data.Observacion_dependencia;
    this.observaciones_dependencia = data.observaciones_Dependencia;
    this.observacion_planeacion = data.Observacion_planeacion;
    this.observaciones_planeacion = data.observaciones_Planeacion;

    if(this.observaciones_dependencia){
      this.observacionText = this.observacion_dependencia;
    } else if(this.observaciones_planeacion){
      this.observacionText = this.observacion_planeacion;
    }
    this.banderaPUI = data.banderaPUI;
    this.file = this.sanitizer.bypassSecurityTrustResourceUrl(data["url"]);
    Swal.close();
  }

  ngOnInit(): void {
  }

  cerrar() {
    if(this.observaciones_dependencia){
      this.dialogRef.close({ "Id": this.data["Id"], "Observacion_dependencia": this.observacionText , "Observacion_planeacion": this.observacion_planeacion});
    } else if(this.observaciones_planeacion){
      this.dialogRef.close({ "Id": this.data["Id"], "Observacion_planeacion": this.observacionText, "Observacion_dependencia": this.observacion_dependencia});
    } else {
      this.dialogRef.close();
    }
  }

  guardar() {
    if(this.observaciones_dependencia){
      this.dialogRef.close({ "Id": this.data["Id"], "Observacion_dependencia": this.observacionText , "Observacion_planeacion": this.observacion_planeacion});
    } else if(this.observaciones_planeacion){
      this.dialogRef.close({ "Id": this.data["Id"], "Observacion_planeacion": this.observacionText, "Observacion_dependencia": this.observacion_dependencia});
    } else {
      this.dialogRef.close();
    }
  }
  
  getRol() {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA';
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION';
    }
  }

}
