import { PeriodoSeguimiento } from "../../habilitar-reporte/utils";

export interface Tipo {
	Id?: string;
	CodigoAbreviacion: string;
	Etiqueta: string;
}

export interface Plan {
	_id:                string;
	nombre:             string;
	descripcion:        string;
	tipo_plan_id:       string;
	aplicativo_id:      string;
	activo:             boolean;
	formato:            boolean;
	fecha_creacion:     Date;
	fecha_modificacion: Date;
	__v?:               number;
}

export interface BodyPeticion {
	vigencia_id: 					string;
	tipo_seguimiento_id: 	string;
	codigo_abreviacion_proceso: string;
	activo: 							boolean;
	unidades_interes: 		string;
	planes_interes: 			string;
}

export interface PeriodoSeguimientoTrimestres extends PeriodoSeguimiento {
	trimestre?: string;
}