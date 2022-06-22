import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarProyectoInversionComponent } from './consultar-proyecto-inversion.component';

describe('ConsultarProyectoInversionComponent', () => {
  let component: ConsultarProyectoInversionComponent;
  let fixture: ComponentFixture<ConsultarProyectoInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultarProyectoInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarProyectoInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
