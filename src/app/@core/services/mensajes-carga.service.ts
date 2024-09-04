import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class MensajesCargaService {

  constructor() { }

  mostrarMensajeCarga(banderaPeticion: boolean = false): void {
    Swal.fire({
      title: (!banderaPeticion) ? 'Cargando datos...' : 'Procesando petición...',
      allowEscapeKey: false,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  }
}
