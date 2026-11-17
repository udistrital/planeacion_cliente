import { TextFieldModule } from '@angular/cdk/text-field';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import Swal from 'sweetalert2';
import { GestorDocumentalService } from 'src/app/@core/utils/gestor_documental.service';
import { IniciativaService } from '../../iniciativa.service';
import { Datos, NodoDefinicion } from '../../utils';
import { ContextoFormulario, estructuraDeDocumentos } from '../../utils/formulario.utils';
import { CampoCatalogoIniciativaComponent } from '../campo-catalogo-iniciativa/campo-catalogo-iniciativa.component';
import { CampoDocumentoIniciativaComponent } from '../campo-documento-iniciativa/campo-documento-iniciativa.component';
import { CeldaIniciativaComponent } from '../celda-iniciativa/celda-iniciativa.component';
import { TablaDocumentosIniciativaComponent } from './tabla-documentos-iniciativa.component';

function nodo(clave: string, nombre: string, tipo?: any, extra: any = {}, hijos: NodoDefinicion[] = []): NodoDefinicion {
  return { id: clave, nombre, descripcion: '', bandera_tabla: false, dato: { clave, type: tipo, required: true, ...extra }, hijos };
}

const PDF_O_WORD = { formatos: ['pdf', 'doc', 'docx'], tamano_maximo_mb: 10 };

/** Los campos del submódulo Anexos de la plantilla. */
const ANEXOS = [
  nodo('carta_presentacion', 'Carta de presentación suscrita', 'documento', PDF_O_WORD),
  nodo('presupuesto', 'Presupuesto', 'documento', PDF_O_WORD),
  nodo('otros_anexos', 'Otros anexos', 'repetible', { required: false, min: 0, max: 2, etiqueta_fila: 'Documento' }, [
    nodo('nombre', 'Nombre del documento', 'input'),
    nodo('archivo', 'Archivo', 'documento', PDF_O_WORD),
  ]),
];

