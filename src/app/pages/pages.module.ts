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
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS,} from '@angular/material-moment-adapter';
import { MatNativeDateModule, DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { OasGridColsDirective } from './directives/oas-grid-cols.directive';
import {MatDialogModule} from '@angular/material/dialog';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatSortModule} from '@angular/material/sort';

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
import { ArbolComponent } from './plan/arbol/arbol.component';
import { AgregarDialogComponent } from './plan/construir-plan/agregar-dialog/agregar-dialog.component';
import { EditarDialogComponent } from './plan/construir-plan/editar-dialog/editar-dialog.component';
import { FormulacionComponent } from './formulacion/formulacion.component';
import { ContratistasComponent } from './formulacion/contratistas/contratistas.component';
import { RecursosComponent } from './formulacion/recursos/recursos.component';
import { DocentesComponent } from './formulacion/docentes/docentes.component';
import { NgIsGrantedDirective } from './directives/ng-is-granted.directive';



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
  FormulacionComponent,
  AgregarDialogComponent,
  EditarDialogComponent,
  ArbolComponent
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
  MatRadioModule,
];
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
    ArbolComponent,
    AgregarDialogComponent,
    EditarDialogComponent,
    FormulacionComponent,
    ContratistasComponent,
    RecursosComponent,
    DocentesComponent,
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
    ...materialModules
  ],
  providers: [
    RequestManager,
    MatDatepickerModule,
    { provide: MAT_DATE_LOCALE, useValue: 'es-CO' },
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS}
  ]
})
export class PagesModule { }
