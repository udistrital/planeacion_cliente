import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoSubProyectoInversionComponent } from './seguimiento-sub-proyecto-inversion.component';

describe('SeguimientoSubProyectoInversionComponent', () => {
  let component: SeguimientoSubProyectoInversionComponent;
  let fixture: ComponentFixture<SeguimientoSubProyectoInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeguimientoSubProyectoInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeguimientoSubProyectoInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
