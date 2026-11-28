import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';
import { NodoDefinicion, ReferenciaDocumento } from '../../utils';
import { ContextoFormulario } from '../../utils/formulario.utils';
import { CampoDocumentoIniciativaComponent } from './campo-documento-iniciativa.component';

const ARCHIVO: NodoDefinicion = {
  id: 'archivo', nombre: 'Archivo', descripcion: '', hijos: [],
  dato: { clave: 'archivo', type: 'documento', required: true, formatos: ['pdf', 'doc', 'docx'], tamano_maximo_mb: 1 },
};

const SUBIDA: ReferenciaDocumento = {
  id: 125, enlace: 'uuid-1', nombre: 'cotizacion.pdf', usuario: '1020', usuario_nombre: 'LAURA GOMEZ RIOS', fecha: '2026-11-15T10:10:00',
};

describe('CampoDocumentoIniciativaComponent (archivo de un documento)', () => {
  let fixture: ComponentFixture<CampoDocumentoIniciativaComponent>;
  let componente: CampoDocumentoIniciativaComponent;
  let elemento: HTMLElement;
  let emitidos: Array<ReferenciaDocumento | null>;
  let subir: jasmine.Spy;
  let guardar: jasmine.Spy;

  function montar(valor: ReferenciaDocumento | null, soloLectura = false): void {
    subir = jasmine.createSpy('subirDocumento').and.returnValue(of(SUBIDA));
    guardar = jasmine.createSpy('guardarAutomatico');
    const contexto = { soloLectura, errores: {}, subirDocumento: subir, guardarAutomatico: guardar } as Partial<ContextoFormulario>;
    fixture = TestBed.createComponent(CampoDocumentoIniciativaComponent);
    componente = fixture.componentInstance;
    Object.assign(componente, { nodo: ARCHIVO, valor, ruta: 'otros_anexos[oa-1].archivo', contexto, etiqueta: 'Cotización' });
    emitidos = [];
    componente.valorChange.subscribe((v: ReferenciaDocumento | null) => emitidos.push(v));
    fixture.detectChanges();
    elemento = fixture.nativeElement;
  }

  /** Simula elegir un archivo en el selector oculto. */
  function elegir(nombre: string, bytes = 10): void {
    const entrada = elemento.querySelector('input[type=file]') as HTMLInputElement;
    const archivo = new File([new Uint8Array(bytes)], nombre);
    Object.defineProperty(entrada, 'files', { value: [archivo], configurable: true });
    entrada.dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  const etiquetas = () => Array.from(elemento.querySelectorAll('button')).map((b) => b.getAttribute('aria-label'));
  const texto = (selector: string) => (elemento.querySelector(selector) || { textContent: '' }).textContent.trim();

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CampoDocumentoIniciativaComponent],
      imports: [NoopAnimationsModule, MatButtonModule, MatDialogModule, MatIconModule, MatTooltipModule],
      providers: [{ provide: GestorDocumentalService, useValue: { getByUUID: () => of('blob:local') } }],
    }).compileComponents();
  });

  it('sin archivo dice «Sin adjuntar» y solo ofrece adjuntar, con el selector del navegador oculto', () => {
    montar(null);

    expect(texto('.documento__sin-archivo')).toBe('Sin adjuntar');
    expect(etiquetas()).toEqual(['Adjuntar archivo de Cotización']);
    expect((elemento.querySelector('input[type=file]') as HTMLInputElement).accept).toBe('.pdf,.doc,.docx');
  });

  it('al elegir un archivo válido lo sube con la ruta de la plantilla, deja la referencia en los datos y guarda', () => {
    montar(null);
    elegir('cotizacion.pdf');

    expect(subir).toHaveBeenCalledTimes(1);
    expect(subir.calls.mostRecent().args[0]).toBe('otros_anexos.archivo');
    expect(emitidos).toEqual([SUBIDA]);
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(texto('.documento__nombre')).toBe('cotizacion.pdf');
    expect(texto('.documento__detalle')).toMatch(/^Subido el 15\/11\/2026 \d\d:\d\d por LAURA GOMEZ RIOS$/);
    expect(etiquetas()).toEqual(['Ver Cotización', 'Reemplazar archivo de Cotización', 'Eliminar archivo de Cotización']);
  });

  it('sin el nombre de quien lo subió muestra solo la fecha, nunca el documento de identidad', () => {
    montar({ ...SUBIDA, usuario_nombre: undefined });

    expect(texto('.documento__detalle')).toMatch(/^Subido el 15\/11\/2026 \d\d:\d\d$/);
  });

  it('rechaza el formato o el tamaño sin subir nada', () => {
    montar(null);
    elegir('foto.png');
    expect(texto('.documento__error')).toContain('no es un formato permitido');

    elegir('grande.pdf', 2 * 1024 * 1024);
    expect(texto('.documento__error')).toContain('pasa de 1 MB');
    expect(subir).not.toHaveBeenCalled();
    expect(emitidos).toEqual([]);
    expect(guardar).not.toHaveBeenCalled();
  });

  it('si la subida falla muestra el error, conserva el archivo anterior y no guarda', () => {
    montar(SUBIDA);
    subir.and.returnValue(throwError({ status: 404 }));
    elegir('nuevo.docx');

    expect(texto('.documento__error')).toContain('No se pudo subir «nuevo.docx»');
    expect(texto('.documento__nombre')).toBe('cotizacion.pdf');
    expect(emitidos).toEqual([]);
    expect(guardar).not.toHaveBeenCalled();
  });

  it('quitar pide confirmación, deja el campo vacío y guarda', async () => {
    montar(SUBIDA);
    const confirmar = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    await componente.quitar();
    fixture.detectChanges();

    expect(confirmar.calls.mostRecent().args[0]).toEqual(jasmine.objectContaining({ title: '¿Eliminar el archivo de «Cotización»?' }));
    expect(emitidos).toEqual([null]);
    expect(guardar).toHaveBeenCalledTimes(1);
    expect(texto('.documento__sin-archivo')).toBe('Sin adjuntar');
  });

  it('si no se confirma, quitar no cambia nada', async () => {
    montar(SUBIDA);
    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: false }) as any);
    await componente.quitar();
    fixture.detectChanges();

    expect(emitidos).toEqual([]);
    expect(guardar).not.toHaveBeenCalled();
    expect(texto('.documento__nombre')).toBe('cotizacion.pdf');
  });

  it('en solo lectura solo deja ver el PDF o descargar el Word', () => {
    montar({ ...SUBIDA, nombre: 'presupuesto.docx' }, true);

    expect(etiquetas()).toEqual(['Descargar Cotización']);
  });
});
