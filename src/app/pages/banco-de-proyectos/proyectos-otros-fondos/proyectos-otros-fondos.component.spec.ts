import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyectosOtrosFondosComponent } from './proyectos-otros-fondos.component';

describe('ProyectosOtrosFondosComponent', () => {
  let component: ProyectosOtrosFondosComponent;
  let fixture: ComponentFixture<ProyectosOtrosFondosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProyectosOtrosFondosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProyectosOtrosFondosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
