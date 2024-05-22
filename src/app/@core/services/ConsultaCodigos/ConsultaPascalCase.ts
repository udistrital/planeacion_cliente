import { RequestManager } from 'src/app/pages/services/requestManager';
import { TipoParametro } from '../../models/tipo';
import { ConsultaIdentificador } from './ConsultaIdentificador';

export class ConsultaPascalCase extends ConsultaIdentificador {
  constructor(
    request: RequestManager,
    path: string,
    endpoint: string,
    private codigoAbreviacion: string
  ) {
    super(request, path, endpoint);
  }
  obtenerFiltros(): string {
    return `CodigoAbreviacion:${this.codigoAbreviacion},Activo:true`;
  }
  obtenerIdentificador(data: TipoParametro): string {
    return data.Id.toString();
  }
}
