import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarFechasIniciativasComponent } from './visualizar-fechas-iniciativas.component';

describe('VisualizarFechasIniciativasComponent', () => {
  let component: VisualizarFechasIniciativasComponent;
  let fixture: ComponentFixture<VisualizarFechasIniciativasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizarFechasIniciativasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizarFechasIniciativasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
