import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';

@Component({
  selector: 'app-visualizar-soportes-dialog',
  templateUrl: './visualizar-soportes-dialog.component.html',
  styleUrls: ['./visualizar-soportes-dialog.component.scss']
})
export class VisualizarSoportesDialogComponent implements OnInit {
  file: any;
  header = "data:application/pdf;base64,";
  observacion: string;
  observacionText: string;
  constructor(
    public dialogRef: MatDialogRef<VisualizarSoportesDialogComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) { 
    this.observacion = data.Observacion;
    this.observacionText = this.observacion;
    this.file = this.sanitizer.bypassSecurityTrustResourceUrl(data["url"]);
  }

  ngOnInit(): void {
  }

  cerrar() {
    this.dialogRef.close();
  }

  guardar() {
    this.dialogRef.close();
  }

}
