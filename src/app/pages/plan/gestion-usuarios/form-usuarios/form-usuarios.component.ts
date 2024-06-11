import { Component, Input, OnInit } from '@angular/core';
import { RequestManager } from 'src/app/pages/services/requestManager';
import Swal from 'sweetalert2';
import { Rol, ROL_ASISTENTE_DEPENDENCIA, ROL_JEFE_DEPENDENCIA, ROL_JEFE_DEPENDENCIA_PLANEACION, ROL_PLANEACION, Usuario } from '../utils';

@Component({
  selector: 'app-form-usuarios',
  templateUrl: './form-usuarios.component.html',
  styleUrls: ['./form-usuarios.component.scss']
})
export class FormUsuariosComponent implements OnInit {
  rolesUsuario: Rol[] = [];
  rolesSistema: Rol[] = [
    { rol: ROL_PLANEACION, selected: false },
    { rol: ROL_JEFE_DEPENDENCIA_PLANEACION, selected: false },
    { rol: ROL_JEFE_DEPENDENCIA, selected: false },
    { rol: ROL_ASISTENTE_DEPENDENCIA, selected: false },
  ];
  @Input() usuario: Usuario;

  constructor(
    private request: RequestManager,
  ) { }

  ngOnInit(): void {
    this.rolesUsuario = this.formatearRoles(this.usuario);
    this.rolesUsuario = this.rolesUsuario.filter(usuarioRol => { // Nos aseguramos de mostrar solo los roles de SISGPLAN
      return this.rolesSistema.some(sistemaRol => sistemaRol.rol === usuarioRol.rol);
    })
    this.validarRoles(this.rolesUsuario, this.rolesSistema);
  }

  seleccionarRol(item: any) {
    item.selected = !item.selected;
  }

  vincularRol() {
    const rolesSeleccionados = this.rolesSistema.filter(item => item.selected);
    if(rolesSeleccionados.length === 0) return;
    Swal.fire({
      title: 'Vincular Rol',
      text: `¿Está seguro de vincular el rol al usuario?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let body = {
          "user": this.usuario.email,
          "role": this.rolesSistema.filter(item => item.selected).map(item => item.rol)
        }
        console.log('Vincular Rol/Roles', body);
        // Realizar la peticion y si es exitosa, realizar el cambio en la vista
        rolesSeleccionados.forEach(item => {
          if (!this.rolesUsuario.find(i => i.rol === item.rol)) {
            this.rolesUsuario.push({ ...item });
          }
        });
        this.rolesSistema = this.rolesSistema.filter(item => !item.selected);
        this.clearSelection();
        // Aqui termina el cambio en la vista
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    })
  }

  desvincularRol() {
    const rolesSeleccionados = this.rolesUsuario.filter(item => item.selected);
    if(rolesSeleccionados.length === 0) return;
    Swal.fire({
      title: 'Desvincular Rol',
      text: `¿Está seguro de desvincular el rol al usuario?`,
      showCancelButton: true,
      confirmButtonText: `Si`,
      cancelButtonText: `No`,
      allowOutsideClick: false,
    }).then((result) => {
      if (result.isConfirmed) {
        let body = {
          "user": this.usuario.email,
          "role": this.rolesUsuario.filter(item => item.selected).map(item => item.rol)
        }
        console.log('Desvincular Rol/Roles', body);
        // Realizar la peticion y si es exitosa, realizar el cambio en la vista
        rolesSeleccionados.forEach(item => {
          if (!this.rolesSistema.find(i => i.rol === item.rol)) {
            this.rolesSistema.push({ ...item });
          }
        });
        this.rolesUsuario = this.rolesUsuario.filter(item => !item.selected);
        this.clearSelection();
        // Aqui termina el cambio en la vista
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        Swal.fire({
          title: 'Cambio cancelado',
          icon: 'error',
          showConfirmButton: false,
          timer: 2500
        })
      }
    })
  }

  clearSelection() {
    this.rolesUsuario.forEach(item => item.selected = false);
    this.rolesSistema.forEach(item => item.selected = false);
  }

  formatearRoles(usuario: Usuario) {
    return usuario.role.filter(rol => rol !== 'Internal/everyone' && rol !== 'Internal/selfsignup')
                              .map(rol => ({ "rol": rol, "selected": false }));
  }

  validarRoles(rolesUsuario: Rol[], rolesSistema: Rol[]) {
    // Crea un conjunto de roles del usuario para facilitar la búsqueda
    const rolesSet = new Set(rolesUsuario.map(role => JSON.stringify(role)));

    // Filtra los roles del sistema excluyendo los del usuario
    this.rolesSistema = rolesSistema.filter(role => !rolesSet.has(JSON.stringify(role)));
  }
}
