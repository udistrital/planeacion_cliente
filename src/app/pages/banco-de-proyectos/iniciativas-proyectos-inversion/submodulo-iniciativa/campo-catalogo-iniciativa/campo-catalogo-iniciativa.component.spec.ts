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
  return { id: clave, nombre: clave, descripcion: '', bandera_tabla: false, dato, hijos: [] };
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
    Array.from(TestBed.inject(OverlayContainer).getContainerElement().querySelectorAll('mat-option')).map((o) => o.textContent.trim());

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

  it('en catálogos grandes muestra las primeras opciones y avisa cuántas faltan', fakeAsync(() => {
    items = Array.from({ length: MAXIMO_SUGERENCIAS + 5 }, (_, i) => ({ codigo: `C${i}`, nombre: `Producto ${i}` }));
    montar(nodo('producto', 'productos'));

    abrirLista();

    const lista = opciones();
    expect(lista.length).toBe(MAXIMO_SUGERENCIAS + 1);
    expect(lista[lista.length - 1]).toBe('Hay 5 opciones más: escriba para filtrar.');
  }));
});
