import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

 const menu = [
  { Nombre: "Inicio", Icono: "home", Url: "pages", Opciones: null },
  {
    Nombre: "Construcción", Icono: "wysiwyg", Url: null, Opciones: [
      { Nombre: "Administrar sistema", Icono: null, Url: "pages/plan/habilitar-reporte", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Consultar Planes/Proyectos", Icono: null, Url: "pages/plan/listar-plan", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Construir Plan/Proyecto", Icono: null, Url: "pages/plan/construir-plan-proyecto", TipoOpcion: "Menú", Opciones: null },
    ]
  },
  {
    Nombre: "Proyecto universitario institucional", Icono: "wysiwyg", Url: null, Opciones: [
      { Nombre: "Consultar PUI", Url: "pages/pui", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  {
    Nombre: "Plan estratégico de desarrollo", Icono: "wysiwyg", Url: null, Opciones: [
      { Nombre: "Consultar PED", Url: "pages/ped/ped", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Seguimiento PED", Url: "pages/ped/seguimiento-ped", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Evaluación PED", Url: "pages/ped/evaluacion-ped", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  {
    Nombre: "Plan maestro de espacios educativos", Icono: "wysiwyg", Url: null, Opciones: [
      { Nombre: "Consultar PMEE", Url: "pages/pmee/construccion-pmee", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Seguimiento PMEE", Url: "pages/pmee/seguimiento-pmee", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Evaluación PMEE", Url: "pages/pmee/evaluacion-pmee", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  {
    Nombre: "Plan indicativo", Icono: "wysiwyg", Url: null, Opciones: [
      { Nombre: "Consultar PI", Url: "pages/pi/consultar-pi", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Seguimiento PI", Url: "pages/pi/seguimiento-pi", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Evaluación PI", Url: "pages/pi/evaluacion-pi", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  {
    Nombre: "Plan operativo anual", Icono: "wysiwyg", Url: null, Opciones: [
      { Nombre: "Consultar POA", Url: "pages/poa/consultar-poa", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Evaluación POA", Url: "pages/poa/evaluacion-poa", TipoOpcion: "Menú", Opciones: null }
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
      { Nombre: "Proyectos de inversón MACRO", Icono: "view_list", Url: null, TipoOpcion: "Menú", Opciones: [
          { Nombre: "Consulta Proyectos de Inversión Inscritos", Icono: "search", Url: "pages/proyectos-macro/consultar-proyecto", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Formulación Proyecto de Inversión", Icono: "forward", Url: "pages/proyectos-macro/formular-proyecto", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Seguimiento Proyectos de Inversión", Icono: "find_in_page", Url: "pages/proyectos-macro/seguimiento-proyecto", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Evaluación Proyectos de Inversión", Icono: "done_all", Url: "pages/proyectos-macro/evaluacion-proyecto", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Generación de reportes", Icono: "view_list", Url: "pages/proyectos-macro/reporte-proyecto", TipoOpcion: "Menú", Opciones: null }
      ] },
      { Nombre: "Banco de iniciativas de inversión institucionales", Icono: "view_list", Url: null, TipoOpcion: "Menú", Opciones: [
          { Nombre: "Consulta Proyectos de Inversión Inscritos", Icono: "search", Url: "pages/banco-inicaitivas/consultar-subproyecto", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Formulación SubProyecto de Inversión", Icono: "forward", Url: "pages/banco-inicaitivas/formular-subproyecto", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Seguimiento SubProyectos de Inversión", Icono: "find_in_page", Url: "pages/banco-inicaitivas/seguimiento-subproyecto", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Evaluación SubProyectos de Inversión", Icono: "done_all", Url: "pages/banco-inicaitivas/evaluacion-subproyecto", TipoOpcion: "Menú", Opciones: null },
          { Nombre: "Generación de reportes", Icono: "view_list", Url: "pages/banco-inicaitivas/reporte-subproyecto", TipoOpcion: "Menú", Opciones: null }
      ] },
      { Nombre: "Proyectos otros fondos", Icono: "view_list", Url: "pages/proyecto-otro", TipoOpcion: "Menú", Opciones: null }
    ]
  },
  { Nombre: "Programación Presupuestal", Icono: "account_balance_wallet", Url: null, Opciones: [
    { Nombre: "Apropiación presupuestal inicial", Icono: "library_books", Url: null, Opciones: [
      { Nombre: "Reportes de necesidades de funcionamiento", Icono: null, Url: "pages/apropiacion-presupuestal/reporte-funcionamiento", TipoOpcion: "Menú", Opciones: null },
      { Nombre: "Reportes de necesidades de inversión", Icono: "poll", Url: "pages/apropiacion-presupuestal/reporte-inversion", TipoOpcion: "Menú", Opciones: null }
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

