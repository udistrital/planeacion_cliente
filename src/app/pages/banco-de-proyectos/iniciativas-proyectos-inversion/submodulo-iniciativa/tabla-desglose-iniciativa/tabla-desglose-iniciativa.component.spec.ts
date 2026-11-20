import { TextFieldModule } from '@angular/cdk/text-field';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { IniciativaService } from '../../iniciativa.service';
import { Datos, NodoDefinicion } from '../../utils';
import { ContextoFormulario, prepararEstructura } from '../../utils/formulario.utils';
import { CampoCatalogoIniciativaComponent } from '../campo-catalogo-iniciativa/campo-catalogo-iniciativa.component';
import { CeldaIniciativaComponent } from '../celda-iniciativa/celda-iniciativa.component';
import { TablaDesgloseIniciativaComponent } from './tabla-desglose-iniciativa.component';

function nodo(clave: string, nombre: string, tipo?: any, extra: any = {}, hijos: NodoDefinicion[] = []): NodoDefinicion {
  return { id: clave, nombre, descripcion: '', dato: { clave, type: tipo, required: true, ...extra }, hijos };
}

const ETNICOS = 'Trazador Presupuestal de Grupos Étnicos';
const NO_ETNICOS = { solo_si: { campo: 'origen', valor: ETNICOS, distinto: true } };

/**
 * Trazadores presupuestales como en la plantilla: Grupos Étnicos se desglosa por comunidad y se
 * pueden agregar hasta dos «Otro: ¿Cuál?».
 */
const TRAZADORES = nodo('trazadores', 'Trazadores', 'repetible', {
  espejo_de: 'catalogo.trazadores_presupuestales',
  mostrar: 'nombre',
  filas_opcionales: true,
  filas_adicionales: { origen: 'Otro', max: 2, nombre: 'Otro: ¿Cuál?', etiqueta: 'Otro trazador' },
  etiqueta_fila: 'Nombre completo del trazador presupuestal',
}, [
  nodo('cual', '¿Cuál?', 'input', { maxlength: 300, solo_si: { campo: 'origen', valor: 'Otro' } }),
  nodo('descripcion', 'Descripción', 'input', { multilinea: true }),
  nodo('discriminado', 'Discriminado', 'input', { required: false, ...NO_ETNICOS }),
  nodo('numero_beneficiarios', 'Número de beneficiarios', 'numeric', { min: 0, decimales: 0, ...NO_ETNICOS }),
  nodo('actividad', 'Actividad', 'input', { required: false, multilinea: true }),
  nodo('presupuesto', 'Presupuesto', 'input', { required: false, maxlength: 300 }),
  nodo('grupos_etnicos', 'Comunidades', 'repetible', {
    espejo_de: 'catalogo.grupos_etnicos_trazador',
    mostrar: 'nombre',
    filas_opcionales: true,
    min: 1,
    solo_si: { campo: 'origen', valor: ETNICOS },
  }, [nodo('numero_beneficiarios', 'Número de beneficiarios', 'numeric', { min: 0, decimales: 0 })]),
]);

const CATALOGOS = {
  trazadores_presupuestales: [
    { id: 'Trazador Presupuestal de Cultura Ciudadana', nombre: 'Trazador Presupuestal de Cultura Ciudadana', descripcion: 'Busca consolidar un modelo…' },
    { id: ETNICOS, nombre: ETNICOS, descripcion: 'Orientado a evidenciar…' },
    { id: 'Trazador Presupuestal de Juventud', nombre: 'Trazador Presupuestal de Juventud' },
  ],
  grupos_etnicos_trazador: [
    { id: 'Comunidades indígenas', nombre: 'Comunidades indígenas' },
    { id: 'Comunidades Rrom', nombre: 'Comunidades Rrom' },
  ],
};

