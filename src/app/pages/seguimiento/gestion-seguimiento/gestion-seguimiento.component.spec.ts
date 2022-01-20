import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoComponentGestion } from './gestion-seguimiento.component';

describe('SeguimientoComponentGestion', () => {
  let component: SeguimientoComponentGestion;
  let fixture: ComponentFixture<SeguimientoComponentGestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeguimientoComponentGestion ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeguimientoComponentGestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
