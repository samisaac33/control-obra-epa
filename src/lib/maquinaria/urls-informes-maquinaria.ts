import { rutaObra } from "@/src/lib/rutas-proyecto"

/** Descarga del PDF con detalle por semana (desasolve + complementarios; cama baja en anexo). */
export function urlInformeCompletoMaquinariaPdf(proyectoId: string): string {
  return rutaObra(proyectoId, "maquinaria/informe-completo")
}

/** Descarga del PDF de informe consolidado (misma ruta que en emergencia-manabí/maquinaria). */
export function urlInformeConsolidadoMaquinariaPdf(proyectoId: string): string {
  return rutaObra(proyectoId, "maquinaria/informe-consolidado")
}