import { ConnectedPosition } from '@angular/cdk/overlay';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnDestroy,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { MAT_OPTION_PARENT_COMPONENT, MatOption, MatOptionSelectionChange } from '@angular/material/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { IniciativaService } from '../../iniciativa.service';
import { ANCHO_LISTA_EN_CELDA, ItemCatalogo, NodoDefinicion } from '../../utils';
import { seVe } from '../../utils/scroll.utils';

/**
 * Catálogo con varias opciones (dato.multiple) como casillas, una por elemento. Emite la lista de
 * códigos marcados en el orden del catálogo. Es para listas cortas; los catálogos largos usan la
 * búsqueda de campo-catalogo.
 *
 * Dentro de una celda de tabla (p. ej. las sedes de un resultado esperado) se ve como las listas de
 * campo-catalogo: el campo muestra los nombres elegidos y la flecha, y debajo se abre una lista del
 * mismo ancho con las mismas opciones de Material (mat-option), aquí de varias opciones (con casilla,
 * por MAT_OPTION_PARENT_COMPONENT). Marcar una no la cierra; se cierra con un clic fuera de ella,
 * con Escape o si el campo deja de verse al desplazar la página.
 */
@Component({
  selector: 'app-casillas-catalogo-iniciativa',
  templateUrl: './casillas-catalogo-iniciativa.component.html',
  styleUrls: ['./casillas-catalogo-iniciativa.component.scss'],
  providers: [{ provide: MAT_OPTION_PARENT_COMPONENT, useValue: { multiple: true } }],
})
export class CasillasCatalogoIniciativaComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() nodo: NodoDefinicion;
  @Input() valor: string[] | null = null;
  @Output() valorChange = new EventEmitter<string[]>();
  @Input() deshabilitado = false;
  /** Dentro de una celda de tabla: campo de una línea con la lista de opciones desplegable. */
  @Input() enCelda = false;
  /** Nombre accesible de la celda (p. ej. "Localización (Sede) 3"). */
  @Input() etiquetaCelda = '';
  /** Texto de la celda sin nada elegido (p. ej. "Si aplica" u "Obligatorio"). */
  @Input() textoVacio = '';

  @ViewChild('caja') private caja?: ElementRef<HTMLElement>;
  @ViewChild('disparador') private disparador?: ElementRef<HTMLButtonElement>;
  @ViewChildren(MatOption) private opciones: QueryList<MatOption>;

  readonly anchoLista = ANCHO_LISTA_EN_CELDA;
  /** Debajo del campo y, si no cabe, encima, como las listas de campo-catalogo. */
  readonly posiciones: ConnectedPosition[] = [
    { originX: 'start', originY: 'bottom', overlayX: 'start', overlayY: 'top' },
    { originX: 'start', originY: 'top', overlayX: 'start', overlayY: 'bottom' },
  ];

  items: ItemCatalogo[] = [];
  cargando = true;
  /** La lista de la celda está abierta. */
  abierta = false;
  /** Se abrió con el teclado (Enter o Espacio en el campo): el foco pasa a la primera opción. */
  private abiertaConTeclado = false;
  private readonly destruir$ = new Subject<void>();

  constructor(
    private servicio: IniciativaService,
    private elemento: ElementRef<HTMLElement>,
    private despachadorScroll: ScrollDispatcher,
    private zona: NgZone,
  ) {}

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
    // Como campo-catalogo: la lista sigue al campo al desplazar la página y se cierra si el campo
    // deja de verse (p. ej. bajo la barra de OAS). El aviso llega fuera de la zona de Angular.
    this.despachadorScroll
      .ancestorScrolled(this.elemento, 20)
      .pipe(takeUntil(this.destruir$))
      .subscribe(() => {
        if (this.abierta && this.caja && !seVe(this.caja.nativeElement)) {
          this.zona.run(() => this.cerrar());
        }
      });
  }

  /**
   * Las opciones se crean cada vez que se abre la lista; mat-option guarda su estado marcado por
   * dentro, así que se marca según el valor. Se hace en el siguiente ciclo para no cambiar la vista
   * en plena detección de cambios.
   */
  ngAfterViewInit(): void {
    this.opciones.changes.pipe(takeUntil(this.destruir$)).subscribe(() => {
      Promise.resolve().then(() => this.marcarOpciones());
    });
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  /** Texto de la celda sin nada elegido; mientras carga el catálogo, «Cargando…». */
  get textoGuia(): string {
    if (this.cargando) {
      return 'Cargando…';
    }
    return this.items.length ? this.textoVacio : 'Sin opciones';
  }

  /** Nombres de lo elegido, en el orden del catálogo: la celda los corta y la ayuda los muestra completos. */
  get textoElegidas(): string {
    return this.items
      .filter((item) => this.marcada(item))
      .map((item) => item.nombre)
      .join(', ');
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

  /** Clic o tecla en una opción de la lista de la celda (las que marca marcarOpciones no cuentan). */
  alElegir(item: ItemCatalogo, cambio: MatOptionSelectionChange): void {
    if (cambio.isUserInput) {
      this.marcar(item, cambio.source.selected);
    }
  }

  /** Abre o cierra la lista. Un clic hecho con el teclado (Enter o Espacio) tiene detail 0. */
  alternar(evento?: MouseEvent): void {
    if (this.deshabilitado) {
      return;
    }
    this.abiertaConTeclado = !!evento && evento.detail === 0;
    this.abierta = !this.abierta;
  }

  cerrar(): void {
    this.abierta = false;
  }

  /** Abierta con el teclado, el foco pasa a la primera opción (se recorren con Tab y se marcan con Espacio o Enter). */
  alAbrir(): void {
    if (this.abiertaConTeclado) {
      Promise.resolve().then(() => this.opciones.first && this.opciones.first.focus(undefined, { preventScroll: true }));
    }
  }

  /**
   * Un clic fuera de la lista la cierra. El del propio campo no: ese clic la alterna (alternar),
   * y si también la cerrara aquí se volvería a abrir.
   */
  alHacerClicAfuera(evento: MouseEvent): void {
    const enElCampo = !!this.caja && this.caja.nativeElement.contains(evento.target as Node);
    if (!enElCampo) {
      this.zona.run(() => this.cerrar());
    }
  }

  /** Escape cierra la lista y devuelve el foco al campo. */
  alTeclear(evento: KeyboardEvent): void {
    if (evento.key === 'Escape') {
      evento.preventDefault();
      this.cerrar();
      if (this.disparador) {
        this.disparador.nativeElement.focus();
      }
    }
  }

  private marcarOpciones(): void {
    this.opciones.forEach((opcion) => ((this.valor || []).includes(opcion.value) ? opcion.select() : opcion.deselect()));
  }
}
