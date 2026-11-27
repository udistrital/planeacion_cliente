import { Injectable } from '@angular/core';
import { defer, Observable } from 'rxjs';
import { map, shareReplay, switchMap, take, tap } from 'rxjs/operators';
import { Dependencia } from 'src/app/@core/models/dependencia';
import { DataRequest } from 'src/app/@core/models/interfaces/DataRequest.interface';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../../services/requestManager';
import {
  AccionIniciativa,
  Actor,
  Datos,
  Definicion,
  ItemCatalogo,
  IniciativaListado,
  ReferenciaDocumento,
  ResumenIniciativa,
  SubmoduloConRelacionadas,
  SubmoduloVista,
  SolicitudDocumento,
} from './utils';

/**
 * Acceso al API /v1/iniciativa-inversion del mid. Devuelve directamente el Data del sobre.
 *
 * Cada petición lleva al actor (documento y todos los roles del usuario): en las consultas va en
 * la URL y en las escrituras, en el cuerpo. El mid decide con él qué puede hacer el usuario.
 */
@Injectable({
  providedIn: 'root',
})
export class IniciativaService {
  private readonly base = 'iniciativa-inversion';
  private readonly catalogos = new Map<string, Observable<ItemCatalogo[]>>();
  private readonly nombresCatalogo = new Map<string, Map<string, string>>();
  /** El usuario de la sesión; se lee una vez. */
  private readonly actor$: Observable<Actor> = defer(() =>
    Promise.all([this.autenticacion.getRole(), this.autenticacion.getDocument()]),
  ).pipe(
    map(([roles, documento]) => ({ usuario: String(documento || ''), roles: (roles as string[]) || [] })),
    shareReplay(1),
  );

  constructor(private request: RequestManager, private autenticacion: ImplicitAutenticationService) {}

  /** El usuario de la sesión y sus roles. */
  actor(): Observable<Actor> {
    return this.actor$.pipe(take(1));
  }

  /**
   * Unidades del usuario. Las resuelve el mid con Terceros y Oikos (mismos cargos
   * que Formulación); el navegador no consulta Terceros, que no acepta CORS desde
   * cualquier origen. Lista vacía si no tiene ninguna.
   */
  unidadesDelUsuario(): Observable<Dependencia[]> {
    return this.actor().pipe(
      switchMap((actor) => this.obtener<Dependencia[]>(`${this.base}/unidades/${encodeURIComponent(actor.usuario)}`)),
      map((unidades) => unidades || []),
    );
  }

  /** Iniciativas que consulta el usuario (la OAP, todas; los demás, las de sus unidades), de la más reciente a la más antigua. */
  iniciativas(): Observable<IniciativaListado[]> {
    return this.obtenerComoActor(`${this.base}/iniciativas`);
  }

  /** Crea la iniciativa con la plantilla vigente, a nombre del usuario y para la unidad indicada. */
  crearIniciativa(dependenciaId: string): Observable<ResumenIniciativa> {
    return this.enviarComoActor('post', `${this.base}/iniciativas`, { dependencia_id: dependenciaId });
  }

  /** Vista general de la iniciativa, con lo que el usuario puede hacer con ella. */
  resumen(iniciativaId: string): Observable<ResumenIniciativa> {
    return this.obtenerComoActor(`${this.base}/iniciativas/${iniciativaId}`);
  }

  definicion(iniciativaId: string): Observable<Definicion> {
    return this.obtener(`${this.base}/iniciativas/${iniciativaId}/definicion`);
  }

  submodulo(iniciativaId: string, clave: string): Observable<SubmoduloConRelacionadas> {
    return this.obtener(`${this.base}/iniciativas/${iniciativaId}/submodulos/${clave}`);
  }

  guardarSubmodulo(iniciativaId: string, clave: string, version: number, datos: Datos): Observable<SubmoduloVista> {
    return this.enviarComoActor('put', `${this.base}/iniciativas/${iniciativaId}/submodulos/${clave}`, { version, datos });
  }

  /**
   * Agrega una observación al historial del submódulo, que queda «Con observaciones»; su versión
   * no cambia. Si es el último veredicto de la OAP, la iniciativa cambia de estado (va en
   * estado_iniciativa).
   */
  agregarObservacion(iniciativaId: string, clave: string, texto: string): Observable<SubmoduloVista> {
    return this.enviarComoActor('post', `${this.base}/iniciativas/${iniciativaId}/submodulos/${clave}/observaciones`, { texto });
  }

  /** Veredicto «Aprobado» de la OAP sobre el submódulo (el historial de observaciones se conserva). */
  aprobarSubmodulo(iniciativaId: string, clave: string, version: number): Observable<SubmoduloVista> {
    return this.enviarComoActor('put', `${this.base}/iniciativas/${iniciativaId}/submodulos/${clave}/revision`, { version });
  }

  /**
   * Sube el archivo de un campo documento (Anexos) al gestor documental, a través del mid, y
   * devuelve su referencia. No guarda el submódulo: eso lo hace el guardado automático que sigue a la carga.
   */
  subirDocumento(iniciativaId: string, clave: string, solicitud: SolicitudDocumento): Observable<ReferenciaDocumento> {
    return this.enviarComoActor('post', `${this.base}/iniciativas/${iniciativaId}/submodulos/${clave}/documentos`, solicitud);
  }

  /** Cambia el estado de la iniciativa con una acción; rechazar exige el motivo. */
  ejecutarAccion(iniciativaId: string, accion: AccionIniciativa, motivo?: string): Observable<ResumenIniciativa> {
    return this.enviarComoActor('put', `${this.base}/iniciativas/${iniciativaId}/acciones/${accion}`, motivo ? { motivo } : {});
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

  /** GET con el actor en la consulta: ?usuario=...&roles=A,B. */
  private obtenerComoActor<T>(ruta: string): Observable<T> {
    return this.actor().pipe(
      switchMap((actor) => {
        const consulta = `usuario=${encodeURIComponent(actor.usuario)}&roles=${encodeURIComponent(actor.roles.join(','))}`;
        return this.obtener<T>(`${ruta}?${consulta}`);
      }),
    );
  }

  /**
   * POST o PUT con el actor en el cuerpo. La ruta va completa: RequestManager.put agrega «/id»
   * al final, así que se le pasa el último segmento como id.
   */
  private enviarComoActor<T>(metodo: 'post' | 'put', ruta: string, cuerpo: object): Observable<T> {
    return this.actor().pipe(
      switchMap((actor) => {
        const conActor = { ...cuerpo, ...actor };
        if (metodo === 'post') {
          return this.datos<T>(this.request.post(environment.PLANES_MID, ruta, conActor));
        }
        const corte = ruta.lastIndexOf('/');
        return this.datos<T>(this.request.put(environment.PLANES_MID, ruta.slice(0, corte), conActor, ruta.slice(corte + 1)));
      }),
    );
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
