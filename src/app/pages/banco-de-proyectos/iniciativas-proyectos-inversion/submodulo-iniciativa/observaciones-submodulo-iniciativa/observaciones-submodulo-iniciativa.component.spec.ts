import { TextFieldModule } from '@angular/cdk/text-field';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { IniciativaService } from '../../iniciativa.service';
import { Observacion, SubmoduloVista } from '../../utils';
import { DatosObservaciones, ObservacionesSubmoduloIniciativaComponent } from './observaciones-submodulo-iniciativa.component';

const HISTORIAL: Observacion[] = [
  { _id: 'o1', texto: 'Precisar la fuente.', rol: 'PLANEACION', usuario: '100', fecha: '2026-11-04T10:00:00Z' },
  { _id: 'o2', texto: 'Se agregó la fuente.', rol: 'JEFE_DEPENDENCIA', usuario: '200', usuario_nombre: 'Ana María Pérez', fecha: '2026-11-05T09:00:00Z' },
];

describe('ObservacionesSubmoduloIniciativaComponent (modal de observaciones)', () => {
  let fixture: ComponentFixture<ObservacionesSubmoduloIniciativaComponent>;
  let componente: ObservacionesSubmoduloIniciativaComponent;
  let servicio: jasmine.SpyObj<IniciativaService>;

  function montar(parcial: Partial<DatosObservaciones>): void {
    const datos: DatosObservaciones = {
      iniciativaId: 'p1',
      clave: 'problematica',
      nombreSubmodulo: 'Problemática',
      observaciones: HISTORIAL,
      usuario: '200',
      puedePublicar: false,
      ...parcial,
    };
    servicio = jasmine.createSpyObj('IniciativaService', ['agregarObservacion']);
    TestBed.configureTestingModule({
      declarations: [ObservacionesSubmoduloIniciativaComponent],
      imports: [FormsModule, TextFieldModule, MatDialogModule, MatInputModule, MatButtonModule, NoopAnimationsModule],
      providers: [
        { provide: IniciativaService, useValue: servicio },
        { provide: MAT_DIALOG_DATA, useValue: datos },
      ],
    });
    fixture = TestBed.createComponent(ObservacionesSubmoduloIniciativaComponent);
    componente = fixture.componentInstance;
    fixture.detectChanges();
  }

  function textoDe(selector: string): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll(selector)).map((el: HTMLElement) => el.textContent.trim());
  }

  it('sin permiso para publicar solo lista las entradas, de la más reciente a la más antigua', () => {
    montar({});

    expect(textoDe('.entrada__texto')).toEqual(['Se agregó la fuente.', 'Precisar la fuente.']);
    expect(textoDe('.entrada__autor')).toEqual(['Ana María Pérez', 'Planeación']);
    expect(textoDe('.entrada__rol')).toEqual(['Jefe de dependencia']);
    expect(textoDe('.entrada__propia')).toEqual(['Usted']);
    expect(fixture.nativeElement.querySelector('textarea')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Publicar');
  });

  it('avisa cuando no hay observaciones', () => {
    montar({ observaciones: [] });

    expect(fixture.nativeElement.textContent).toContain('Aún no hay observaciones');
  });

  it('si puede publicar, manda el texto (el rol lo pone el mid), la muestra de primera y avisa a la pantalla', () => {
    montar({ puedePublicar: true });
    const nueva: Observacion = { _id: 'o3', texto: 'Se ajustó la línea base.', rol: 'JEFE_DEPENDENCIA', usuario: '200' };
    const vista = { observaciones: [...HISTORIAL, nueva] } as SubmoduloVista;
    servicio.agregarObservacion.and.returnValue(of(vista));
    const publicadas: SubmoduloVista[] = [];
    componente.publicada.subscribe((v: SubmoduloVista) => publicadas.push(v));

    componente.texto = '  Se ajustó la línea base.  ';
    componente.publicar();
    fixture.detectChanges();

    expect(servicio.agregarObservacion).toHaveBeenCalledWith('p1', 'problematica', 'Se ajustó la línea base.');
    expect(componente.texto).toBe('');
    expect(textoDe('.entrada__texto')[0]).toBe('Se ajustó la línea base.');
    expect(publicadas).toEqual([vista]);
  });

  it('no publica un texto vacío', () => {
    montar({ puedePublicar: true, observaciones: [] });
    componente.texto = '   ';

    componente.publicar();

    expect(servicio.agregarObservacion).not.toHaveBeenCalled();
  });

  it('el avatar usa las iniciales del nombre y, sin nombre, las del rol', () => {
    montar({});

    expect(textoDe('.entrada__avatar')).toEqual(['AM', 'P']);
  });
});
