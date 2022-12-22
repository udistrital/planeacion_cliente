import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PagesRoutingModule } from './pages-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PagesComponent } from './pages.component';
import { InformacionBasicaComponent } from './informacion-basica/informacion-basica.component';
import { HttpClientModule } from '@angular/common/http';
import { RequestManager } from './services/requestManager';

import { MatTableModule } from '@angular/material/table'
import { MatRadioModule } from '@angular/material/radio';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatStepperModule } from '@angular/material/stepper';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS, MomentDateModule, MatMomentDateModule, } from '@angular/material-moment-adapter';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OasGridColsDirective } from './directives/oas-grid-cols.directive';
import { MatDialogModule } from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';

import { Ng2SmartTableModule } from 'ng2-smart-table';
import { UtilService } from './services/utilService';
import { UserService } from './services/userService';
import { CrearPlanComponent } from './plan/crear-plan/crear-plan.component';
import { ListarPlanComponent } from './plan/listar-plan/listar-plan.component';
import { ConstruirPlanComponent } from './plan/construir-plan/construir-plan.component';
import { ConsultarPlanComponent } from './plan/consultar-plan/consultar-plan.component';
import { EvaluacionComponent } from './evaluacion/evaluacion.component';
import { SeguimientoComponentList } from './seguimiento/listar-plan-accion-anual/seguimiento.component';
import { SeguimientoComponentGestion } from './seguimiento/gestion-seguimiento/gestion-seguimiento.component';
import { ReportarPeriodoComponent } from './seguimiento/reportar-periodo/reportar-periodo.component';
import { GenerarTrimestreComponent } from './seguimiento/generar-trimestre/generar-trimestre.component';
import { EvidenciasDialogComponent } from './seguimiento/evidencias/evidencias-dialog.component';
import { ArbolComponent } from './plan/arbol/arbol.component';
import { AgregarDialogComponent } from './plan/construir-plan/agregar-dialog/agregar-dialog.component';
import { EditarDialogComponent } from './plan/construir-plan/editar-dialog/editar-dialog.component';
import { FormulacionComponent } from './formulacion/formulacion.component';
import { ContratistasComponent } from './formulacion/contratistas/contratistas.component';
import { RecursosComponent } from './formulacion/recursos/recursos.component';
import { DocentesComponent } from './formulacion/docentes/docentes.component';
import { NgIsGrantedDirective } from './directives/ng-is-granted.directive';
import { PlanAnualComponent } from './reportes/reporte-plan-anual/plan-anual.component';
import { HabilitarReporteComponent } from './plan/habilitar-reporte/habilitar-reporte.component';
import { VisualizarDocumentoDialogComponent } from './seguimiento/generar-trimestre/visualizar-documento-dialog/visualizar-documento-dialog.component';
import { ConstruccionModulComponent } from './construccion-modul/construccion-modul.component';
import { PUIComponent } from './pui/pui.component';
import { PedComponent } from './ped/ped.component';
import { ConsultarDialogPedComponent } from './ped/consultar-dialog-ped/consultar-dialog-ped.component';
import { ConsultarPIComponent } from './plan-indicativo/consultar-pi/consultar-pi.component';
import { SeguimientoPedComponent } from './ped/seguimiento-ped/seguimiento-ped.component';
import { EvaluacionPedComponent } from './ped/evaluacion-ped/evaluacion-ped.component';
import { ConstruccionPmeeComponent } from './pmee/construccion-pmee/construccion-pmee.component';
import { SeguimientoPmeeComponent } from './pmee/seguimiento-pmee/seguimiento-pmee.component';
import { EvaluacionPmeeComponent } from './pmee/evaluacion-pmee/evaluacion-pmee.component';
import { SeguimientoPIComponent } from './plan-indicativo/seguimiento-pi/seguimiento-pi.component';
import { EvaluacionPIComponent } from './plan-indicativo/evaluacion-pi/evaluacion-pi.component';
import { ConsultarPOAComponent } from './plan-operativo-anual/consultar-poa/consultar-poa.component';
import { EvaluacionPOAComponent } from './plan-operativo-anual/evaluacion-poa/evaluacion-poa.component';
import { ConsultarProyectoInversionComponent } from './banco-de-proyectos/proyectos-inversion-macro/consultar-proyecto-inversion/consultar-proyecto-inversion.component';
import { FormularProyectoInversionComponent } from './banco-de-proyectos/proyectos-inversion-macro/formular-proyecto-inversion/formular-proyecto-inversion.component';
import { SeguimientoProyectoInversionComponent } from './banco-de-proyectos/proyectos-inversion-macro/seguimiento-proyecto-inversion/seguimiento-proyecto-inversion.component';
import { EvaluacionProyectoInversionComponent } from './banco-de-proyectos/proyectos-inversion-macro/evaluacion-proyecto-inversion/evaluacion-proyecto-inversion.component';
import { ReportesProyectoInversionComponent } from './banco-de-proyectos/proyectos-inversion-macro/reportes-proyecto-inversion/reportes-proyecto-inversion.component';
import { ConsultarSubProyectoInversionComponent } from './banco-de-proyectos/banco-iniciativas-inversion/consultar-sub-proyecto-inversion/consultar-sub-proyecto-inversion.component';
import { FormularSubProyectoInversionComponent } from './banco-de-proyectos/banco-iniciativas-inversion/formular-sub-proyecto-inversion/formular-sub-proyecto-inversion.component';
import { SeguimientoSubProyectoInversionComponent } from './banco-de-proyectos/banco-iniciativas-inversion/seguimiento-sub-proyecto-inversion/seguimiento-sub-proyecto-inversion.component';
import { EvaluacionSubProyectoInversionComponent } from './banco-de-proyectos/banco-iniciativas-inversion/evaluacion-sub-proyecto-inversion/evaluacion-sub-proyecto-inversion.component';
import { ReportesSubProyectoInversionComponent } from './banco-de-proyectos/banco-iniciativas-inversion/reportes-sub-proyecto-inversion/reportes-sub-proyecto-inversion.component';
import { ProyectosOtrosFondosComponent } from './banco-de-proyectos/proyectos-otros-fondos/proyectos-otros-fondos.component';
import { ReporteFuncionamientoComponent } from './apropiacion-presupuestal/reporte-funcionamiento/reporte-funcionamiento.component';
import { ReporteInversionComponent } from './apropiacion-presupuestal/reporte-inversion/reporte-inversion.component';
import { ConstruirPlanProyectoComponent } from './plan/construir-plan-proyecto/construir-plan-proyecto.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { GoogleChartsModule } from 'angular-google-charts';


