import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstruirPlanComponent } from './construir-plan.component';

describe('ConstruirPlanComponent', () => {
  let component: ConstruirPlanComponent;
  let fixture: ComponentFixture<ConstruirPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstruirPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstruirPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
