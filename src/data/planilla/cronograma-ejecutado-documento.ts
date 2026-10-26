import { PORCENTAJE_CRONOGRAMA_EJECUTADO_PLANILLA_1 } from "@/src/data/contrato-emergencia-severino-trasvase"

/** Avance EPA del cronograma ejecutado generado (planilla 1). */
export const AVANCE_PLANILLA_1_CRONOGRAMA_EJECUTADO_PCT =
  PORCENTAJE_CRONOGRAMA_EJECUTADO_PLANILLA_1

export function nombreArchivoCronogramaEjecutadoEpaPdf(planillaNumero: number): string {
  return `cronograma-ejecutado-epa-planilla-${planillaNumero}.pdf`
}
