import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import { TipoPlanesCRUD } from '../../models/tipo';
import { ConsultaIdentificador } from './ConsultaIdentificador';

export class ConsultaSnakeCase extends ConsultaIdentificador {
  constructor(
    request: RequestManager,
    path: string,
    endpoint: string,
    private codigoAbreviacion: string
  ) {
    super(request, path, endpoint);
  }
  obtenerFiltros(): string {
    return `codigo_abreviacion:${this.codigoAbreviacion},activo:true`;
  }
  obtenerIdentificador(data: TipoPlanesCRUD): string {
    return data._id;
  }
}
