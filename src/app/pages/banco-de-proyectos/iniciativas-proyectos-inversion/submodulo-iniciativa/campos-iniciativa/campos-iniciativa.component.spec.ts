import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTooltipModule } from '@angular/material/tooltip';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { IniciativaService } from '../../iniciativa.service';
import { Datos, NodoDefinicion } from '../../utils';
import { ContextoFormulario, prepararEstructura } from '../../utils/formulario.utils';
import { CampoCatalogoIniciativaComponent } from '../campo-catalogo-iniciativa/campo-catalogo-iniciativa.component';
import { CampoMatrizIniciativaComponent } from '../campo-matriz-iniciativa/campo-matriz-iniciativa.component';
import { CasillasCatalogoIniciativaComponent } from '../casillas-catalogo-iniciativa/casillas-catalogo-iniciativa.component';
import { CeldaIniciativaComponent } from '../celda-iniciativa/celda-iniciativa.component';
import { GrupoRepetibleIniciativaComponent } from '../grupo-repetible-iniciativa/grupo-repetible-iniciativa.component';
import { TablaJerarquicaIniciativaComponent } from '../tabla-jerarquica-iniciativa/tabla-jerarquica-iniciativa.component';
import { CamposIniciativaComponent } from './campos-iniciativa.component';

function nodo(clave: string, nombre: string, tipo?: any, extra: any = {}, hijos: NodoDefinicion[] = []): NodoDefinicion {
  return { id: clave, nombre, descripcion: '', bandera_tabla: false, dato: { clave, type: tipo, required: true, ...extra }, hijos };
}

const PROBLEMATICA: NodoDefinicion[] = [
  nodo('problema_central', 'Problema central', 'input', { multilinea: true }),
  nodo('causas_directas', 'Causas directas', 'repetible', { min: 1, etiqueta_fila: 'Causa directa' }, [
    nodo('descripcion', 'Descripción', 'input'),
    nodo('causas_indirectas', 'Causas indirectas', 'repetible', { min: 1, etiqueta_fila: 'Causa indirecta' }, [
      nodo('descripcion', 'Descripción', 'input'),
    ]),
  ]),
];

const OBJETIVOS: NodoDefinicion[] = [
  nodo('objetivos_especificos', 'Objetivos específicos', 'repetible',
    { espejo_de: 'problematica.causas_directas', mostrar: 'descripcion', etiqueta_fila: 'Objetivo específico' }, [
      nodo('objetivo_especifico', 'Objetivo específico', 'input'),
      nodo('medios', 'Medios', 'repetible', { etiqueta_fila: 'Medio' }, [
        nodo('causa_indirecta', 'Causa indirecta que atiende', 'referencia', { opciones_desde: 'origen.causas_indirectas', mostrar: 'descripcion' }),
      ]),
    ]),
];

const PARTICIPANTES: NodoDefinicion[] = [
  nodo('actores', 'Actores', 'repetible', { min: 2, etiqueta_fila: 'Participante' }, [
    nodo('actor', 'Actor', 'select', { options: [{ valor: 'Distrital' }, { valor: 'Nacional' }] }),
    nodo('entidad', 'Entidad', 'input'),
  ]),
];

const ALTERNATIVAS: NodoDefinicion[] = [
  nodo('actividades_por_objetivo', 'Actividades por objetivo', 'repetible',
    { espejo_de: 'objetivos.objetivos_especificos', mostrar: 'objetivo_especifico', etiqueta_fila: 'Objetivo específico' }, [
      nodo('actividades', 'Actividades', 'input'),
    ]),
];

function problematicaDeEjemplo(): Datos {
  return {
    problema_central: 'Bajas capacidades tecnológicas',
    causas_directas: [
      { id: 'cd-1', descripcion: 'Obsolescencia de la infraestructura', causas_indirectas: [
        { id: 'ci-1', descripcion: 'Fallas en los equipos' },
        { id: 'ci-2', descripcion: 'Falta de mantenimiento' },
      ] },
      { id: 'cd-2', descripcion: 'Herramientas insuficientes', causas_indirectas: [{ id: 'ci-3', descripcion: 'Recursos insuficientes' }] },
    ],
  };
}

