import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultarPIComponent } from './consultar-pi.component';

describe('ConsultarPIComponent', () => {
  let component: ConsultarPIComponent;
  let fixture: ComponentFixture<ConsultarPIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConsultarPIComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConsultarPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
