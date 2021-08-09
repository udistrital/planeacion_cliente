import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { InformacionBasicaComponent } from './informacion-basica/informacion-basica.component';
import { PagesComponent } from './pages.component';
import { CrearPlanComponent } from './plan/crear-plan/crear-plan.component';
import { ListarPlanComponent } from './plan/listar-plan/listar-plan.component';
import { ConstruirPlanComponent } from './plan/construir-plan/construir-plan.component';
import { ConsultarPlanComponent } from './plan/consultar-plan/consultar-plan.component';
import { EvaluacionComponent } from './evaluacion/evaluacion.component';
import { SeguimientoComponent } from './seguimiento/seguimiento.component';
import { FormulacionComponent } from './formulacion/formulacion.component';

const routes: Routes = [{
  path: '',
  component: PagesComponent,
  children: [
    {
       path: 'dashboard',
       component: DashboardComponent,
     },
    // {
    //   path: 'informacion_basica',
    //   component: InformacionBasicaComponent,
    // },
    // {
    //   path: 'caracterizacion',
    //   component: PreexistenciaComponent,
    // },
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
        }
      ]
    },
    {
      path: 'evaluacion',
      component: EvaluacionComponent,
    },
    {
      path: 'seguimiento',
      component: SeguimientoComponent,
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
export class PagesRoutingModule { }
