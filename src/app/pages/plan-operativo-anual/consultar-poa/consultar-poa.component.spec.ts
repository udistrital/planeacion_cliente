import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarPOAComponent } from './consultar-poa.component';

describe('ConsultarPOAComponent', () => {
  let component: ConsultarPOAComponent;
  let fixture: ComponentFixture<ConsultarPOAComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultarPOAComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarPOAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
