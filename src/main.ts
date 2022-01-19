import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const menu = [
  { Nombre: "Inicio", Icono: "home", Url: "pages", Opciones: null },
  {
    Nombre: "Construcción", Icono: "build", Url: null, Opciones: [
      { Nombre: "Listar", Icono: 'view_list', Url: "pages/plan/listar-plan", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Definir", Icono: 'add_circle', Url: "pages/plan/crear-plan", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Construir", Icono: 'input', Url: "pages/plan/construir-plan", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Consultar", Icono: 'search', Url: "pages/plan/consultar-plan", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  {
    Nombre: "Plan de Acción", Icono: "assignment", Url: null, Opciones: [
      { Nombre: "Consulta Planes de Acción", Icono: "search", Url: "pages/plan/consultar-plan", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Formulación Plan de Acción Anual", Icono: "forward", Url: "pages/formulacion", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Seguimiento Plan de Acción Anual", Icono: "find_in_page", Url: "pages/seguimiento/listar-plan-accion-anual", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Seguimiento Plan de Acción Anual temp 2", Icono: "find_in_page", Url: "pages/seguimiento/gestion-seguimiento", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Seguimiento Plan de Acción Anual temp 3", Icono: "find_in_page", Url: "pages/seguimiento/reportar-periodo", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Seguimiento Plan de Acción Anual temp 4", Icono: "find_in_page", Url: "pages/seguimiento/generar-trimestre", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Evaluación Plan de Acción Anual", Icono: "done_all", Url: "pages/evaluacion", TipoOpcion: "Menú", Opciones: null },
    ]
  },
  { Nombre: "Banco de Proyectos", Icono: "account_balance", Url: null, Opciones: [
    { Nombre: "Consulta Proyectos de Inversión Inscritos", Icono: "search", Url: "pages/plan/consultar-plan", TipoOpcion: "Menú", Opciones: null },
    { Nombre: "Formulación Proyecto de Inversión", Icono: "forward", Url: "pages/formulacion", TipoOpcion: "Menú", Opciones: null },
    { Nombre: "Seguimiento Proyectos de Inversión", Icono: "find_in_page", Url: "pages/seguimiento", TipoOpcion: "Menú", Opciones: null },
    { Nombre: "Evaluación Proyectos de Inversión", Icono: "done_all", Url: "pages/evaluacion", TipoOpcion: "Menú", Opciones: null },
  ]},
  { Nombre: "Programación Presupuestal", Icono: "account_balance_wallet", Url: null, Opciones: null },
];

localStorage.setItem('menu', btoa(JSON.stringify(menu)));


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

