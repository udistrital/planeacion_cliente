import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { Dependencia } from 'src/app/@core/models/dependencia';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';
import { mensajeDeError, IniciativaService } from '../iniciativa.service';
import {
  ACCIONES_SUBMODULO,
  DescripcionAccionSubmodulo,
  HTTP_CONFLICTO,
  IniciativaListado,
  ROLES_FORMULADORES,
  RUTA_INICIATIVAS,
} from '../utils';
import { tieneAlgunRol } from '../utils/roles.utils';
import {
  DatosSeleccionarUnidad,
  SeleccionarUnidadDialogoComponent,
} from './seleccionar-unidad-dialogo/seleccionar-unidad-dialogo.component';

/**
 * Listado de iniciativas. El mid decide qué ve cada usuario (la OAP, todas; los demás, las de
 * sus unidades) y qué hace con cada una (formularla, revisarla o consultarla), según su estado,
 * los roles del usuario y las fechas de la unidad. Las unidades del usuario se consultan solo al
 * crear, para elegir con cuál.
 */
@Component({
  selector: 'app-listado-iniciativas',
  templateUrl: './listado-iniciativas.component.html',
  styleUrls: ['./listado-iniciativas.component.scss'],
})
export class ListadoIniciativasComponent implements OnInit, OnDestroy {
  readonly columnas = ['numero', 'dependencia', 'nombre', 'estado', 'responsable', 'fecha', 'acciones'];
  readonly iniciativas = new MatTableDataSource<IniciativaListado>([]);
  roles: string[] = [];
  cargando = true;
  creando = false;
  /** Unidades del usuario; null mientras no se han consultado. */
  private unidades: Dependencia[] | null = null;
  private readonly destruir$ = new Subject<void>();

  @ViewChild(MatPaginator, { static: true }) paginador: MatPaginator;

  constructor(
    private servicio: IniciativaService,
    private autenticacion: ImplicitAutenticationService,
    private router: Router,
    private dialogo: MatDialog,
  ) {
    this.iniciativas.filterPredicate = (fila, filtro) => this.textoDeBusqueda(fila).includes(filtro);
  }

  /** Puede crear iniciativas (el mid valida además que sea para una de sus unidades). */
  get esFormulador(): boolean {
    return tieneAlgunRol(this.roles, ROLES_FORMULADORES);
  }

  async ngOnInit(): Promise<void> {
    this.iniciativas.paginator = this.paginador;
    this.roles = (await this.autenticacion.getRole()) as string[];
    this.cargar();
  }

  ngOnDestroy(): void {
    this.destruir$.next();
    this.destruir$.complete();
  }

  filtrar(evento: Event): void {
    this.iniciativas.filter = (evento.target as HTMLInputElement).value.trim().toLowerCase();
    this.iniciativas.paginator?.firstPage();
  }

  /** Botón de la fila: formular, revisar o consultar, según lo que el mid dice que hace el usuario. */
  accionDe(fila: IniciativaListado): DescripcionAccionSubmodulo {
    return ACCIONES_SUBMODULO[fila.accion] || ACCIONES_SUBMODULO.consultar;
  }

  /** Ayuda del botón: si el usuario actuaría pero la unidad está fuera de sus fechas, lo dice. */
  ayuda(fila: IniciativaListado): string {
    return fila.fuera_de_fechas ? 'Consultar (fuera de las fechas de formulación de la unidad)' : this.accionDe(fila).etiqueta;
  }

  mensajeSinFilas(busqueda: string): string {
    if (this.cargando) {
      return 'Cargando iniciativas…';
    }
    if (busqueda) {
      return `No se han encontrado resultados para la búsqueda "${busqueda}"`;
    }
    return 'No hay iniciativas registradas.';
  }

  /**
   * Crea la iniciativa a nombre de la unidad del usuario y abre sus componentes. Fuera de las
   * fechas de formulación de esa unidad, el mid no la crea y su mensaje se muestra como aviso.
   */
  async nuevaIniciativa(): Promise<void> {
    let unidad: Dependencia | null;
    try {
      unidad = await this.unidadParaCrear();
    } catch (error) {
      this.mostrarError(error, 'No se pudieron consultar sus unidades');
      return;
    }
    if (!unidad) {
      return;
    }
    this.creando = true;
    Swal.fire({ title: 'Creando la iniciativa…', allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() });
    this.servicio.crearIniciativa(String(unidad.Id)).subscribe(
      (creada) => {
        Swal.close();
        this.abrir(creada.id);
      },
      (error) => {
        this.creando = false;
        Swal.fire({
          icon: error && error.status === HTTP_CONFLICTO ? 'warning' : 'error',
          title: 'No se pudo crear la iniciativa',
          text: mensajeDeError(error),
        });
      },
    );
  }

  abrir(iniciativaId: string): void {
    this.router.navigate([RUTA_INICIATIVAS, iniciativaId]);
  }

  private cargar(): void {
    this.cargando = true;
    this.servicio
      .iniciativas()
      .pipe(takeUntil(this.destruir$))
      .subscribe(
        (iniciativas) => {
          this.iniciativas.data = iniciativas || [];
          this.cargando = false;
        },
        (error) => this.mostrarError(error),
      );
  }

  /** La unidad del usuario (se consulta la primera vez); si tiene varias, pregunta cuál. */
  private async unidadParaCrear(): Promise<Dependencia | null> {
    if (this.unidades === null) {
      Swal.fire({ title: 'Consultando sus unidades…', allowOutsideClick: false, allowEscapeKey: false, didOpen: () => Swal.showLoading() });
      this.unidades = await this.servicio.unidadesDelUsuario().toPromise();
      Swal.close();
    }
    const unidades = this.unidades;
    if (unidades.length === 1) {
      return unidades[0];
    }
    if (unidades.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Nueva iniciativa',
        text: 'Su usuario no está vinculado a ninguna unidad, así que no puede crear iniciativas.',
      });
      return null;
    }
    const datos: DatosSeleccionarUnidad = { unidades };
    const elegida: Dependencia | undefined = await this.dialogo
      .open(SeleccionarUnidadDialogoComponent, { width: '750px', maxWidth: '95vw', data: datos })
      .afterClosed()
      .toPromise();
    return elegida || null;
  }

  private textoDeBusqueda(fila: IniciativaListado): string {
    return [fila.numero, fila.nombre, fila.dependencia_nombre, fila.responsable, fila.estado.nombre]
      .filter((valor) => valor !== undefined && valor !== null)
      .join(' ')
      .toLowerCase();
  }

  private mostrarError(error: any, titulo = 'Error'): void {
    this.cargando = false;
    Swal.fire({ icon: 'error', title: titulo, text: mensajeDeError(error) });
  }
}
