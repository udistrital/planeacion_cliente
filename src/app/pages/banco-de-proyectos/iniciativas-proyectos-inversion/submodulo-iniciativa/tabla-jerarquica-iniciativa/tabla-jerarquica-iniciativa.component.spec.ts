import { TextFieldModule } from '@angular/cdk/text-field';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Datos, NodoDefinicion } from '../../utils';
import { ContextoFormulario } from '../../utils/formulario.utils';
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

  function montar(filas: Datos[], parcial: Partial<ContextoFormulario> = {}): Datos[] {
    const contexto: ContextoFormulario = {
      claveSubmodulo: 'problematica',
      datosSubmodulo: { efectos_directos: filas },
      relacionadas: {},
      soloLectura: false,
      errores: {},
      apariencia: 'fill',
      listasEnTabla: ['efectos_directos'],
      nombreEnCatalogo: (catalogo, codigo) => codigo,
      ...parcial,
    };
    fixture = TestBed.createComponent(TablaJerarquicaIniciativaComponent);
    Object.assign(fixture.componentInstance, { nodo: EFECTOS, filas, ruta: 'efectos_directos', contexto });
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
      declarations: [TablaJerarquicaIniciativaComponent],
      imports: [FormsModule, TextFieldModule, NoopAnimationsModule, MatIconModule, MatButtonModule, MatTooltipModule],
    }).compileComponents();
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
