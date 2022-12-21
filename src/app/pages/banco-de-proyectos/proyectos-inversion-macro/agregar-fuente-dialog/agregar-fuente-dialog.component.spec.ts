import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarFuenteDialogComponent } from './agregar-fuente-dialog.component';

describe('AgregarFuenteDialogComponent', () => {
  let component: AgregarFuenteDialogComponent;
  let fixture: ComponentFixture<AgregarFuenteDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarFuenteDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarFuenteDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
