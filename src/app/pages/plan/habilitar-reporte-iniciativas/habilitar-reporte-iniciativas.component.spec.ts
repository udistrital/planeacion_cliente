import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HabilitarReporteIniciativasComponent } from './habilitar-reporte-iniciativas.component';

describe('HabilitarReporteIniciativasComponent', () => {
  let component: HabilitarReporteIniciativasComponent;
  let fixture: ComponentFixture<HabilitarReporteIniciativasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HabilitarReporteIniciativasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HabilitarReporteIniciativasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
