import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarFuenteComponent } from './editar-fuente.component';

describe('EditarFuenteComponent', () => {
  let component: EditarFuenteComponent;
  let fixture: ComponentFixture<EditarFuenteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarFuenteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarFuenteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
