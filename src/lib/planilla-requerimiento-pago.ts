import type { Rubro } from "@/data/presupuesto"
import { montoTotalContrato, subtotalRubro } from "@/data/presupuesto"
import type { PlanillaNumero, PlanillaPeriodo } from "@/src/data/planilla/types"
import type { ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { cantidadesPorPeriodoCronogramaVigente } from "@/src/lib/planilla-cronograma-valorado-vigente"

export type LineaRequerimientoPago = {
  rubroId: number
  categoria: string
  detalle: string
  unidad: string
  cantidadContrato: number
  precioUnitario: number
  montoContratoRubro: number
  cantidadAcumuladaAnterior: number
  cantidadPeriodo: number
  cantidadAcumulada: number
  montoPeriodo: number
  montoAcumulado: number
  pctAvanceFisicoRubro: number
}

export type ResumenRequerimientoPago = {
  planillaNumero: PlanillaNumero
  periodo: PlanillaPeriodo
  pctAvanceAcumuladoObjetivo: number
  pctAvancePeriodoAnterior: number
  deltaAvancePeriodo: number
  montoContratoTotal: number
  montoPeriodo: number
  montoAcumulado: number
  montoSaldoContrato: number
  lineas: LineaRequerimientoPago[]
}

export type MedicionRubroGuardada = {
  rubro_id: number
  cantidad_periodo: number
  cantidad_acumulada_anterior: number
}

function pctAcumuladoObjetivo(
  config: ProyectoPlanillaConfig,
  planillaNumero: PlanillaNumero
): number {
  return planillaNumero === 1 ? config.porcentaje_avance_planilla_1 : 100
}

function pctAnteriorAcumulado(
  config: ProyectoPlanillaConfig,
  planillaNumero: PlanillaNumero
): number {
  return planillaNumero === 1 ? 0 : config.porcentaje_avance_planilla_1
}

/**
 * Avance físico lineal por rubro: acumulado = cantidad × % objetivo global;
 * cantidad del periodo = delta entre acumulado objetivo y acumulado anterior.
 */
export function sugerirCantidadesPeriodo(
  rubros: Rubro[],
  config: ProyectoPlanillaConfig,
  planillaNumero: PlanillaNumero
): Map<number, { cantidadPeriodo: number; cantidadAcumuladaAnterior: number }> {
  const map = new Map<number, { cantidadPeriodo: number; cantidadAcumuladaAnterior: number }>()

  const pctParticion = config.porcentaje_avance_planilla_1

  for (const r of rubros) {
    const [cantP1, cantP2] = cantidadesPorPeriodoCronogramaVigente(r, pctParticion)
    const cantidadAcumuladaAnterior = planillaNumero === 1 ? 0 : cantP1
    const cantidadPeriodo = planillaNumero === 1 ? cantP1 : cantP2

    map.set(r.id, {
      cantidadPeriodo,
      cantidadAcumuladaAnterior,
    })
  }

  return map
}

export function calcularRequerimientoPago(
  rubros: Rubro[],
  config: ProyectoPlanillaConfig,
  periodo: PlanillaPeriodo,
  planillaNumero: PlanillaNumero,
  mediciones?: MedicionRubroGuardada[]
): ResumenRequerimientoPago {
  const pctAcum = pctAcumuladoObjetivo(config, planillaNumero)
  const pctAnt = pctAnteriorAcumulado(config, planillaNumero)
  const deltaPct = pctAcum - pctAnt

  const sugeridas = sugerirCantidadesPeriodo(rubros, config, planillaNumero)
  const porRubro = new Map<number, MedicionRubroGuardada>()

  for (const m of mediciones ?? []) {
    porRubro.set(m.rubro_id, m)
  }

  const lineas: LineaRequerimientoPago[] = rubros.map((r) => {
    const guardada = porRubro.get(r.id)
    const sug = sugeridas.get(r.id)
    const cantidadAcumuladaAnterior =
      guardada?.cantidad_acumulada_anterior ?? sug?.cantidadAcumuladaAnterior ?? 0
    const cantidadPeriodo = guardada?.cantidad_periodo ?? sug?.cantidadPeriodo ?? 0
    const cantidadAcumulada = cantidadAcumuladaAnterior + cantidadPeriodo
    const montoContratoRubro = subtotalRubro(r)
    const montoPeriodo = cantidadPeriodo * r.precioUnitario
    const montoAcumulado = cantidadAcumulada * r.precioUnitario
    const pctAvanceFisicoRubro = r.cantidad > 0 ? (cantidadAcumulada / r.cantidad) * 100 : 0

    return {
      rubroId: r.id,
      categoria: r.categoria,
      detalle: r.detalle,
      unidad: r.unidad,
      cantidadContrato: r.cantidad,
      precioUnitario: r.precioUnitario,
      montoContratoRubro,
      cantidadAcumuladaAnterior,
      cantidadPeriodo,
      cantidadAcumulada,
      montoPeriodo,
      montoAcumulado,
      pctAvanceFisicoRubro,
    }
  })

  const montoContratoTotal = montoTotalContrato(rubros)
  const montoPeriodo = lineas.reduce((s, l) => s + l.montoPeriodo, 0)
  const montoAcumulado = lineas.reduce((s, l) => s + l.montoAcumulado, 0)

  return {
    planillaNumero,
    periodo,
    pctAvanceAcumuladoObjetivo: pctAcum,
    pctAvancePeriodoAnterior: pctAnt,
    deltaAvancePeriodo: deltaPct,
    montoContratoTotal,
    montoPeriodo,
    montoAcumulado,
    montoSaldoContrato: montoContratoTotal - montoAcumulado,
    lineas,
  }
}
