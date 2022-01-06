import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanUnidadComponent } from './plan-unidad.component';

describe('PlanUnidadComponent', () => {
  let component: PlanUnidadComponent;
  let fixture: ComponentFixture<PlanUnidadComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanUnidadComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanUnidadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});