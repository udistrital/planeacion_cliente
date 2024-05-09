import { RequestManager } from 'src/app/pages/services/requestManager';
import { DataRequest } from '../../models/interfaces/DataRequest.interface';
import { TipoParametro, TipoPlanesCRUD } from '../../models/tipo';

// template-method
export abstract class ConsultaIdentificador {
  constructor(
    private request: RequestManager,
    private path: string,
    private endpoint: string
  ) {}
  abstract obtenerIdentificador(data: TipoPlanesCRUD | TipoParametro): string;
  abstract obtenerFiltros(): string;
  async obtenerCodigo() {
    const codigo = await new Promise<string>((resolve, reject) => {
      const filters = this.obtenerFiltros();
      this.request
        .get(this.path, `${this.endpoint}?query=${filters}`)
        .subscribe({
          next: (data: DataRequest) => {
            if (data.Data[0]) {
              resolve(this.obtenerIdentificador(data.Data[0]));
            } else {
              const error = Error(
                `No existe un codigo para la consulta ${this.path}${this.endpoint}?query=${filters}`
              );
              console.error(error);
              reject(error);
            }
          },
        });
    });
    return codigo;
  }
}
