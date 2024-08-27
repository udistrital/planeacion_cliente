export interface Planes {
  _id: string
  activo: string
  aplicativo_id: string
  dependencia_id: string
  descripcion: string
  formato: boolean
  nombre: string
  nombre_tipo_plan: string
  tipo_plan_id: string
  vigencia: string
  iconSelected: string
}

export interface Plan {
  _id: string;
  nombre: string;
}