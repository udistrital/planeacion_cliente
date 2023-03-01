import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormulacionPlanInversionComponent } from './formulacion-plan-inversion.component';

describe('FormulacionPlanInversionComponent', () => {
  let component: FormulacionPlanInversionComponent;
  let fixture: ComponentFixture<FormulacionPlanInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormulacionPlanInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormulacionPlanInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
