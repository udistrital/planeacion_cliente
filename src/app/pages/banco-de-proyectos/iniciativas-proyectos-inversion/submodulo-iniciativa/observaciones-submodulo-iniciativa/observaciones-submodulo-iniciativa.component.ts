import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { mensajeDeError, IniciativaService } from '../../iniciativa.service';
import { MAXIMO_TEXTO_OBSERVACION, Observacion, SubmoduloVista } from '../../utils';
import { delMasReciente, esDeLaOAP, nombreDeRol } from '../../utils/observaciones.utils';

export interface DatosObservaciones {
  iniciativaId: string;
  clave: string;
  nombreSubmodulo: string;
  /** Historial en orden de registro, como llega del API. */
  observaciones: Observacion[];
  /** Documento del usuario: marca sus propias entradas. */
  usuario: string;
  /** Puede publicar (lo dice el mid en los permisos); si no, el modal es de solo lectura. El rol con que firma lo pone el mid. */
  puedePublicar: boolean;
  /** Qué pasa al publicar, p. ej. que el submódulo queda «Con observaciones». */
  aviso?: string;
}

/**
 * Modal de observaciones de un submódulo, de la más reciente a la más antigua. Si el usuario
 * puede publicar, muestra el formulario; si no, es solo lectura. Cada publicación se emite en
 * (publicada) para que la pantalla actualice el estado del submódulo sin esperar a que se cierre.
 */
@Component({
  selector: 'app-observaciones-submodulo-iniciativa',
  templateUrl: './observaciones-submodulo-iniciativa.component.html',
  styleUrls: ['./observaciones-submodulo-iniciativa.component.scss'],
})
export class ObservacionesSubmoduloIniciativaComponent {
  @Output() readonly publicada = new EventEmitter<SubmoduloVista>();

  readonly maximo = MAXIMO_TEXTO_OBSERVACION;
  readonly nombreDeRol = nombreDeRol;
  readonly esDeLaOAP = esDeLaOAP;
  entradas: Observacion[];
  texto = '';
  publicando = false;

  constructor(private servicio: IniciativaService, @Inject(MAT_DIALOG_DATA) public datos: DatosObservaciones) {
    this.entradas = delMasReciente(datos.observaciones);
  }

  get puedePublicar(): boolean {
    return this.datos.puedePublicar;
  }

  get puedeEnviar(): boolean {
    return this.puedePublicar && !this.publicando && this.texto.trim() !== '';
  }

  /** Agrega la observación al historial; el modal sigue abierto y la muestra de primera. */
  publicar(): void {
    if (!this.puedeEnviar) {
      return;
    }
    this.publicando = true;
    this.servicio.agregarObservacion(this.datos.iniciativaId, this.datos.clave, this.texto.trim()).subscribe(
      (vista) => {
        this.publicando = false;
        this.texto = '';
        this.entradas = delMasReciente(vista.observaciones);
        this.publicada.emit(vista);
      },
      (error) => {
        this.publicando = false;
        Swal.fire({ icon: 'error', title: 'No se publicó la observación', text: mensajeDeError(error) });
      },
    );
  }

  esPropia(observacion: Observacion): boolean {
    return !!this.datos.usuario && observacion.usuario === this.datos.usuario;
  }

  /** Cabecera «Nombre · Rol»; sin nombre (observaciones antiguas o Terceros no respondió), solo el rol. */
  autor(observacion: Observacion): string {
    const rol = nombreDeRol(observacion.rol);
    const nombre = (observacion.usuario_nombre || '').trim();
    return nombre ? `${nombre} · ${rol}` : rol;
  }

  /** Iniciales del rol para el avatar: «Planeación» -> P, «Jefe de dependencia» -> JD. */
  // iniciales(observacion: Observacion): string {
  //   return nombreDeRol(observacion.rol)
  //     .split(/\s+/)
  //     .filter((palabra) => palabra.length > 2)
  //     .slice(0, 2)
  //     .map((palabra) => palabra[0].toUpperCase())
  //     .join('');
  // }
  /** Iniciales del nombre si existe («Ana María Pérez» -> AM); si no, las del rol («Jefe de dependencia» -> JD). */
  iniciales(observacion: Observacion): string {
    const fuente = (observacion.usuario_nombre || '').trim() || nombreDeRol(observacion.rol);
    return fuente
      .split(/\s+/)
      .filter((palabra) => palabra.length > 2)
      .slice(0, 2)
      .map((palabra) => palabra[0].toUpperCase())
      .join('');
  }

  porId(indice: number, observacion: Observacion): string {
    return observacion._id || `${observacion.fecha}-${indice}`;
  }
}
