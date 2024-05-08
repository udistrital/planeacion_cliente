import { RequestManager } from "src/app/pages/services/requestManager";
import { DataRequest } from "../../models/interfaces/DataRequest.interface";
import { TipoParametro, TipoPlanesCRUD } from "../../models/tipo";

// template-method
export abstract class Consulta {
  constructor(private request: RequestManager, private endpoint:string) {}
  abstract obtenerPath(): string;
  abstract obtenerIdentificador(data: TipoPlanesCRUD | TipoParametro): string;
  abstract obtenerFiltros(): string;
  async obtenerCodigo() {
    const codigo = new Promise<string>((resolve, reject) => {
      const path = this.obtenerPath();
      const filters = this.obtenerFiltros();
      this.request.get(path, `${this.endpoint}?query=${filters}`).subscribe({
        next: (data: DataRequest) => {
          if (data.Data[0]) {
            resolve(this.obtenerIdentificador(data.Data[0]));
          } else {
            const error = Error(
              `No existe un codigo para la consulta ${path}${this.endpoint}?query=${filters}`
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
