import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { RequestManager } from '../services/requestManager';
import { ImplicitAutenticationService } from 'src/app/@core/utils/implicit_autentication.service';

@Injectable({
  providedIn: 'root',
})
export class Notificaciones {
  private arm = environment.ARM_AWS_NOTIFICACIONES;

  constructor(
    private router: Router,
    private request: RequestManager,
    private autenticationService: ImplicitAutenticationService
  ) {}

  // Lista de mensajes
  // El prefijo pertenece al modulo (F:Formulacion/S:Seguimiento)
  notificaciones = [
    {
      "id": "",
      "mensaje": "El asistente de [Nombre de la Unidad] ha comenzado la formulación del plan [Nombre del plan] para la vigencia [VIGENCIA]. El plan se encuentra en estado En Formulación.",
      "destinatarios": ["jefe unidad"],
      "codigo": "FA"
    },
    {
      "id": "",
      "mensaje": "El asistente de [Nombre de la Unidad] ha finalizado la formulación del plan [Nombre del plan] de la vigencia [VIGENCIA]. El plan se encuentra en estado Formulado.",
      "destinatarios": ["jefe unidad"],
      "codigo": "FB"
    },
    {
      "id": "",
      "mensaje": "El asistente de planeación ha comenzado la revision del plan [Nombre del plan] en la unidad [Nombre de la Unidad] para la vigencia [VIGENCIA]. El plan se encuentra en estado En Revisión.",
      "destinatarios": ["asistente unidad", "jefe unidad"],
      "codigo": "FC"
    },
    {
      "id": "",
      "mensaje": "El asistente de planeación ha finalizado la revisión; en el proceso de formulación del plan [Nombre del plan] en la unidad [Nombre de la Unidad] para la vigencia [VIGENCIA].",
      "destinatarios": ["asistente unidad", "jefe unidad"],
      "codigo": "FD"
    },
    {
      "id": "",
      "mensaje": "El jefe de [Nombre de la Unidad] ha realizado la Verificación de la formulación para el plan [Nombre del plan] en la vigencia [VIGENCIA]. El plan se encuentra en estado Verificado.",
      "destinatarios": ["asistente unidad", "asistente planeacion", "jefe planeacion"],
      "codigo": "FE"
    },
    {
      "id": "",
      "mensaje": "El Jefe de planeación ha finalizado la revisión; en el proceso de formulación del plan [Nombre del plan] de la unidad [Nombre de la Unidad] en la vigencia [VIGENCIA].",
      "destinatarios": ["asistente unidad", "jefe unidad"],
      "codigo": "FF"
    },
    {
      "id": "",
      "mensaje": "El asistente de [Nombre de la Unidad] ha realizado los ajustes y ha enviado la formulación del plan [Nombre del plan] en la vigencia [VIGENCIA]. El plan se encuentra en estado pre avalado.",
      "destinatarios": ["jefe unidad", "asistente planeacion", "jefe planeacion"],
      "codigo": "FG"
    },
    {
      "id": "",
      "mensaje": "El jefe de planeación ha finalizado la revisión; aceptando la formulación y asignando aval para el plan [Nombre del plan] de la unidad [Nombre de la Unidad] en la vigencia [VIGENCIA]. El plan se encuentra en estado Avalado.",
      "destinatarios": ["asistente unidad", "jefe unidad", "asistente planeacion"],
      "codigo": "FH"
    },
    {
      "id": "",
      "mensaje": "El asistente [Nombre de la Unidad]  ha comenzado el seguimiento del plan [Nombre del plan] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado Habilitado.",
      "destinatarios": ["jefe unidad"],
      "codigo": "SA"
    },
    {
      "id": "",
      "mensaje": "El asistente [Nombre de la Unidad]  ha comenzado el seguimiento del plan [Nombre del plan] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado En reporte.",
      "destinatarios": ["jefe unidad"],
      "codigo": "SB"
    },
    {
      "id": "",
      "mensaje": "El jefe de unidad [Nombre de la Unidad] ha finalizado la revisión del plan [Nombre del plan] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado Enviado a revisión.",
      "destinatarios": ["asistente unidad", "asistente planeacion"],
      "codigo": "SC"
    },
    {
      "id": "",
      "mensaje": "El jefe de [Nombre de la Unidad] ha realizado la verificación del seguimiento para el plan [Nombre del plan] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado en verificacion.",
      "destinatarios": ["asistente unidad", "asistente planeacion", "jefe planeacion"],
      "codigo": "SD"
    },
    {
      "id": "",
      "mensaje": "El asistente de planeación ha finalizado la revisión; aceptando el seguimiento para el plan [Nombre del plan] en la unidad [Nombre de la Unidad] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado Reporte Avalado.",
      "destinatarios": ["asistente unidad", "jefe unidad"],
      "codigo": "SE1"
    },
    {
      "id": "",
      "mensaje": "El jefe de planeación ha finalizado la revisión; devolviendo y asignando observaciones al seguimiento del plan [Nombre del plan] en la unidad [Nombre de la Unidad] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado con observaciones.",
      "destinatarios": ["asistente unidad", "jefe unidad"],
      "codigo": "SE2"
    },
    {
      "id": "",
      "mensaje": "El asistente de [Nombre de la Unidad] ha realizado los ajustes y ha enviado el seguimiento del plan [Nombre del plan] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado En Revisión OAP.",
      "destinatarios": ["jefe unidad", "asistente planeacion", "jefe planeacion"],
      "codigo": "SF"
    },
    {
      "id": "",
      "mensaje": "El  jefe de planeación ha finalizado la revisión; aceptando el seguimiento y asignando aval para el plan [Nombre del plan] en la unidad [Nombre de la Unidad] de la vigencia [VIGENCIA] en el trimestre [TRIMESTRE]. El plan se encuentra en estado Reporte avalado.",
      "destinatarios": ["asistente unidad", "jefe unidad", "asistente planeacion"],
      "codigo": "SG"
    }
  ]

