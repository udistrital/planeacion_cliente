import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionSubProyectoInversionComponent } from './evaluacion-sub-proyecto-inversion.component';

describe('EvaluacionSubProyectoInversionComponent', () => {
  let component: EvaluacionSubProyectoInversionComponent;
  let fixture: ComponentFixture<EvaluacionSubProyectoInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluacionSubProyectoInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionSubProyectoInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
