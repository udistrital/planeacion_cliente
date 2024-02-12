import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class NotificacionesService {
    private path = environment.NOTIFICACION_MID_SERVICE;
    private arm = environment.ARM_AWS_NOTIFICACIONES;

    constructor(private http: HttpClient) { }
 
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

    enviarNotificacion(asunto: string, destinatarioId: string, mensaje: string, token: any): Observable<any> {
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
            'Authorization': `Bearer ${token}`
        });
        return this.http.post(`${this.path}/notificaciones/enviar`, elemento, { headers: headers });
    }
}