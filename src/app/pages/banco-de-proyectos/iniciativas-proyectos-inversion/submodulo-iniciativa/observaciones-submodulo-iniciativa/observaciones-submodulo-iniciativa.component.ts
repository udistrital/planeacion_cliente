import { Component, EventEmitter, Inject, Output } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { mensajeDeError, IniciativaService } from '../../iniciativa.service';
import { MAXIMO_TEXTO_OBSERVACION, Observacion, SubmoduloVista } from '../../utils';
import { delMasReciente, esDePlaneacion, nombreDeRol } from '../../utils/observaciones.utils';

export interface DatosObservaciones {
  iniciativaId: string;
  clave: string;
  nombreSubmodulo: string;
  /** Historial en orden de registro, como llega del API. */
  observaciones: Observacion[];
  /** Documento del usuario: firma lo que publique y marca sus propias entradas. */
  usuario: string;
  /** Rol con el que publica; null abre el modal en solo lectura (p. ej. desde la tabla de submódulos). */
  rol: string | null;
  /** Qué pasa al publicar, p. ej. que el submódulo queda «Con observaciones». */
  aviso?: string;
}

/**
 * Modal de observaciones de un submódulo, como un blog: arriba el cuadro para publicar
 * (solo si se abre con un rol) y debajo las entradas, de la más reciente a la más
 * antigua. Desde el formulario del submódulo se abre para leer y publicar; desde la
 * tabla de submódulos, solo para leer. Cada publicación se avisa con (publicada) para
 * que la pantalla actualice el estado del submódulo sin esperar a que se cierre el modal.
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
  readonly esDePlaneacion = esDePlaneacion;
  entradas: Observacion[];
  texto = '';
  publicando = false;

  constructor(private servicio: IniciativaService, @Inject(MAT_DIALOG_DATA) public datos: DatosObservaciones) {
    this.entradas = delMasReciente(datos.observaciones);
  }

  get puedePublicar(): boolean {
    return !!this.datos.rol;
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
    const solicitud = { texto: this.texto.trim(), rol: this.datos.rol, usuario: this.datos.usuario };
    this.servicio.agregarObservacion(this.datos.iniciativaId, this.datos.clave, solicitud).subscribe(
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

  /** Iniciales del rol para el avatar: «Planeación» -> P, «Jefe de dependencia» -> JD. */
  iniciales(observacion: Observacion): string {
    return nombreDeRol(observacion.rol)
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
