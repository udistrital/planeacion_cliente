import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SeguimientoComponentGestion } from './pages/seguimiento/gestion-seguimiento/gestion-seguimiento.component';

const routes: Routes = [
  {
    path: 'pages',
    loadChildren: () => import('./pages/pages.module')
      .then(m => m.PagesModule),
  },
  { path: '**', redirectTo: 'pages/dashboard', pathMatch: 'full' }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      routes, {
      // enableTracing: true,
      useHash: true,
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
