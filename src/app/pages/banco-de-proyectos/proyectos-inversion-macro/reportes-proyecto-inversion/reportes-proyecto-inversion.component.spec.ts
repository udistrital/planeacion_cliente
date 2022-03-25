import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesProyectoInversionComponent } from './reportes-proyecto-inversion.component';

describe('ReportesProyectoInversionComponent', () => {
  let component: ReportesProyectoInversionComponent;
  let fixture: ComponentFixture<ReportesProyectoInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportesProyectoInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesProyectoInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
