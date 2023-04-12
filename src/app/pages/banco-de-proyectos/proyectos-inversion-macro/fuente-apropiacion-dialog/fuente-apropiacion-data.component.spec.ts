import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FuenteApropiacionDataComponent } from './fuente-apropiacion-data.component';

describe('FuenteApropiacionDialogComponent', () => {
  let component: FuenteApropiacionDataComponent;
  let fixture: ComponentFixture<FuenteApropiacionDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FuenteApropiacionDataComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FuenteApropiacionDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
