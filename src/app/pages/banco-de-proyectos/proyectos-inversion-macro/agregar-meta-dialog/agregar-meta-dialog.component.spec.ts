import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgregarMetaDialogComponent } from './agregar-meta-dialog.component';

describe('AgregarMetaDialogComponent', () => {
  let component: AgregarMetaDialogComponent;
  let fixture: ComponentFixture<AgregarMetaDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AgregarMetaDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AgregarMetaDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
