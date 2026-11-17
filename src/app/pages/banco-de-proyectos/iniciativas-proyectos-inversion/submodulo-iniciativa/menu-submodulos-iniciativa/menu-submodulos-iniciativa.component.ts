import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ESTADO_SUBMODULO_SIN_FORMULAR, ResumenModulo, ResumenSubmodulo } from '../../utils';

/**
 * Selector de los submódulos de la iniciativa (mat-select fill, como los de Formulación), fijo
 * arriba del formulario, con ‹ › para pasar al anterior o al siguiente (también de un módulo al
 * otro). Al abrirlo, los submódulos van agrupados por módulo (Identificación, Preparación,
 * Anexos), cada uno con el punto y el nombre de su estado.
 */
@Component({
  selector: 'app-menu-submodulos-iniciativa',
  templateUrl: './menu-submodulos-iniciativa.component.html',
  styleUrls: ['./menu-submodulos-iniciativa.component.scss'],
})
export class MenuSubmodulosIniciativaComponent implements OnChanges {
  /** Módulos de la iniciativa, en orden, cada uno con sus submódulos. */
  @Input() modulos: ResumenModulo[] = [];
  /** Clave del submódulo abierto. */
  @Input() actual = '';
  @Output() elegir = new EventEmitter<ResumenSubmodulo>();

  /** Submódulos de todos los módulos, en orden: para contar los formulados y pasar al anterior o al siguiente. */
  submodulos: ResumenSubmodulo[] = [];

  ngOnChanges(): void {
    this.submodulos = (this.modulos || []).reduce((todos, modulo) => todos.concat(modulo.submodulos || []), [] as ResumenSubmodulo[]);
  }

  get formulados(): number {
    return this.submodulos.filter((s) => s.estado && s.estado.codigo_abreviacion !== ESTADO_SUBMODULO_SIN_FORMULAR).length;
  }

  get posicion(): number {
    return this.submodulos.findIndex((s) => s.clave === this.actual);
  }

  get seleccionado(): ResumenSubmodulo | null {
    return this.submodulos[this.posicion] || null;
  }

  get anterior(): ResumenSubmodulo | null {
    return this.posicion > 0 ? this.submodulos[this.posicion - 1] : null;
  }

  get siguiente(): ResumenSubmodulo | null {
    return this.posicion >= 0 ? this.submodulos[this.posicion + 1] || null : null;
  }

  /** trackBy de módulos y submódulos. */
  porClave(_: number, elemento: { clave: string }): string {
    return elemento.clave;
  }

  ir(submodulo: ResumenSubmodulo | null): void {
    if (submodulo && submodulo.clave !== this.actual) {
      this.elegir.emit(submodulo);
    }
  }

  irAClave(clave: string): void {
    this.ir(this.submodulos.find((s) => s.clave === clave) || null);
  }
}
