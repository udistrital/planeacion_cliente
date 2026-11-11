import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { IniciativaService } from '../../iniciativa.service';
import { ItemCatalogo, NodoDefinicion } from '../../utils';

const MAXIMO_SUGERENCIAS = 50;

/**
 * Selección de un elemento de catálogo con búsqueda (los catálogos de la iniciativa pueden
 * tener miles de elementos). Si el campo depende de otro (depende_de), solo
 * muestra los hijos del valor elegido allí. Emite el código del elemento.
 */
@Component({
  selector: 'app-campo-catalogo-iniciativa',
  templateUrl: './campo-catalogo-iniciativa.component.html',
  styleUrls: ['./campo-catalogo-iniciativa.component.scss'],
})
export class CampoCatalogoIniciativaComponent implements OnInit, OnChanges, OnDestroy {
  @Input() nodo: NodoDefinicion;
  @Input() valor: string | null = null;
  @Output() valorChange = new EventEmitter<string | null>();
  @Input() padre: string | null = null;
  @Input() deshabilitado = false;

  readonly control = new FormControl('');
  sugerencias$: Observable<ItemCatalogo[]>;
  cargando = true;
  private items: ItemCatalogo[] = [];
  private readonly destruir$ = new Subject<void>();

  constructor(private servicio: IniciativaService) {}

  ngOnInit(): void {
    this.sugerencias$ = this.control.valueChanges.pipe(
      startWith(''),
      map((texto) => this.filtrar(typeof texto === 'string' ? texto : '')),
    );
    this.servicio
      .catalogo(this.nodo.dato.catalogo)
      .pipe(takeUntil(this.destruir$))
      .subscribe((items) => {
        this.items = items;
        this.cargando = false;
        this.mostrarValorActual();
      });
  }

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios.deshabilitado) {
      this.deshabilitado ? this.control.disable({ emitEvent: false }) : this.control.enable({ emitEvent: false });
    }
    const padreCambio = cambios.padre && !cambios.padre.firstChange;
    if (padreCambio && !this.cargando && this.valor && !this.perteneceAlPadre(this.buscar(this.valor))) {
      // El valor ya no pertenece al padre elegido. Se limpia en el siguiente ciclo
      // para no cambiar los datos del formulario en plena detección de cambios.
      Promise.resolve().then(() => this.seleccionar(null));
    }
    if (cambios.valor) {
      this.mostrarValorActual();
    }
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  /** Texto que muestra el campo para el elemento elegido. */
  readonly mostrar = (item: ItemCatalogo | string | null): string => {
    if (typeof item === 'string') {
      return item;
    }
    return item ? `${item.codigo} - ${item.nombre}` : '';
  }

  seleccionar(item: ItemCatalogo | null): void {
    this.valor = item ? item.codigo : null;
    this.valorChange.emit(this.valor);
    this.control.setValue(item || '', { emitEvent: false });
  }

  /** Si se escribió sin elegir una sugerencia, vuelve a mostrar el valor guardado. */
  alSalir(): void {
    if (typeof this.control.value === 'string') {
      this.mostrarValorActual();
    }
  }

  private filtrar(texto: string): ItemCatalogo[] {
    const busqueda = normalizar(texto);
    return this.items
      .filter((item) => this.perteneceAlPadre(item))
      .filter((item) => !busqueda || normalizar(`${item.codigo} ${item.nombre}`).includes(busqueda))
      .slice(0, MAXIMO_SUGERENCIAS);
  }

  private perteneceAlPadre(item: ItemCatalogo | undefined): boolean {
    return !this.nodo.dato.depende_de || (!!item && item.padre === this.padre);
  }

  private buscar(codigo: string): ItemCatalogo | undefined {
    return this.items.find((item) => item.codigo === codigo);
  }

  private mostrarValorActual(): void {
    this.control.setValue(this.valor ? this.buscar(this.valor) || this.valor : '', { emitEvent: false });
  }
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
