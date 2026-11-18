import { NodoDefinicion } from '../../utils';
import { GrupoRepetibleIniciativaComponent } from './grupo-repetible-iniciativa.component';

function lista(etiqueta_fila?: string): NodoDefinicion {
  return {
    id: 'bienes_servicios',
    nombre: 'Bienes o servicios a entregar',
    descripcion: '',
    dato: { clave: 'bienes_servicios', type: 'repetible', required: true, etiqueta_fila },
    hijos: [],
  };
}

describe('GrupoRepetibleIniciativaComponent', () => {
  function componente(etiqueta?: string): GrupoRepetibleIniciativaComponent {
    const grupo = new GrupoRepetibleIniciativaComponent();
    grupo.nodo = lista(etiqueta);
    return grupo;
  }

  it('el título de la fila lleva la etiqueta completa y los botones la nombran sin el «No.» final', () => {
    const grupo = componente('Bien o servicio a entregar o demanda a satisfacer No.');

    expect(grupo.etiqueta).toBe('Bien o servicio a entregar o demanda a satisfacer No.');
    expect(grupo.etiquetaAccion).toBe('Bien o servicio a entregar o demanda a satisfacer');
  });

  it('una etiqueta sin «No.» queda igual, y sin etiqueta dice Elemento', () => {
    expect(componente('Ingreso o beneficio').etiquetaAccion).toBe('Ingreso o beneficio');
    expect(componente().etiquetaAccion).toBe('Elemento');
  });
});
