import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuentesDeApropiacionComponent } from './fuentes-de-apropiacion.component';

describe('FuentesDeApropiacionComponent', () => {
  let component: FuentesDeApropiacionComponent;
  let fixture: ComponentFixture<FuentesDeApropiacionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FuentesDeApropiacionComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FuentesDeApropiacionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
