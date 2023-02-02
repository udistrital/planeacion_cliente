import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentificacionActividadesRecursosComponent } from './identificacion-actividades-recursos.component';

describe('IdentificacionActividadesRecursosComponent', () => {
  let component: IdentificacionActividadesRecursosComponent;
  let fixture: ComponentFixture<IdentificacionActividadesRecursosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ IdentificacionActividadesRecursosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentificacionActividadesRecursosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
