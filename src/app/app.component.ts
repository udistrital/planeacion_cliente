import { Component, OnInit } from '@angular/core';
import { environment } from 'src/environments/environment';
import { Router, NavigationEnd } from '@angular/router';
import { UserService } from './pages/services/userService';
import { Notificaciones } from './pages/services/notificaciones';
declare let gtag: Function;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loadRouting = false;
  environment = environment;
  loadingRouter: boolean;
  title = 'configuracion-cliente';

  constructor(
    private router: Router,
    private userService: UserService,
    private notificacionesService: Notificaciones
  ) {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        gtag('config', 'G-RBY2GQV40M', {
          page_path: event.urlAfterRedirects,
        });
      }
    });
  }

  ngOnInit(): void {
    const oas = document.querySelector('ng-uui-oas');
    const notioas = document.querySelector('ng-uui-notioas');

    oas.addEventListener('user', (event: any) => {
      if (event.detail) {
        this.loadRouting = true;
        this.userService.updateUser(event.detail);
      }
    });

    oas.addEventListener('option', (event: any) => {
      if (event.detail) {
        setTimeout(() => this.router.navigate([event.detail.Url]), 50);
      }
    });

    oas.addEventListener('logout', (event: any) => {
      if (event.detail) {
        console.log(event.detail);
      }
    });

    notioas.addEventListener('notificacion', (event: any) => {
      if (event.detail) {
        this.notificacionesService.redirigir(event.detail);
      }
    });
  }
}
