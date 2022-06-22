import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularProyectoInversionComponent } from './formular-proyecto-inversion.component';

describe('FormularProyectoInversionComponent', () => {
  let component: FormularProyectoInversionComponent;
  let fixture: ComponentFixture<FormularProyectoInversionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FormularProyectoInversionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormularProyectoInversionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
