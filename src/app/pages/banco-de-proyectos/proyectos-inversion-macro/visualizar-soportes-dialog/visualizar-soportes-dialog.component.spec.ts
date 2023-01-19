import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarSoportesDialogComponent } from './visualizar-soportes-dialog.component';

describe('VisualizarSoportesDialogComponent', () => {
  let component: VisualizarSoportesDialogComponent;
  let fixture: ComponentFixture<VisualizarSoportesDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizarSoportesDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizarSoportesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
