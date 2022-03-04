import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Evidencias } from './evidencias.component';

describe('Evidencias', () => {
  let component: Evidencias;
  let fixture: ComponentFixture<Evidencias>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ Evidencias ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(Evidencias);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
