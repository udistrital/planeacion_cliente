import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EvaluacionPmeeComponent } from './evaluacion-pmee.component';

describe('EvaluacionPmeeComponent', () => {
  let component: EvaluacionPmeeComponent;
  let fixture: ComponentFixture<EvaluacionPmeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EvaluacionPmeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EvaluacionPmeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
