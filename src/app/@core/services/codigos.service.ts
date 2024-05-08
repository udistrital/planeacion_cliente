import { Injectable } from '@angular/core';
import { Consulta } from './ConsultaCodigos/Consulta';
import { ConsultaPlanes } from './ConsultaCodigos/ConsultaPlanesCRUD';
import { RequestManager } from 'src/app/pages/services/requestManager';
import { ConsultaParametrosTipo } from './ConsultaCodigos/ConsultaParametro';

enum rutas {
  PLANES_CRUD,
  PARAMETROS_SERVICE,
}
export enum TIPO {
  SeguimientoFormulacion,
  IdentificacionContratistas,
  IdentificacionRecursos,
  IdentificacionDocentes,
  PlanProyecto,
  PlanDesarrolloEstrategico,
  PlanIndicativo,
  EstadoEnFormulacion,
  EstadoFormulado,
  EstadoEnRevision,
  EstadoRevisado,
  EstadoPreAval,
  EstadoAval,
  EstadoAjustePresupuestal,
  EstadoRevisionVerificada,
  ParametroPerfilContratistas,
}
@Injectable({
  providedIn: 'root',
})
export class CodigosService {
  private CONSULTAS = [
    {
      path: rutas.PLANES_CRUD,
      endpoints: [
        {
          endpoint: 'tipo-seguimiento',
          codigosAbreviacion: ['F_SP'],
        },
        {
          endpoint: 'tipo-identificacion',
          codigosAbreviacion: ['IC_SP', 'IR_SP', 'ID_SP'],
        },
        {
          endpoint: 'tipo-plan',
          codigosAbreviacion: ['PR_SP', 'PD_SP', 'PLI_SP'],
        },
        {
          endpoint: 'estado-plan',
          codigosAbreviacion: [
            'EF_SP',
            'F_SP',
            'ER_SP',
            'R_SP',
            'PA_SP',
            'A_SP',
            'AP_SP',
            'RV_SP',
          ],
        },
      ],
    },
    {
      path: rutas.PARAMETROS_SERVICE,
      endpoints: [
        {
          endpoint: 'tipo_parametro',
          codigosAbreviacion: ['PC'],
        },
      ],
    },
  ];
  private codigos: string[] = [];

  private constructor(private request: RequestManager) {}

  public async cargarIdentificadores() {
    let pos = 0;
    for (let i = 0; i < this.CONSULTAS.length; i++) {
      const consulta = this.CONSULTAS[i];
      for (let j = 0; j < consulta.endpoints.length; j++) {
        const endpoint = consulta.endpoints[j];
        let consultaTipo: Consulta;
        for (let k = 0; k < endpoint.codigosAbreviacion.length; k++) {
          const codigoAbreviacion = endpoint.codigosAbreviacion[k];
          if (consulta.path == rutas.PLANES_CRUD) {
            consultaTipo = new ConsultaPlanes(
              this.request,
              endpoint.endpoint,
              codigoAbreviacion
            );
          } else if (consulta.path == rutas.PARAMETROS_SERVICE) {
            consultaTipo = new ConsultaParametrosTipo(
              this.request,
              endpoint.endpoint,
              codigoAbreviacion
            );
          }
          await consultaTipo.obtenerCodigo().then((codigo: string) => {
            this.codigos[pos++] = codigo;
          });
        }
      }
    }
  }

  public getId(posicion: number) {
    return this.codigos[posicion];
  }
}
