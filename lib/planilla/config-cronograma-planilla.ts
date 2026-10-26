import { PORCENTAJE_CRONOGRAMA_EJECUTADO_PLANILLA_1 } from "@/src/data/contrato-emergencia-severino-trasvase"
import type { PlanillaNumero, ProyectoPlanillaConfig } from "@/src/data/planilla/types"

/** Config con % de avance para cronograma ejecutado EPA (planilla 1 → 61,33 %). */
export function configCronogramaEjecutadoEpa(
  config: ProyectoPlanillaConfig,
  planillaNumero: PlanillaNumero
): ProyectoPlanillaConfig {
  if (planillaNumero !== 1) return config
  return {
    ...config,
    porcentaje_avance_planilla_1: PORCENTAJE_CRONOGRAMA_EJECUTADO_PLANILLA_1,
  }
}
