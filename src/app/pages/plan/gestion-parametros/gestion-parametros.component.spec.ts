import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GestionParametrosComponent } from './gestion-parametros.component';

describe('GestionParametrosComponent', () => {
  let component: GestionParametrosComponent;
  let fixture: ComponentFixture<GestionParametrosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GestionParametrosComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GestionParametrosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
