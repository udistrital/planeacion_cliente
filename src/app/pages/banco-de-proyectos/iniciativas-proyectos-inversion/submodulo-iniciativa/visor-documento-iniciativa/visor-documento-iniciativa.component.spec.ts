import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { of } from 'rxjs';
import { VisorDocumentoIniciativaComponent } from './visor-documento-iniciativa.component';

describe('VisorDocumentoIniciativaComponent', () => {
  let fixture: ComponentFixture<VisorDocumentoIniciativaComponent>;
  let dialogRef: { close: jasmine.Spy; afterOpened: () => any };

  beforeEach(async () => {
    dialogRef = { close: jasmine.createSpy('close'), afterOpened: () => of(undefined) };
    await TestBed.configureTestingModule({
      declarations: [VisorDocumentoIniciativaComponent],
      imports: [MatIconModule, MatButtonModule, MatTooltipModule],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { url: 'about:blank', nombre: 'Carta.pdf' } },
        { provide: MatDialogRef, useValue: dialogRef },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(VisorDocumentoIniciativaComponent);
    fixture.detectChanges();
  });

  it('se crea', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('muestra el nombre del documento en la barra', () => {
    const titulo = fixture.nativeElement.querySelector('.visor-doc__titulo');
    expect(titulo.textContent).toContain('Carta.pdf');
  });

  it('carga el PDF en el iframe cuando el modal termina de abrirse', () => {
    expect(fixture.nativeElement.querySelector('iframe.visor-doc__marco')).not.toBeNull();
  });

  it('cierra el modal con el botón de cerrar', () => {
    fixture.nativeElement.querySelector('.visor-doc__cerrar').click();
    expect(dialogRef.close).toHaveBeenCalled();
  });
});
