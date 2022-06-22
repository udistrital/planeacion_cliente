import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PUIComponent } from './pui.component';

describe('PUIComponent', () => {
  let component: PUIComponent;
  let fixture: ComponentFixture<PUIComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PUIComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PUIComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