  async enviarNotificacion(datosMensaje: any) {    
    // Obtener notificación de lista (notificaciones) por código de abreviación
    const notificacion = this.notificaciones.find(
      objeto => objeto.codigo === datosMensaje.codigo
    );
    
    let codigosAbreviacion: string[] = [];
    if (notificacion.destinatarios.some(str => str.includes("jefe"))) {
      codigosAbreviacion.push("JO");
    } 
    if (notificacion.destinatarios.some(str => str.includes("asistente"))) {
      codigosAbreviacion.push("AS_D", "NR");
    }
    
    try {
      const cargos:any = await this.getCargos(codigosAbreviacion.join("|"))
      let idsCargos = cargos.Data.map((cargo:any) => cargo.Id).join("|");

      // Añadir dependencia de planeación si aplica
      let dependencias:string = datosMensaje.id_unidad.toString()
      if (notificacion.destinatarios.some(str => str.includes("planeacion"))) {
        dependencias += "|11" // Id dependencia planeacion
      }

      const usuarios:any = await this.getUsuarios(dependencias, idsCargos)
      
      let documentos: string[] = [];
      for (let i = 0; i < usuarios.length; i++) {
        const usuario = usuarios[i];
        if (Object.keys(usuario).length > 0 && usuario.TerceroPrincipalId.Id) {
          const docUsuario:any = await this.getDocUsuario(usuario.TerceroPrincipalId.Id)
          let doc = docUsuario[0]
          if (Object.keys(doc).length > 0 && typeof doc.Numero === "string" && doc.Numero !== "") {
            documentos.push(doc.Numero)
          }
        }
      }

      const body = this.getBodyMensaje(notificacion, datosMensaje, documentos)
      this.publicarNotificacion(body);
    } catch (error) {
      console.error('Error al publicar notificación:', error);
    }
  }

  // Obtener cargos por códigos de abreviación
  async getCargos(codigosAbreviacion: string) {
    return await new Promise((resolve, reject) => {
      this.request.get(environment.PARAMETROS_SERVICE, `parametro?query=CodigoAbreviacion__in:${codigosAbreviacion}`)
        .subscribe(
          (data: any) => resolve(data),
          (error: any) => reject(error)
        );
    });
  }
  
  // Obtener los usuarios filtrados por dependencia y cargo
  async getUsuarios(dependencias: string, idsCargos: string) {
    return await new Promise((resolve, reject) => {
      this.request.get(environment.TERCEROS_SERVICE, `vinculacion?query=DependenciaId__in:${dependencias},CargoId__in:${idsCargos}`)
        .subscribe(
          (data: any) => resolve(data),
          (error: any) => reject(error)
        );
    });
  }

  // Obtener el documento de un usuario
  async getDocUsuario(idTercero: string) {
    return await new Promise((resolve, reject) => {
      this.request.get(environment.TERCEROS_SERVICE, `datos_identificacion?query=TerceroId.Id:${idTercero}`)
        .subscribe(
          (data: any) => resolve(data),
          (error: any) => reject(error)
        );
    });
  }

  // Recrear los id de las colas (destinatarios)
  getIdsColas(rolesRemitentes: string[]) : string[] {
    let idsColas = rolesRemitentes.map(rol => {
      let palabras = rol.split(' ');
      let nombreCola = palabras.map(nombre => nombre.charAt(0).toUpperCase() + nombre.slice(1));
      return "idcola" + nombreCola.join('');
    });
    return idsColas
  }

  // Convertir un objeto JSON en una cadena de texto con formato personalizado
  getTextoDeJson(jsonData:any) {
    return Object.entries(jsonData).map(([key, value]) => `${key}:${value}`).join(",");
  }

  // Convertir la cadena de texto con formato personalizado en un objeto JSON
  getJsonDeTexto(texto:string) {
    const partes = texto.split(',');
    const objeto = {};
    partes.forEach(part => {
      const [key, value] = part.split(':');
      objeto[key] = value;
    });
    return objeto
  }

