import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramacionPresupuestalComponent } from './programacion-presupuestal.component';

describe('ProgramacionPresupuestalComponent', () => {
  let component: ProgramacionPresupuestalComponent;
  let fixture: ComponentFixture<ProgramacionPresupuestalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramacionPresupuestalComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProgramacionPresupuestalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