const pagesComponents = [
  DashboardComponent,
  PagesComponent,
  //InformacionBasicaComponent,
  CrearPlanComponent,
  ListarPlanComponent,
  ConstruirPlanComponent,
  ConsultarPlanComponent,
  EvaluacionComponent,
  SeguimientoComponentList,
  SeguimientoComponentGestion,
  ReportarPeriodoComponent,
  GenerarTrimestreComponent,
  EvidenciasDialogComponent,
  FormulacionComponent,
  AgregarDialogComponent,
  EditarDialogComponent,
  ArbolComponent,
  PlanAnualComponent,
];

const materialModules = [
  MatCardModule,
  MatListModule,
  MatIconModule,
  MatInputModule,
  MatSelectModule,
  MatCheckboxModule,
  MatDatepickerModule,
  MatNativeDateModule,
  MatFormFieldModule,
  MatGridListModule,
  MatExpansionModule,
  MatButtonModule,
  MatStepperModule,
  MatSlideToggleModule,
  MatRadioModule,
  MatMomentDateModule
];

const MY_FORMATS = {
  parse: {
    dateInput: 'DD.MM.YYYY',
  },
  display: {
    dateInput: 'DD.MM.YYYY',
    monthYearLabel: 'MM YYYY',
    dateA11yLabel: 'DD.MM.YYYY',
    monthYearA11yLabel: 'MM YYYY',
  },
};

@NgModule({
  declarations: [
    ...pagesComponents,
    OasGridColsDirective,
    NgIsGrantedDirective,
    CrearPlanComponent,
    ListarPlanComponent,
    ConstruirPlanComponent,
    ConsultarPlanComponent,
    EvaluacionComponent,
    SeguimientoComponentList,
    SeguimientoComponentGestion,
    ReportarPeriodoComponent,
    GenerarTrimestreComponent,
    EvidenciasDialogComponent,
    ArbolComponent,
    AgregarDialogComponent,
    EditarDialogComponent,
    FormulacionComponent,
    ContratistasComponent,
    RecursosComponent,
    DocentesComponent,
    PlanAnualComponent,
    HabilitarReporteComponent,
    VisualizarDocumentoDialogComponent,
    ConstruccionModulComponent,
    PUIComponent,
    PedComponent,
    ConsultarDialogPedComponent,
    ConsultarPIComponent,
    SeguimientoPedComponent,
    EvaluacionPedComponent,
    ConstruccionPmeeComponent,
    SeguimientoPmeeComponent,
    EvaluacionPmeeComponent,
    SeguimientoPIComponent,
    EvaluacionPIComponent,
    ConsultarPOAComponent,
    EvaluacionPOAComponent,
    ConsultarProyectoInversionComponent,
    FormularProyectoInversionComponent,
    SeguimientoProyectoInversionComponent,
    EvaluacionProyectoInversionComponent,
    ReportesProyectoInversionComponent,
    ConsultarSubProyectoInversionComponent,
    FormularSubProyectoInversionComponent,
    SeguimientoSubProyectoInversionComponent,
    EvaluacionSubProyectoInversionComponent,
    ReportesSubProyectoInversionComponent,
    ProyectosOtrosFondosComponent,
    ReporteFuncionamientoComponent,
    ReporteInversionComponent,
    ConstruirPlanProyectoComponent,
  ],
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    PagesRoutingModule,
    Ng2SmartTableModule,
    MatTableModule,
    MatDialogModule,
    MatRadioModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    MatIconModule,
    MatFormFieldModule,
    MatCardModule,
    MatGridListModule,
    MatButtonModule,
    MatButtonToggleModule,
    GoogleChartsModule,
    ...materialModules
  ],
  providers: [
    RequestManager,
    MatDatepickerModule,
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: {useUtc: true} }
  ]
})
export class PagesModule { }
