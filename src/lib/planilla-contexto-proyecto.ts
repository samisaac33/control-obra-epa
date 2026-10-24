import { getProyecto } from "@/src/data/proyectos/catalog"
import { contextoDocumentalDesasolve } from "@/src/data/desasolve/contexto-obra"
import { OBJETO_CONTRATO, RESOLUCION_EMERGENCIA } from "@/src/data/contrato-emergencia-severino-trasvase"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"

/** Texto de referencia contractual para el análisis integral de planilla. */
export function resumenContractualPlanilla(proyectoId: string): string {
  const proyecto = getProyecto(proyectoId)
  const lineas = [
    `Obra: ${proyecto.nombreObra}`,
    `Contrato / resolución: ${proyecto.numeroContrato}`,
    `Objeto: ${proyecto.objeto}`,
    `Cliente: ${proyecto.cliente}`,
    `Sistema: ${proyecto.sistema}`,
  ]

  if (proyectoId === PROYECTO_DESASOLVE_CANALES) {
    lineas.push(
      "",
      "Referencias documentales (extracto asistente / TDR):",
      contextoDocumentalDesasolve(2_500)
    )
  }

  if (proyecto.numeroContrato.includes("EPA-EPA-2026-00134")) {
    lineas.push("", `Resolución de emergencia: ${RESOLUCION_EMERGENCIA}`, `Objeto blindaje: ${OBJETO_CONTRATO}`)
  }

  return lineas.join("\n")
}
