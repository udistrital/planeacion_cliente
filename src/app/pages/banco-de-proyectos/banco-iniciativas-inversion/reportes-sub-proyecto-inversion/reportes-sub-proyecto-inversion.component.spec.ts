import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReportesSubProyectoInversionComponent } from './reportes-sub-proyecto-inversion.component';

describe('ReportesSubProyectoInversionComponent', () => {
  let component: ReportesSubProyectoInversionComponent;
  let fixture: ComponentFixture<ReportesSubProyectoInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReportesSubProyectoInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReportesSubProyectoInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
