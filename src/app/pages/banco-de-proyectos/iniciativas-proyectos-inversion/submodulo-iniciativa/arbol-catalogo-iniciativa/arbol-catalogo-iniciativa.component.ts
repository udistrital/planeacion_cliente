import { FlatTreeControl } from '@angular/cdk/tree';
import { Component, Input, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { MatTreeFlatDataSource, MatTreeFlattener } from '@angular/material/tree';
import { forkJoin, Subscription } from 'rxjs';
import Swal from 'sweetalert2';
import { IniciativaService, mensajeDeError } from '../../iniciativa.service';
import { Datos, ItemCatalogo, NodoDefinicion } from '../../utils';
import { cadenaDeCatalogos, ContextoFormulario, rutaCampo } from '../../utils/formulario.utils';

/** Íconos de la columna Armonizar, los mismos de la armonización de Formulación (plan/arbol). */
export const ARMONIZADO = 'done';
export const SIN_ARMONIZAR = 'compare_arrows';

/** Los elementos «No aplica» excluyen a los demás de su nivel, como en Formulación. */
const NO_APLICA = 'no aplica';

/** Nodo del árbol armado con los catálogos de los niveles. */
interface NodoArbol {
  id: string;
  nombre: string;
  descripcion: string;
  children: NodoArbol[];
  nivel: number;
}

/** Fila de la tabla (nodo aplanado). */
export interface FilaArbol {
  id: string;
  nombre: string;
  descripcion: string;
  /** Los planes solo traen nodos activos. */
  activo: string;
  level: number;
  expandable: boolean;
  icon: string;
  padre?: FilaArbol;
  hijos: FilaArbol[];
}

/**
 * Grupo de catálogos encadenados (GRUPOS_EN_ARBOL): el plan se elige en su campo de catálogo, como
 * los demás del formulario, y debajo va la tabla en árbol de la armonización de Formulación
 * (plan/arbol), con las flechas para desplegar y la columna Armonizar (⇄ / ✓), en la que se
 * seleccionan varios elementos de cualquier nivel. Al seleccionar uno quedan seleccionados los de
 * arriba; al quitarlo se quitan los de abajo y los de arriba que se quedan sin ninguno. Un «No
 * aplica» excluye a los demás de su nivel.
 * Cada nivel se guarda en su campo del grupo como lista de códigos (catálogo multiple), y el mid
 * valida que cada uno cuelgue de lo seleccionado arriba.
 */
@Component({
  selector: 'app-arbol-catalogo-iniciativa',
  templateUrl: './arbol-catalogo-iniciativa.component.html',
  styleUrls: ['./arbol-catalogo-iniciativa.component.scss'],
})
export class ArbolCatalogoIniciativaComponent implements OnChanges, OnDestroy {
  /** El grupo (p. ej. Plan Estratégico de Desarrollo). */
  @Input() nodo: NodoDefinicion;
  /** Datos del grupo: el código del plan y una lista de códigos por nivel. */
  @Input() datos: Datos = {};
  @Input() ruta = '';
  @Input() contexto: ContextoFormulario;

  readonly displayedColumns = ['nombre', 'descripcion', 'activo', 'actions'];

  /** Primer campo de la cadena: el plan, que se elige en su lista. */
  campoPlan: NodoDefinicion | null = null;
  /** Los demás campos, uno por nivel del árbol. */
  niveles: NodoDefinicion[] = [];
  cargando = true;
  errorDeCarga = '';

  readonly treeControl = new FlatTreeControl<FilaArbol>(
    (fila) => fila.level,
    (fila) => fila.expandable,
  );
  private readonly treeFlattener = new MatTreeFlattener<NodoArbol, FilaArbol>(
    (nodo, level) => ({
      id: nodo.id,
      nombre: nodo.nombre,
      descripcion: nodo.descripcion,
      activo: 'activo',
      level,
      expandable: nodo.children.length > 0,
      icon: this.estaGuardado(nodo) ? ARMONIZADO : SIN_ARMONIZAR,
      hijos: [],
    }),
    (fila) => fila.level,
    (fila) => fila.expandable,
    (nodo) => nodo.children,
  );
  readonly dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  /** Elementos de cada nivel, agrupados por el código de su padre. */
  private porPadre: Map<string, ItemCatalogo[]>[] = [];
  private carga?: Subscription;

  constructor(private servicio: IniciativaService) {}

  ngOnChanges(cambios: SimpleChanges): void {
    if (cambios.nodo) {
      this.cargar();
    } else if (cambios.datos) {
      this.armarArbol();
    }
  }

  ngOnDestroy(): void {
    if (this.carga) {
      this.carga.unsubscribe();
    }
  }

  /** Código del plan elegido. */
  get plan(): string | null {
    return (this.campoPlan && this.datos[this.campoPlan.dato.clave]) || null;
  }

  /** Errores de los niveles, que van debajo de la tabla. */
  get erroresDeNiveles(): string[] {
    return this.niveles.reduce((todos, campo) => todos.concat(this.erroresDe(campo)), [] as string[]);
  }

  erroresDe(campo: NodoDefinicion): string[] {
    return this.contexto.errores[rutaCampo(this.ruta, campo.dato.clave)] || [];
  }

  /** Otro plan trae otro árbol: lo seleccionado en el anterior se quita. */
  cambiarPlan(plan: string | null): void {
    const clave = this.campoPlan.dato.clave;
    if ((this.datos[clave] || null) === (plan || null)) {
      return;
    }
    this.datos[clave] = plan || null;
    for (const campo of this.niveles) {
      this.datos[campo.dato.clave] = [];
    }
    this.armarArbol();
  }

  /** Columna Armonizar: selecciona o quita el elemento, con las mismas reglas de Formulación. */
  async armonizar(fila: FilaArbol): Promise<void> {
    if (this.contexto.soloLectura) {
      return;
    }
    if (fila.icon === ARMONIZADO) {
      this.quitar(fila);
      this.quitarPadresSinSeleccion(fila.padre);
    } else {
      const esNoAplica = esFilaNoAplica(fila);
      if (esNoAplica && !(await this.confirmarNoAplica(fila))) {
        return;
      }
      for (const hermana of this.hermanasDe(fila)) {
        if (esNoAplica) {
          this.quitar(hermana);
        } else {
          this.quitarNoAplica(hermana);
        }
      }
      fila.icon = ARMONIZADO;
      for (let padre = fila.padre; padre; padre = padre.padre) {
        padre.icon = ARMONIZADO;
      }
      this.quitarNoAplicaSiHayOtras(this.raices());
    }
    this.guardar();
  }

  private cargar(): void {
    if (this.carga) {
      this.carga.unsubscribe();
    }
    const cadena = cadenaDeCatalogos(this.nodo.hijos) || [];
    this.campoPlan = cadena[0] || null;
    this.niveles = cadena.slice(1);
    this.cargando = true;
    this.errorDeCarga = '';
    this.dataSource.data = [];
    if (!this.campoPlan) {
      return;
    }
    // El plan lo carga su propio campo de catálogo; aquí, los niveles del árbol.
    this.carga = forkJoin(this.niveles.map((campo) => this.servicio.catalogo(campo.dato.catalogo))).subscribe(
      (porNivel) => {
        this.porPadre = porNivel.map(agruparPorPadre);
        this.cargando = false;
        this.armarArbol();
      },
      (error) => {
        this.cargando = false;
        this.errorDeCarga = mensajeDeError(error);
      },
    );
  }

  /** Arma la tabla del plan elegido con lo guardado marcado y desplegado hasta verlo. */
  private armarArbol(): void {
    if (this.cargando) {
      return;
    }
    this.dataSource.data = this.plan ? this.nodosDe(this.plan, 0) : [];
    this.enlazar();
    this.desplegarSeleccion();
  }

  private nodosDe(padre: string, nivel: number): NodoArbol[] {
    const items = (nivel < this.porPadre.length && this.porPadre[nivel].get(padre)) || [];
    return items.map((item) => ({
      id: item.codigo,
      nombre: item.nombre,
      descripcion: item.descripcion || '',
      nivel,
      children: this.nodosDe(item.codigo, nivel + 1),
    }));
  }

  /** Une cada fila con su padre y sus hijas (las filas vienen en orden de árbol). */
  private enlazar(): void {
    const ultimaPorNivel: FilaArbol[] = [];
    for (const fila of this.treeControl.dataNodes) {
      fila.padre = fila.level > 0 ? ultimaPorNivel[fila.level - 1] : undefined;
      if (fila.padre) {
        fila.padre.hijos.push(fila);
      }
      ultimaPorNivel[fila.level] = fila;
    }
  }

  /** Despliega cada elemento seleccionado y los de arriba, como Formulación al abrir la armonización. */
  private desplegarSeleccion(): void {
    for (const fila of this.treeControl.dataNodes.filter((candidata) => candidata.icon === ARMONIZADO && candidata.expandable)) {
      for (let actual: FilaArbol | undefined = fila; actual; actual = actual.padre) {
        this.treeControl.expand(actual);
      }
    }
  }

  private estaGuardado(nodo: NodoArbol): boolean {
    const campo = this.niveles[nodo.nivel];
    const guardados = campo ? this.datos[campo.dato.clave] : null;
    return Array.isArray(guardados) && guardados.includes(nodo.id);
  }

  /** Cada nivel queda en su campo: los códigos seleccionados, en el orden del árbol. */
  private guardar(): void {
    this.niveles.forEach((campo, nivel) => {
      this.datos[campo.dato.clave] = this.treeControl.dataNodes
        .filter((fila) => fila.level === nivel && fila.icon === ARMONIZADO)
        .map((fila) => fila.id);
    });
  }

  private confirmarNoAplica(fila: FilaArbol): Promise<boolean> {
    return Swal.fire({
      title: `Ha elegido: ${fila.nombre}`,
      text: 'Si hay más opciones seleccionadas para el nivel actual se quitarán ¿Desea continuar?',
      icon: 'warning',
      confirmButtonText: 'Sí',
      cancelButtonText: 'No',
      showCancelButton: true,
      allowOutsideClick: false,
    }).then((resultado) => !!resultado.isConfirmed);
  }

  private raices(): FilaArbol[] {
    return this.treeControl.dataNodes.filter((fila) => fila.level === 0);
  }

  private hermanasDe(fila: FilaArbol): FilaArbol[] {
    return (fila.padre ? fila.padre.hijos : this.raices()).filter((hermana) => hermana !== fila);
  }

  /** Quita la fila y todo lo de abajo. */
  private quitar(fila: FilaArbol): void {
    fila.icon = SIN_ARMONIZAR;
    fila.hijos.forEach((hija) => this.quitar(hija));
  }

  /** Quita los «No aplica» de la fila y de todo lo de abajo. */
  private quitarNoAplica(fila: FilaArbol): void {
    if (esFilaNoAplica(fila)) {
      this.quitar(fila);
      return;
    }
    fila.hijos.forEach((hija) => this.quitarNoAplica(hija));
  }

  /** Sube quitando los padres que se quedaron sin ningún elemento seleccionado debajo. */
  private quitarPadresSinSeleccion(padre: FilaArbol | undefined): void {
    for (let actual = padre; actual && !actual.hijos.some((hija) => hija.icon === ARMONIZADO); actual = actual.padre) {
      actual.icon = SIN_ARMONIZAR;
    }
  }

  /** En un nivel con varios seleccionados, el «No aplica» sobra. */
  private quitarNoAplicaSiHayOtras(filas: FilaArbol[]): void {
    const seleccionadas = filas.filter((fila) => fila.icon === ARMONIZADO);
    seleccionadas.forEach((fila) => this.quitarNoAplicaSiHayOtras(fila.hijos));
    if (seleccionadas.length > 1) {
      seleccionadas.filter(esFilaNoAplica).forEach((fila) => this.quitar(fila));
    }
  }
}

function esFilaNoAplica(fila: FilaArbol): boolean {
  return fila.nombre.toLowerCase().includes(NO_APLICA);
}

function agruparPorPadre(items: ItemCatalogo[]): Map<string, ItemCatalogo[]> {
  const grupos = new Map<string, ItemCatalogo[]>();
  for (const item of items || []) {
    grupos.set(item.padre, [...(grupos.get(item.padre) || []), item]);
  }
  return grupos;
}
