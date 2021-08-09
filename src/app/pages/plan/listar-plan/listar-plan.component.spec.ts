import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListarPlanComponent } from './listar-plan.component';

describe('ListarPlanComponent', () => {
  let component: ListarPlanComponent;
  let fixture: ComponentFixture<ListarPlanComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ListarPlanComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ListarPlanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
