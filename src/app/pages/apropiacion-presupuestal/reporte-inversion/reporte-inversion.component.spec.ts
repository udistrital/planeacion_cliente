import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteInversionComponent } from './reporte-inversion.component';

describe('ReporteInversionComponent', () => {
  let component: ReporteInversionComponent;
  let fixture: ComponentFixture<ReporteInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporteInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
