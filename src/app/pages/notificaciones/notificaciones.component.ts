import { Component, OnInit } from '@angular/core';
import { RequestManager } from '../services/requestManager';
import { NotificacionesService } from "./notificaciones.service";

@Component({ 
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss']
})
export class NotificacionesComponent implements OnInit {
 
  constructor(
    private request: RequestManager,
    private notificacionesService: NotificacionesService
  ) { }

  ngOnInit(): void {
    
  }

  function(notificacionRequest, $this, behaviorTheme, token_service, $location) {
    var self = this;
    $this.roles = token_service.getAppPayload().role;
    $this.notificacion = notificacionRequest;
    $this.notificacion.existeNotificaciones = false;

    function traerNoticicaciones() {
      if ($this.roles != null && $this.roles.includes('SUPERVISOR')) {
        notificacionRequest.traerNotificacion('ColaSupervisor').then(function (response) {
          //console.log(response)
          if (response.data.Data != null) {
            $this.existenNotificaciones = true;
            $this.notificacion.existeNotificaciones = true;
            $this.url_redirect = response.data.Data[0].Body.Message;
          } else {
            $this.existenNotificaciones = false;
          }
        }).catch(
          function (error) {
            //console.log(error)
          }
        );
      } else {
        //console.log("no tiene el rol")
      }

      if ($this.roles != null && $this.roles.includes('ORDENADOR_DEL_GASTO')) {
        notificacionRequest.traerNotificacion('ColaOrdenador').then(function (response) {
          //console.log(response)
          if (response.data.Data != null) {
            $this.existenNotificaciones = true;
            $this.notificacion.existeNotificaciones = true;
            $this.url_redirect = response.data.Data[0].Body.Message;
          } else {
            $this.existenNotificaciones = false;
          }
        }).catch(
          function (error) {
            //console.log(error)
          }
        );
      } else {
        //console.log("no tiene el rol")
      }
    }

    $this.claseContainer = behaviorTheme.notificacion;
    $this.redirect_url = function () {
      $location.path($this.url_redirect);
      behaviorTheme.toogleNotificacion();
      traerNoticicaciones()
    };

    traerNoticicaciones()

  }
}
