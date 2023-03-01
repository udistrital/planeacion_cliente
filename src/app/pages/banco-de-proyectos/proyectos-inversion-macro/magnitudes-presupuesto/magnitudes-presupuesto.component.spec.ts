import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MagnitudesPresupuestoComponent } from './magnitudes-presupuesto.component';

describe('MagnitudesPresupuestoComponent', () => {
  let component: MagnitudesPresupuestoComponent;
  let fixture: ComponentFixture<MagnitudesPresupuestoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MagnitudesPresupuestoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MagnitudesPresupuestoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
