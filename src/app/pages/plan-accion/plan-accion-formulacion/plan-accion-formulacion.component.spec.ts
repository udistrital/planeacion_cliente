import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlanAccionComponent } from './plan-accion.component';

describe('PlanAccionComponent', () => {
  let component: PlanAccionComponent;
  let fixture: ComponentFixture<PlanAccionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PlanAccionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PlanAccionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
