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
      { Nombre: "Consultar", Icono: 'search', Url: "pages/plan/consultar-plan", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Gestión de Reportes", Icono: 'find_in_page', Url: "pages/plan/habilitar-reporte", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  {
    Nombre: "Proyecto universitario institucional", Icono: "wysiwyg", Url: null, Opciones: [
      { Nombre: "Consultar PUI", Icono: 'view_list', Url: "pages/pui", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  {
    Nombre: "Plan estratégico de desarrollo", Icono: "wysiwyg", Url: null, Opciones: [
      { Nombre: "Consultar PED", Icono: 'view_list', Url: "pages/ped", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Seguimiento PED", Icono: 'view_list', Url: "pages/pui", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Evaluación PED", Icono: 'view_list', Url: "pages/pui", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  {
    Nombre: "Plan maestro de espacios educativos", Icono: "wysiwyg", Url: null, Opciones: [
      { Nombre: "Consultar PMEE", Icono: 'view_list', Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Seguimiento PMEE", Icono: 'view_list', Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Evaluación PMEE", Icono: 'view_list', Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  {
    Nombre: "Plan indicativo", Icono: "wysiwyg", Url: null, Opciones: [
      { Nombre: "Consultar PI", Icono: 'view_list', Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Seguimiento PI", Icono: 'view_list', Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Evaluación PI", Icono: 'view_list', Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  {
    Nombre: "Plan operativo anual", Icono: "wysiwyg", Url: null, Opciones: [
      { Nombre: "Consultar POA", Icono: 'view_list', Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Evaluación POA", Icono: 'view_list', Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  {
    Nombre: "Plan de acción", Icono: "assignment", Url: null, Opciones: [
      { Nombre: "Consulta planes de acción", Icono: "view_list", Url: "pages/plan/consultar-plan", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Planes de acción activos", Icono: "view_list", Url: "pages/plan/consultar-plan", TipoOpcion: "Menú", Opciones: [
        { Nombre: "Formulación Plan de Acción Anual", Icono: "forward", Url: "pages/formulacion", TipoOpcion: "Menú", Opciones: null },
        { Nombre: "Seguimiento Plan de Acción Anual", Icono: "find_in_page", Url: "pages/seguimiento/listar-plan-accion-anual", TipoOpcion: "Menú", Opciones: null },
        { Nombre: "Evaluación Plan de Acción Anual", Icono: "done_all", Url: "pages/evaluacion", TipoOpcion: "Menú", Opciones: null }
      ] },
      { Nombre: "Generación de reportes", Icono: "view_list", Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  { 
    Nombre: "Banco de Proyectos", Icono: "account_balance", Url: null, Opciones: [
      { Nombre: "Proyectos de inversón MACRO", Icono: "view_list", Url: "pages/plan/consultar-plan", TipoOpcion: "Menú", Opciones: [
          { Nombre: "Consulta Proyectos de Inversión Inscritos", Icono: "search", Url: "pages/plan/consultar-plan", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Formulación Proyecto de Inversión", Icono: "forward", Url: "pages/formulacion", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Seguimiento Proyectos de Inversión", Icono: "find_in_page", Url: "pages/seguimiento", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Evaluación Proyectos de Inversión", Icono: "done_all", Url: "pages/evaluacion", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Generación de reportes", Icono: "view_list", Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null }
      ] },
      { Nombre: "Banco de iniciativas de inversión institucionales", Icono: "view_list", Url: "pages/plan/consultar-plan", TipoOpcion: "Menú", Opciones: [
          { Nombre: "Consulta Proyectos de Inversión Inscritos", Icono: "search", Url: "pages/plan/consultar-plan", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Formulación SubProyecto de Inversión", Icono: "forward", Url: "pages/formulacion", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Seguimiento SubProyectos de Inversión", Icono: "find_in_page", Url: "pages/seguimiento", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Evaluación SubProyectos de Inversión", Icono: "done_all", Url: "pages/evaluacion", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Generación de reportes", Icono: "view_list", Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null }
      ] },
      { Nombre: "Proyectos otros fondos", Icono: "view_list", Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  { Nombre: "Programación Presupuestal", Icono: "account_balance_wallet", Url: null, Opciones: [
    { Nombre: "Apropiación presupuestal inicial", Icono: "library_books", Url: null, Opciones: [
      { Nombre: "Reportes de necesidades de funcionamiento", Icono: "poll", Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Reportes de necesidades de inversión", Icono: "poll", Url: "pages/construccion-modul", TipoOpcion: "Menú", Opciones: null }
    ]}
  ] },
  // { Nombre: "Reportes", Icono: "library_books", Url: null, Opciones: [
  //   { Nombre: "Reporte plan de acción por unidad", Icono: "poll", Url: "pages/reportes/reporte-plan-unidad", TipoOpcion: "Menú", Opciones: null },
  //   { Nombre: "Reporte plan de acción anual", Icono: "poll", Url: "pages/reportes/reporte-plan-anual", TipoOpcion: "Menú", Opciones: null },
  //   { Nombre: "Reporte consolidado presupuestal", Icono: "poll", Url: "pages/reportes/reporte-consolidado", TipoOpcion: "Menú", Opciones: null },
  // ]},
];

 localStorage.setItem('menu', btoa(JSON.stringify(menu)));


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

