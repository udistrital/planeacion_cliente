import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../pages/services/requestManager';
import { DataRequest } from '../models/interfaces/DataRequest.interface';

@Injectable({
  providedIn: 'root',
})
export class CodigosService {
  private idsCargados = false;
  private consultasCodigos: {
    [key: string]: { [key: string]: { [key: string]: string } };
  } = {
    PARAMETROS_SERVICE: {
      tipo_parametro: { PC: '' },
    },
    PLANES_CRUD: {
      'estado-plan': {
        EF_SP: '',
        F_SP: '',
        ER_SP: '',
        R_SP: '',
        PA_SP: '',
        A_SP: '',
        AP_SP: '',
        APR_SP: '',
        RV_SP: '',
      },
      'tipo-identificacion': { IC_SP: '', IR_SP: '', ID_SP: '' },
      'tipo-plan': {
        PR_SP: '',
        PAF_SP: '',
        PAI_SP: '',
        PD_SP: '',
        PLI_SP: '',
        PUI_SP: '',
        PRI_SP: '',
        MPAI_SP: '',
        PDD_SP: '',
        API_SP: '',
      },
      'tipo-seguimiento': { F_SP: '', S_SP: '', SI_SP: '', FI_SP: '' },
    },
  };

  constructor(private request: RequestManager) {}

  /**
   * Obtener el Id cargado previamente
   * @param ruta nombre de la variable como se encuentra en environment
   * @param endpoint endpoint al que se apunta en el API
   * @param abreviacion codigo de abreviación del objeto al que se le obtendra el id
   * @returns codigo del objeto
   */
  public async getId(ruta: string, endpoint: string, abreviacion: string) {
    if (this.consultasCodigos[ruta][endpoint][abreviacion] === '') {
      await new Promise((resolve, reject) => {
        if (ruta == 'PLANES_CRUD') {
          this.request
            .get(
              environment.PLANES_CRUD,
              `${endpoint}?query=codigo_abreviacion:${abreviacion},activo:true`
            )
            .subscribe({
              next: (data: DataRequest) => {
                if (data.Data[0]) {
                  data.Data[0]._id;
                  resolve(data.Data[0]._id);
                }
              },
            });
        } else if (ruta == 'PARAMETROS_SERVICE') {
          this.request
            .get(
              environment.PARAMETROS_SERVICE,
              `${endpoint}?query=CodigoAbreviacion:${abreviacion},Activo:true`
            )
            .subscribe({
              next: (data: DataRequest) => {
                if (data.Data[0]) {
                  resolve(data.Data[0].Id.toString());
                }
              },
            });
        }
      }).then((codigo: string) => {
        this.consultasCodigos[ruta][endpoint][abreviacion] = codigo;
      });
    }
    return this.consultasCodigos[ruta][endpoint][abreviacion];
  }
}