  // Constuir el body del mensaje(notificación)
  getBodyMensaje(notificacion:any, datosMensaje:any, documentos:string[]) {
    const cod_modulo = datosMensaje.codigo[0]
    const nombre_unidad = datosMensaje.nombre_unidad
    const nombre_plan = datosMensaje.nombre_plan
    const nombre_vigencia = datosMensaje.nombre_vigencia

    //Modificar el mensaje
    let mensaje = notificacion.mensaje;
    const reemplazos = {
      "[Nombre de la Unidad]": nombre_unidad,
      "[Nombre del plan]": nombre_plan,
      "[VIGENCIA]": nombre_vigencia
    };

    if (cod_modulo === "S") {
      reemplazos["[TRIMESTRE]"] = datosMensaje.trimestre;
    }

    for (const [key, value] of Object.entries(reemplazos)) {
      mensaje = mensaje.replace(key, value);
    }

    // Obtener colas (destinatarios)
    const idsColas = this.getIdsColas(notificacion.destinatarios);

    // Obtener el documento del usuario autenticado
    var docUsuarioAuth: any = this.autenticationService.getDocument();

    // Construir data del sistema (información necesaria para planeacion_cliente)
    const jsonSistema = {
      modulo: cod_modulo == "F" ? "formulacion" : "seguimiento",
      nombre_unidad,
      nombre_plan,
      nombre_vigencia,
    }
    if (cod_modulo == "S") {
      jsonSistema["trimestre"] = datosMensaje.trimestre
    }
    const dataSistema = this.getTextoDeJson(jsonSistema)

    // Cuerpo del mensaje
    const bodyMensaje = {
      ArnTopic: this.arm,
      Asunto: "Sin asunto",
      Atributos: {
        UsuariosDestino: documentos,
        EstadoMensaje: "pendiente",
        Data: dataSistema
      },
      DestinatarioId: idsColas,
      IdDeduplicacion: new Date().getTime().toString(),
      IdGrupoMensaje: "",
      Mensaje: mensaje,
      RemitenteId: docUsuarioAuth.__zone_symbol__value || 'pruebasplaneacion',
    };
    return bodyMensaje
  }

  // Publicar notificación
  publicarNotificacion(data: any) {
    return new Promise((resolve, reject) => {
      this.request.post(environment.NOTIFICACION_MID_SERVICE, 'notificaciones/enviar', data)
        .subscribe(
          (data: any) => resolve(data),
          (error: any) => reject(error)
        );
    });
  }

  // Obtener id de la unidad por nombre
  async getIdUnidad(nombre_unidad: string) {
    const unidad:any = await new Promise((resolve, reject) => {
      this.request.get(environment.OIKOS_SERVICE, `dependencia?query=Nombre:${nombre_unidad}`)
        .subscribe(
          (data: any) => resolve(data),
          (error: any) => reject(error)
        );
    });
    return unidad[0].Id
  }

  // Obtener el id de la vigencia por nombre
  async getIdVigencia(nombre_vigencia: string) {
    const vigencia:any = await new Promise((resolve, reject) => {
      this.request.get(environment.PARAMETROS_SERVICE, `periodo?query=CodigoAbreviacion:VG,Nombre:${nombre_vigencia},activo:true`)
        .subscribe(
          (data: any) => resolve(data),
          (error: any) => reject(error)
        );
    });
    return vigencia.Data[0].Id
  }

  // Obtener id del plan por nombre, unidad y vigencia
  async getIdPlan(nombre_plan: string, dependencia_id: string, vigencia_id:string) {
    const plan:any = await new Promise((resolve, reject) => {
      this.request.get(environment.PLANES_CRUD, `plan?query=nombre:${nombre_plan},dependencia_id:${dependencia_id},vigencia:${vigencia_id},activo:true,formato:false`)
        .subscribe(
          (data: any) => resolve(data),
          (error: any) => reject(error)
        );
    });
    return plan.Data[0]._id
  }

  // Regirigir al modulo (página del componente)
  async redirigir(notificacion: any) {
    const atributos = notificacion.Body.MessageAttributes
    const dataSistema:any = this.getJsonDeTexto(atributos.Data.Value)
    
    const modulo = dataSistema.modulo;
    const nombre_plan = dataSistema.nombre_plan
    const id_unidad = await this.getIdUnidad(dataSistema.nombre_unidad)
    const id_vigencia = await this.getIdVigencia(dataSistema.nombre_vigencia)
    
    if (id_vigencia && id_unidad) {
      let url: string;
      if (modulo === "formulacion") {
        url = `${id_unidad}/${nombre_plan}/${id_vigencia}`
      } else if (modulo == "seguimiento") {
        const plan_id = await this.getIdPlan(nombre_plan, id_unidad, id_vigencia)
        url = `gestion-seguimiento/${plan_id}/${dataSistema.trimestre}`
      }
      setTimeout(() => this.router.navigate([`pages/${modulo}/${url}`]), 50);
    }
  }
}
