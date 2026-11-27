import { OverlayContainer } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ResumenModulo, ResumenSubmodulo } from '../../utils';
import { MenuSubmodulosIniciativaComponent } from './menu-submodulos-iniciativa.component';

function submodulo(clave: string, nombre: string, codigo: string, estado: string, color: string): ResumenSubmodulo {
  return {
    clave,
    nombre,
    accion: 'consultar',
    observaciones: 0,
    dependientes: [],
    estado: { nombre: estado, codigo_abreviacion: codigo, color },
  };
}

function modulo(clave: string, nombre: string, submodulos: ResumenSubmodulo[]): ResumenModulo {
  return { clave, nombre, submodulos };
}

const MODULOS = [
  modulo('identificacion', 'Identificación', [submodulo('nombre', 'Nombre', 'APR_SUB', 'Aprobado', '#2e7d32')]),
  modulo('preparacion', 'Preparación', [
    submodulo('necesidades', 'Necesidades', 'FOR_SUB', 'Formulado', '#f9a825'),
    submodulo('riesgos', 'Riesgos', 'SF_SUB', 'Sin formular', '#c62828'),
  ]),
];

describe('MenuSubmodulosIniciativaComponent (selector de submódulos)', () => {
  let fixture: ComponentFixture<MenuSubmodulosIniciativaComponent>;
  let componente: MenuSubmodulosIniciativaComponent;
  let elegidos: string[];

  const textos = (raiz: Element, selector: string) => Array.from(raiz.querySelectorAll(selector)).map((e) => e.textContent.trim());
  const boton = (nombre: string) => fixture.nativeElement.querySelector(`button[aria-label="Submódulo ${nombre}"]`) as HTMLButtonElement;

  async function montar(actual: string): Promise<void> {
    fixture = TestBed.createComponent(MenuSubmodulosIniciativaComponent);
    componente = fixture.componentInstance;
    Object.assign(componente, { modulos: MODULOS, actual });
    componente.ngOnChanges();
    elegidos = [];
    componente.elegir.subscribe((s: ResumenSubmodulo) => elegidos.push(s.clave));
    fixture.detectChanges();
    // mat-select marca la opción del valor en una microtarea: el valor se pinta en el siguiente ciclo.
    await fixture.whenStable();
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MenuSubmodulosIniciativaComponent],
      imports: [NoopAnimationsModule, MatButtonModule, MatIconModule, MatSelectModule, MatTooltipModule],
    }).compileComponents();
  });

  it('muestra el submódulo actual con su estado y cuántos van formulados', async () => {
    await montar('necesidades');

    expect(textos(fixture.nativeElement, '.mat-select-value .opcion__nombre')).toEqual(['Necesidades']);
    expect(textos(fixture.nativeElement, '.mat-select-value .opcion__estado')).toEqual(['Formulado']);
    expect(textos(fixture.nativeElement, '.selector__conteo')).toEqual(['2 de 3 formulados']);
  });

  it('al abrirlo agrupa los submódulos por módulo, con su estado', async () => {
    await montar('necesidades');
    (fixture.nativeElement.querySelector('.mat-select-trigger') as HTMLElement).click();
    fixture.detectChanges();
    const panel = TestBed.inject(OverlayContainer).getContainerElement();

    expect(textos(panel, '.mat-optgroup-label')).toEqual(['Identificación', 'Preparación']);
    expect(textos(panel, '.mat-optgroup:nth-of-type(2) .opcion__nombre')).toEqual(['Necesidades', 'Riesgos']);
    expect(textos(panel, '.opcion__estado')).toEqual(['Aprobado', 'Formulado', 'Sin formular']);
  });

  it('pasa al anterior y al siguiente (también de un módulo al otro), y no deja salir de los extremos', async () => {
    await montar('necesidades');

    boton('anterior').click();
    boton('siguiente').click();
    expect(elegidos).toEqual(['nombre', 'riesgos']);

    await montar('riesgos');
    expect(boton('siguiente').disabled).toBeTrue();
    expect(boton('anterior').disabled).toBeFalse();
  });
});
