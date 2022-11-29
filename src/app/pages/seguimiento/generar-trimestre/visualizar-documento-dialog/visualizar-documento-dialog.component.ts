import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';

@Component({
  selector: 'app-visualizar-documento-dialog',
  templateUrl: './visualizar-documento-dialog.component.html',
  styleUrls: ['./visualizar-documento-dialog.component.scss']
})
export class VisualizarDocumentoDialogComponent implements OnInit {

  file: any;
  header = "data:application/pdf;base64,";
  rol: string;
  observacion: string;
  observacionText: string;

  constructor(
    private autenticationService: ImplicitAutenticationService,
    public dialogRef: MatDialogRef<VisualizarDocumentoDialogComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any) {
    this.getRol();
    this.observacion = data.Observacion;
    this.observacionText = this.observacion;
    this.file = this.sanitizer.bypassSecurityTrustResourceUrl(data["url"]);
  }

  ngOnInit(): void {
  }

  cerrar() {
    this.dialogRef.close({ "Id": this.data["Id"], "Observacion": this.observacion });
  }

  guardar() {
    this.dialogRef.close({ "Id": this.data["Id"], "Observacion": this.observacionText });
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
