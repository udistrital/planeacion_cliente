import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarSubProyectoInversionComponent } from './consultar-sub-proyecto-inversion.component';

describe('ConsultarSubProyectoInversionComponent', () => {
  let component: ConsultarSubProyectoInversionComponent;
  let fixture: ComponentFixture<ConsultarSubProyectoInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultarSubProyectoInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarSubProyectoInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
