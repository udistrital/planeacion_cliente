import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  private path = environment.NOTIFICACION_MID_SERVICE;
  private arm = environment.ARM_AWS_NOTIFICACIONES;

  constructor(
    private autenticationService: ImplicitAutenticationService,
    private http: HttpClient
  ) {}

  //Enviar notificaciones a un usuario (en la sección de atributos)
  enviarNotificacion(
    idCola: string,
    asunto: string,
    mensaje: string,
    usuarioDestino: string
  ) {
    var documento: any = this.autenticationService.getDocument();
    const datos = {
      ArnTopic: this.arm,
      Asunto: asunto,
      Atributos: {
        IdUsuario: usuarioDestino,
      },
      DestinatarioId: [idCola],
      IdDeduplicacion: new Date().getTime().toString(),
      IdGrupoMensaje: usuarioDestino,
      Mensaje: mensaje,
      RemitenteId: documento.__zone_symbol__value || 'pruebasplaneacion',
    };
    return new Promise((resolve, reject) => {
      this.http.post(this.path + 'notificaciones/enviar', datos).subscribe(
        (data: any) => {
          if (data.Data != null) {
            resolve(data.Data);
          } else {
            reject('Error al registrar notificación');
          }
        },
        (error: any) => {
          reject(error);
        }
      );
    });
  }

  //Lista las notificaciones vinculadas a un usuario
  consultarNotificaciones(nombreCola: string) {
    var documento: any = this.autenticationService.getDocument();
    var documentoValor = documento.__zone_symbol__value || 'pruebasplaneacion';
    return new Promise((resolve, reject) => {
      this.http
        .get(
          this.path +
            'colas/mensajes/espera?nombre=' +
            nombreCola +
            '&tiempoEspera=1&cantidad=10&filtro=IdUsuario:' +
            documentoValor
        )
        .subscribe(
          (data: any) => {
            if (data.Data != null) {
              resolve(data.Data);
            } else {
              reject('Error al obtener notificaciones');
            }
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }

  //Borrar una notificacion por id
  borrarNotificacion(nombreCola: string, idNotificacion: string) {
    return new Promise((resolve, reject) => {
      this.http
        .get(this.path + 'colas/mensajes?nombre=' + nombreCola + '&numMax=10')
        .subscribe(
          (data: any) => {
            if (data.Data != null) {
              const notificacionBorrar = data.Data.filter(
                (notificacion: any) =>
                  notificacion.Body.MessageId === idNotificacion
              );
              this.http
                .post(
                  this.path + 'colas/mensajes/' + nombreCola,
                  notificacionBorrar[0]
                )
                .subscribe(
                  (data: any) => {
                    if (data.Data != null) {
                      resolve('Notificación eliminada');
                    } else {
                      reject('Error al eliminar notificación');
                    }
                  },
                  (error: any) => {
                    reject(error);
                  }
                );
            } else {
              reject('Error al obtener notificaciones');
            }
          },
          (error: any) => {
            reject(error);
          }
        );
    });
  }
}
