import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import { TipoParametro } from '../../models/tipo';
import { Consulta } from './Consulta';


export class ConsultaParametrosTipo extends Consulta {
  constructor(
    request: RequestManager,
    endpoint: string,
    private codigoAbreviacion: string
  ) {
    super(request, endpoint);
  }
  obtenerPath(): string {
    return environment.PARAMETROS_SERVICE;
  }
  obtenerFiltros(): string {
    return `CodigoAbreviacion:${this.codigoAbreviacion},Activo:true`;
  }
  obtenerIdentificador(data: TipoParametro): string {
    return data.Id.toString();
  }
}
