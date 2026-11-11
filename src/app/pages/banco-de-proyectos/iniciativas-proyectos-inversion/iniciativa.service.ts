import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { Dependencia } from 'src/app/@core/models/dependencia';
import { DataRequest } from 'src/app/@core/models/interfaces/DataRequest.interface';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import { UserService } from '../../services/userService';
import {
  AccionIniciativa,
  Datos,
  Definicion,
  ItemCatalogo,
  IniciativaListado,
  ResumenIniciativa,
  SubmoduloConRelacionadas,
  SubmoduloVista,
  SolicitudCrearIniciativa,
  SolicitudObservacion,
} from './utils';

/** Acceso al API /v1/iniciativa-inversion del mid. Devuelve directamente el Data del sobre. */
@Injectable({
  providedIn: 'root',
})
export class IniciativaService {
  private readonly base = 'iniciativa-inversion';
  private readonly catalogos = new Map<string, Observable<ItemCatalogo[]>>();
  private readonly nombresCatalogo = new Map<string, Map<string, string>>();

  constructor(private request: RequestManager, private usuario: UserService) {}

  /**
   * Unidades del usuario. Las resuelve el mid con Terceros y Oikos (mismos cargos
   * que Formulación); el navegador no consulta Terceros, que no acepta CORS desde
   * cualquier origen. Lista vacía si no tiene ninguna.
   */
  unidadesDelUsuario(): Observable<Dependencia[]> {
    return this.usuario.user$.pipe(
      map((datos: any) => datos && datos.userService && datos.userService.documento),
      filter((documento) => !!documento),
      take(1),
      switchMap((documento) => this.obtener<Dependencia[]>(`${this.base}/unidades/${encodeURIComponent(documento)}`)),
      map((unidades) => unidades || []),
    );
  }

  /** Iniciativas activas, de la más reciente a la más antigua; sin dependencias, todas. */
  iniciativas(dependencias: string[] = []): Observable<IniciativaListado[]> {
    const filtro = dependencias.length ? `?dependencias=${encodeURIComponent(dependencias.join(','))}` : '';
    return this.obtener(`${this.base}/iniciativas${filtro}`);
  }

  /** Crea la iniciativa con la plantilla vigente y todos sus submódulos sin formular. */
  crearIniciativa(solicitud: SolicitudCrearIniciativa): Observable<ResumenIniciativa> {
    return this.datos(this.request.post(environment.PLANES_MID, `${this.base}/iniciativas`, solicitud));
  }

  resumen(iniciativaId: string): Observable<ResumenIniciativa> {
    return this.obtener(`${this.base}/iniciativas/${iniciativaId}`);
  }

  definicion(iniciativaId: string): Observable<Definicion> {
    return this.obtener(`${this.base}/iniciativas/${iniciativaId}/definicion`);
  }

  submodulo(iniciativaId: string, clave: string): Observable<SubmoduloConRelacionadas> {
    return this.obtener(`${this.base}/iniciativas/${iniciativaId}/submodulos/${clave}`);
  }

  guardarSubmodulo(iniciativaId: string, clave: string, version: number, datos: Datos): Observable<SubmoduloVista> {
    const cuerpo = { version, datos };
    return this.datos(this.request.put(environment.PLANES_MID, `${this.base}/iniciativas/${iniciativaId}/submodulos`, cuerpo, clave));
  }

  /**
   * Agrega una observación al historial del submódulo. No cambia la versión, así que no
   * interfiere con el formulario abierto. Si la escribe Planeación, el submódulo queda «Con observaciones».
   */
  agregarObservacion(iniciativaId: string, clave: string, solicitud: SolicitudObservacion): Observable<SubmoduloVista> {
    const ruta = `${this.base}/iniciativas/${iniciativaId}/submodulos/${clave}/observaciones`;
    return this.datos(this.request.post(environment.PLANES_MID, ruta, solicitud));
  }

  /** Planeación da el submódulo por revisado sin observaciones (el historial se conserva). */
  marcarSinObservaciones(iniciativaId: string, clave: string, version: number): Observable<SubmoduloVista> {
    return this.datos(this.request.put(environment.PLANES_MID, `${this.base}/iniciativas/${iniciativaId}/submodulos/${clave}`, { version }, 'revision'));
  }

  ejecutarAccion(iniciativaId: string, accion: AccionIniciativa): Observable<ResumenIniciativa> {
    return this.datos(this.request.put(environment.PLANES_MID, `${this.base}/iniciativas/${iniciativaId}/acciones`, {}, accion));
  }

  /** Catálogo completo; se pide una sola vez por nombre y se reutiliza. */
  catalogo(nombre: string): Observable<ItemCatalogo[]> {
    if (!this.catalogos.has(nombre)) {
      const peticion = this.obtener<ItemCatalogo[]>(`${this.base}/catalogos/${nombre}`).pipe(
        tap((items) => this.nombresCatalogo.set(nombre, new Map(items.map((item) => [item.codigo, item.nombre])))),
        shareReplay(1),
      );
      this.catalogos.set(nombre, peticion);
    }
    return this.catalogos.get(nombre);
  }

  /** Nombre de un elemento de un catálogo ya cargado; si no está cargado, el código. */
  nombreEnCatalogo(catalogo: string, codigo: string): string {
    const nombres = this.nombresCatalogo.get(catalogo);
    return (nombres && nombres.get(codigo)) || codigo;
  }

  private obtener<T>(ruta: string): Observable<T> {
    return this.datos<T>(this.request.get(environment.PLANES_MID, ruta));
  }

  /**
   * Extrae el Data del sobre { Success, Status, Message, Data }. RequestManager arma
   * cada petición sobre un BehaviorSubject (el del token) que nunca se completa: sin
   * take(1) la respuesta llega pero el observable no termina, y forkJoin espera para siempre.
   */
  private datos<T>(peticion: Observable<any>): Observable<T> {
    return peticion.pipe(
      take(1),
      map((respuesta: DataRequest<T>) => (respuesta ? respuesta.Data : null)),
    );
  }
}

/** Mensaje legible de un error del API (RequestManager lo envuelve en { status, error }). */
export function mensajeDeError(error: any): string {
  return (error && error.error && error.error.Message) || 'No fue posible completar la operación. Intente de nuevo.';
}
