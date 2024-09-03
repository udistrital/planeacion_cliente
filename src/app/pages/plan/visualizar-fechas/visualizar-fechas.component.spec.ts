import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VisualizarFechasComponent } from './visualizar-fechas.component';

describe('VisualizarFechasComponent', () => {
  let component: VisualizarFechasComponent;
  let fixture: ComponentFixture<VisualizarFechasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VisualizarFechasComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VisualizarFechasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
