import { ElementRef, NgZone } from '@angular/core';
import { CdkScrollable, ScrollDispatcher } from '@angular/cdk/scrolling';

/**
 * En SISGPLAN la página no se desplaza con la ventana sino dentro de `.main-container`, el `div`
 * fijo de PagesComponent (oas.css). Angular Material no se entera de ese scroll porque el
 * contenedor no está registrado como `cdkScrollable`: las listas flotantes (autocomplete, select,
 * datepicker) se quedan quietas mientras el formulario se mueve.
 *
 * Esta función registra en el ScrollDispatcher el contenedor con scroll más cercano al elemento,
 * para que las listas sigan a su campo como en una página normal. Devuelve la función que lo
 * quita del registro (al destruir la pantalla). Si no hay contenedor, o ya estaba registrado,
 * no hace nada.
 */
export function registrarContenedorConScroll(elemento: HTMLElement, despachador: ScrollDispatcher, zona: NgZone): () => void {
  const contenedor = contenedorConScroll(elemento);
  if (!contenedor || yaRegistrado(contenedor, despachador)) {
    return () => {};
  }
  const desplazable = new CdkScrollable(new ElementRef(contenedor), despachador, zona);
  desplazable.ngOnInit();
  return () => desplazable.ngOnDestroy();
}

/** El ancestro más cercano que se desplaza en vertical (overflow-y auto o scroll), o null. */
export function contenedorConScroll(elemento: HTMLElement): HTMLElement | null {
  let actual = elemento.parentElement;
  while (actual && actual !== document.body && actual !== document.documentElement) {
    if (/(auto|scroll)/.test(getComputedStyle(actual).overflowY)) {
      return actual;
    }
    actual = actual.parentElement;
  }
  return null;
}

function yaRegistrado(contenedor: HTMLElement, despachador: ScrollDispatcher): boolean {
  return Array.from(despachador.scrollContainers.keys()).some((desplazable) => desplazable.getElementRef().nativeElement === contenedor);
}

/**
 * Si el elemento se ve en pantalla: que en su centro esté él mismo y no otra cosa encima (p. ej. la
 * barra de OAS) ni nada (fuera del área visible).
 */
export function seVe(elemento: HTMLElement): boolean {
  const caja = elemento.getBoundingClientRect();
  if (!caja.width || !caja.height) {
    return false;
  }
  const encima = document.elementFromPoint(caja.left + caja.width / 2, caja.top + caja.height / 2);
  return !!encima && elemento.contains(encima);
}
