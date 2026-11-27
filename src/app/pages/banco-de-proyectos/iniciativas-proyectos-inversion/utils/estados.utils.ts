import {
  ESTADO_INICIATIVA_APROBADA,
  ESTADO_INICIATIVA_POR_CORREGIR,
  ESTADO_SUBMODULO_APROBADO,
  ESTADO_SUBMODULO_CON_OBSERVACIONES,
} from './constantes';
import { ResumenIniciativa, ResumenSubmodulo, Veredicto } from './iniciativa.models';
import { submodulosDeResumen } from './formulario.utils';

/** Estado en que queda un submódulo con cada veredicto de la OAP. */
const ESTADO_POR_VEREDICTO: { [veredicto in Veredicto]: string } = {
  aprobado: ESTADO_SUBMODULO_APROBADO,
  con_observaciones: ESTADO_SUBMODULO_CON_OBSERVACIONES,
};

/** Veredicto que ya tiene el submódulo según su estado; null si aún no tiene (Formulado). */
export function veredictoDe(codigoEstado: string): Veredicto | null {
  const veredicto = (Object.keys(ESTADO_POR_VEREDICTO) as Veredicto[]).find((v) => ESTADO_POR_VEREDICTO[v] === codigoEstado);
  return veredicto || null;
}

/**
 * Estado al que pasaría la iniciativa En revisión OAP si el submódulo recibe el veredicto: con todos
 * aprobados, Aprobado; con todos con veredicto y alguno con observaciones, Por corregir; si falta
 * algún veredicto, null. Es la misma regla del mid (EstadoTrasRevision); aquí solo sirve para
 * avisar antes del último veredicto.
 */
export function estadoTrasVeredicto(resumen: ResumenIniciativa, clave: string, veredicto: Veredicto): string | null {
  const estados = submodulosDeResumen(resumen).map((s) =>
    s.clave === clave ? ESTADO_POR_VEREDICTO[veredicto] : s.estado.codigo_abreviacion,
  );
  if (estados.length === 0) {
    return null;
  }
  if (estados.every((estado) => estado === ESTADO_SUBMODULO_APROBADO)) {
    return ESTADO_INICIATIVA_APROBADA;
  }
  if (estados.every((estado) => estado === ESTADO_SUBMODULO_APROBADO || estado === ESTADO_SUBMODULO_CON_OBSERVACIONES)) {
    return ESTADO_INICIATIVA_POR_CORREGIR;
  }
  return null;
}

/** Submódulos con observaciones por atender, en el orden de la iniciativa (traen su última observación). */
export function observacionesPorAtender(resumen: ResumenIniciativa | null): ResumenSubmodulo[] {
  return resumen ? submodulosDeResumen(resumen).filter((s) => s.estado.codigo_abreviacion === ESTADO_SUBMODULO_CON_OBSERVACIONES) : [];
}

/** Submódulos que leen datos del indicado, en el orden de la iniciativa. */
export function dependientesDe(resumen: ResumenIniciativa | null, clave: string): ResumenSubmodulo[] {
  const submodulos = resumen ? submodulosDeResumen(resumen) : [];
  const origen = submodulos.find((s) => s.clave === clave);
  const dependientes = (origen && origen.dependientes) || [];
  return submodulos.filter((s) => dependientes.includes(s.clave));
}

export function estaAprobado(submodulo: ResumenSubmodulo): boolean {
  return submodulo.estado.codigo_abreviacion === ESTADO_SUBMODULO_APROBADO;
}
