import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProyectosDeInversionVigentesComponent } from './proyectos-de-inversion-vigentes.component';

describe('ProyectosDeInversionVigentesComponent', () => {
  let component: ProyectosDeInversionVigentesComponent;
  let fixture: ComponentFixture<ProyectosDeInversionVigentesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProyectosDeInversionVigentesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ProyectosDeInversionVigentesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
