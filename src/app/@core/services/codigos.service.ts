import { Injectable } from '@angular/core';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import { ConsultaIdentificador } from './ConsultaCodigos/ConsultaIdentificador';
import { ConsultaSnakeCase } from './ConsultaCodigos/ConsultaSnakeCase';
import { ConsultaPascalCase } from './ConsultaCodigos/ConsultaPascalCase';

@Injectable({
  providedIn: 'root',
})
export class CodigosService {
  private consultas: {
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

  private constructor(private request: RequestManager) {}

  public async cargarIdentificadores() {
    let promesas: Promise<void>[] = [];
    let consultaTipo: ConsultaIdentificador;
    const rutas = Object.keys(this.consultas);
    rutas.forEach((ruta) => {
      const endpoints = Object.keys(this.consultas[ruta]);
      endpoints.forEach((endpoint) => {
        const abreviaciones = Object.keys(this.consultas[ruta][endpoint]);
        abreviaciones.forEach((abreviacion) => {
          if (ruta == 'PLANES_CRUD') {
            consultaTipo = new ConsultaSnakeCase(
              this.request,
              environment.PLANES_CRUD,
              endpoint,
              abreviacion
            );
          } else if (ruta == 'PARAMETROS_SERVICE') {
            consultaTipo = new ConsultaPascalCase(
              this.request,
              environment.PARAMETROS_SERVICE,
              endpoint,
              abreviacion
            );
          }
          const promesa = consultaTipo
            .obtenerCodigo()
            .then((codigo: string) => {
              this.consultas[ruta][endpoint][abreviacion] = codigo;
              // if (endpoint == 'tipo-plan') {
              //   console.log(
              //     `${codigo}\nthis.codigosService.getId('${ruta}', '${endpoint}', '${abreviacion}')`
              //   );
              // }
            });
          promesas.push(promesa);
        });
      });
    });
    await Promise.all(promesas);
    console.log(this.consultas);
  }

  /**
   * Obtener el Id cargado previamente
   * @param ruta nombre de la variable como se encuentra en environment
   * @param endpoint endpoint al que se apunta en el API
   * @param abreviacion codigo de abreviación del objeto al que se le obtendra el id
   * @returns codigo del objeto
   */
  public getId(ruta: string, endpoint: string, abreviacion: string) {
    return this.consultas[ruta][endpoint][abreviacion];
  }
}
