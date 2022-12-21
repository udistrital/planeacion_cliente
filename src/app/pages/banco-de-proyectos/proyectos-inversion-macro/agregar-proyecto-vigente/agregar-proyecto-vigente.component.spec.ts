import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarProyectoVigenteComponent } from './agregar-proyecto-vigente.component';

describe('AgregarProyectoVigenteComponent', () => {
  let component: AgregarProyectoVigenteComponent;
  let fixture: ComponentFixture<AgregarProyectoVigenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarProyectoVigenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarProyectoVigenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
