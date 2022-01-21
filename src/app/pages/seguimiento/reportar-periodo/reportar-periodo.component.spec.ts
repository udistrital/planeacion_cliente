import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportarPeriodoComponent } from './reportar-periodo.component';

describe('ReportarPeriodoComponent', () => {
  let component: ReportarPeriodoComponent;
  let fixture: ComponentFixture<ReportarPeriodoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportarPeriodoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportarPeriodoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
