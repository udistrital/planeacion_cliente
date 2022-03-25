import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoProyectoInversionComponent } from './seguimiento-proyecto-inversion.component';

describe('SeguimientoProyectoInversionComponent', () => {
  let component: SeguimientoProyectoInversionComponent;
  let fixture: ComponentFixture<SeguimientoProyectoInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeguimientoProyectoInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeguimientoProyectoInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
