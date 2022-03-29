import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoPIComponent } from './seguimiento-pi.component';

describe('SeguimientoPIComponent', () => {
  let component: SeguimientoPIComponent;
  let fixture: ComponentFixture<SeguimientoPIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeguimientoPIComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeguimientoPIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
