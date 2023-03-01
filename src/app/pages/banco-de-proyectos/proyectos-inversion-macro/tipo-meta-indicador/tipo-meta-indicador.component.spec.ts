import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoMetaIndicadorComponent } from './tipo-meta-indicador.component';

describe('TipoMetaIndicadorComponent', () => {
  let component: TipoMetaIndicadorComponent;
  let fixture: ComponentFixture<TipoMetaIndicadorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoMetaIndicadorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TipoMetaIndicadorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
