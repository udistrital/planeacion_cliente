import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CargarSoportesDialogComponent } from './cargar-soportes-dialog.component';

describe('CargarSoportesDialogComponent', () => {
  let component: CargarSoportesDialogComponent;
  let fixture: ComponentFixture<CargarSoportesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CargarSoportesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CargarSoportesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
