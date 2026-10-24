import { PLAZO_CALENDARIO_DIAS } from "@/src/data/contrato-emergencia-severino-trasvase"
import type {
  PlanillaAnalisisIntegral,
  PlanillaPeriodo,
  ProyectoPlanillaConfig,
} from "@/src/data/planilla/types"

function addDaysIso(fechaIso: string, dias: number): string {
  const d = new Date(`${fechaIso}T12:00:00`)
  d.setDate(d.getDate() + dias)
  return d.toISOString().slice(0, 10)
}

function diffDaysInclusive(inicio: string, fin: string): number {
  const a = new Date(`${inicio}T12:00:00`).getTime()
  const b = new Date(`${fin}T12:00:00`).getTime()
  return Math.max(1, Math.round((b - a) / 86_400_000) + 1)
}

export function calcularPeriodosPlanilla(
  config: Pick<
    ProyectoPlanillaConfig,
    "fecha_inicio_plazo" | "plazo_dias" | "dias_por_planilla" | "porcentaje_avance_planilla_1"
  >
): PlanillaPeriodo[] {
  const plazo = config.plazo_dias || PLAZO_CALENDARIO_DIAS
  const diasPlanilla = config.dias_por_planilla || 30
  const inicio = config.fecha_inicio_plazo

  const finPlanilla1 = addDaysIso(inicio, diasPlanilla - 1)
  const inicioPlanilla2 = addDaysIso(finPlanilla1, 1)
  const finPlazo = addDaysIso(inicio, plazo - 1)

  const periodo1: PlanillaPeriodo = {
    numero: 1,
    etiqueta: "Planilla 1 (primer periodo)",
    fecha_inicio: inicio,
    fecha_fin: finPlanilla1,
    porcentaje_avance_objetivo: config.porcentaje_avance_planilla_1,
    dias_calendario: diffDaysInclusive(inicio, finPlanilla1),
  }

  const periodo2: PlanillaPeriodo = {
    numero: 2,
    etiqueta: "Planilla 2 (cierre contractual)",
    fecha_inicio: inicioPlanilla2,
    fecha_fin: finPlazo,
    porcentaje_avance_objetivo: 100,
    dias_calendario: diffDaysInclusive(inicioPlanilla2, finPlazo),
  }

  return [periodo1, periodo2]
}

export function analisisIntegralPlanilla(
  config: ProyectoPlanillaConfig,
  resumenContractual: string
): PlanillaAnalisisIntegral {
  const periodos = calcularPeriodosPlanilla(config)
  const finPlazo = addDaysIso(config.fecha_inicio_plazo, config.plazo_dias - 1)

  return {
    fecha_inicio_plazo: config.fecha_inicio_plazo,
    fecha_fin_plazo: finPlazo,
    plazo_dias: config.plazo_dias,
    cantidad_planillas: periodos.length,
    periodos,
    resumen_contractual: resumenContractual,
  }
}

export function periodoPorNumero(
  config: ProyectoPlanillaConfig,
  numero: 1 | 2
): PlanillaPeriodo | null {
  return calcularPeriodosPlanilla(config).find((p) => p.numero === numero) ?? null
}
