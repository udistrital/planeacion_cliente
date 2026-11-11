import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { IniciativaService } from '../../iniciativa.service';
import { Datos, NodoDefinicion } from '../../utils';
import { ContextoFormulario, prepararEstructura } from '../../utils/formulario.utils';
import { CampoCatalogoIniciativaComponent } from '../campo-catalogo-iniciativa/campo-catalogo-iniciativa.component';
import { CampoMatrizIniciativaComponent } from '../campo-matriz-iniciativa/campo-matriz-iniciativa.component';
import { GrupoRepetibleIniciativaComponent } from '../grupo-repetible-iniciativa/grupo-repetible-iniciativa.component';
import { CamposIniciativaComponent } from './campos-iniciativa.component';

function nodo(clave: string, nombre: string, tipo?: any, extra: any = {}, hijos: NodoDefinicion[] = []): NodoDefinicion {
  return { id: clave, nombre, descripcion: '', bandera_tabla: false, dato: { clave, type: tipo, required: true, ...extra }, hijos };
}

const PROBLEMATICA: NodoDefinicion[] = [
  nodo('problema_central', 'Problema central', 'input', { multilinea: true }),
  nodo('causas_directas', 'Causas directas', 'repetible', { min: 1, etiqueta_fila: 'Causa directa' }, [
    nodo('descripcion', 'Descripción', 'input'),
    nodo('causas_indirectas', 'Causas indirectas', 'repetible', { min: 1, etiqueta_fila: 'Causa indirecta' }, [
      nodo('descripcion', 'Descripción', 'input'),
    ]),
  ]),
];

const OBJETIVOS: NodoDefinicion[] = [
  nodo('objetivos_especificos', 'Objetivos específicos', 'repetible',
    { espejo_de: 'problematica.causas_directas', mostrar: 'descripcion', etiqueta_fila: 'Objetivo específico' }, [
      nodo('objetivo_especifico', 'Objetivo específico', 'input'),
      nodo('medios', 'Medios', 'repetible', { etiqueta_fila: 'Medio' }, [
        nodo('causa_indirecta', 'Causa indirecta que atiende', 'referencia', { opciones_desde: 'origen.causas_indirectas', mostrar: 'descripcion' }),
      ]),
    ]),
];

function problematicaDeEjemplo(): Datos {
  return {
    problema_central: 'Bajas capacidades tecnológicas',
    causas_directas: [
      { id: 'cd-1', descripcion: 'Obsolescencia de la infraestructura', causas_indirectas: [
        { id: 'ci-1', descripcion: 'Fallas en los equipos' },
        { id: 'ci-2', descripcion: 'Falta de mantenimiento' },
      ] },
      { id: 'cd-2', descripcion: 'Herramientas insuficientes', causas_indirectas: [{ id: 'ci-3', descripcion: 'Recursos insuficientes' }] },
    ],
  };
}

