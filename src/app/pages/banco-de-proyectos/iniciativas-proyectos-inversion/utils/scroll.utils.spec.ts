import { ScrollDispatcher } from '@angular/cdk/scrolling';
import { NgZone } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { contenedorConScroll, registrarContenedorConScroll, seVe } from './scroll.utils';

describe('scroll.utils', () => {
  let raiz: HTMLElement;

  /** Como en SISGPLAN: un contenedor fijo con scroll (.main-container) y la pantalla dentro. */
  function armar(): { contenedor: HTMLElement; pantalla: HTMLElement } {
    raiz = document.createElement('div');
    raiz.innerHTML = `
      <div class="main-container" style="position: fixed; top: 100px; left: 100px; width: 300px; height: 200px; overflow: auto; z-index: 5000; background: #fff">
        <div class="tarjeta"><div class="pantalla" style="height: 1000px"></div></div>
      </div>`;
    document.body.appendChild(raiz);
    return { contenedor: raiz.querySelector('.main-container'), pantalla: raiz.querySelector('.pantalla') };
  }

  afterEach(() => raiz && raiz.remove());

  it('encuentra el contenedor que se desplaza, aunque haya elementos en medio', () => {
    const { contenedor, pantalla } = armar();

    expect(contenedorConScroll(pantalla)).toBe(contenedor);
    expect(contenedorConScroll(document.body)).toBeNull();
  });

  it('registra el contenedor en el ScrollDispatcher una sola vez y lo quita al salir', () => {
    const { contenedor, pantalla } = armar();
    const despachador = TestBed.inject(ScrollDispatcher);
    const zona = TestBed.inject(NgZone);
    const registrados = () =>
      Array.from(despachador.scrollContainers.keys()).filter((d) => d.getElementRef().nativeElement === contenedor).length;

    const quitar = registrarContenedorConScroll(pantalla, despachador, zona);
    const quitarOtraVez = registrarContenedorConScroll(pantalla, despachador, zona);
    expect(registrados()).toBe(1);
    expect(despachador.getAncestorScrollContainers(pantalla).length).toBe(1);

    quitarOtraVez();
    expect(registrados()).toBe(1);
    quitar();
    expect(registrados()).toBe(0);
  });

  it('un elemento no se ve si algo lo tapa o si quedó fuera del área visible', () => {
    const { contenedor, pantalla } = armar();
    const campo = document.createElement('div');
    campo.style.height = '30px';
    pantalla.appendChild(campo);
    expect(seVe(campo)).toBeTrue();

    const tapa = document.createElement('div');
    Object.assign(tapa.style, { position: 'fixed', top: '100px', left: '100px', width: '300px', height: '40px', zIndex: '6000', background: '#fff' });
    raiz.appendChild(tapa);
    expect(seVe(campo)).toBeFalse();
    tapa.remove();

    contenedor.scrollTop = 500;
    expect(seVe(campo)).toBeFalse();
  });
});
