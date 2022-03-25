import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PedComponent } from './ped.component';

describe('PedComponent', () => {
  let component: PedComponent;
  let fixture: ComponentFixture<PedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PedComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
