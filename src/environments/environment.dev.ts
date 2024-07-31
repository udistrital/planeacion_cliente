export const environment = {
    production: true,
    entorno: 'test',
    autenticacion: true,
    notificaciones: true,
    menuApps: true,
    appname: 'PLANEACION',
    appMenu: 'PLANEACION',
    SINTOMAS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/sintomas_crud/v1/',
    TERCEROS_SERVICE: 'http://pruebasapi.intranetoas.udistrital.edu.co:8121/v1/',
    //SERVICES PLANEACIÓN
    PLANES_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/planeacion_mid/v1/',
    PLANES_MID_PROXY: 'https://autenticacion.portaloas.udistrital.edu.co/go_api/planeacion_mid/v1/',
    PLANES_CRUD: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/planes_crud/',
    AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/',
    OIKOS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/oikos_crud_api/v2/',
    PARAMETROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/parametros/v1/',
    RESOLUCIONES_DOCENTES_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/resoluciones_docentes_mid/v2/',
    GESTOR_DOCUMENTAL_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/gestor_documental_mid/v1/',
    DOCUMENTO_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/documento_crud/v2/',
    ///
    //PARAMETROS_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/parametros/v1/',
    CONFIGURACION_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/',
    CONF_MENU_SERVICE: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/configuracion_crud_api/v1/menu_opcion_padre/ArbolMenus/',
    ASSETS_SERVICE: "https://assets.portaloas.udistrital.edu.co/",
    
    // Notificaciones
    NOTIFICACION_MID_WS: "wss://pruebasapi.intranetoas.udistrital.edu.co:8527/v1/ws",
    NOTIFICACIONES_CRUD: "https://autenticacion.portaloas.udistrital.edu.co/apioas/notificaciones_crud/",
    
    TOKEN: {
      AUTORIZATION_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oauth2/authorize',
      CLIENTE_ID: 'Wr8pla31bD51cT_IPEis1e_Opt4a',
      RESPONSE_TYPE: 'id_token token',
      SCOPE: 'openid email',
      REDIRECT_URL: 'http://localhost',
      SIGN_OUT_URL: 'https://autenticacion.portaloas.udistrital.edu.co/oidc/logout',
      SIGN_OUT_REDIRECT_URL: 'http://localhost',
      AUTENTICACION_MID: 'https://autenticacion.portaloas.udistrital.edu.co/apioas/autenticacion_mid/v1/token/userRol',
    },
  };
