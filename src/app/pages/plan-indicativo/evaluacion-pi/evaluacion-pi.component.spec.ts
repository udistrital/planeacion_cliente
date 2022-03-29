import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionPIComponent } from './evaluacion-pi.component';

describe('EvaluacionPIComponent', () => {
  let component: EvaluacionPIComponent;
  let fixture: ComponentFixture<EvaluacionPIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluacionPIComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
