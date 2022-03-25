import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarDialogPedComponent } from './consultar-dialog-ped.component';

describe('ConsultarDialogPedComponent', () => {
  let component: ConsultarDialogPedComponent;
  let fixture: ComponentFixture<ConsultarDialogPedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultarDialogPedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarDialogPedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
