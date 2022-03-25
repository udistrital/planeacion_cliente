import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConstruccionModulComponent } from './construccion-modul.component';

describe('ConstruccionModulComponent', () => {
  let component: ConstruccionModulComponent;
  let fixture: ComponentFixture<ConstruccionModulComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ConstruccionModulComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConstruccionModulComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
