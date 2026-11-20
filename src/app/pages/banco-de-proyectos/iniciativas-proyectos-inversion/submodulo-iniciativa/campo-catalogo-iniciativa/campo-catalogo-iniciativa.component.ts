import { ScrollDispatcher } from '@angular/cdk/scrolling';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { BehaviorSubject, combineLatest, Observable, Subject } from 'rxjs';
import { map, startWith, takeUntil } from 'rxjs/operators';
import { IniciativaService } from '../../iniciativa.service';
import { ItemCatalogo, NodoDefinicion } from '../../utils';
import { ANCHO_LISTA_EN_CELDA } from '../../utils/constantes';
import { seVe } from '../../utils/scroll.utils';

/**
 * Máximo de opciones en la lista. Cubre casi todos los catálogos completos (sectores, procesos,
 * municipios de un departamento…); en los más grandes (productos, bienes y servicios) hay que
 * escribir para filtrar.
 */
export const MAXIMO_SUGERENCIAS = 150;

/** Opciones de la lista y cuántas coinciden pero no se muestran. */
export interface Sugerencias {
  items: ItemCatalogo[];
  ocultas: number;
}

/**
 * Selección de un elemento de catálogo. Se usa como una lista: al hacer clic se despliegan
 * las opciones, y escribir las filtra (algunos catálogos tienen miles de elementos). Si el
 * campo depende de otro (depende_de), solo muestra los hijos del valor elegido allí. Si el
 * elemento tiene descripción, va en gris bajo su nombre en la lista y bajo el campo al elegirlo.
 * Emite el código del elemento.
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
  /** Falso cuando el campo va solo en una sección cuyo título ya lo nombra. */
  @Input() conEtiqueta = true;
  /** Dentro de una celda de tabla: un renglón sin marco ni ayudas, que muestra solo el nombre. */
  @Input() enCelda = false;
  /** Nombre accesible de la celda (p. ej. "Fase 2"). */
  @Input() etiquetaCelda = '';
  /** El disparador de la lista que está en pantalla (el del campo o el de la celda). */
  @ViewChild(MatAutocompleteTrigger) private disparador?: MatAutocompleteTrigger;

  /** Ancho (px) de la lista dentro de una celda: más que la columna, para que se lean las opciones largas. */
  readonly anchoListaEnCelda = ANCHO_LISTA_EN_CELDA;

  readonly control = new FormControl('');
  sugerencias$: Observable<Sugerencias>;
  cargando = true;
  private items: ItemCatalogo[] = [];
  /** Vuelve a calcular la lista sin que el usuario escriba: cuando llega el catálogo y cuando cambia el padre. */
  private readonly refrescar$ = new BehaviorSubject<void>(undefined);
  private readonly destruir$ = new Subject<void>();

  constructor(
    private servicio: IniciativaService,
    private elemento: ElementRef<HTMLElement>,
    private despachadorScroll: ScrollDispatcher,
    private zona: NgZone,
  ) {}

  ngOnInit(): void {
    // La lista sigue al campo porque la pantalla registra el contenedor con scroll
    // (registrarContenedorConScroll); si el campo deja de verse (p. ej. bajo la barra de OAS),
    // se cierra para no quedar flotando. El aviso llega fuera de la zona de Angular.
    this.despachadorScroll
      .ancestorScrolled(this.elemento, 20)
      .pipe(takeUntil(this.destruir$))
      .subscribe(() => this.cerrarSiNoSeVe());
    this.sugerencias$ = combineLatest([this.control.valueChanges.pipe(startWith('')), this.refrescar$]).pipe(
      map(([texto]) => this.filtrar(typeof texto === 'string' ? texto : '')),
    );
    this.servicio
      .catalogo(this.nodo.dato.catalogo)
      .pipe(takeUntil(this.destruir$))
      .subscribe((items) => {
        this.items = items;
        this.cargando = false;
        this.mostrarValorActual();
        this.refrescar$.next();
      });
  }

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios.deshabilitado) {
      this.deshabilitado ? this.control.disable({ emitEvent: false }) : this.control.enable({ emitEvent: false });
    }
    if (cambios.padre && !cambios.padre.firstChange) {
      this.refrescar$.next();
      if (!this.cargando && this.valor && !this.perteneceAlPadre(this.buscar(this.valor))) {
        // El valor ya no pertenece al padre elegido. Se limpia en el siguiente ciclo
        // para no cambiar los datos del formulario en plena detección de cambios.
        Promise.resolve().then(() => this.seleccionar(null));
      }
    }
    if (cambios.valor) {
      this.mostrarValorActual();
    }
  }

  /** Falta elegir el campo del que depende (p. ej. el sector antes que el programa). */
  get faltaPadre(): boolean {
    return !!this.nodo.dato.depende_de && !this.padre;
  }

  /** Texto del campo vacío. */
  get textoGuia(): string {
    if (this.cargando) {
      return 'Cargando…';
    }
    return this.faltaPadre ? 'Elija primero el campo anterior' : 'Seleccione o escriba para buscar';
  }

  /** Despliega la lista al hacer clic, aunque el campo ya tenga el foco (como un select). */
  abrir(disparador: MatAutocompleteTrigger): void {
    if (!this.deshabilitado && !disparador.panelOpen) {
      disparador.openPanel();
    }
  }

  /** Cierra la lista abierta si el campo ya no se ve en pantalla. */
  cerrarSiNoSeVe(): void {
    const disparador = this.disparador;
    if (disparador && disparador.panelOpen && !seVe(this.elemento.nativeElement)) {
      this.zona.run(() => disparador.closePanel());
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
    return item ? this.etiquetaDe(item) : '';
  }

  /** En la celda basta el nombre; el código completo queda en la ayuda emergente. */
  readonly mostrarNombre = (item: ItemCatalogo | string | null): string => {
    if (typeof item === 'string') {
      return item;
    }
    return item ? item.nombre : '';
  }

  /** Código y nombre del elemento elegido, para la ayuda emergente de la celda. */
  get detalleElegido(): string {
    const valor = this.control.value;
    return valor && typeof valor === 'object' ? this.mostrar(valor) : '';
  }

  /** Descripción del elemento elegido, que se muestra bajo el campo (p. ej. el enunciado de una meta). */
  get descripcionElegida(): string {
    const valor = this.control.value;
    return (valor && typeof valor === 'object' && valor.descripcion) || '';
  }

  /** Texto de cada opción de la lista: con el código, salvo que sea un id interno (sin_codigo). */
  etiquetaDe(item: ItemCatalogo): string {
    return this.nodo.dato.sin_codigo ? item.nombre : etiquetaCompleta(item);
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

  private filtrar(texto: string): Sugerencias {
    const busqueda = normalizar(texto);
    const coincidencias = this.items
      .filter((item) => this.perteneceAlPadre(item))
      .filter((item) => !busqueda || normalizar(this.textoDeBusqueda(item)).includes(busqueda));
    return {
      items: coincidencias.slice(0, MAXIMO_SUGERENCIAS),
      ocultas: Math.max(0, coincidencias.length - MAXIMO_SUGERENCIAS),
    };
  }

  /** Lo que se busca al escribir: código (si se muestra), nombre y descripción. */
  private textoDeBusqueda(item: ItemCatalogo): string {
    const codigo = this.nodo.dato.sin_codigo ? '' : item.codigo;
    return `${codigo} ${item.nombre} ${item.descripcion || ''}`;
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

/** "Código - Nombre", o solo el nombre si el código es el mismo nombre (catálogos como procesos o sedes). */
function etiquetaCompleta(item: ItemCatalogo): string {
  return item.codigo === item.nombre ? item.nombre : `${item.codigo} - ${item.nombre}`;
}

function normalizar(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}
