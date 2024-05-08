import { RequestManager } from 'src/app/pages/services/requestManager';
import { environment } from 'src/environments/environment';
import { TipoPlanesCRUD } from '../../models/tipo';
import { Consulta } from './Consulta';

export class ConsultaPlanes extends Consulta {
  constructor(
    request: RequestManager,
    endpoint: string,
    private codigoAbreviacion: string
  ) {
    super(request, endpoint);
  }
  obtenerPath(): string {
    return environment.PLANES_CRUD;
  }
  obtenerFiltros(): string {
    return `codigo_abreviacion:${this.codigoAbreviacion},activo:true`;
  }
  obtenerIdentificador(data: TipoPlanesCRUD): string {
    return data._id;
  }
}