describe('TablaDesgloseIniciativaComponent', () => {
  let fixture: ComponentFixture<TablaDesgloseIniciativaComponent>;
  let elemento: HTMLElement;

  /** Arma la tabla como el submódulo: prepararEstructura crea una fila por trazador y por comunidad. */
  function montar(parcial: Partial<ContextoFormulario> = {}, guardadas: Datos[] = []): Datos[] {
    const datos: Datos = { trazadores: guardadas };
    const contexto: ContextoFormulario = {
      claveSubmodulo: 'trazadores_presupuestales',
      datosSubmodulo: datos,
      relacionadas: { catalogo: CATALOGOS },
      soloLectura: false,
      errores: {},
      listasEnTabla: [],
      nombreEnCatalogo: (catalogo, codigo) => codigo,
      ...parcial,
    };
    prepararEstructura([TRAZADORES], datos, contexto);
    fixture = TestBed.createComponent(TablaDesgloseIniciativaComponent);
    Object.assign(fixture.componentInstance, { nodo: TRAZADORES, filas: datos.trazadores, ruta: 'trazadores', contexto });
    fixture.componentInstance.ngOnChanges();
    fixture.detectChanges();
    elemento = fixture.nativeElement;
    return datos.trazadores;
  }

  const textos = (selector: string) => Array.from(elemento.querySelectorAll(selector)).map((e) => e.textContent.trim());
  const numeros = () => Array.from(elemento.querySelectorAll('input[type=number]')) as HTMLInputElement[];
  const botonAgregar = () => elemento.querySelector('button.agregar') as HTMLButtonElement | null;
  const otro = (campos: Datos = {}): Datos => ({ id: 'tp-9', origen: 'Otro', ...campos });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TablaDesgloseIniciativaComponent, CeldaIniciativaComponent, CampoCatalogoIniciativaComponent],
      imports: [
        FormsModule, ReactiveFormsModule, TextFieldModule, NoopAnimationsModule, MatIconModule, MatTooltipModule,
        MatAutocompleteModule, MatCheckboxModule,
      ],
      providers: [{ provide: IniciativaService, useValue: { catalogo: () => of([]) } }],
    }).compileComponents();
  });

  it('muestra cada trazador con su definición como ayuda y sus campos en columnas', () => {
    montar();

    expect(textos('thead th:not(.col-acciones)')).toEqual([
      'N.°', 'Nombre completo del trazador presupuestal', 'Descripción', 'Discriminado', 'Número de beneficiarios', 'Actividad', 'Presupuesto',
    ]);
    expect(textos('td.origen .origen__nombre')).toEqual(['Trazador Presupuestal de Cultura Ciudadana', ETNICOS, 'Trazador Presupuestal de Juventud']);
    expect(textos('td.origen .origen__ayuda')).toEqual(['Busca consolidar un modelo…', 'Orientado a evidenciar…']);
    expect(textos('td.numero')).toEqual(['1', '2', '3']);
  });

  it('parte Grupos Étnicos en una subfila por comunidad, cada una con su número de beneficiarios', () => {
    const filas = montar();

    expect(textos('td.elemento')).toEqual(['Comunidades indígenas', 'Comunidades Rrom']);
    expect(elemento.querySelector('td.origen').getAttribute('rowspan')).toBe('1');
    expect(elemento.querySelectorAll('td.origen')[1].getAttribute('rowspan')).toBe('2');
    // Cultura, las dos comunidades y Juventud; la descripción, la actividad y el presupuesto de Grupos
    // Étnicos son uno solo (3 + 3 + 3) y el discriminado es de Cultura y Juventud (2).
    expect(numeros().length).toBe(4);
    expect(elemento.querySelectorAll('textarea').length).toBe(11);

    numeros()[1].value = '40';
    numeros()[1].dispatchEvent(new Event('input'));
    expect(filas[1].grupos_etnicos[0].numero_beneficiarios).toBe(40);
    expect(filas[1].numero_beneficiarios).toBeUndefined();
  });

  it('las celdas vacías dicen «Si aplica»: se llenan solo los trazadores a los que contribuye el proyecto', fakeAsync(() => {
    montar();
    tick();
    fixture.detectChanges();

    expect(numeros().map((n) => n.placeholder)).toEqual(['Si aplica', 'Si aplica', 'Si aplica', 'Si aplica']);
  }));

  it('muestra debajo de la fila los errores del desglose y en su celda los de cada comunidad', () => {
    const indigenas = { id: 'ge-1', origen: 'Comunidades indígenas' };
    const guardada = { id: 'tp-2', origen: ETNICOS, descripcion: 'Becas', grupos_etnicos: [indigenas] };
    montar({
      errores: {
        'trazadores[tp-2].grupos_etnicos': ['Comunidades: diligencie al menos 1 (hay 0).'],
        'trazadores[tp-2].grupos_etnicos[ge-1].numero_beneficiarios': ['Número de beneficiarios: es obligatorio.'],
      },
    }, [guardada]);

    expect(textos('.fila-errores .iniciativa-error')).toEqual(['Comunidades: diligencie al menos 1 (hay 0).']);
    expect(textos('.error-celda')).toEqual(['Número de beneficiarios: es obligatorio.']);
    expect(elemento.querySelectorAll('td.con-error').length).toBe(1);
  });

  it('agrega con «Agregar otro trazador» hasta dos «Otro: ¿Cuál?», que se nombran en la celda del trazador', () => {
    const filas = montar();
    expect(botonAgregar().textContent).toContain('Agregar otro trazador');
    // Sin filas agregadas no hay columna Acciones.
    expect(elemento.querySelector('th.col-acciones')).toBeNull();

    botonAgregar().click();
    fixture.detectChanges();
    expect(filas.length).toBe(4);
    expect(filas[3].origen).toBe('Otro');
    expect(textos('td.origen .origen__nombre')[3]).toBe('Otro: ¿Cuál?');
    const cual = elemento.querySelectorAll('td.origen')[3].querySelector('textarea') as HTMLTextAreaElement;
    cual.value = 'Trazador de Paz';
    cual.dispatchEvent(new Event('input'));
    expect(filas[3].cual).toBe('Trazador de Paz');
    // Sin comunidades: lleva su propio número de beneficiarios.
    expect(numeros().length).toBe(5);

    botonAgregar().click();
    fixture.detectChanges();
    expect(filas.length).toBe(5);
    expect(botonAgregar()).toBeNull();
    expect(textos('th.col-acciones')).toEqual(['Acciones']);
    expect(textos('td.numero')).toEqual(['1', '2', '3', '4', '5']);
    expect(elemento.querySelectorAll('td.acciones button').length).toBe(2);
  });

  it('elimina, después de confirmar, solo las filas agregadas', fakeAsync(() => {
    const filas = montar({}, [otro({ cual: 'Trazador de Paz' })]);
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    expect(filas.map((fila) => fila.origen)).toEqual(['Trazador Presupuestal de Cultura Ciudadana', ETNICOS, 'Trazador Presupuestal de Juventud', 'Otro']);
    expect(elemento.querySelectorAll('td.acciones button').length).toBe(1);

    (elemento.querySelector('td.acciones button') as HTMLButtonElement).click();
    tick();
    fixture.detectChanges();

    expect(filas.map((fila) => fila.origen)).not.toContain('Otro');
    expect(textos('td.origen .origen__nombre').length).toBe(3);
    expect(botonAgregar()).not.toBeNull();
    expect(elemento.querySelector('th.col-acciones')).toBeNull();
  }));

  it('en solo lectura no se agregan ni se eliminan, y el error del «¿Cuál?» va en la celda del trazador', () => {
    montar({ soloLectura: true, errores: { 'trazadores[tp-9].cual': ['¿Cuál?: es obligatorio.'] } }, [otro()]);

    expect(elemento.querySelector('th.col-acciones')).toBeNull();
    expect(elemento.querySelector('td.acciones')).toBeNull();
    expect(botonAgregar()).toBeNull();
    const celda = elemento.querySelectorAll('td.origen')[3];
    expect(celda.querySelector('.origen__nombre').textContent.trim()).toBe('Otro: ¿Cuál?');
    expect(celda.classList).toContain('con-error');
    expect(textos('td.origen .error-celda')).toEqual(['¿Cuál?: es obligatorio.']);
  });
});
