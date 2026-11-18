import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IniciativaService } from '../../iniciativa.service';
import { ItemCatalogo, NodoDefinicion } from '../../utils';

/**
 * Catálogo con varias opciones (dato.multiple) como casillas, una por elemento. Emite la lista de
 * códigos marcados en el orden del catálogo. Es para listas cortas; los catálogos largos usan la
 * búsqueda de campo-catalogo.
 */
@Component({
  selector: 'app-casillas-catalogo-iniciativa',
  templateUrl: './casillas-catalogo-iniciativa.component.html',
  styleUrls: ['./casillas-catalogo-iniciativa.component.scss'],
})
export class CasillasCatalogoIniciativaComponent implements OnInit, OnDestroy {
  @Input() nodo: NodoDefinicion;
  @Input() valor: string[] | null = null;
  @Output() valorChange = new EventEmitter<string[]>();
  @Input() deshabilitado = false;

  items: ItemCatalogo[] = [];
  cargando = true;
  private readonly destruir$ = new Subject<void>();

  constructor(private servicio: IniciativaService) {}

  ngOnInit(): void {
    this.servicio
      .catalogo(this.nodo.dato.catalogo)
      .pipe(takeUntil(this.destruir$))
      .subscribe(
        (items) => {
          this.items = items;
          this.cargando = false;
        },
        () => (this.cargando = false),
      );
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  porCodigo(_: number, item: ItemCatalogo): string {
    return item.codigo;
  }

  marcada(item: ItemCatalogo): boolean {
    return (this.valor || []).includes(item.codigo);
  }

  marcar(item: ItemCatalogo, marcada: boolean): void {
    const marcadas = new Set(this.valor || []);
    if (marcada) {
      marcadas.add(item.codigo);
    } else {
      marcadas.delete(item.codigo);
    }
    // En el orden del catálogo; un código guardado que ya no esté en el catálogo se conserva al final
    // para que el servidor lo reporte.
    const enCatalogo = this.items.map((elemento) => elemento.codigo).filter((codigo) => marcadas.has(codigo));
    const fuera = Array.from(marcadas).filter((codigo) => !enCatalogo.includes(codigo));
    this.valor = enCatalogo.concat(fuera);
    this.valorChange.emit(this.valor);
  }
}
