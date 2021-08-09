import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

const menu = [
  { Nombre: "Inicio", Icono: "home", Url: "pages", Opciones: null },
  { Nombre: "Construcción", Icono: "build", Url: null, Opciones: [
    { Nombre: "Listar", Icono: 'view_list', Url: "pages/plan/listar-plan", TipoOpcion: "Menú", Opciones: null },
    { Nombre: "Definir", Icono: 'add_circle', Url: "pages/plan/crear-plan", TipoOpcion: "Menú", Opciones: null },
    { Nombre: "Construir", Icono: 'input', Url: "pages/plan/construir-plan", TipoOpcion: "Menú", Opciones: null },
    { Nombre: "Consultar", Icono: 'search', Url: "pages/plan/consultar-plan", TipoOpcion: "Menú", Opciones: null }
    ]},
  { Nombre: "Formulación", Icono: "forward", Url: "pages/formulacion", Opciones: null },
  { Nombre: "Evaluación", Icono: "done_all", Url: "pages/evaluacion", Opciones: null },
  { Nombre: "Seguimiento", Icono: "find_in_page", Url: "pages/seguimiento", Opciones: null },  
]; 

localStorage.setItem('menu', btoa(JSON.stringify(menu)));


if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));

