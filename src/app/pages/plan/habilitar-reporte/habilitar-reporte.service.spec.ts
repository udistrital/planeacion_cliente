import { TestBed } from '@angular/core/testing';

import { HabilitarReporteService } from './habilitar-reporte.service';

describe('HabilitarReporteService', () => {
  let service: HabilitarReporteService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HabilitarReporteService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
