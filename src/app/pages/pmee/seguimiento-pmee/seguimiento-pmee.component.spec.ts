import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SeguimientoPmeeComponent } from './seguimiento-pmee.component';

describe('SeguimientoPmeeComponent', () => {
  let component: SeguimientoPmeeComponent;
  let fixture: ComponentFixture<SeguimientoPmeeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SeguimientoPmeeComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SeguimientoPmeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
