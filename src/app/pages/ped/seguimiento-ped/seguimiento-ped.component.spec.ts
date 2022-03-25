import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoPedComponent } from './seguimiento-ped.component';

describe('SeguimientoPedComponent', () => {
  let component: SeguimientoPedComponent;
  let fixture: ComponentFixture<SeguimientoPedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeguimientoPedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeguimientoPedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
