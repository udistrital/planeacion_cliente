import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstruirPlanProyectoComponent } from './construir-plan-proyecto.component';

describe('ConstruirPlanProyectoComponent', () => {
  let component: ConstruirPlanProyectoComponent;
  let fixture: ComponentFixture<ConstruirPlanProyectoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstruirPlanProyectoComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstruirPlanProyectoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
