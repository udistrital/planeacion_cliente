import { ArbolComponent } from './arbol.component';

describe('ArbolComponent - orden del formato', () => {
  let component: ArbolComponent;
  beforeEach(() => {
    const request = { get: jasmine.createSpy('get'), put: jasmine.createSpy('put') };
    const autenticacion = { getRole: () => ({ __zone_symbol__value: [] }) };
    const codigos = { getId: jasmine.createSpy('getId') };
    component = new ArbolComponent({} as any, request as any, autenticacion as any, codigos as any);
    component.idPlan = 'plan';
  });

  it('conserva activos e inactivos y ordena cada nivel por orden', () => {
    const arbol = (component as any).prepararArbol([
      { id: 'raiz', activo: 'activo', orden: 0, children: [
        { id: 'b', activo: 'inactivo', orden: 1 },
        { id: 'a', activo: 'activo', orden: 0 }
      ] }
    ], 'plan');

    expect(arbol[0].children.map(hijo => hijo.id)).toEqual(['a', 'b']);
    expect(arbol[0].children[1].activo).toBe('inactivo');
    expect(arbol[0].children[0].parentId).toBe('raiz');
  });

  it('permite mover hijos directos del plan y bloquea los inactivos', () => {
    expect(component.puedeArrastrar({ level: 0, activo: 'activo', parentId: 'plan' } as any)).toBeTrue();
    expect(component.puedeArrastrar({ level: 0, activo: 'inactivo', parentId: 'plan' } as any)).toBeFalse();
  });

  it('reordena activos sin desplazar la posición absoluta de los inactivos', () => {
    component.dataSource.data = (component as any).prepararArbol([
      { id: 'padre', activo: 'activo', orden: 0, children: [
        { id: 'a', activo: 'activo', orden: 0 },
        { id: 'b', activo: 'inactivo', orden: 1 },
        { id: 'c', activo: 'activo', orden: 2 }
      ] }
    ], 'plan');
    component.treeControl.expand(component.treeControl.dataNodes[0]);
    const visibles = component.obtenerNodosVisibles();
    const origen = visibles.find(nodo => nodo.id === 'c');
    spyOn<any>(component, 'persistirOrden');

    component.soltar({
      item: { data: origen },
      container: { data: visibles },
      currentIndex: visibles.findIndex(nodo => nodo.id === 'a')
    } as any);

    const hijos = component.dataSource.data[0].children;
    expect(hijos.map(hijo => hijo.id)).toEqual(['c', 'b', 'a']);
    expect((component as any).persistirOrden).toHaveBeenCalledWith(
      'padre', ['c', 'b', 'a'], jasmine.any(Array)
    );
  });

  it('rechaza un drop cuyo destino pertenece a otro padre', () => {
    component.dataSource.data = (component as any).prepararArbol([
      { id: 'p1', activo: 'activo', orden: 0, children: [{ id: 'a', activo: 'activo', orden: 0 }] },
      { id: 'p2', activo: 'activo', orden: 1, children: [{ id: 'b', activo: 'activo', orden: 0 }] }
    ], 'plan');
    component.treeControl.expandAll();
    const visibles = component.obtenerNodosVisibles();
    const origen = visibles.find(nodo => nodo.id === 'a');
    spyOn<any>(component, 'persistirOrden');

    component.soltar({
      item: { data: origen },
      container: { data: visibles },
      currentIndex: visibles.findIndex(nodo => nodo.id === 'b')
    } as any);

    expect((component as any).persistirOrden).not.toHaveBeenCalled();
  });
});
