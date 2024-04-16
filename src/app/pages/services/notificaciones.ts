import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';

@Injectable({
  providedIn: 'root',
})
export class NotificacionesService {
  private path = environment.NOTIFICACION_MID_SERVICE;
  private arm = environment.ARM_AWS_NOTIFICACIONES;

  constructor(
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private http: HttpClient
  ) {}

  mensajesFormulacion = {
    A: "El asistente de [Nombre de la Unidad] ha comenzado la formulación del plan [Nombre del plan] para la vigencia [VIGENCIA]. El plan se encuentra en estado En Formulación.",
    B: "El asistente de [Nombre de la Unidad] ha finalizado la formulación del plan [Nombre del plan] de la vigencia [VIGENCIA]. El plan se encuentra en estado Formulado.",
    C: "El asistente de planeación ha comenzado la revision del plan [Nombre del plan] en la unidad [Nombre de la Unidad] para la vigencia [VIGENCIA]. El plan se encuentra en estado En Revisión.",
    D: "El asistente de planeación ha finalizado la revisión; en el proceso de formulación del plan [Nombre del plan] en la unidad [Nombre de la Unidad] para la vigencia [VIGENCIA].",
    E: "El jefe de [Nombre de la Unidad] ha realizado la Verificación de la formulación para el plan [Nombre del plan] en la vigencia [VIGENCIA]. El plan se encuentra en estado Verificado",
    F: "El Jefe de planeación ha finalizado la revisión; en el proceso de formulación del plan [Nombre del plan] de la unidad [Nombre de la Unidad] en la vigencia [VIGENCIA].",
    G: "El asistente de [Nombre de la Unidad] ha realizado los ajustes y ha enviado la formulación del plan [Nombre del plan] en la vigencia [VIGENCIA]. El plan se encuentra en estado pre avalado.",
    H: "El jefe de planeación ha finalizado la revisión; aceptando la formulación y asignando aval para el plan [Nombre del plan] de la unidad [Nombre de la Unidad] en la vigencia [VIGENCIA]. El plan se encuentra en estado Avalado",
  }

  obtenerColas(rolesRemitentes:string[]) : string[] {
    let listaColas = rolesRemitentes.map(elemento => {
      let palabras = elemento.split(' ');
      let palabrasCapitalizadas = palabras.map(palabra => palabra.charAt(0).toUpperCase() + palabra.slice(1));
      return "idcola" + palabrasCapitalizadas.join('');
    });
    return listaColas
  }

  enviarNotificacion(itemMensaje:string, rolesRemitentes:string[], datos: any) {
    let codigosAbreviacion = []
    if (rolesRemitentes.some(str => str.includes("jefe"))) {
      codigosAbreviacion.push("JO")
    } 
    if (rolesRemitentes.some(str => str.includes("asistente"))) {
      codigosAbreviacion.push("AS_D", "NR")
    }
    
    //Obtener los id de los diferentes cargos por codigos de abreviación
    this.request.get(environment.PARAMETROS_SERVICE, `parametro?query=CodigoAbreviacion__in:${codigosAbreviacion.join("|")}`)
      .subscribe((data: any) => {
        if (data) {
          let idsCargos = data.Data.map((element:any) => element.Id);

          //Añadir dependencia de planeación si aplica
          let dependencias:string = datos.unidadId.toString()
          if (rolesRemitentes.some(str => str.includes("planeacion"))) {
            dependencias += "|11" //id dependencia planeacion
          }

          //Obtener los usuarios filtrados por dependencia y cargo
          this.request.get(environment.TERCEROS_SERVICE, `vinculacion?query=DependenciaId__in:${dependencias},CargoId__in:319`)
            .subscribe((data: any) => {
              if (data && Array.isArray(data) && data.length > 0 && Object.keys(data[0]).length > 0) {
                //Obtener los documentos de los usuarios
                const promises = [];
                for (let index = 0; index < data.length; index++) {
                  const TerceroPrincipalId = data[index].TerceroPrincipalId.Id;
                  const promise = new Promise((resolve, reject) => {
                    this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion?query=TerceroId.Id:${TerceroPrincipalId}`)
                      .subscribe((userData: any) => {
                        if (userData && typeof userData[0].Numero === "string" && userData[0].Numero !== "") {
                          resolve(userData[0].Numero);
                        } else {
                          resolve(null); // O rechaza la promesa si no hay datos válidos
                        }
                      }, (error) => {
                        reject(error);
                      });
                  });
                  promises.push(promise);
                }

                // Esperar a que todas las promesas se resuelvan
                Promise.all(promises)
                  .then((documentos) => {
                    documentos = documentos.filter(doc => doc !== null);
                    // En este punto, todos los documentos están disponibles
                    // Enviar la notificación
                    var mensajeFinal = this.mensajesFormulacion[itemMensaje]
                      .replace("[Nombre de la Unidad]", datos.nombreUnidad)
                      .replace("[Nombre del plan]", datos.nombrePlan)
                      .replace("[VIGENCIA]", datos.vigencia);
                    const colas = this.obtenerColas(rolesRemitentes);
                    this.publicarNotificacion(colas, "Sin asunto", mensajeFinal, documentos);
                  })
                  .catch((error) => {
                    console.error("Error al obtener documentos:", error);
                  });
              }
          }, (error) => {
            console.log(error);
          })
        }
    }, (error) => {
      console.log(error);
    })
  }  

  //Enviar notificacion a usuarios(sección de Atributos)
  publicarNotificacion(
    colas: string[],
    asunto: string,
    mensaje: string,
    usuariosDestino: string[]
  ) {
    var documento: any = this.autenticationService.getDocument();
    const datos = {
      ArnTopic: this.arm,
      Asunto: asunto,
      Atributos: {
        IdUsuarios: usuariosDestino,
      },
      DestinatarioId: colas,
      IdDeduplicacion: new Date().getTime().toString(),
      IdGrupoMensaje: "",
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
