import type { Rubro } from "@/data/presupuesto"
import { montoTotalContrato } from "@/data/presupuesto"
import { formatearFechaCorta } from "@/lib/sicc/format"
import {
  calcularAvanceFisicoGlobal,
  calcularResumenRubros,
} from "@/lib/sicc/metrados"
import type {
  DesviacionRubro,
  EntradaMetrado,
  PuntoCurvaS,
  ResumenPresupuesto,
  ResumenRubroMetrado,
} from "@/lib/sicc/types"

/** Factor demo para presupuesto de ejecución interno (82 % del contractual). */
export const FACTOR_PE_DEMO = 0.82

export function calcularAvanceFinanciero(
  resumenes: ResumenRubroMetrado[],
  montoContrato: number
): number {
  if (montoContrato <= 0) return 0
  const ejecutado = resumenes.reduce((sum, r) => sum + r.subtotalEjecutado, 0)
  return (ejecutado / montoContrato) * 100
}

export function calcularAvanceProgramado(
  fechaReferencia: string,
  fechaInicio: string,
  plazoDias: number
): number {
  const inicio = new Date(`${fechaInicio}T12:00:00`).getTime()
  const ref = new Date(`${fechaReferencia}T12:00:00`).getTime()
  const dias = Math.max(0, Math.round((ref - inicio) / (1000 * 60 * 60 * 24)))
  return Math.min((dias / plazoDias) * 100, 100)
}

export function calcularResumenPresupuesto(
  rubros: Rubro[],
  entradas: EntradaMetrado[],
  fechaInicio: string,
  plazoDias: number,
  fechaReferencia: string
): ResumenPresupuesto {
  const resumenes = calcularResumenRubros(rubros, entradas)
  const montoContrato = montoTotalContrato(rubros)
  const montoEjecutado = resumenes.reduce((sum, r) => sum + r.subtotalEjecutado, 0)
  const presupuestoEjecucion = montoContrato * FACTOR_PE_DEMO
  const avanceFisico = calcularAvanceFisicoGlobal(resumenes)
  const avanceFinanciero = calcularAvanceFinanciero(resumenes, montoContrato)
  const avanceProgramado = calcularAvanceProgramado(
    fechaReferencia,
    fechaInicio,
    plazoDias
  )

  return {
    montoContrato,
    montoEjecutado,
    montoSaldo: montoContrato - montoEjecutado,
    presupuestoEjecucion,
    margenEstimado: montoContrato - presupuestoEjecucion,
    avanceFisico,
    avanceFinanciero,
    avanceProgramado,
    desviacionFisicoFinanciero: avanceFisico - avanceFinanciero,
    desviacionVsProgramado: avanceFisico - avanceProgramado,
  }
}

export function calcularCurvaS(
  rubros: Rubro[],
  entradas: EntradaMetrado[],
  fechaInicio: string,
  plazoDias: number
): PuntoCurvaS[] {
  const montoContrato = montoTotalContrato(rubros)
  const fechas = new Set<string>([fechaInicio, ...entradas.map((e) => e.fecha)])
  const ordenadas = [...fechas].sort()

  return ordenadas.map((fecha) => {
    const entradasHasta = entradas.filter((e) => e.fecha <= fecha)
    const resumenes = calcularResumenRubros(rubros, entradasHasta)

    return {
      fecha,
      etiqueta: formatearFechaCorta(fecha),
      fisico: calcularAvanceFisicoGlobal(resumenes),
      financiero: calcularAvanceFinanciero(resumenes, montoContrato),
      programado: calcularAvanceProgramado(fecha, fechaInicio, plazoDias),
    }
  })
}

export function calcularDesviacionesRubro(
  resumenes: ResumenRubroMetrado[],
  avanceProgramado: number
): DesviacionRubro[] {
  return resumenes
    .map((r) => {
      const esperado = r.subtotalContratado * (avanceProgramado / 100)
      return {
        rubroId: r.rubroId,
        detalle: r.detalle,
        categoria: r.categoria,
        subtotalContratado: r.subtotalContratado,
        subtotalEjecutado: r.subtotalEjecutado,
        avancePorcentaje: r.avancePorcentaje,
        desviacionUsd: r.subtotalEjecutado - esperado,
        estado: r.estado,
      }
    })
    .sort((a, b) => Math.abs(b.desviacionUsd) - Math.abs(a.desviacionUsd))
}

export function rubrosConDesviacionSignificativa(
  desviaciones: DesviacionRubro[],
  umbralUsd = 500
): DesviacionRubro[] {
  return desviaciones.filter(
    (d) => d.subtotalEjecutado > 0 && Math.abs(d.desviacionUsd) >= umbralUsd
  )
}
