import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { ESTADOS_SUBMODULO_POR_FORMULAR, ResumenModulo, ResumenSubmodulo } from '../../utils';

/**
 * Selector de los submódulos de la iniciativa, agrupados por módulo y con su estado. Permite pasar
 * al anterior o al siguiente (también entre módulos) y muestra cuántos van formulados.
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
    return this.submodulos.filter((s) => s.estado && !ESTADOS_SUBMODULO_POR_FORMULAR.includes(s.estado.codigo_abreviacion)).length;
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
