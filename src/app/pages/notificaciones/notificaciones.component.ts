import { Component, OnInit } from '@angular/core';
import { NotificacionesService } from './notificaciones.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-notificaciones',
  templateUrl: './notificaciones.component.html',
  styleUrls: ['./notificaciones.component.scss'],
})
export class NotificacionesComponent implements OnInit {
  formularioRegistro: FormGroup;
  formularioBorrar: FormGroup;
  formularioConsulta: FormGroup;

  constructor(
    private notificacionRequest: NotificacionesService,
    private formBuilder: FormBuilder
  ) {
    this.formularioRegistro = this.formBuilder.group({
      asunto: ['', Validators.required],
      destinatario: ['', [Validators.required]],
      mensaje: ['', [Validators.required]],
    });

    this.formularioBorrar = this.formBuilder.group({
      nameCola: ['', Validators.required],
      idNotificacion: ['', Validators.required],
    });

    this.formularioConsulta = this.formBuilder.group({
      nombreCola: ['', Validators.required],
    });
  }

  ngOnInit(): void {}

  onSubmitformularioRegistro() {
    if (this.formularioRegistro.valid) {
      console.log(
        this.notificacionRequest.enviarNotificacion(
          "idcola",
          this.formularioRegistro.value.asunto,
          this.formularioRegistro.value.mensaje,
          this.formularioRegistro.value.destinatario
        )
      );
    } else {
    }
  }

  onSubmitformularioBorrar() {
    if (this.formularioBorrar.valid) {
      console.log(
        this.notificacionRequest.borrarNotificacion(
          this.formularioBorrar.value.nameCola + '.fifo',
          this.formularioBorrar.value.idNotificacion
        )
      );
    } else {
    }
  }

  onSubmitformularioConsulta() {
    if (this.formularioConsulta.valid) {
      this.notificacionRequest.consultarNotificaciones(
        this.formularioConsulta.value.nombreCola + '.fifo'
      ).then((resultado) => {
        console.log(resultado);
        // Aquí puedes realizar cualquier otra operación con el resultado si es necesario
      }).catch((error) => {
        console.error('Error al consultar notificaciones:', error);
      });
    } else {
      // Manejo de formulario no válido si es necesario
    }
  }
}
