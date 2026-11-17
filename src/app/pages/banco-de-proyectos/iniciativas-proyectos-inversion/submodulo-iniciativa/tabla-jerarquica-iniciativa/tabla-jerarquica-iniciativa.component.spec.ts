import { TextFieldModule } from '@angular/cdk/text-field';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { IniciativaService } from '../../iniciativa.service';
import { Datos, NodoDefinicion } from '../../utils';
import { ContextoFormulario } from '../../utils/formulario.utils';
import { CampoCatalogoIniciativaComponent } from '../campo-catalogo-iniciativa/campo-catalogo-iniciativa.component';
import { CeldaIniciativaComponent } from '../celda-iniciativa/celda-iniciativa.component';
import { TablaJerarquicaIniciativaComponent } from './tabla-jerarquica-iniciativa.component';

function nodo(clave: string, nombre: string, tipo?: any, extra: any = {}, hijos: NodoDefinicion[] = []): NodoDefinicion {
  return { id: clave, nombre, descripcion: '', bandera_tabla: false, dato: { clave, type: tipo, required: true, ...extra }, hijos };
}

const EFECTOS = nodo('efectos_directos', 'Efectos directos', 'repetible', { min: 1, etiqueta_fila: 'Efecto directo' }, [
  nodo('descripcion', 'Descripción', 'input'),
  nodo('linea_base', 'Línea base', 'input'),
  nodo('efectos_indirectos', 'Efectos indirectos', 'repetible', { min: 1, etiqueta_fila: 'Efecto indirecto' }, [
    nodo('descripcion', 'Descripción', 'input'),
    nodo('linea_base', 'Línea base', 'input', { required: false }),
  ]),
]);

function efectosDeEjemplo(): Datos[] {
  return [
    { id: 'ed-1', descripcion: 'Retrasos en los trámites', linea_base: '35 % fuera de tiempo', efectos_indirectos: [
      { id: 'ei-1', descripcion: 'Inconformidad de estudiantes', linea_base: '1.240 PQRS' },
      { id: 'ei-2', descripcion: 'Mayores costos de operación', linea_base: '' },
    ] },
    { id: 'ed-2', descripcion: 'Pérdida de información', linea_base: '', efectos_indirectos: [
      { id: 'ei-3', descripcion: '', linea_base: '' },
    ] },
  ];
}

