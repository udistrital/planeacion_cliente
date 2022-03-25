import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionPOAComponent } from './evaluacion-poa.component';

describe('EvaluacionPOAComponent', () => {
  let component: EvaluacionPOAComponent;
  let fixture: ComponentFixture<EvaluacionPOAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluacionPOAComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionPOAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
