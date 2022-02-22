import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InformacionBasicaComponent } from './informacion-basica/informacion-basica.component';
import { PagesComponent } from './pages.component';
import { CrearPlanComponent } from './plan/crear-plan/crear-plan.component';
import { ListarPlanComponent } from './plan/listar-plan/listar-plan.component';
import { ConstruirPlanComponent } from './plan/construir-plan/construir-plan.component';
import { ConsultarPlanComponent } from './plan/consultar-plan/consultar-plan.component';
import { ConsolidadoComponent } from './reportes/reporte-consolidado/consolidado.component';
import { PlanAnualComponent } from './reportes/reporte-plan-anual/plan-anual.component';
import { PlanUnidadComponent } from './reportes/reporte-plan-unidad/plan-unidad.component';
import { EvaluacionComponent } from './evaluacion/evaluacion.component';
import { SeguimientoComponentList } from './seguimiento/listar-plan-accion-anual/seguimiento.component';
import { SeguimientoComponentGestion } from './seguimiento/gestion-seguimiento/gestion-seguimiento.component';
import { ReportarPeriodoComponent } from './seguimiento/reportar-periodo/reportar-periodo.component';
import { GenerarTrimestreComponent } from './seguimiento/generar-trimestre/generar-trimestre.component';
import { FormulacionComponent } from './formulacion/formulacion.component';
import { HabilitarReporteComponent } from './plan/habilitar-reporte/habilitar-reporte.component';
import { Evidencias } from './seguimiento/evidencias/evidencias.component';


const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
       path: 'dashboard',
       component: DashboardComponent,
    },
    {
      path: 'informacion_basica',
      component: InformacionBasicaComponent,
    },
    {
      path: 'plan',
      component: PagesComponent,
      children: [
        {
          path: 'crear-plan',
          component: CrearPlanComponent,
        },
        {
          path: 'listar-plan',
          component: ListarPlanComponent,
        },
        {
          path: 'consultar-plan',
          component: ConsultarPlanComponent,
        }, 
        {
          path: 'construir-plan',
          component: ConstruirPlanComponent,
        },
        {
          path: 'habilitar-reporte',
          component: HabilitarReporteComponent,
        }
      ]
    },
    {
      path: 'reportes',
      component: PagesComponent,
      children: [
        {
          path: 'reporte-consolidado',
          component: ConsolidadoComponent,
        },
        {
          path: 'reporte-plan-anual',
          component: PlanAnualComponent,
        },
        {
          path: 'reporte-plan-unidad',
          component: PlanUnidadComponent,
        }
      ]
    },
    {
      path: 'evaluacion',
      component: EvaluacionComponent,
    },
    {
      path: 'seguimiento',
      component: PagesComponent,
      children: [
        {
          path: 'listar-plan-accion-anual',
          component: SeguimientoComponentList,
        },
        {
          path: 'gestion-seguimiento/:plan_id',
          component: SeguimientoComponentGestion,
        },
        {
          path: 'reportar-periodo/:plan_id/:index',
          component: ReportarPeriodoComponent,
        },
        {
          path: 'generar-trimestre/:plan_id/:index/:trimestre_id',
          component: GenerarTrimestreComponent,
        },
        {
          path: 'app-evidencias',
          component: Evidencias,
        },
        
      ]
    },
    {
      path: 'formulacion',
      component: FormulacionComponent,
    },
    {
      path: '', redirectTo: 'dashboard', pathMatch: 'full',
    },
  ]
    
}]


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PagesRoutingModule { 
}
