import { Component, OnInit } from '@angular/core';
import { QrService } from '../services/qrService';

@Component({
  selector: 'app-qr',
  templateUrl: './qr.component.html',
  styleUrls: ['./qr.component.scss']
})
export class QrComponent implements OnInit {

  qrValue = btoa(JSON.stringify({user:'fdsanchezl', cc:'123456789'}));
  constructor(private qrService: QrService) {
    console.log(this.qrValue);
    this.qrService.qrData$.subscribe((data)=> {
      if(data !== '') {
      }
    })
  }
  ngOnInit(): void {
  }

}