describe('TablaJerarquicaIniciativaComponent', () => {
  let fixture: ComponentFixture<TablaJerarquicaIniciativaComponent>;
  let elemento: HTMLElement;

  function montar(filas: Datos[], parcial: Partial<ContextoFormulario> = {}, definicion: NodoDefinicion = EFECTOS): Datos[] {
    const contexto: ContextoFormulario = {
      claveSubmodulo: 'problematica',
      datosSubmodulo: { efectos_directos: filas },
      relacionadas: {},
      soloLectura: false,
      errores: {},
      apariencia: 'fill',
      listasEnTabla: ['efectos_directos'],
      gruposEnCasillas: [],
      nombreEnCatalogo: (catalogo, codigo) => codigo,
      ...parcial,
    };
    fixture = TestBed.createComponent(TablaJerarquicaIniciativaComponent);
    Object.assign(fixture.componentInstance, { nodo: definicion, filas, ruta: definicion.dato.clave, contexto });
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
    elemento = fixture.nativeElement;
    return filas;
  }

  const textos = (selector: string) => Array.from(elemento.querySelectorAll(selector)).map((e) => e.textContent.trim());
  const boton = (etiqueta: string) =>
    Array.from(elemento.querySelectorAll('button'))
      .find((b) => b.getAttribute('aria-label') === etiqueta || b.textContent.includes(etiqueta));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TablaJerarquicaIniciativaComponent, CeldaIniciativaComponent, CampoCatalogoIniciativaComponent],
      imports: [
        FormsModule, ReactiveFormsModule, TextFieldModule, NoopAnimationsModule, MatIconModule, MatButtonModule,
        MatTooltipModule, MatSelectModule, MatAutocompleteModule, MatCheckboxModule,
      ],
      providers: [{ provide: IniciativaService, useValue: { catalogo: () => of([]) } }],
    }).compileComponents();
  });

  it('sin lista interna dibuja una columna por campo, con número y opciones en su celda', fakeAsync(() => {
    const necesidades = nodo('analisis_anual', 'Análisis anual', 'repetible', { etiqueta_fila: 'Año' }, [
      nodo('tipo_analisis', 'Tipo de análisis', 'select', { options: [{ valor: 'Histórico' }, { valor: 'Proyectado' }] }),
      nodo('anio', 'Año', 'numeric', { decimales: 0 }),
      nodo('demanda', 'Demanda', 'numeric', { required: false }),
    ]);
    montar([{ id: 'aa-1', tipo_analisis: 'Histórico', anio: 2024, demanda: 120 }], {}, necesidades);
    tick();
    fixture.detectChanges();

    expect(textos('thead th')).toEqual(['N.°', 'Tipo de análisis', 'Año', 'Demanda', 'Acciones']);
    expect(elemento.querySelectorAll('th.col-numerica').length).toBe(2);
    expect(elemento.querySelectorAll('td mat-select').length).toBe(1);
    const numeros = Array.from(elemento.querySelectorAll('input[type=number]')) as HTMLInputElement[];
    expect(numeros.map((n) => n.value)).toEqual(['2024', '120']);
    expect(numeros.map((n) => n.placeholder)).toEqual(['Obligatorio', 'Opcional']);
  }));

  it('muestra el déficit (oferta - demanda) en su columna y lo recalcula al cambiar los valores', () => {
    const anual = nodo('analisis_anual', 'Demanda y oferta por año', 'repetible', { etiqueta_fila: 'Año' }, [
      nodo('demanda', 'Demanda', 'numeric'),
      nodo('oferta', 'Oferta', 'numeric'),
      nodo('deficit', 'Déficit', 'calculado', { required: false, operacion: 'resta', operandos: ['oferta', 'demanda'] }),
    ]);
    const filas = montar([{ id: 'aa-1', demanda: 60, oferta: 40 }, { id: 'aa-2', demanda: 10 }], {}, anual);

    expect(textos('thead th')).toEqual(['N.°', 'Demanda', 'Oferta', 'Déficit', 'Acciones']);
    expect(elemento.querySelectorAll('th.col-numerica').length).toBe(3);
    expect(textos('output.celda--calculada')).toEqual(['-20', 'Se calcula']);

    filas[1].oferta = 25;
    fixture.detectChanges();
    expect(textos('output.celda--calculada')).toEqual(['-20', '15']);
  });

  it('deja marcada la casilla única en una sola fila', () => {
    const alternativas = nodo('alternativas_solucion', 'Alternativas de solución', 'repetible', { etiqueta_fila: 'Alternativa' }, [
      nodo('descripcion_alternativa', 'Descripción de la alternativa de solución', 'input'),
      nodo('pasa_preparacion', '¿Pasa al módulo de preparación?', 'casilla', { unica: true }),
    ]);
    const filas = montar([
      { id: 'as-1', descripcion_alternativa: 'Modernizar la infraestructura', pasa_preparacion: true },
      { id: 'as-2', descripcion_alternativa: 'Contratar el servicio en la nube' },
    ], {}, alternativas);
    const casillas = () => Array.from(elemento.querySelectorAll('td input[type=checkbox]')) as HTMLInputElement[];

    expect(textos('thead th')).toEqual(['N.°', 'Descripción de la alternativa de solución', '¿Pasa al módulo de preparación?', 'Acciones']);
    // El título y la casilla van centrados en su columna, uno bajo el otro.
    expect(textos('th.col-casilla')).toEqual(['¿Pasa al módulo de preparación?']);
    expect(elemento.querySelectorAll('td.col-casilla input[type=checkbox]').length).toBe(2);
    expect(casillas().map((c) => c.checked)).toEqual([true, false]);

    casillas()[1].click();
    fixture.detectChanges();

    expect(filas.map((f) => f.pasa_preparacion)).toEqual([false, true]);
    expect(casillas().map((c) => c.checked)).toEqual([false, true]);
  });

  it('numera las filas 1, 1.1, 1.2 y nombra los dos niveles en la primera columna', fakeAsync(() => {
    montar(efectosDeEjemplo());
    tick();
    fixture.detectChanges();

    expect(textos('thead th')).toEqual(['N.°', 'Efecto directo / efecto indirecto', 'Línea base', 'Acciones']);
    expect(textos('td.numero')).toEqual(['1', '1.1', '1.2', '2', '2.1']);
    const valores = Array.from(elemento.querySelectorAll('textarea')).map((t) => (t as HTMLTextAreaElement).value);
    expect(valores).toContain('Mayores costos de operación');
  }));

  it('agrega filas internas y del primer nivel con su id y su lista interna vacía', () => {
    const filas = montar(efectosDeEjemplo());

    boton('Agregar efecto indirecto a 2').click();
    boton('Agregar efecto directo').click();
    fixture.detectChanges();

    expect(filas[1].efectos_indirectos.length).toBe(2);
    expect(filas[1].efectos_indirectos[1].id).toMatch(/^ei-/);
    expect(filas.length).toBe(3);
    expect(filas[2].id).toMatch(/^ed-/);
    expect(filas[2].efectos_indirectos).toEqual([]);
    expect(textos('td.numero')).toEqual(['1', '1.1', '1.2', '2', '2.1', '2.2', '3']);
  });

  it('muestra el error de un campo en su celda y el de la lista interna debajo de la fila', () => {
    montar(efectosDeEjemplo(), {
      errores: {
        'efectos_directos[ed-2].efectos_indirectos[ei-3].descripcion': ['Descripción: es obligatorio.'],
        'efectos_directos[ed-1].efectos_indirectos': ['Efectos indirectos: se requiere mínimo 1.'],
      },
    });

    expect(textos('.error-celda')).toEqual(['Descripción: es obligatorio.']);
    expect(elemento.querySelectorAll('td.con-error').length).toBe(1);
    expect(textos('.fila-errores .iniciativa-error')).toEqual(['Efectos indirectos: se requiere mínimo 1.']);
  });

  it('corta los textos largos a cuatro líneas y los deja abiertos con «Ver todo»', fakeAsync(() => {
    const filas = efectosDeEjemplo();
    filas[0].efectos_indirectos[0].linea_base = Array.from({ length: 12 }, (_, i) => `Línea ${i + 1}`).join('\n');
    montar(filas);
    tick();
    fixture.detectChanges();

    const verTodo = () => Array.from(elemento.querySelectorAll('.ver-todo')) as HTMLButtonElement[];
    expect(verTodo().length).toBe(1);
    expect(verTodo()[0].textContent).toContain('Ver todo');
    expect(elemento.querySelectorAll('.desvanecido').length).toBe(1);

    verTodo()[0].click();
    fixture.detectChanges();

    expect(verTodo()[0].textContent).toContain('Ver menos');
    expect(elemento.querySelectorAll('.celda-caja.abierta').length).toBe(1);
    expect(elemento.querySelectorAll('.desvanecido').length).toBe(0);
  }));

  it('marca los campos obligatorios y los opcionales', () => {
    montar(efectosDeEjemplo());

    const marcas = Array.from(elemento.querySelectorAll('tr.nivel-2 textarea')).map((t) => t.getAttribute('placeholder'));
    expect(marcas.slice(0, 2)).toEqual(['Obligatorio', 'Opcional']);
  });

  it('en solo lectura no muestra acciones ni botones y deshabilita las celdas', fakeAsync(() => {
    montar(efectosDeEjemplo(), { soloLectura: true });
    tick();
    fixture.detectChanges();

    expect(textos('thead th')).not.toContain('Acciones');
    expect(elemento.querySelectorAll('button').length).toBe(0);
    expect(Array.from(elemento.querySelectorAll('textarea')).every((t) => (t as HTMLTextAreaElement).disabled)).toBeTrue();
  }));
});
