import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarApropiacionFuenteDialogComponent } from './editar-apropiacion-fuente-dialog.component';

describe('EditarApropiacionFuenteDialogComponent', () => {
  let component: EditarApropiacionFuenteDialogComponent;
  let fixture: ComponentFixture<EditarApropiacionFuenteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EditarApropiacionFuenteDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EditarApropiacionFuenteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
