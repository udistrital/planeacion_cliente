import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { FormControl, FormGroup } from '@angular/forms';

@Injectable({
    providedIn: 'root'
})
export class NotificacionesService {
    private path = environment.NOTIFICACION_MID_SERVICE;
    private arm = environment.ARM_AWS_NOTIFICACIONES;

    validarEnvio: FormGroup;

    constructor(private http: HttpClient) { }

    onSubmit() {
        const { asunto, destinatarioId, mensaje, token } = this.validarEnvio.value;

        const respuesta = this.enviarNotificacion(asunto, destinatarioId, mensaje);
        
    }

    verificarSuscripcion(token: any): Observable<any> {
        const elemento = {
            Endpoint: token.email,
            ArnTopic: this.arm
        };
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        return this.http.post(`${this.path}/notificaciones/suscripcion`, elemento, { headers: headers });
    }

    suscripcion(token: any): Observable<any> {
        const elemento = {
            ArnTopic: this.arm,
            Suscritos: [
                {
                    Endpoint: token.email,
                    Id: token.documento,
                    Protocolo: 'email'
                }
            ]
        };
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        });
        return this.http.post(`${this.path}/notificaciones/suscribir`, elemento, { headers: headers });
    }

    enviarNotificacion(asunto: string, destinatarioId: string, mensaje: string): Observable<any> {
        const elemento = {
            ArnTopic: this.arm,
            Asunto: asunto,
            Atributos: {},
            DestinatarioId: [destinatarioId],
            IdDeduplicacion: '',
            IdGrupoMensaje: '',
            Mensaje: mensaje,
            RemitenteId: '',
        };

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': "fa7ee7c62dab1e25447754f665a54c53"
        });

        return this.http.post(`${this.path}/notificaciones/enviar`, elemento, { headers: headers });
    }

    traerNotificacion(nombreCola: string): Observable<any> {
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': "fa7ee7c62dab1e25447754f665a54c53"
        });
        return this.http.get(this.path + 'colas/mensajes?nombre=' + nombreCola + '&numMax=1', { headers: headers });
    }

    borrarNotificaciones(nombreCola: string, contratistaId: string): Observable<any> {
        const elemento = {
            NombreCola: nombreCola,
            Filtro: {
                Remitente: contratistaId,
            }
        };
        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': "fa7ee7c62dab1e25447754f665a54c53"
        });
        return this.http.post(this.path + 'colas/mensajes/', elemento, { headers: headers });
    }
}