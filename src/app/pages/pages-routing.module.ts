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
import { ConstruccionModulComponent } from './construccion-modul/construccion-modul.component';
import { PUIComponent } from './pui/pui.component';
import { PedComponent } from './ped/ped.component';
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
      path: 'construccion-modul',
      component: ConstruccionModulComponent,
    },
    {
      path: 'pui',
      component: PUIComponent,
    },
    {
      path: 'ped',
      component: PagesComponent,
      children:[
        {
          path: 'ped',
          component: PedComponent,
        },
        {
          path: 'seguimiento-ped',
          component: SeguimientoPedComponent,
        },
        {
          path: 'evaluacion-ped',
          component: EvaluacionPedComponent,
        },
      ]
    },
    {
      path: 'pmee',
      component: PagesComponent,
      children:[
        {
          path: 'construccion-pmee',
          component: ConstruccionPmeeComponent,
        },
        {
          path: 'seguimiento-pmee',
          component: SeguimientoPmeeComponent,
        },
        {
          path: 'evaluacion-pmee',
          component: EvaluacionPmeeComponent,
        },
      ]
    },
    {
      path: 'pi',
      component: PagesComponent,
      children:[
        {
          path: 'consultar-pi',
          component: ConsultarPIComponent,
        },
        {
          path: 'seguimiento-pi',
          component: SeguimientoPIComponent,
        },
        {
          path: 'evaluacion-pi',
          component: EvaluacionPIComponent,
        },
      ]
    },
    {
      path: 'poa',
      component: PagesComponent,
      children:[
        {
          path: 'consultar-poa',
          component: ConsultarPOAComponent,
        },
        {
          path: 'evaluacion-poa',
          component: EvaluacionPOAComponent,
        },
      ]
    },
    {
      path: 'proyectos-macro',
      component: PagesComponent,
      children:[
        {
          path: 'consultar-proyecto',
          component: ConsultarProyectoInversionComponent,
        },
        {
          path: 'formular-proyecto',
          component: FormularProyectoInversionComponent,
        },
        {
          path: 'seguimiento-proyecto',
          component: SeguimientoProyectoInversionComponent,
        },
        {
          path: 'evaluacion-proyecto',
          component: EvaluacionProyectoInversionComponent,
        },
        {
          path: 'reporte-proyecto',
          component: ReportesProyectoInversionComponent,
        },
      ]
    },
    {
      path: 'banco-inicaitivas',
      component: PagesComponent,
      children:[
        {
          path: 'consultar-subproyecto',
          component: ConsultarSubProyectoInversionComponent,
        },
        {
          path: 'formular-subproyecto',
          component: FormularSubProyectoInversionComponent,
        },
        {
          path: 'seguimiento-subproyecto',
          component: SeguimientoSubProyectoInversionComponent,
        },
        {
          path: 'evaluacion-subproyecto',
          component: EvaluacionSubProyectoInversionComponent,
        },
        {
          path: 'reporte-subproyecto',
          component: ReportesSubProyectoInversionComponent,
        },
      ]
    },
    {
      path: 'proyecto-otro',
      component: ProyectosOtrosFondosComponent,
    },
    {
      path: 'apropiacion-presupuestal',
      component: PagesComponent,
      children:[
        {
          path: 'reporte-funcionamiento',
          component: ReporteFuncionamientoComponent,
        },
        {
          path: 'reporte-inversion',
          component: ReporteInversionComponent,
        }
      ]
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