describe('CamposIniciativaComponent (formulario dinámico)', () => {
  let fixture: ComponentFixture<CamposIniciativaComponent>;
  let elemento: HTMLElement;

  function montar(nodos: NodoDefinicion[], clave: string, datos: Datos, parcial: Partial<ContextoFormulario> = {}): Datos {
    const contexto: ContextoFormulario = {
      claveSubmodulo: clave,
      datosSubmodulo: datos,
      relacionadas: {},
      soloLectura: false,
      errores: {},
      nombreEnCatalogo: (catalogo, codigo) => codigo,
      ...parcial,
    };
    contexto.datosSubmodulo = datos;
    prepararEstructura(nodos, datos, contexto);
    fixture = TestBed.createComponent(CamposIniciativaComponent);
    Object.assign(fixture.componentInstance, { nodos, datos, ruta: '', contexto });
    fixture.detectChanges();
    elemento = fixture.nativeElement;
    return datos;
  }

  const textos = (selector: string) => Array.from(elemento.querySelectorAll(selector)).map((e) => e.textContent.trim());

  const servicioFalso = {
    catalogo: () => of([]),
    nombreEnCatalogo: (catalogo: string, codigo: string) => codigo,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CamposIniciativaComponent,
        GrupoRepetibleIniciativaComponent,
        CampoCatalogoIniciativaComponent,
        CampoMatrizIniciativaComponent,
      ],
      imports: [
        FormsModule, ReactiveFormsModule, NoopAnimationsModule, MatInputModule, MatSelectModule,
        MatAutocompleteModule, MatIconModule, MatButtonModule, MatTooltipModule,
      ],
      providers: [{ provide: IniciativaService, useValue: servicioFalso }],
    }).compileComponents();
  });

  it('dibuja las causas directas y, dentro de cada una, sus causas indirectas', fakeAsync(() => {
    montar(PROBLEMATICA, 'problematica', problematicaDeEjemplo());
    tick();
    fixture.detectChanges();

    const titulos = textos('.iniciativa-fila__titulo strong');
    expect(titulos.filter((t) => t.startsWith('Causa directa')).length).toBe(2);
    expect(titulos.filter((t) => t.startsWith('Causa indirecta')).length).toBe(3);
    const valores = Array.from(elemento.querySelectorAll('textarea')).map((t) => (t as HTMLTextAreaElement).value);
    expect(valores).toContain('Falta de mantenimiento');
  }));

  it('agrega una fila nueva con id y su lista anidada vacía', () => {
    const datos = montar(PROBLEMATICA, 'problematica', problematicaDeEjemplo());
    const agregar = Array.from(elemento.querySelectorAll('button')).find((b) => b.textContent.includes('Agregar causa directa'));

    agregar.click();
    fixture.detectChanges();

    expect(datos.causas_directas.length).toBe(3);
    expect(datos.causas_directas[2].id).toMatch(/^cd-/);
    expect(datos.causas_directas[2].causas_indirectas).toEqual([]);
  });

  it('muestra los errores del servidor junto al campo que corresponde', () => {
    montar(PROBLEMATICA, 'problematica', problematicaDeEjemplo(), {
      errores: { 'causas_directas[cd-2].causas_indirectas[ci-3].descripcion': ['Descripción: es obligatorio.'] },
    });

    expect(textos('.iniciativa-error')).toEqual(['error_outline Descripción: es obligatorio.']);
  });

  it('en solo lectura no permite agregar ni eliminar y deshabilita los campos', fakeAsync(() => {
    montar(PROBLEMATICA, 'problematica', problematicaDeEjemplo(), { soloLectura: true });
    tick();
    fixture.detectChanges();

    expect(textos('button').some((t) => t.includes('Agregar'))).toBeFalse();
    expect(elemento.querySelectorAll('.iniciativa-fila__titulo button').length).toBe(0);
    expect(Array.from(elemento.querySelectorAll('textarea')).every((t) => (t as HTMLTextAreaElement).disabled)).toBeTrue();
  }));

  it('arma el espejo desde el submódulo de origen y ofrece solo las causas de su causa directa', fakeAsync(() => {
    const datos = montar(OBJETIVOS, 'objetivos', {}, { relacionadas: { problematica: problematicaDeEjemplo() } });
    tick();
    fixture.detectChanges();

    expect(datos.objetivos_especificos.map((f: Datos) => f.origen)).toEqual(['cd-1', 'cd-2']);
    expect(textos('.iniciativa-fila__origen')).toEqual(['Obsolescencia de la infraestructura', 'Herramientas insuficientes']);
    expect(textos('button').some((t) => t.includes('Agregar objetivo'))).toBeFalse();

    const medios = Array.from(elemento.querySelectorAll('button')).filter((b) => b.textContent.includes('Agregar medio'));
    medios[0].click();
    fixture.detectChanges();
    const grupo = fixture.debugElement.queryAll((d) => d.componentInstance instanceof CamposIniciativaComponent)
      .map((d) => d.componentInstance as CamposIniciativaComponent)
      .find((c) => c.nodos[0] && c.nodos[0].dato.clave === 'causa_indirecta');
    const opciones = grupo.opcionesDe(grupo.nodos[0]).map((o) => o.etiqueta);
    expect(opciones).toEqual(['Fallas en los equipos', 'Falta de mantenimiento']);
  }));
});
