import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { IniciativaService } from '../../iniciativa.service';
import { Datos, NodoDefinicion } from '../../utils';
import { ContextoFormulario, prepararEstructura } from '../../utils/formulario.utils';
import { TablaTraidaIniciativaComponent } from './tabla-traida-iniciativa.component';

function traido(clave: string, nombre: string, desde: string, extra: any = {}): NodoDefinicion {
  return { id: clave, nombre, descripcion: '', dato: { clave, type: 'calculado', required: false, desde, ...extra }, hijos: [] };
}

/** El Presupuesto inicial con dos años: todo se trae de la Cadena de valor. */
const PRESUPUESTO: NodoDefinicion = {
  id: 'actividades',
  nombre: 'Presupuesto por actividad',
  descripcion: '',
  dato: {
    clave: 'actividades',
    type: 'repetible',
    required: true,
    espejo_de: 'cadena_valor.productos_por_objetivo.productos.actividades',
    mostrar: 'actividad',
    numerar_por: 'productos_por_objetivo',
    etiqueta_fila: 'Actividad',
    totales: { filas: false, columnas: true },
  },
  hijos: [
    traido('producto', 'Producto', 'cadena_valor.productos_por_objetivo.productos.producto', { catalogo: 'productos' }),
    traido('actividad', 'Actividad', 'origen.actividad'),
    traido('anio_0', 'Año 0', 'origen.periodo_0'),
    traido('anio_1', 'Año 1', 'origen.periodo_1'),
    traido('valor_total', 'Valor total', 'origen.costo_total'),
  ],
};

const CADENA_VALOR = {
  productos_por_objetivo: [
    { id: 'ppo-1', productos: [
      { id: 'p-1', producto: '2201001', actividades: [
        { id: 'a-1', actividad: 'Adecuar aulas', periodo_0: 500000000, periodo_1: 100000000, costo_total: 600000000 },
        { id: 'a-2', actividad: 'Comprar equipos', periodo_1: 250000000, costo_total: 250000000 },
      ] },
    ] },
    { id: 'ppo-2', productos: [
      { id: 'p-2', producto: '2201002', actividades: [{ id: 'a-3', actividad: 'Capacitar', periodo_0: 10, costo_total: 10 }] },
    ] },
  ],
};

describe('TablaTraidaIniciativaComponent', () => {
  let fixture: ComponentFixture<TablaTraidaIniciativaComponent>;
  let elemento: HTMLElement;
  let catalogosPedidos: string[];

  /** Arma el resumen como el submódulo: prepararEstructura crea una fila por actividad de origen. */
  function montar(cadena: Datos = CADENA_VALOR): Datos[] {
    const datos: Datos = { actividades: [] };
    const contexto: ContextoFormulario = {
      claveSubmodulo: 'presupuesto_inicial',
      datosSubmodulo: datos,
      relacionadas: { cadena_valor: cadena },
      soloLectura: false,
      errores: {},
      listasEnTabla: [],
      nombreEnCatalogo: (catalogo, codigo) => (catalogo === 'productos' ? `Producto ${codigo}` : codigo),
    };
    prepararEstructura([PRESUPUESTO], datos, contexto);
    fixture = TestBed.createComponent(TablaTraidaIniciativaComponent);
    Object.assign(fixture.componentInstance, { nodo: PRESUPUESTO, filas: datos.actividades, ruta: 'actividades', contexto });
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
    elemento = fixture.nativeElement;
    return datos.actividades;
  }

  const textos = (selector: string) => Array.from(elemento.querySelectorAll(selector)).map((e) => e.textContent.trim());

  beforeEach(async () => {
    catalogosPedidos = [];
    await TestBed.configureTestingModule({
      declarations: [TablaTraidaIniciativaComponent],
      imports: [NoopAnimationsModule, MatTooltipModule],
      providers: [{
        provide: IniciativaService,
        useValue: {
          catalogo: (nombre: string) => {
            catalogosPedidos.push(nombre);
            return of([]);
          },
        },
      }],
    }).compileComponents();
  });

  it('muestra cada actividad con su número n.m, su producto y sus costos por año', () => {
    const filas = montar();

    expect(textos('thead th')).toEqual(['N.°', 'Producto', 'Actividad', 'Año 0', 'Año 1', 'Valor total']);
    expect(textos('tbody tr').length).toBe(3);
    expect(textos('tbody tr:first-child td')).toEqual(['1.1', 'Producto 2201001', 'Adecuar aulas', '500.000.000', '100.000.000', '600.000.000']);
    expect(textos('tbody tr:nth-child(2) td')).toEqual(['1.2', 'Producto 2201001', 'Comprar equipos', '—', '250.000.000', '250.000.000']);
    expect(textos('tbody tr:nth-child(3) td')[0]).toBe('2.1');
    // Del espejo solo se guardan id y origen.
    expect(filas.map((fila) => Object.keys(fila).sort())).toEqual([['id', 'origen'], ['id', 'origen'], ['id', 'origen']]);
    expect(catalogosPedidos).toEqual(['productos']);
  });

  it('suma cada año y el valor total en la fila de totales', () => {
    montar();

    expect(textos('tfoot th')).toEqual(['Total']);
    expect(elemento.querySelector('tfoot th').getAttribute('colspan')).toBe('3');
    expect(textos('tfoot td')).toEqual(['500.000.010', '350.000.000', '850.000.010']);
  });

  it('sin actividades en la Cadena de valor avisa y no muestra totales', () => {
    montar({ productos_por_objetivo: [] });

    expect(textos('td.vacio')).toEqual(['Aún no hay elementos de origen: complete primero el submódulo del que depende.']);
    expect(elemento.querySelector('tfoot')).toBeNull();
  });

  it('no tiene campos para escribir', () => {
    montar();

    expect(elemento.querySelectorAll('input, textarea, select, button').length).toBe(0);
  });
});
