import { PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION } from "@/src/data/contrato-emergencia-severino-trasvase"

/** Avance acumulado contractual vigente al cierre de planilla 1 (cronograma ejecutado compartido). */
export const AVANCE_PLANILLA_1_CRONOGRAMA_EJECUTADO_PCT = PORCENTAJE_AVANCE_PLANILLA_1_EJECUCION

/** Archivo oficial de cronograma ejecutado (Excel compartido por fiscalización). */
export const CRONOGRAMA_EJECUTADO_VIGENTE_PUBLIC_PATH =
  "/documentos/planillas/cronograma-ejecutado-vigente.xlsx"

export const CRONOGRAMA_EJECUTADO_VIGENTE_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

export function nombreArchivoCronogramaEjecutadoVigente(): string {
  return "cronograma-ejecutado-vigente.xlsx"
}
