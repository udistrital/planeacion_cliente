import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Observable, of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { IniciativaService } from '../../iniciativa.service';
import { Datos, ItemCatalogo, NodoDefinicion } from '../../utils';
import { ContextoFormulario } from '../../utils/formulario.utils';
import { CampoCatalogoIniciativaComponent } from '../campo-catalogo-iniciativa/campo-catalogo-iniciativa.component';
import { ArbolCatalogoIniciativaComponent, FilaArbol } from './arbol-catalogo-iniciativa.component';

function catalogo(clave: string, nombre: string, catalogoDe: string, dependeDe?: string): NodoDefinicion {
  const dato = { clave, type: 'catalogo' as const, required: true, catalogo: catalogoDe, sin_codigo: true };
  return { id: clave, nombre, descripcion: '', dato: { ...dato, depende_de: dependeDe, multiple: !!dependeDe }, hijos: [] };
}

/** Plan Estratégico de Desarrollo: plan → lineamientos → metas. */
const PED: NodoDefinicion = {
  id: 'ped',
  nombre: 'Plan Estratégico de Desarrollo',
  descripcion: '',
  dato: { clave: 'ped', required: false },
  hijos: [
    catalogo('plan', 'Plan estratégico', 'planes_ped'),
    catalogo('lineamiento_estrategico', 'Lineamiento estratégico', 'lineamientos_ped', 'plan'),
    catalogo('meta_estrategica', 'Meta estratégica', 'metas_ped', 'lineamiento_estrategico'),
  ],
};

const CATALOGOS: { [nombre: string]: ItemCatalogo[] } = {
  planes_ped: [{ codigo: 'p1', nombre: 'Plan 2021–2025' }, { codigo: 'p2', nombre: 'Plan 2026–2030' }],
  lineamientos_ped: [
    { codigo: 'l1', nombre: 'Lineamiento 1', padre: 'p1' },
    { codigo: 'l2', nombre: 'Lineamiento 2', padre: 'p1' },
    { codigo: 'na', nombre: 'No aplica', padre: 'p1' },
    { codigo: 'l3', nombre: 'Lineamiento único', padre: 'p2' },
  ],
  metas_ped: [
    { codigo: 'm1', nombre: 'Meta 1', padre: 'l1', descripcion: 'Mantener la acreditación institucional' },
    { codigo: 'm2', nombre: 'Meta 2', padre: 'l1' },
    { codigo: 'm3', nombre: 'Meta 3', padre: 'l2' },
  ],
};

