import { TextFieldModule } from '@angular/cdk/text-field';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { IniciativaService } from '../../iniciativa.service';
import { Datos, NodoDefinicion } from '../../utils';
import { ContextoFormulario, prepararEstructura } from '../../utils/formulario.utils';
import { CampoCatalogoIniciativaComponent } from '../campo-catalogo-iniciativa/campo-catalogo-iniciativa.component';
import { CeldaIniciativaComponent } from '../celda-iniciativa/celda-iniciativa.component';
import { TablaSubfilasIniciativaComponent } from './tabla-subfilas-iniciativa.component';

function nodo(clave: string, nombre: string, tipo?: any, extra: any = {}, hijos: NodoDefinicion[] = []): NodoDefinicion {
  return { id: clave, nombre, descripcion: '', dato: { clave, type: tipo, required: false, ...extra }, hijos };
}

/** El Cronograma con dos años: física (se escribe) y financiera (se trae de la Cadena de valor). */
const CRONOGRAMA = nodo('actividades', 'Actividades', 'repetible', {
  espejo_de: 'cadena_valor.productos_por_objetivo.productos.actividades',
  mostrar: 'actividad',
  numerar_por: 'productos_por_objetivo',
  etiqueta_fila: 'Actividad',
}, [
  nodo('programacion_fisica', 'Programación física', undefined, {}, [
    nodo('anio_0', 'Año 0', 'input', { obligatorio_si: 'origen.periodo_0' }),
    nodo('anio_1', 'Año 1', 'input', { obligatorio_si: 'origen.periodo_1' }),
  ]),
  nodo('programacion_financiera', 'Programación financiera', undefined, {}, [
    nodo('anio_0', 'Año 0', 'calculado', { desde: 'origen.periodo_0' }),
    nodo('anio_1', 'Año 1', 'calculado', { desde: 'origen.periodo_1' }),
    nodo('valor_total', 'Valor total', 'calculado', { desde: 'origen.costo_total' }),
  ]),
]);

const CADENA_VALOR = {
  productos_por_objetivo: [
    { id: 'ppo-1', productos: [
      { id: 'p-1', actividades: [{ id: 'a-1', actividad: 'Adecuar aulas', periodo_0: 500000000, costo_total: 500000000 }] },
      { id: 'p-2', actividades: [{ id: 'a-2', actividad: 'Comprar equipos', periodo_1: 250000000, costo_total: 250000000 }] },
    ] },
    { id: 'ppo-2', productos: [
      { id: 'p-3', actividades: [{ id: 'a-3', actividad: 'Capacitar', periodo_0: 0, periodo_1: 10, costo_total: 10 }] },
    ] },
  ],
};

describe('TablaSubfilasIniciativaComponent', () => {
  let fixture: ComponentFixture<TablaSubfilasIniciativaComponent>;
  let elemento: HTMLElement;

  /** Arma el cronograma como el submódulo: prepararEstructura crea una fila por actividad de origen. */
  function montar(guardadas: Datos[], parcial: Partial<ContextoFormulario> = {}): Datos[] {
    const datos: Datos = { actividades: guardadas };
    const contexto: ContextoFormulario = {
      claveSubmodulo: 'cronograma',
      datosSubmodulo: datos,
      relacionadas: { cadena_valor: CADENA_VALOR },
      soloLectura: false,
      errores: {},
      listasEnTabla: [],
      nombreEnCatalogo: (catalogo, codigo) => codigo,
      ...parcial,
    };
    prepararEstructura([CRONOGRAMA], datos, contexto);
    fixture = TestBed.createComponent(TablaSubfilasIniciativaComponent);
    Object.assign(fixture.componentInstance, { nodo: CRONOGRAMA, filas: datos.actividades, ruta: 'actividades', contexto });
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
    elemento = fixture.nativeElement;
    return datos.actividades;
  }

  const textos = (selector: string) => Array.from(elemento.querySelectorAll(selector)).map((e) => e.textContent.trim());

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TablaSubfilasIniciativaComponent, CeldaIniciativaComponent, CampoCatalogoIniciativaComponent],
      imports: [
        FormsModule, ReactiveFormsModule, TextFieldModule, NoopAnimationsModule, MatIconModule, MatTooltipModule,
        MatAutocompleteModule, MatCheckboxModule,
      ],
      providers: [{ provide: IniciativaService, useValue: { catalogo: () => of([]) } }],
    }).compileComponents();
  });

  it('dibuja cada actividad con su número n.m en dos subfilas: física y financiera', () => {
    montar([]);

    expect(textos('thead th')).toEqual(['N.°', 'Actividad', 'Año 0', 'Año 1', 'Valor total']);
    expect(textos('td.numero')).toEqual(['1.1', '1.2', '2.1']);
    expect(textos('td.origen')).toEqual(['Adecuar aulas', 'Comprar equipos', 'Capacitar']);
    expect(textos('th.subfila')).toEqual([
      'Programación física', 'Programación financiera',
      'Programación física', 'Programación financiera',
      'Programación física', 'Programación financiera',
    ]);
  });

  it('trae la programación financiera de la Cadena de valor y la física no tiene valor total', () => {
    montar([]);

    expect(textos('output.celda--calculada')).toEqual([
      '500.000.000', '—', '500.000.000',
      '—', '250.000.000', '250.000.000',
      '0', '10', '10',
    ]);
    expect(textos('.no-aplica')).toEqual(['N/A', 'N/A', 'N/A']);
  });

  it('la física es obligatoria solo en los años en que la actividad tiene costo', () => {
    const filas = montar([]);
    const marcas = Array.from(elemento.querySelectorAll('textarea')).map((t) => t.getAttribute('placeholder'));

    expect(marcas).toEqual(['Obligatorio', 'Opcional', 'Opcional', 'Obligatorio', 'Opcional', 'Obligatorio']);
    expect(filas.map((fila) => fila.origen)).toEqual(['a-1', 'a-2', 'a-3']);
  });

  it('conserva lo escrito y muestra el error en su celda', fakeAsync(() => {
    const guardadas = [{ id: 'cr-1', origen: 'a-1', programacion_fisica: { anio_0: 'Enero - Diciembre' }, programacion_financiera: {} }];
    montar(guardadas, { errores: { 'actividades[cr-1].programacion_fisica.anio_1': ['Año 1: es obligatorio.'] } });
    tick();
    fixture.detectChanges();

    expect((elemento.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Enero - Diciembre');
    expect(textos('.error-celda')).toEqual(['Año 1: es obligatorio.']);
    expect(elemento.querySelectorAll('td.con-error').length).toBe(1);
  }));

  it('en solo lectura deshabilita la programación física', fakeAsync(() => {
    montar([], { soloLectura: true });
    tick();
    fixture.detectChanges();

    expect(Array.from(elemento.querySelectorAll('textarea')).every((t) => (t as HTMLTextAreaElement).disabled)).toBeTrue();
  }));
});
