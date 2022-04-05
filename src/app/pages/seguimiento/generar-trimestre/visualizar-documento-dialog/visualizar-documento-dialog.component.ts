import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-visualizar-documento-dialog',
  templateUrl: './visualizar-documento-dialog.component.html',
  styleUrls: ['./visualizar-documento-dialog.component.scss']
})
  export class VisualizarDocumentoDialogComponent implements OnInit {

  file : any;
  header = "data:application/pdf;base64,";


  constructor(
    public dialogRef: MatDialogRef<VisualizarDocumentoDialogComponent>,
    private sanitizer: DomSanitizer,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    const url = this.header + data;

    this.file = this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  ngOnInit(): void {
  }

  cerrar(){
    this.dialogRef.close();
  }

}
