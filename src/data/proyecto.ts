import { getProyecto, PROYECTO_EMERGENCIA_MANABI } from "@/src/data/proyectos/catalog"

/** @deprecated Usar useProyecto() o getProyecto() según el contexto. */
export const PROYECTO = getProyecto(PROYECTO_EMERGENCIA_MANABI)

export const RESUMEN_CONTRATO = {
  nombreObra: PROYECTO.nombreObra,
  numeroContrato: PROYECTO.numeroContrato,
  cliente: PROYECTO.cliente,
} as const
