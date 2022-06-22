import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionProyectoInversionComponent } from './evaluacion-proyecto-inversion.component';

describe('EvaluacionProyectoInversionComponent', () => {
  let component: EvaluacionProyectoInversionComponent;
  let fixture: ComponentFixture<EvaluacionProyectoInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluacionProyectoInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionProyectoInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