describe('ArbolCatalogoIniciativaComponent', () => {
  let fixture: ComponentFixture<ArbolCatalogoIniciativaComponent>;
  let componente: ArbolCatalogoIniciativaComponent;
  let elemento: HTMLElement;
  let catalogoDe: (nombre: string) => Observable<ItemCatalogo[]>;

  beforeEach(async () => {
    catalogoDe = (nombre) => of(CATALOGOS[nombre] || []);
    await TestBed.configureTestingModule({
      declarations: [ArbolCatalogoIniciativaComponent, CampoCatalogoIniciativaComponent],
      imports: [
        MatTableModule, ReactiveFormsModule, MatAutocompleteModule, MatInputModule, MatTooltipModule, MatIconModule, MatButtonModule,
        NoopAnimationsModule,
      ],
      providers: [{ provide: IniciativaService, useValue: { catalogo: (nombre: string) => catalogoDe(nombre) } }],
    }).compileComponents();
  });

  function montar(datos: Datos, parcial: Partial<ContextoFormulario> = {}): Datos {
    const contexto: ContextoFormulario = {
      claveSubmodulo: 'articulacion_pnd',
      datosSubmodulo: { ped: datos },
      relacionadas: {},
      soloLectura: false,
      errores: {},
      listasEnTabla: [],
      nombreEnCatalogo: (_, codigo) => codigo,
      ...parcial,
    };
    fixture = TestBed.createComponent(ArbolCatalogoIniciativaComponent);
    componente = fixture.componentInstance;
    Object.assign(componente, { nodo: PED, datos, ruta: 'ped', contexto });
    componente.ngOnChanges({ nodo: {} as any, datos: {} as any });
    fixture.detectChanges();
    elemento = fixture.nativeElement;
    return datos;
  }

  /** Filas visibles: la flecha y el nombre, como se ven en la columna Nombre. */
  const filas = () =>
    Array.from(elemento.querySelectorAll('td.mat-column-nombre')).map((celda) => celda.textContent.replace(/\s+/g, ' ').trim());

  /** Nombres de las filas en negrilla (seleccionadas). */
  const resaltadas = () =>
    Array.from(elemento.querySelectorAll('td.mat-column-nombre.highlightSelection')).map((celda) =>
      celda.textContent.replace(/chevron_right|expand_more/g, '').trim(),
    );

  const fila = (nombre: string): FilaArbol => componente.treeControl.dataNodes.find((candidata) => candidata.nombre === nombre);

  function clicEn(nombre: string, columna: 'nombre' | 'actions'): void {
    const celda = Array.from(elemento.querySelectorAll(`td.mat-column-${columna === 'nombre' ? 'nombre' : 'actions'}`)).find((td) =>
      td.closest('tr').querySelector('td.mat-column-nombre').textContent.includes(nombre),
    );
    (celda.querySelector('button') as HTMLButtonElement).click();
    fixture.detectChanges();
  }

  async function armonizar(nombre: string): Promise<void> {
    await componente.armonizar(fila(nombre));
    fixture.detectChanges();
  }

  it('el plan se elige en el campo de catálogo del formulario; sin plan no hay tabla', () => {
    montar({});
    expect(elemento.querySelector('table')).toBeNull();
    const campoPlan = fixture.debugElement.query(By.directive(CampoCatalogoIniciativaComponent)).componentInstance;
    expect(campoPlan.nodo.dato.clave).toBe('plan');
    expect(elemento.querySelector('mat-label').textContent).toContain('Plan estratégico');

    campoPlan.seleccionar(CATALOGOS.planes_ped[0]);
    fixture.detectChanges();
    expect(filas()).toEqual(['chevron_right Lineamiento 1', 'chevron_right Lineamiento 2', 'chevron_right No aplica']);
    expect(Array.from(elemento.querySelectorAll('th')).map((th) => th.textContent.trim())).toEqual(['Nombre', 'Descripción', 'Estado', 'Armonizar']);
  });

  it('despliega con la flecha y selecciona varios, en cualquier nivel; al seleccionar uno quedan los de arriba', async () => {
    const datos = montar({ plan: 'p1', lineamiento_estrategico: [], meta_estrategica: [] });
    clicEn('Lineamiento 1', 'nombre');
    expect(filas()).toEqual([
      'expand_more Lineamiento 1',
      'chevron_right Meta 1',
      'chevron_right Meta 2',
      'chevron_right Lineamiento 2',
      'chevron_right No aplica',
    ]);
    expect(elemento.textContent).toContain('Mantener la acreditación institucional');

    clicEn('Meta 2', 'actions');
    await fixture.whenStable();
    fixture.detectChanges();
    expect(datos).toEqual({ plan: 'p1', lineamiento_estrategico: ['l1'], meta_estrategica: ['m2'] });
    expect(resaltadas()).toEqual(['Lineamiento 1', 'Meta 2']);

    await armonizar('Meta 1');
    await armonizar('Lineamiento 2');
    expect(datos).toEqual({ plan: 'p1', lineamiento_estrategico: ['l1', 'l2'], meta_estrategica: ['m1', 'm2'] });
    expect(fila('Meta 1').icon).toBe('done');
  });

  it('al quitar uno se quitan los de abajo y los de arriba que se quedan sin ninguno', async () => {
    const datos = montar({ plan: 'p1', lineamiento_estrategico: ['l1', 'l2'], meta_estrategica: ['m1', 'm2', 'm3'] });
    await armonizar('Lineamiento 1');
    expect(datos).toEqual({ plan: 'p1', lineamiento_estrategico: ['l2'], meta_estrategica: ['m3'] });

    await armonizar('Meta 3');
    expect(datos).toEqual({ plan: 'p1', lineamiento_estrategico: [], meta_estrategica: [] });
  });

  it('«No aplica», si se confirma, quita lo demás de su nivel; al elegir otro, se quita él', async () => {
    const confirmar = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false }) as any);
    const datos = montar({ plan: 'p1', lineamiento_estrategico: ['l1'], meta_estrategica: ['m1'] });

    await armonizar('No aplica');
    expect(confirmar).toHaveBeenCalled();
    expect(datos.lineamiento_estrategico).toEqual(['l1']);

    confirmar.and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    await armonizar('No aplica');
    expect(datos).toEqual({ plan: 'p1', lineamiento_estrategico: ['na'], meta_estrategica: [] });

    await armonizar('Lineamiento 2');
    expect(datos.lineamiento_estrategico).toEqual(['l2']);
  });

  it('al cambiar de plan quita lo seleccionado en el anterior', () => {
    const datos = montar({ plan: 'p1', lineamiento_estrategico: ['l2'], meta_estrategica: ['m3'] });
    componente.cambiarPlan('p2');
    fixture.detectChanges();
    expect(datos).toEqual({ plan: 'p2', lineamiento_estrategico: [], meta_estrategica: [] });
    expect(filas()).toEqual(['chevron_right Lineamiento único']);

    componente.cambiarPlan(null);
    fixture.detectChanges();
    expect(elemento.querySelector('table')).toBeNull();
  });

  it('abre la tabla desplegada hasta lo seleccionado, en negrilla y con ✓', () => {
    montar({ plan: 'p1', lineamiento_estrategico: ['l2'], meta_estrategica: ['m3'] });
    expect(filas()).toEqual([
      'chevron_right Lineamiento 1',
      'expand_more Lineamiento 2',
      'chevron_right Meta 3',
      'chevron_right No aplica',
    ]);
    expect(resaltadas()).toEqual(['Lineamiento 2', 'Meta 3']);
    expect(Array.from(elemento.querySelectorAll('td.mat-column-actions')).map((td) => td.textContent.trim())).toEqual([
      'compare_arrows', 'done', 'done', 'compare_arrows',
    ]);
  });

  it('en solo lectura no deja seleccionar', async () => {
    const datos = montar({ plan: 'p1', lineamiento_estrategico: ['l2'], meta_estrategica: ['m3'] }, { soloLectura: true });
    const botones = Array.from(elemento.querySelectorAll('td.mat-column-actions button')) as HTMLButtonElement[];
    expect(botones.every((boton) => boton.disabled)).toBeTrue();
    await armonizar('Meta 3');
    expect(datos.meta_estrategica).toEqual(['m3']);
  });

  it('muestra los errores de los niveles, el aviso de un plan vacío y el de catálogos que no se pudieron leer', () => {
    const errores = { 'ped.meta_estrategica': ['Meta estratégica: es obligatorio.'] };
    montar({ plan: 'p1', lineamiento_estrategico: [] }, { errores });
    expect(elemento.querySelector('.iniciativa-error').textContent).toContain('Meta estratégica: es obligatorio.');

    catalogoDe = (nombre) => of(nombre === 'lineamientos_ped' ? [] : CATALOGOS[nombre]);
    montar({ plan: 'p1' });
    expect(elemento.querySelector('p').textContent).toContain('El plan seleccionado no tiene objetivos para la armonización.');

    const sinOpciones = { error: { Message: 'No se encontraron las opciones de este campo.' } };
    catalogoDe = (nombre) => (nombre === 'planes_ped' ? of(CATALOGOS.planes_ped) : throwError(sinOpciones));
    montar({ plan: 'p1' });
    expect(elemento.querySelector('p').textContent).toContain('No se encontraron las opciones de este campo.');
  });
});