describe('TablaDocumentosIniciativaComponent (Anexos en una sola tabla)', () => {
  let fixture: ComponentFixture<TablaDocumentosIniciativaComponent>;
  let elemento: HTMLElement;

  function montar(datos: Datos, parcial: Partial<ContextoFormulario> = {}): Datos {
    const contexto: ContextoFormulario = {
      claveSubmodulo: 'anexos',
      datosSubmodulo: datos,
      relacionadas: {},
      soloLectura: false,
      errores: {},
      apariencia: 'fill',
      listasEnTabla: [],
      gruposEnCasillas: [],
      nombreEnCatalogo: (catalogo, codigo) => codigo,
      subirDocumento: () => of({ nombre: 'x.pdf' }),
      ...parcial,
    };
    fixture = TestBed.createComponent(TablaDocumentosIniciativaComponent);
    Object.assign(fixture.componentInstance, { estructura: estructuraDeDocumentos(ANEXOS), datos, contexto });
    fixture.detectChanges();
    elemento = fixture.nativeElement;
    return datos;
  }

  const textos = (selector: string) => Array.from(elemento.querySelectorAll(selector)).map((e) => e.textContent.trim());
  const boton = (etiqueta: string) => elemento.querySelector(`button[aria-label="${etiqueta}"]`) as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        TablaDocumentosIniciativaComponent, CampoDocumentoIniciativaComponent, CeldaIniciativaComponent, CampoCatalogoIniciativaComponent,
      ],
      imports: [
        FormsModule, ReactiveFormsModule, TextFieldModule, NoopAnimationsModule, MatIconModule, MatButtonModule,
        MatTooltipModule, MatSelectModule, MatAutocompleteModule, MatCheckboxModule,
      ],
      providers: [
        { provide: IniciativaService, useValue: { catalogo: () => of([]) } },
        { provide: GestorDocumentalService, useValue: { getByUUID: () => of('blob:local') } },
      ],
    }).compileComponents();
  });

  it('muestra los documentos fijos y los adicionales en una sola tabla, numerados seguidos', fakeAsync(() => {
    montar({
      carta_presentacion: { id: 1, enlace: 'u-1', nombre: 'carta.pdf' },
      presupuesto: null,
      otros_anexos: [{ id: 'oa-1', nombre: 'Cotización de equipos', archivo: { id: 3, enlace: 'u-3', nombre: 'cotizacion.docx' } }],
    });
    tick();
    fixture.detectChanges();

    expect(textos('thead th').slice(0, 3)).toEqual(['N.°', 'Documento', 'Archivo']);
    expect(textos('td.numero')).toEqual(['1', '2', '3']);
    expect(textos('.fijo__nombre')).toEqual(['Carta de presentación suscrita', 'Presupuesto']);
    expect(textos('.fijo__marca')).toEqual(['Obligatorio', 'Obligatorio']);
    expect(textos('app-campo-documento-iniciativa .documento__nombre')).toEqual(['carta.pdf', 'cotizacion.docx']);
    expect(textos('.documento__sin-archivo')).toEqual(['Sin adjuntar']);
    expect((elemento.querySelector('.fila-adicional textarea') as HTMLTextAreaElement).value).toBe('Cotización de equipos');
  }));

  it('el ⊕ del encabezado agrega documentos hasta el máximo y la caneca los elimina', async () => {
    const datos = montar({ carta_presentacion: null, presupuesto: null, otros_anexos: [] });

    boton('Agregar documento').click();
    fixture.detectChanges();
    boton('Agregar documento').click();
    fixture.detectChanges();

    expect(datos.otros_anexos.length).toBe(2);
    expect(datos.otros_anexos.every((fila: Datos) => /^oa-/.test(fila.id))).toBeTrue();
    expect(textos('td.numero')).toEqual(['1', '2', '3', '4']);
    expect(boton('Agregar documento')).toBeNull();
    expect((elemento.querySelector('.fila-adicional textarea') as HTMLTextAreaElement).placeholder).toBe('Escriba el nombre del documento');

    spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true }) as any);
    const primero = datos.otros_anexos[0].id;
    await fixture.componentInstance.eliminar(0);
    fixture.detectChanges();

    expect(datos.otros_anexos.map((fila: Datos) => fila.id)).not.toContain(primero);
    expect(boton('Agregar documento')).not.toBeNull();
  });

  it('muestra el error de cada archivo en su celda y los de la lista debajo', () => {
    montar(
      { carta_presentacion: null, presupuesto: null, otros_anexos: [{ id: 'oa-1', nombre: '', archivo: null }] },
      {
        errores: {
          carta_presentacion: ['Carta de presentación suscrita: es obligatorio.'],
          'otros_anexos[oa-1].archivo': ['Archivo: es obligatorio.'],
          otros_anexos: ['Otros anexos: se permiten máximo 2.'],
        },
      },
    );

    expect(textos('td > .error-celda')).toEqual(['Carta de presentación suscrita: es obligatorio.', 'Archivo: es obligatorio.']);
    expect(elemento.querySelectorAll('td.con-error').length).toBe(2);
    expect(textos('.fila-errores .iniciativa-error')).toEqual(['Otros anexos: se permiten máximo 2.']);
  });

  it('en solo lectura no hay columna de acciones ni botones para cambiar archivos', fakeAsync(() => {
    montar(
      { carta_presentacion: { id: 1, enlace: 'u-1', nombre: 'carta.pdf' }, presupuesto: null, otros_anexos: [{ id: 'oa-1', nombre: 'Cotización' }] },
      { soloLectura: true },
    );
    tick();
    fixture.detectChanges();

    expect(textos('thead th')).toEqual(['N.°', 'Documento', 'Archivo']);
    expect(Array.from(elemento.querySelectorAll('button')).map((b) => b.getAttribute('aria-label'))).toEqual(['Ver Carta de presentación suscrita']);
    expect((elemento.querySelector('.fila-adicional textarea') as HTMLTextAreaElement).disabled).toBeTrue();
  }));
});
