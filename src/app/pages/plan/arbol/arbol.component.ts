import { Component, Input, Output, EventEmitter, OnInit, ViewChild, AfterViewInit, OnChanges, ElementRef } from '@angular/core';
import { ControlValueAccessor, FormBuilder, FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { FlatTreeControl } from '@angular/cdk/tree';
import { MatPaginator } from '@angular/material/paginator';
import { forkJoin, Observable } from 'rxjs'
import { MatSort } from '@angular/material/sort';
import {
  MatTreeFlatDataSource,
  MatTreeFlattener
} from '@angular/material/tree';
import { RequestManager } from '../../services/requestManager';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { CodigosService } from 'src/app/@core/services/codigos.service';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { take } from 'rxjs/operators';

interface Subgrupo {
  activo: string;
  nombre: string;
  descripcion: string;
  id: string;
  orden?: number;
  parentId?: string;
  children?: Subgrupo[];
}

// Objeto fila

interface Nodo {
  expandable: boolean;
  activo: string;
  nombre: string;
  descripcion: string;
  id: string;
  orden?: number;
  parentId?: string;
  level: number;
  icon?: string;
  idx?: number;
  padre_idx?: number | undefined;
  hijos_idx?: (number | undefined)[];
}

const Checked: string = 'done';
const Unchecked: string = 'compare_arrows';
const No_Aplica: string = "no aplica"

@Component({
  selector: 'app-arbol',
  templateUrl: './arbol.component.html',
  styleUrls: ['./arbol.component.scss'],
})
export class ArbolComponent implements OnInit {
  ID_TIPO_PROYECTO: string;

  selectedFiles: any;
  dataRow: any;
  formConstruirPUI: FormGroup;
  displayedColumns: string[] = ['nombre', 'descripcion', 'activo', 'actions'];
  displayedColumnsView: string[] = ['nombre', 'descripcion', 'activo'];
  mostrar: boolean = false;
  planActual: string;
  icon: string;
  idIcon: string;
  rol: string;
  padresGuardando = new Set<string>();

  private transformer = (node: Subgrupo, level: number) => {
    if (this.armonizacionPED || this.armonizacionPI) {
      return {
        expandable: !!node.children && node.children.length > 0,
        activo: node.activo,
        nombre: node.nombre,
        descripcion: node.descripcion,
        id: node.id,
        orden: node.orden,
        parentId: node.parentId,
        level: level,
        icon: this.iconArmonizacion(node.id)
      };
    } else {
      return {
        expandable: !!node.children && node.children.length > 0,
        activo: node.activo,
        nombre: node.nombre,
        descripcion: node.descripcion,
        id: node.id,
        orden: node.orden,
        parentId: node.parentId,
        level: level,
      };
    }

  };

  treeControl = new FlatTreeControl<Nodo>(
    node => node.level,
    node => node.expandable
  );

  treeFlattener = new MatTreeFlattener(
    this.transformer,
    node => node.level,
    node => node.expandable,
    node => node.children
  );

  dataSource = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  @Input() tipoPlanId: string;
  @Input() idPlan: string;
  @Input() consulta: boolean;
  @Input() banderaCarga: boolean;
  @Input() armonizacionPED: boolean;
  @Input() armonizacionPI: boolean;
  @Input() dataArmonizacion: any[];
  @Input() estado: string;
  @Input() updateSignal: Observable<String[]>;
  @Output() grupo = new EventEmitter<any>();
  @Output() componentLoaded: EventEmitter<void> = new EventEmitter<void>();
  constructor(
    private formBuilder: FormBuilder,
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService,
    private codigosService: CodigosService
  ) {
    let roles: any = this.autenticationService.getRole();
    if (roles.__zone_symbol__value.find(x => x == 'JEFE_DEPENDENCIA' || x == 'ASISTENTE_DEPENDENCIA')) {
      this.rol = 'JEFE_DEPENDENCIA'
    } else if (roles.__zone_symbol__value.find(x => x == 'PLANEACION')) {
      this.rol = 'PLANEACION'
    }
  }

  getErrorMessage(campo: FormControl) {
    if (campo.hasError('required',)) {
      return 'Campo requerido';
    } else {
      return 'Introduzca un valor válido';
    }
  }

  async ngOnChanges(changes) {
    if (this.tipoPlanId !== await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PR_SP')) {
      if (this.idPlan !== this.planActual) {
        await this.loadArbolMid();
      }
    }
    if (changes['updateSignal'] && this.updateSignal) {
      this.updateSignal.subscribe(async () => {
        await this.loadArbolMid();
      });
    }
  }

  async loadArbolMid() {
    this.mostrar = false;
    Swal.fire({
      title: 'Cargando información',
      timerProgressBar: true,
      showConfirmButton: false,
      allowOutsideClick: false,
      willOpen: () => {
        Swal.showLoading();
      },
    })
    await new Promise((resolve, reject) => {
      this.request.get(environment.PLANES_MID, `arbol/` + this.idPlan).subscribe(async (data: any) => {
        if (data.Data !== null) {
          this.mostrar = true;
          this.dataSource.data = this.prepararArbol(data.Data, this.idPlan);
          if (this.armonizacionPED || this.armonizacionPI) {
            await this.linksArbol()
            await this.expandNodes()
          }
        } else {
          this.dataSource.data = [];
        }
        this.componentLoaded.emit();
        Swal.close();
        resolve(true);
      }, (error) => {
        Swal.fire({
          title: 'Error en la operación',
          text: `No se encontraron datos registrados ${JSON.stringify(error)}`,
          icon: 'warning',
          showConfirmButton: false,
          timer: 2500
        })
        reject(error);
      })
    });
  }

  async linksArbol() {
    let deepLevelIxd: number[] = [-1,-1,-1];
    let pastdeepLevelIxd: number[] = deepLevelIxd;
    this.treeControl.dataNodes.forEach((element, i) => {
      element.idx = i;
      deepLevelIxd[element.level] = i;
      element.padre_idx = pastdeepLevelIxd[element.level-1];
      pastdeepLevelIxd = deepLevelIxd;
    })
    this.treeControl.dataNodes.forEach((elementp, i) => {
      const idsHijos = this.treeControl.dataNodes.filter(elementh => elementh.padre_idx == i).map((e) => {return e.idx});
      elementp.hijos_idx = idsHijos;
    })
    await Promise.resolve();
  }

  selectFile(event) {
    this.selectedFiles = event.target.files;
    if (this.selectedFiles.length == 0) {
      return this.selectedFiles = false;
    }
  }


  editar(fila, bandera) {
    this.grupo.emit({ fila, bandera })
  }

  puedeArrastrar(fila: Nodo): boolean {
    return this.esActivo(fila) && !this.padresGuardando.has(fila.parentId);
  }

  puedeSoltar = (indice: number, drag: CdkDrag<Nodo>, drop: CdkDropList<Nodo[]>): boolean => {
    const destino = drop.data && drop.data[indice];
    const origen = drag.data;
    return !!destino && this.puedeArrastrar(origen) && this.esActivo(destino) &&
      origen.level === destino.level && origen.parentId === destino.parentId;
  }

  obtenerNodosVisibles(): Nodo[] {
    const visibles: Nodo[] = [];
    const ancestrosExpandidos: boolean[] = [];
    for (const nodo of this.treeControl.dataNodes || []) {
      const visible = nodo.level === 0 || ancestrosExpandidos.slice(0, nodo.level).every(expandido => expandido);
      if (visible) {
        visibles.push(nodo);
      }
      ancestrosExpandidos[nodo.level] = visible && this.treeControl.isExpanded(nodo);
      ancestrosExpandidos.length = nodo.level + 1;
    }
    return visibles;
  }

  soltar(event: CdkDragDrop<Nodo[]>) {
    const origen: Nodo = event.item.data;
    const visibles = event.container.data || [];
    const destino = visibles[event.currentIndex];
    if (!destino || origen.id === destino.id || !this.puedeArrastrar(origen) ||
      !this.esActivo(destino) || origen.level !== destino.level || origen.parentId !== destino.parentId) {
      return;
    }

    const hermanos = this.obtenerHermanos(this.dataSource.data, origen.id);
    if (!hermanos) {
      return;
    }
    const anterior = this.clonarArbol(this.dataSource.data);
    const activos = hermanos.filter(hermano => this.esActivo(hermano));
    const indiceOrigen = activos.findIndex(hermano => hermano.id === origen.id);
    const indiceDestino = activos.findIndex(hermano => hermano.id === destino.id);
    if (indiceOrigen < 0 || indiceDestino < 0) {
      return;
    }

    moveItemInArray(activos, indiceOrigen, indiceDestino);
    let siguienteActivo = 0;
    hermanos.forEach((hermano, indice) => {
      if (this.esActivo(hermano)) {
        hermanos[indice] = activos[siguienteActivo++];
      }
      hermanos[indice].orden = indice;
    });
    this.refrescarArbol();
    const idsOrdenados = hermanos.map(hermano => hermano.id);
    if (origen.level === 0) {
      this.persistirOrdenPrimerNivel(origen.parentId, idsOrdenados, anterior);
    } else {
      this.persistirOrden(origen.parentId, idsOrdenados, anterior);
    }
  }

  private obtenerHermanos(nodos: any[], id: string): any[] {
    const nodo = nodos.find(item => item.id === id);
    if (nodo) {
      return nodos;
    }
    for (const item of nodos) {
      if (item.children && item.children.length) {
        const resultado = this.obtenerHermanos(item.children, id);
        if (resultado) {
          return resultado;
        }
      }
    }
    return undefined;
  }

  private prepararArbol(nodos: any[], parentId: string): any[] {
    return (nodos || []).map(nodo => ({
      ...nodo,
      parentId,
      children: nodo.children ? this.prepararArbol(nodo.children, nodo.id) : nodo.children
    })).sort((a, b) => {
      const ordenA = a.orden !== undefined && a.orden !== null ? Number(a.orden) : Number.MAX_SAFE_INTEGER;
      const ordenB = b.orden !== undefined && b.orden !== null ? Number(b.orden) : Number.MAX_SAFE_INTEGER;
      return ordenA - ordenB;
    });
  }

  private refrescarArbol() {
    this.dataSource.data = [...this.dataSource.data];
  }

  private esActivo(nodo: { activo: string | boolean }): boolean {
    return nodo.activo === true || String(nodo.activo).toLowerCase() === 'activo';
  }

  private clonarArbol(nodos: any[]): any[] {
    return nodos.map(nodo => ({
      ...nodo,
      children: nodo.children ? this.clonarArbol(nodo.children) : nodo.children
    }));
  }

  private persistirOrden(parentId: string, hijos: string[], anterior: any[]) {
    this.padresGuardando.add(parentId);
    this.request.get(environment.PLANES_CRUD, `subgrupo/${parentId}`).subscribe((consulta: any) => {
      const padre = consulta && consulta.Data;
      if (!padre) {
        this.manejarErrorOrden({ status: 404 }, parentId, anterior);
        return;
      }

      // Compatibilidad: el CRUD desplegado todavía valida el esquema completo
      // aunque el contrato nuevo permite actualizar únicamente { hijos }.
      const payload = { ...padre, hijos };
      delete payload.orden;
      this.request.put(environment.PLANES_CRUD, 'subgrupo', payload, parentId).subscribe(
      async (respuesta: any) => {
        const hijosRespuesta = respuesta && respuesta.Data && respuesta.Data.hijos;
        if (respuesta && respuesta.Success === false || !this.mismoOrden(hijos, hijosRespuesta)) {
          this.restaurarArbol(anterior);
          this.padresGuardando.delete(parentId);
          await Swal.fire({
            title: 'No fue posible guardar el orden',
            text: respuesta && respuesta.Message ? respuesta.Message : 'El backend no confirmó el orden enviado.',
            icon: 'error'
          });
          return;
        }

        await this.loadArbolMid();
        this.padresGuardando.delete(parentId);
        const confirmados = this.obtenerHijosPorPadre(this.dataSource.data, parentId);
        if (!this.mismoOrden(hijos, confirmados)) {
          await Swal.fire({
            title: 'El orden no pudo verificarse',
            text: 'La estructura recargada no coincide con el orden enviado.',
            icon: 'warning'
          });
          return;
        }
        Swal.fire({
          title: 'Orden actualizado',
          text: 'El nuevo orden se guardó correctamente.',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        });
      },
      (error) => this.manejarErrorOrden(error, parentId, anterior)
      );
    }, (error) => this.manejarErrorOrden(error, parentId, anterior));
  }

  private persistirOrdenPrimerNivel(planId: string, idsOrdenados: string[], anterior: any[]) {
    this.padresGuardando.add(planId);
    forkJoin(idsOrdenados.map(id => this.request.get(
      environment.PLANES_CRUD,
      `subgrupo/${id}`
    ).pipe(take(1)))).subscribe(
      (consultas: any[]) => {
        const subgrupos = consultas.map(consulta => consulta && consulta.Data);
        if (subgrupos.some(subgrupo => !subgrupo || !subgrupo.fecha_creacion)) {
          this.manejarErrorOrden({ status: 404 }, planId, anterior);
          return;
        }

        const fechas = subgrupos.map(subgrupo => new Date(subgrupo.fecha_creacion).getTime());
        const fechaBase = Math.min(...fechas);
        const unaHora = 60 * 60 * 1000;
        const actualizaciones = subgrupos.map((subgrupo, indice) => {
          const payload = {
            fecha_creacion: new Date(fechaBase + indice * unaHora).toISOString()
          };
          return this.request.put(
            environment.PLANES_CRUD,
            'subgrupo',
            payload,
            subgrupo._id
          ).pipe(take(1));
        });

        forkJoin(actualizaciones).subscribe(
          () => this.verificarOrdenPrimerNivel(planId, idsOrdenados, anterior),
          (error) => this.manejarErrorOrden(error, planId, anterior)
        );
      },
      (error) => this.manejarErrorOrden(error, planId, anterior)
    );
  }

  private verificarOrdenPrimerNivel(planId: string, idsOrdenados: string[], anterior: any[]) {
    this.request.get(environment.PLANES_CRUD, `subgrupo/hijos/${planId}`).pipe(take(1)).subscribe(
      async (respuesta: any) => {
        const hijosCrud = respuesta && Array.isArray(respuesta.Data)
          ? respuesta.Data.map(hijo => String(hijo._id))
          : [];
        if (!this.mismoOrden(idsOrdenados, hijosCrud)) {
          this.restaurarArbol(anterior);
          this.padresGuardando.delete(planId);
          Swal.fire({
            title: 'El orden no se guardó en planes_crud',
            text: `Esperado: ${idsOrdenados.join(', ')}. Recibido: ${hijosCrud.join(', ')}.`,
            icon: 'warning'
          });
          return;
        }

        await this.loadArbolMid();
        this.padresGuardando.delete(planId);
        const hijosMid = this.dataSource.data.map(nodo => String(nodo.id));
        if (!this.mismoOrden(idsOrdenados, hijosMid)) {
          Swal.fire({
            title: 'planes_crud guardó el orden, pero planeacion_mid no lo refleja',
            text: 'Verifique que planeacion_mid consuma la misma instancia actualizada de planes_crud.',
            icon: 'warning'
          });
          return;
        }
        Swal.fire({
          title: 'Orden actualizado',
          text: 'El primer nivel se ordenó actualizando la hora de creación.',
          icon: 'success',
          showConfirmButton: false,
          timer: 2000
        });
      },
      (error) => this.manejarErrorOrden(error, planId, anterior)
    );
  }

  private async manejarErrorOrden(error: any, parentId: string, anterior: any[]) {
    this.restaurarArbol(anterior);
    this.padresGuardando.delete(parentId);
    if (Number(error && error.status) === 409) {
      await this.loadArbolMid();
      Swal.fire({
        title: 'Estructura actualizada',
        text: 'La estructura fue modificada por otro usuario. Se cargó el orden más reciente.',
        icon: 'warning'
      });
      return;
    }
    const mensaje = error && error.error && error.error.Message
      ? error.error.Message
      : 'No fue posible guardar el nuevo orden. Se restauró la estructura anterior.';
    Swal.fire({ title: 'Error en la operación', text: mensaje, icon: 'error' });
  }

  private restaurarArbol(anterior: any[]) {
    this.dataSource.data = anterior;
  }

  private mismoOrden(esperado: string[], recibido: any[]): boolean {
    return Array.isArray(recibido) && esperado.length === recibido.length &&
      esperado.every((id, indice) => String(id) === String(recibido[indice]));
  }

  private obtenerHijosPorPadre(nodos: any[], parentId: string): string[] {
    for (const nodo of nodos) {
      if (String(nodo.id) === String(parentId)) {
        return (nodo.children || []).map(hijo => String(hijo.id));
      }
      const encontrados = this.obtenerHijosPorPadre(nodo.children || [], parentId);
      if (encontrados) {
        return encontrados;
      }
    }
    return undefined;
  }

  agregar(fila, bandera) {
    this.grupo.emit({ fila, bandera })
  }

  async armonizar(fila, bandera) {
    let planIs: string = "";
    if (this.armonizacionPED) {
      await this.changeIcon(fila)
      planIs = "PED";
    } else if (this.armonizacionPI) {
      await this.changeIcon(fila)
      planIs = "PI";
    }
    const idsArmo = this.treeControl.dataNodes.filter(elements => elements.icon == Checked).map(element => { return element.id })
    this.grupo.emit({ fila, bandera, plan: planIs, armonizacionIds: idsArmo })
  }

  iconArmonizacion(id): string {
    if (this.dataArmonizacion.length != 0) {
      const found = this.dataArmonizacion.find(element => element === id);
      if (id === found) {
        return Checked
      } else {
        return Unchecked
      }
    } else {
      return Unchecked
    }
  }

  async changeIcon(fila: Nodo) {
    if (fila.icon == Unchecked) {
      if (fila.activo != "inactivo") {
        const accion = new Promise<number>(resolve => {
          if (fila.nombre.toLowerCase().includes(No_Aplica)) {
            Swal.fire({
              title: `Ha elegido: ` + fila.nombre,
              text: `Si hay más opciones seleccionadas para el nivel actual se quitarán ¿Desea continuar?`,
              icon: 'warning',
              confirmButtonText: `Sí`,
              cancelButtonText: `No`,
              showCancelButton: true,
              allowOutsideClick: false,
            }).then((result) => {
              if (result.isConfirmed) {
                resolve(1); // confirma dejar no aplica, quitar resto del nivel
              } else {
                resolve(0); // No confirma dejar no aplica, aquí no se hace nada
              }
            })
          } else {
            resolve(-1); // es un caso normal, no es No aplica
          }
        });
        const response = await accion;
        const uncheckNoAplicaOnly = (response != 1);
        if (response != 0) {
          if (fila.padre_idx != undefined) {
            this.uncheckHijos(this.treeControl.dataNodes[fila.padre_idx].hijos_idx, uncheckNoAplicaOnly);
          } else {
            this.treeControl.dataNodes.filter(ef => ef.padre_idx == undefined).forEach(e => {
              if (uncheckNoAplicaOnly) {
                if (e.nombre.toLowerCase().includes(No_Aplica)) {
                  e.icon = Unchecked;
                }
              } else {
                e.icon = Unchecked;
                this.uncheckHijos(e.hijos_idx);
              }
            })
          }
          fila.icon = Checked;
          this.checkPadres(fila.padre_idx);
          const idxs = this.treeControl.dataNodes.filter(ef => ef.level == 0).map(e => { return e.idx });
          this.unCheckNoAplicaHijosIfMulti(idxs);
        }
      }
    } else {
      fila.icon = Unchecked;
      this.uncheckHijos(fila.hijos_idx);
      this.uncheckPadres(fila.padre_idx);
    }
  }

  checkPadres(idPadre: number) {
    let listPadres: number[] = [];
    while (idPadre != undefined) {
      listPadres.push(idPadre);
      this.treeControl.dataNodes[idPadre].icon = Checked;
      idPadre = this.treeControl.dataNodes[idPadre].padre_idx;
    }
  }

  uncheckHijos(idHijos: number[], justForNoAplica?: boolean) {
    justForNoAplica = justForNoAplica || false;
    idHijos.forEach(id => {
      if (!justForNoAplica) {
        this.treeControl.dataNodes[id].icon = Unchecked;
      } else if (this.treeControl.dataNodes[id].nombre.toLowerCase().includes(No_Aplica)) {
        this.treeControl.dataNodes[id].icon = Unchecked;
      }
      this.uncheckHijos(this.treeControl.dataNodes[id].hijos_idx, justForNoAplica);
    })
  }

  uncheckPadres(idPadre: number) {
    let thereIsMoreChecked = this.isAnotherChecked(this.treeControl.dataNodes[idPadre]?.hijos_idx);
      while (idPadre != undefined && !thereIsMoreChecked) {
        this.treeControl.dataNodes[idPadre].icon = Unchecked;
        idPadre = this.treeControl.dataNodes[idPadre].padre_idx;
        thereIsMoreChecked = this.isAnotherChecked(this.treeControl.dataNodes[idPadre]?.hijos_idx);
      }
  }

  isAnotherChecked(idxs: number[]): boolean {
    let checked: boolean = false;
    if (idxs != undefined) {
      for (let i = 0; i < idxs.length; i++) {
        if (this.treeControl.dataNodes[idxs[i]].icon == Checked) {
          checked = true;
          break;
        }
      }
    }
    return checked;
  }

  unCheckNoAplicaHijosIfMulti(idxs: number[]) {
    let count: number = 0;
    let idNoAplica: number = undefined;
    for (let i = 0; i < idxs.length; i++) {
      if (this.treeControl.dataNodes[idxs[i]].icon == Checked) {
        this.unCheckNoAplicaHijosIfMulti(this.treeControl.dataNodes[idxs[i]].hijos_idx);
        count++;
        if (this.treeControl.dataNodes[idxs[i]].nombre.toLowerCase().includes(No_Aplica)) {
          idNoAplica = idxs[i];
        }
      }
    }
    if ((count > 1) && (idNoAplica != undefined)) {
      this.treeControl.dataNodes[idNoAplica].icon = Unchecked;
    }
  }

  async expandNodes() {
    for (let nodo of this.dataArmonizacion) {
      let found = this.treeControl.dataNodes.find(element => element.id == nodo);
      let index = this.treeControl.dataNodes.indexOf(found);
      let level = found.level;

      for (let i = index; level >= 0; i--) {
        const element = this.treeControl.dataNodes[i];
        if (element.level == level) {
          this.treeControl.expand(element);
          level--;
        }
      }
    }
    await Promise.resolve();
  }

  hasChild = (_: number, node: Nodo) => node.expandable;

  async ngOnInit(){
    this.formConstruirPUI = this.formBuilder.group({
      infoControl: ['', Validators.required],
      requiredfile: ['', Validators.required]
    });
    this.planActual = '';
    this.ID_TIPO_PROYECTO = await this.codigosService.getId('PLANES_CRUD', 'tipo-plan', 'PR_SP')
  }
}
