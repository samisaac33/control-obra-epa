import { rutaObra } from "@/src/lib/rutas-proyecto"

/** Abre maquinaria y lanza el diálogo de impresión del informe operativo completo (vista imprimible). */
export function urlInformeCompletoMaquinaria(proyectoId: string): string {
  return `${rutaObra(proyectoId, "maquinaria")}?informe=completo`
}

/** Descarga del PDF de informe consolidado (misma ruta que en emergencia-manabí/maquinaria). */
export function urlInformeConsolidadoMaquinariaPdf(proyectoId: string): string {
  return rutaObra(proyectoId, "maquinaria/informe-consolidado")
}