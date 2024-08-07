import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { RequestManager } from '../../services/requestManager';
import { environment } from 'src/environments/environment';
import { Vigencia } from './utils/habilitar-reporte.models';
import { DataRequest } from 'src/app/@core/models/interfaces/DataRequest.interface';

@Injectable({
  providedIn: 'root'
})
export class HabilitarReporteService {

  private trimestresSubject = new Subject<any>();

  constructor(
    private request: RequestManager,
  ) { }

  async loadTrimestres(vigencia: Vigencia) {
    Swal.fire({
      title: 'Cargando períodos',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
    this.request.get(environment.PLANES_MID, `seguimiento/trimestres/` + vigencia.Id).subscribe((data: DataRequest) => {
      if (data.Data != null) {
        this.trimestresSubject.next(data);
      } else {
        this.trimestresSubject.next(null);
      }
    }, (error) => {
      this.trimestresSubject.next(error);
    });
  }

  getTrimestresSubject(): Subject<any> {
    return this.trimestresSubject;
  }

  // Función para validar un ObjectId
  isValidObjectId(id: string): boolean {
    // Utiliza una expresión regular para verificar el formato del ObjectId
    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
    
    // Verifica si el id tiene el formato correcto
    return objectIdRegex.test(id);
  }
}
