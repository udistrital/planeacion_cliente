import { Component, Input, OnChanges } from '@angular/core';
import { IniciativaService } from '../../iniciativa.service';
import { Datos, NodoDefinicion } from '../../utils';
import {
  ContextoFormulario,
  filasDeRuta,
  formatearNumero,
  numeroDeFila,
  numerosDeLista,
  textoDeTraido,
  valorTraidoEnEspejo,
} from '../../utils/formulario.utils';

/** Fila del resumen: su número y lo que trae cada columna. */
export interface FilaTraida {
  id: string;
  numero: string;
  valores: any[];
}

/** Anchos mínimos (px) para que la tabla se desplace en pantallas angostas en vez de apretar las columnas. */
const ANCHO = { numero: 48, texto: 200, numerica: 120, minimo: 560 };

/**
 * Espejo de solo lectura (esEspejoTraido): una fila por elemento de origen, con su número y lo que
 * trae cada campo y, si la plantilla lo pide (totales.columnas), una fila con la suma de cada
 * columna numérica. En el Presupuesto inicial: el producto, la actividad y su costo por año en la
 * Cadena de valor, con el total. Aquí no se escribe nada; el submódulo se guarda para formularlo.
 */
@Component({
  selector: 'app-tabla-traida-iniciativa',
  templateUrl: './tabla-traida-iniciativa.component.html',
  styleUrls: ['./tabla-traida-iniciativa.component.scss'],
})
export class TablaTraidaIniciativaComponent implements OnChanges {
  @Input() nodo: NodoDefinicion;
  /** Filas del espejo dentro de los datos (solo id y origen). */
  @Input() filas: Datos[] = [];
  @Input() ruta = '';
  @Input() contexto: ContextoFormulario;
  /** Verdadero cuando la tabla no tiene un recuadro de sección que la nombre. */
  @Input() conTitulo = false;

  columnas: NodoDefinicion[] = [];
  /** Si cada columna es numérica (todos sus valores son números): va centrada y se suma. */
  numericas: boolean[] = [];
  vista: FilaTraida[] = [];
  /** Columnas de texto antes de la primera numérica: la celda «Total» las abarca. */
  columnasDeEtiqueta = 0;
  /** Suma de cada columna desde la primera numérica (null en las de texto); vacío si no hay fila de totales. */
  totales: (number | null)[] = [];

  constructor(private servicio: IniciativaService) {}

  /**
   * Todo viene de otro submódulo (relacionadas), que no cambia mientras se ve este: la tabla se arma
   * cuando llegan los datos (al cargar y al guardar).
   */
  ngOnChanges(): void {
    const espejo = this.nodo.dato.espejo_de;
    const origenes = new Map(filasDeRuta(espejo, this.contexto).map((origen) => [origen.id, origen] as [string, Datos]));
    const numeros = numerosDeLista(this.nodo, this.ruta, this.contexto);
    this.columnas = this.nodo.hijos || [];
    this.vista = (this.filas || []).map((fila, posicion) => ({
      id: fila.id,
      numero: numeroDeFila(this.nodo, fila, posicion, numeros),
      valores: this.columnas.map((campo) => valorTraidoEnEspejo(campo.dato, espejo, origenes.get(fila.origen) || null, this.contexto)),
    }));
    this.numericas = this.columnas.map((campo, columna) => !campo.dato.catalogo && this.esNumerica(columna));
    this.calcularTotales();
    this.cargarCatalogos();
  }

  get anchoMinimo(): number {
    const columnas = this.numericas.reduce((suma, numerica) => suma + (numerica ? ANCHO.numerica : ANCHO.texto), 0);
    return Math.max(ANCHO.minimo, ANCHO.numero + columnas);
  }

  porId(_: number, fila: FilaTraida): string {
    return fila.id;
  }

  porClave(_: number, campo: NodoDefinicion): string {
    return campo.dato.clave;
  }

  texto(columna: number, valor: any): string {
    return textoDeTraido(this.columnas[columna].dato, valor, this.contexto);
  }

  textoTotal(total: number | null): string {
    return total === null ? '' : formatearNumero(total);
  }

  /**
   * Columna sin textos: la de los costos por año y la del valor total. Un año que ninguna actividad
   * usa (todo vacío) también cuenta, para que su total quede en su columna.
   */
  private esNumerica(columna: number): boolean {
    const conValor = (valor: any) => valor !== undefined && valor !== null && valor !== '';
    const valores = this.vista.map((fila) => fila.valores[columna]).filter(conValor);
    return this.vista.length > 0 && valores.every((valor) => typeof valor === 'number' && isFinite(valor));
  }

  private calcularTotales(): void {
    const primera = this.numericas.indexOf(true);
    const conTotales = !!this.nodo.dato.totales && this.nodo.dato.totales.columnas && primera >= 0 && this.vista.length > 0;
    this.columnasDeEtiqueta = conTotales ? primera : 0;
    this.totales = conTotales
      ? this.numericas.slice(primera).map((numerica, desplazamiento) =>
          // Vacío = 0, como el costo total de la Cadena de valor.
          numerica ? this.vista.reduce((suma, fila) => suma + (fila.valores[primera + desplazamiento] || 0), 0) : null,
        )
      : [];
  }

  /** Los nombres de los catálogos (p. ej. el producto) se muestran cuando el catálogo termina de cargar. */
  private cargarCatalogos(): void {
    const catalogos = new Set(this.columnas.map((campo) => campo.dato.catalogo).filter((catalogo) => !!catalogo));
    catalogos.forEach((catalogo) => this.servicio.catalogo(catalogo).subscribe(() => {}, () => {}));
  }
}
