import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularSubProyectoInversionComponent } from './formular-sub-proyecto-inversion.component';

describe('FormularSubProyectoInversionComponent', () => {
  let component: FormularSubProyectoInversionComponent;
  let fixture: ComponentFixture<FormularSubProyectoInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularSubProyectoInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularSubProyectoInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
