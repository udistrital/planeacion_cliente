import { Component, ViewChild, ViewEncapsulation, OnInit, AfterViewInit } from '@angular/core';
import { QrScannerComponent } from 'angular2-qrscanner';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-qrscan',
  templateUrl: './qrscan.component.html',
  styleUrls: ['./qrscan.component.scss']
})
export class QrscanComponent implements AfterViewInit {
  lectura: any = {};
  @ViewChild(QrScannerComponent, { static: false }) qrScannerComponent: QrScannerComponent;
  videoDevices: any = null;
  dispositivoActual: any = null;
  constructor() { }

  ngAfterViewInit(): void {
    this.qrScannerComponent.getMediaDevices()
      .then((devices) => {
        this.videoDevices = devices.filter((video) => (video.kind === 'videoinput'));
      });
    this.qrScannerComponent.capturedQr.subscribe(async (result) => {
      this.lectura = JSON.parse(atob(result));
      if (this.lectura) {
        const { value: accept } = await Swal.fire({
          html: `
            <h3 class="title-term-conditional">Información de ingreso</h3>
            <p class="text-term-condional">
                <b>Usuario:</b> ${this.lectura.user}<br>
                <b>Identificación</b> ${this.lectura.cc}<br>
                <b>Ingreso:</b> AUTORIZADO<br>
            </p>`,
          confirmButtonText:'Aceptar',
        })
        this.dispositivoActual = null;
      }
    });
  }

  selectDevice(device) {
    this.dispositivoActual = device;
    this.qrScannerComponent.chooseCamera.next(device);
  }

  clear() {
    this.dispositivoActual = null;
    this.lectura = ''
  }



}
