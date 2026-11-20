import { OverlayContainer } from '@angular/cdk/overlay';
import { SimpleChange } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { IniciativaService } from '../../iniciativa.service';
import { ItemCatalogo, NodoDefinicion } from '../../utils';
import { CampoCatalogoIniciativaComponent, MAXIMO_SUGERENCIAS } from './campo-catalogo-iniciativa.component';

function nodo(clave: string, catalogo: string, extra: any = {}): NodoDefinicion {
  const dato = { clave, type: 'catalogo' as const, required: true, catalogo, ...extra };
  return { id: clave, nombre: clave, descripcion: '', dato, hijos: [] };
}

const PROGRAMAS: ItemCatalogo[] = [
  { codigo: 'P1', nombre: 'Programa uno', padre: 'S1' },
  { codigo: 'P2', nombre: 'Programa dos', padre: 'S1' },
  { codigo: 'P3', nombre: 'Programa tres', padre: 'S2' },
];

describe('CampoCatalogoIniciativaComponent', () => {
  let fixture: ComponentFixture<CampoCatalogoIniciativaComponent>;
  let items: ItemCatalogo[] = [];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CampoCatalogoIniciativaComponent],
      imports: [ReactiveFormsModule, MatAutocompleteModule, MatInputModule, MatIconModule, MatTooltipModule, NoopAnimationsModule],
      providers: [{ provide: IniciativaService, useValue: { catalogo: () => of(items) } }],
    }).compileComponents();
  });

  function montar(definicion: NodoDefinicion, valores: Partial<CampoCatalogoIniciativaComponent> = {}): CampoCatalogoIniciativaComponent {
    fixture = TestBed.createComponent(CampoCatalogoIniciativaComponent);
    Object.assign(fixture.componentInstance, { nodo: definicion, ...valores });
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  /** Clic en el campo, como quien abre un select. */
  function abrirLista(): void {
    (fixture.nativeElement.querySelector('input') as HTMLInputElement).click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  const opciones = () =>
    Array.from(TestBed.inject(OverlayContainer).getContainerElement().querySelectorAll('mat-option')).map((o) =>
      o.textContent.replace(/\s+/g, ' ').trim(),
    );

  /** Escribe en el campo, como quien filtra la lista. */
  function escribir(texto: string): void {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = texto;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
  }

  const METAS: ItemCatalogo[] = [
    { codigo: '6166a1', nombre: 'Meta 1', padre: 'L1', descripcion: 'Mantener la acreditación institucional' },
    { codigo: '6166a2', nombre: 'Meta 2', padre: 'L1' },
  ];

  it('al hacer clic despliega todas las opciones, sin escribir; si el código es el nombre, muestra solo el nombre', fakeAsync(() => {
    items = [{ codigo: 'Adecuación', nombre: 'Adecuación' }, { codigo: '01', nombre: 'Agricultura' }];
    montar(nodo('proceso', 'procesos'));

    abrirLista();

    expect(opciones()).toEqual(['Adecuación', '01 - Agricultura']);
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).placeholder).toBe('Seleccione o escriba para buscar');
  }));

  it('al cambiar el padre limpia el valor y la lista ya muestra los hijos del nuevo padre', fakeAsync(() => {
    items = PROGRAMAS;
    const componente = montar(nodo('programa', 'programas_pnd', { depende_de: 'sector' }), { valor: 'P1', padre: 'S1' });
    const emitidos: (string | null)[] = [];
    componente.valorChange.subscribe((valor) => emitidos.push(valor));

    componente.padre = 'S2';
    componente.ngOnChanges({ padre: new SimpleChange('S1', 'S2', false) });
    tick();
    abrirLista();

    expect(emitidos).toEqual([null]);
    expect(opciones()).toEqual(['P3 - Programa tres']);
  }));

  it('sin el padre elegido, la lista lo explica en lugar de quedar vacía', fakeAsync(() => {
    items = PROGRAMAS;
    montar(nodo('programa', 'programas_pnd', { depende_de: 'sector' }), { padre: null });

    abrirLista();

    expect(opciones()).toEqual(['Primero seleccione el campo del que depende.']);
  }));

  it('con sin_codigo muestra solo el nombre, y la descripción va en la lista y bajo el campo al elegir', fakeAsync(() => {
    items = METAS;
    const componente = montar(nodo('meta_estrategica', 'metas_ped', { depende_de: 'lineamiento', sin_codigo: true }), { padre: 'L1' });

    abrirLista();
    expect(opciones()).toEqual(['Meta 1 Mantener la acreditación institucional', 'Meta 2']);

    // El autocompletado escribe el valor en el campo después de un ciclo (tick).
    componente.seleccionar(METAS[0]);
    tick();
    fixture.detectChanges();
    expect((fixture.nativeElement.querySelector('input') as HTMLInputElement).value).toBe('Meta 1');
    expect(fixture.nativeElement.querySelector('.detalle-elegido').textContent.trim()).toBe('Mantener la acreditación institucional');

    componente.seleccionar(METAS[1]);
    tick();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.detalle-elegido')).toBeNull();
  }));

  it('al escribir busca también en la descripción, y con sin_codigo no en el código', fakeAsync(() => {
    items = METAS;
    montar(nodo('meta_estrategica', 'metas_ped', { depende_de: 'lineamiento', sin_codigo: true }), { padre: 'L1' });
    abrirLista();

    escribir('acreditacion');
    expect(opciones()).toEqual(['Meta 1 Mantener la acreditación institucional']);

    escribir('6166');
    expect(opciones()).toEqual(['No hay opciones que coincidan.']);
  }));

  it('en catálogos grandes muestra las primeras opciones y avisa cuántas faltan', fakeAsync(() => {
    items = Array.from({ length: MAXIMO_SUGERENCIAS + 5 }, (_, i) => ({ codigo: `C${i}`, nombre: `Producto ${i}` }));
    montar(nodo('producto', 'productos'));

    abrirLista();

    const lista = opciones();
    expect(lista.length).toBe(MAXIMO_SUGERENCIAS + 1);
    expect(lista[lista.length - 1]).toBe('Hay 5 opciones más: escriba para filtrar.');
  }));
  it('al hacer scroll cierra la lista solo si el campo dejó de verse (p. ej. bajo algo fijo)', fakeAsync(() => {
    items = PROGRAMAS;
    const componente = montar(nodo('programa', 'programas_pnd'));
    abrirLista();
    expect(opciones().length).toBe(3);

    // El campo se ve: la lista sigue abierta.
    componente.cerrarSiNoSeVe();
    fixture.detectChanges();
    expect(opciones().length).toBe(3);

    // Algo fijo lo tapa (como la barra de OAS al bajar): la lista se cierra.
    const caja = (fixture.nativeElement as HTMLElement).getBoundingClientRect();
    const tapa = document.createElement('div');
    Object.assign(tapa.style, {
      position: 'fixed', zIndex: '99999', background: '#fff',
      left: `${caja.left}px`, top: `${caja.top}px`, width: `${caja.width}px`, height: `${caja.height}px`,
    });
    document.body.appendChild(tapa);
    try {
      componente.cerrarSiNoSeVe();
      fixture.detectChanges();
      tick();
      expect(opciones()).toEqual([]);
    } finally {
      tapa.remove();
    }
  }));
});
