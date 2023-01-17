import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuenteApropiacionDialogComponent } from './fuente-apropiacion-dialog.component';

describe('FuenteApropiacionDialogComponent', () => {
  let component: FuenteApropiacionDialogComponent;
  let fixture: ComponentFixture<FuenteApropiacionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FuenteApropiacionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FuenteApropiacionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