describe('CamposIniciativaComponent (formulario dinámico)', () => {
  let fixture: ComponentFixture<CamposIniciativaComponent>;
  let elemento: HTMLElement;

  function montar(nodos: NodoDefinicion[], clave: string, datos: Datos, parcial: Partial<ContextoFormulario> = {},
                  secciones = false): Datos {
    const contexto: ContextoFormulario = {
      claveSubmodulo: clave,
      datosSubmodulo: datos,
      relacionadas: {},
      soloLectura: false,
      errores: {},
      apariencia: 'outline',
      listasEnTabla: [],
      gruposEnCasillas: [],
      nombreEnCatalogo: (catalogo, codigo) => codigo,
      ...parcial,
    };
    contexto.datosSubmodulo = datos;
    prepararEstructura(nodos, datos, contexto);
    fixture = TestBed.createComponent(CamposIniciativaComponent);
    Object.assign(fixture.componentInstance, { nodos, datos, ruta: '', contexto, secciones });
    fixture.detectChanges();
    elemento = fixture.nativeElement;
    return datos;
  }

  const textos = (selector: string) => Array.from(elemento.querySelectorAll(selector)).map((e) => e.textContent.trim());

  const servicioFalso = {
    catalogo: () => of([]),
    nombreEnCatalogo: (catalogo: string, codigo: string) => codigo,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [
        CamposIniciativaComponent,
        GrupoRepetibleIniciativaComponent,
        CampoCatalogoIniciativaComponent,
        CampoMatrizIniciativaComponent,
        TablaJerarquicaIniciativaComponent,
        CeldaIniciativaComponent,
        CasillasCatalogoIniciativaComponent,
      ],
      imports: [
        FormsModule, ReactiveFormsModule, NoopAnimationsModule, MatInputModule, MatSelectModule,
        MatAutocompleteModule, MatIconModule, MatButtonModule, MatTooltipModule, MatCheckboxModule,
      ],
      providers: [{ provide: IniciativaService, useValue: servicioFalso }],
    }).compileComponents();
  });

  it('muestra las sedes como casillas y pide «¿Cuál otra sede?» solo si se marca «Otra»', fakeAsync(() => {
    const servicio = TestBed.inject(IniciativaService);
    spyOn(servicio, 'catalogo').and.returnValue(of([
      { codigo: 'Macarena A', nombre: 'Macarena A' },
      { codigo: 'Vivero', nombre: 'Vivero' },
      { codigo: 'Otra', nombre: 'Otra' },
    ]));
    const localizacion = [
      nodo('sedes', 'Sedes donde se ejecuta la alternativa', undefined, {}, [
        nodo('seleccionadas', 'Sedes', 'catalogo', { catalogo: 'sedes', multiple: true }),
        nodo('otra', '¿Cuál otra sede?', 'input', { solo_si: { campo: 'seleccionadas', valor: 'Otra' } }),
      ]),
    ];
    const datos = montar(localizacion, 'localizacion', {}, {}, true);
    tick();
    fixture.detectChanges();
    const casillas = () => Array.from(elemento.querySelectorAll('.casillas-catalogo input[type=checkbox]')) as HTMLInputElement[];

    expect(textos('.casillas-catalogo mat-checkbox')).toEqual(['Macarena A', 'Vivero', 'Otra']);
    expect(elemento.querySelector('textarea')).toBeNull();

    casillas()[2].click();
    casillas()[0].click();
    fixture.detectChanges();
    expect(datos.sedes.seleccionadas).toEqual(['Macarena A', 'Otra']);
    expect(textos('mat-label')).toEqual(['¿Cuál otra sede?']);

    casillas()[2].click();
    fixture.detectChanges();
    expect(datos.sedes.seleccionadas).toEqual(['Macarena A']);
    expect(elemento.querySelector('textarea')).toBeNull();
  }));

  it('Cadena de valor: objetivo general arriba, una sección por objetivo y la tabla de actividades con periodos', fakeAsync(() => {
    const periodos = ['periodo_0', 'periodo_1'];
    const cadena = [
      nodo('objetivo_general', 'Objetivo general', 'calculado', { required: false, desde: 'objetivos.objetivo_central' }),
      nodo('productos_por_objetivo', 'Productos y actividades', 'repetible',
        { espejo_de: 'objetivos.objetivos_especificos', mostrar: 'objetivo_especifico', etiqueta_fila: 'Objetivo específico' }, [
          nodo('productos', 'Productos', 'repetible', { etiqueta_fila: 'Producto' }, [
            nodo('indicador_producto', 'Indicador de producto', 'input'),
            nodo('actividades', 'Actividades', 'repetible', { etiqueta_fila: 'Actividad' }, [
              nodo('actividad', 'Actividad', 'input'),
              nodo('insumos', 'Insumos', 'input'),
              nodo('costo_total', 'Costo total', 'calculado', { operacion: 'suma', operandos: periodos }),
              nodo('periodo_0', 'Periodo 0', 'numeric', { required: false }),
              nodo('periodo_1', 'Periodo 1', 'numeric', { required: false }),
            ]),
          ]),
        ]),
    ];
    const objetivos = {
      objetivo_central: 'Fortalecer los componentes tecnológicos',
      objetivos_especificos: [{ id: 'oe-1', objetivo_especifico: 'Modernizar la infraestructura' }],
    };
    const actividad = { id: 'ac-1', actividad: 'Comprar equipos', insumos: 'Equipos', periodo_0: 100, periodo_1: 50 };
    const datos = { productos_por_objetivo: [{ id: 'po-1', origen: 'oe-1', productos: [
      { id: 'pr-1', indicador_producto: 'Sedes', actividades: [actividad] },
    ] }] };
    montar(cadena, 'cadena_valor', datos, { relacionadas: { objetivos } }, true);
    tick();
    fixture.detectChanges();

    expect(textos('.iniciativa-traida strong')).toEqual(['Fortalecer los componentes tecnológicos']);
    expect(textos('.iniciativa-fila__origen')).toEqual(['Modernizar la infraestructura']);
    expect(textos('app-tabla-jerarquica-iniciativa thead th')).toEqual(['N.°', 'Actividad', 'Insumos', 'Costo total', 'Periodo 0', 'Periodo 1', 'Acciones']);
    expect(textos('app-tabla-jerarquica-iniciativa output.celda--calculada')).toEqual(['150']);
  }));

  it('pone lado a lado solo las secciones que el submódulo pide (SECCIONES_LADO_A_LADO)', () => {
    const localizacion = [
      nodo('ubicaciones', 'Localización de la alternativa', 'repetible', { etiqueta_fila: 'Ubicación' }, [
        nodo('region', 'Región', 'input'),
      ]),
      nodo('sedes', 'Sedes', undefined, {}, [nodo('seleccionadas', 'Sedes', 'input')]),
      nodo('factores', 'Factores', undefined, {}, [nodo('otros', 'Otros', 'input')]),
    ];
    montar(localizacion, 'localizacion', {}, { seccionesLadoALado: ['sedes', 'factores'] }, true);

    const secciones = Array.from(elemento.querySelectorAll('fieldset.container-border')) as HTMLElement[];
    expect(fixture.nativeElement.classList).toContain('campos--secciones');
    expect(secciones.map((s) => s.classList.contains('seccion--lado-a-lado'))).toEqual([false, true, true]);
  });

  it('una sola ubicación: los campos del grupo van en columnas solo si el submódulo lo pide (GRUPOS_EN_COLUMNAS)', () => {
    const localizacion = [
      nodo('ubicacion', 'Localización de la alternativa', undefined, {}, [
        nodo('centro_poblado', 'Centro poblado', 'input', { required: false }),
        nodo('latitud', 'Latitud', 'numeric', { required: false }),
      ]),
    ];
    const datos = montar(localizacion, 'localizacion', {}, { gruposEnColumnas: ['ubicacion'] }, true);

    const anidado = elemento.querySelector('fieldset app-campos-iniciativa') as HTMLElement;
    expect(anidado.classList).toContain('campos--columnas');
    expect(textos('mat-label')).toEqual(['Centro poblado', 'Latitud']);
    // Cada campo en su celda, para que sus errores queden debajo de él y no partan las columnas.
    expect(anidado.querySelectorAll(':scope > .campo-en-columna mat-form-field').length).toBe(2);
    expect(datos.ubicacion).toEqual({});

    montar(localizacion, 'localizacion', {}, {}, true);
    expect((elemento.querySelector('fieldset app-campos-iniciativa') as HTMLElement).classList).not.toContain('campos--columnas');
  });

  it('trae sola la alternativa marcada en otro submódulo y la muestra sin poder editarla', () => {
    const analisis = [
      nodo('alternativa_seleccionada', 'Alternativa de solución', 'referencia', {
        opciones_desde: 'alternativas.alternativas_solucion', mostrar: 'descripcion_alternativa', marcada_en: 'pasa_preparacion',
      }),
    ];
    const alternativas = { alternativas_solucion: [
      { id: 'as-1', descripcion_alternativa: 'Modernizar la infraestructura', pasa_preparacion: false },
      { id: 'as-2', descripcion_alternativa: 'Contratar el servicio en la nube', pasa_preparacion: true },
    ] };

    const datos = montar(analisis, 'analisis_tecnico', { alternativa_seleccionada: 'as-1' }, { relacionadas: { alternativas } });
    expect(datos.alternativa_seleccionada).toBe('as-2');
    expect(textos('.iniciativa-traida strong')).toEqual(['Contratar el servicio en la nube']);
    expect(elemento.querySelectorAll('mat-select').length).toBe(0);

    alternativas.alternativas_solucion[1].pasa_preparacion = false;
    const sinMarcada = montar(analisis, 'analisis_tecnico', { alternativa_seleccionada: 'as-2' }, { relacionadas: { alternativas } });
    expect(sinMarcada.alternativa_seleccionada).toBe('');
    expect(textos('.iniciativa-traida__vacia')).toEqual(['Aún no se ha marcado ninguna.']);
  });

  it('resume las causas directas en una tabla y debajo diligencia la seleccionada, con sus causas indirectas en tabla', fakeAsync(() => {
    const datos = montar(PROBLEMATICA, 'problematica', problematicaDeEjemplo());
    tick();
    fixture.detectChanges();
    const valores = () => Array.from(elemento.querySelectorAll('textarea')).map((t) => (t as HTMLTextAreaElement).value);

    expect(textos('.tabla-resumen thead th')).toEqual(['N.°', 'Descripción', 'Datos', 'add_circle_outline']);
    expect(textos('.tabla-resumen tbody td:nth-child(2)')).toEqual(['Obsolescencia de la infraestructura', 'Herramientas insuficientes']);
    expect(textos('.tabla-resumen .estado-datos')).toEqual(['Completos', 'Completos']);
    // Solo la primera se diligencia debajo.
    expect(textos('.iniciativa-fila__titulo strong')).toEqual(['Causa directa 1: Obsolescencia de la infraestructura']);
    expect(elemento.querySelectorAll('app-tabla-jerarquica-iniciativa').length).toBe(1);
    expect(valores()).toContain('Falta de mantenimiento');

    (elemento.querySelectorAll('.tabla-resumen tbody tr')[1] as HTMLElement).click();
    fixture.detectChanges();
    tick();
    fixture.detectChanges();
    expect(textos('.iniciativa-fila__titulo strong')).toEqual(['Causa directa 2: Herramientas insuficientes']);
    expect(valores()).toContain('Recursos insuficientes');
    expect(valores()).not.toContain('Falta de mantenimiento');

    // Al vaciar un campo obligatorio, la tabla lo marca como incompleto.
    datos.causas_directas[1].descripcion = '';
    fixture.detectChanges();
    expect(textos('.tabla-resumen .estado-datos')).toEqual(['Completos', 'Incompletos']);
    expect(textos('.contador')).toEqual(['Total: 2 · 1 con datos incompletos']);

    // Al cerrar queda la indicación para abrir otra.
    (elemento.querySelector('button[aria-label="Cerrar"]') as HTMLElement).click();
    fixture.detectChanges();
    expect(elemento.querySelector('.iniciativa-fila')).toBeNull();
    expect(elemento.querySelector('.sin-seleccion')).not.toBeNull();
  }));

  it('dibuja en tabla las listas sin lista interna, con cada campo en su columna', fakeAsync(() => {
    montar(PARTICIPANTES, 'participantes', { actores: [{ id: 'a-1', actor: 'Distrital', entidad: 'Secretaría de Educación' }] }, {}, true);
    tick();
    fixture.detectChanges();

    expect(elemento.querySelectorAll('.iniciativa-fila').length).toBe(0);
    expect(textos('thead th')).toEqual(['N.°', 'Actor', 'Entidad', 'Acciones']);
    expect(elemento.querySelectorAll('td mat-select').length).toBe(1);
    const valores = Array.from(elemento.querySelectorAll('textarea')).map((t) => (t as HTMLTextAreaElement).value);
    expect(valores).toEqual(['Secretaría de Educación']);
  }));

  it('en un espejo en tabla muestra el elemento de origen y no deja agregar ni eliminar filas', fakeAsync(() => {
    const objetivos = {
      objetivos_especificos: [
        { id: 'oe-1', objetivo_especifico: 'Modernizar la infraestructura' },
        { id: 'oe-2', objetivo_especifico: 'Mejorar los procesos' },
      ],
    };
    const datos = montar(ALTERNATIVAS, 'alternativas', {}, { relacionadas: { objetivos } }, true);
    tick();
    fixture.detectChanges();

    expect(datos.actividades_por_objetivo.map((f: Datos) => f.origen)).toEqual(['oe-1', 'oe-2']);
    expect(textos('thead th')).toEqual(['N.°', 'Objetivo específico', 'Actividades']);
    expect(textos('td.origen')).toEqual(['Modernizar la infraestructura', 'Mejorar los procesos']);
    expect(textos('button').some((t) => t.includes('Agregar') || t.includes('delete'))).toBeFalse();
  }));

  it('con secciones pone cada apartado en su recuadro con el nombre como título, sin repetirlo dentro', fakeAsync(() => {
    montar(PROBLEMATICA, 'problematica', problematicaDeEjemplo(), { apariencia: 'fill' }, true);
    tick();
    fixture.detectChanges();

    expect(textos('fieldset.container-border > legend')).toEqual(['Problema central *', 'Causas directas *']);
    // El título del apartado reemplaza la etiqueta del campo y el encabezado de la lista...
    expect(textos('.iniciativa-repetible__encabezado h4')).not.toContain('Causas directas');
    // ...pero los campos y listas de cada fila conservan los suyos.
    expect(textos('.iniciativa-repetible__encabezado h4')).toContain('Causas indirectas');
    expect(textos('mat-label')).not.toContain('Problema central');
    expect(textos('mat-label')).toContain('Descripción');
  }));

  it('en las secciones el texto empieza arriba del campo y no queda pegado a la línea', fakeAsync(() => {
    const nodos = [
      nodo('objetivo_central', 'Objetivo central', 'input', { multilinea: true }),
      nodo('tipo_fuente', 'Tipo de fuente de verificación', 'input'),
    ];
    montar(nodos, 'objetivos', { objetivo_central: 'Texto', tipo_fuente: 'Informe' }, { apariencia: 'fill' }, true);
    tick();
    fixture.detectChanges();

    Array.from(elemento.querySelectorAll('mat-form-field')).forEach((campo) => {
      const caja = campo.querySelector('.mat-form-field-flex').getBoundingClientRect();
      const texto = campo.querySelector('textarea').getBoundingClientRect();
      // Sin la franja de la etiqueta, el texto empieza cerca del borde superior de la caja.
      expect(texto.top - caja.top).toBeLessThan(18);
      expect(caja.bottom - texto.bottom).toBeGreaterThan(5);
    });
  }));

  it('dibuja como tabla jerárquica solo las listas que indica el submódulo', () => {
    montar(PROBLEMATICA, 'problematica', problematicaDeEjemplo(), { listasEnTabla: ['causas_directas'] }, true);

    expect(elemento.querySelectorAll('app-tabla-jerarquica-iniciativa').length).toBe(1);
    expect(elemento.querySelectorAll('.iniciativa-fila').length).toBe(0);
    expect(textos('td.numero')).toEqual(['1', '1.1', '1.2', '2', '2.1']);
  });

  it('sin secciones (filas y niveles internos) no dibuja recuadros', () => {
    montar(PROBLEMATICA, 'problematica', problematicaDeEjemplo());

    expect(elemento.querySelectorAll('fieldset').length).toBe(0);
    expect(textos('.iniciativa-repetible__encabezado h4')).toContain('Causas directas');
  });

  it('agrega una fila nueva con id y su lista anidada vacía, y la deja abierta para diligenciarla', fakeAsync(() => {
    const datos = montar(PROBLEMATICA, 'problematica', problematicaDeEjemplo());
    const agregar = elemento.querySelector('button[aria-label="Agregar causa directa"]') as HTMLElement;

    agregar.click();
    tick();
    fixture.detectChanges();

    expect(datos.causas_directas.length).toBe(3);
    expect(datos.causas_directas[2].id).toMatch(/^cd-/);
    expect(datos.causas_directas[2].causas_indirectas).toEqual([]);
    expect(textos('.iniciativa-fila__titulo strong')).toEqual(['Causa directa 3']);
    expect(textos('.tabla-resumen tbody td:nth-child(2)')[2]).toBe('—');
    expect(textos('.tabla-resumen .estado-datos')[2]).toBe('Incompletos');
  }));

  it('muestra los errores del servidor junto al campo que corresponde', () => {
    montar(PROBLEMATICA, 'problematica', problematicaDeEjemplo(), {
      errores: {
        'causas_directas[cd-2].descripcion': ['Descripción: es obligatorio.'],
        'causas_directas[cd-2].causas_indirectas[ci-3].descripcion': ['Descripción: no puede superar 500 caracteres.'],
      },
    });

    // La tabla resumen marca la fila con errores; los mensajes salen al abrirla.
    expect(textos('.tabla-resumen .estado-datos')).toEqual(['Completos', 'Incompletos']);
    expect(textos('.iniciativa-error')).toEqual([]);
    (elemento.querySelectorAll('.tabla-resumen tbody tr')[1] as HTMLElement).click();
    fixture.detectChanges();

    // El campo de la fila, debajo del campo; el de la tabla interna, en su celda.
    expect(textos('.iniciativa-error')).toEqual(['error_outline Descripción: es obligatorio.']);
    expect(textos('.error-celda')).toEqual(['Descripción: no puede superar 500 caracteres.']);
  });

  it('en solo lectura no permite agregar ni eliminar y deshabilita los campos', fakeAsync(() => {
    montar(PROBLEMATICA, 'problematica', problematicaDeEjemplo(), { soloLectura: true });
    tick();
    fixture.detectChanges();

    expect(textos('button').some((t) => t.includes('Agregar'))).toBeFalse();
    expect(elemento.querySelectorAll('button[aria-label^="Agregar"], button[aria-label^="Eliminar"]').length).toBe(0);
    expect(textos('.tabla-resumen td.acciones')).toEqual(['search', 'search']);
    expect(Array.from(elemento.querySelectorAll('textarea')).every((t) => (t as HTMLTextAreaElement).disabled)).toBeTrue();
  }));

  it('arma el espejo desde el submódulo de origen y ofrece solo las causas de su causa directa', fakeAsync(() => {
    const datos = montar(OBJETIVOS, 'objetivos', {}, { relacionadas: { problematica: problematicaDeEjemplo() } });
    tick();
    fixture.detectChanges();

    expect(datos.objetivos_especificos.map((f: Datos) => f.origen)).toEqual(['cd-1', 'cd-2']);
    expect(textos('.tabla-resumen td.origen')).toEqual(['Obsolescencia de la infraestructura', 'Herramientas insuficientes']);
    expect(textos('.iniciativa-fila__origen')).toEqual(['Obsolescencia de la infraestructura']);
    expect(elemento.querySelector('button[aria-label="Agregar objetivo específico"]')).toBeNull();
    expect(elemento.querySelectorAll('button[aria-label^="Eliminar objetivo"]').length).toBe(0);

    (elemento.querySelector('button[aria-label="Agregar medio"]') as HTMLElement).click();
    tick();
    fixture.detectChanges();
    const grupo = fixture.debugElement.queryAll((d) => d.componentInstance instanceof CamposIniciativaComponent)
      .map((d) => d.componentInstance as CamposIniciativaComponent)
      .find((c) => c.nodos[0] && c.nodos[0].dato.clave === 'causa_indirecta');
    const opciones = grupo.opcionesDe(grupo.nodos[0]).map((o) => o.etiqueta);
    expect(opciones).toEqual(['Fallas en los equipos', 'Falta de mantenimiento']);
  }));
});
