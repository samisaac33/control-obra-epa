import { presupuestoData } from "@/data/presupuesto"
import { montoTotalContrato } from "@/data/presupuesto"
import type {
  EntradaLibroObra,
  EntradaMetrado,
  KpiObra,
  ObraSicc,
} from "@/lib/sicc/types"
import { crearId, fechaReferenciaDesdeMetrados } from "@/lib/sicc/ids"
import {
  calcularAvanceFisicoGlobal,
  calcularResumenRubros,
  rubrosConAvance,
} from "@/lib/sicc/metrados"
import { calcularAvanceFinanciero, calcularResumenPresupuesto } from "@/lib/sicc/presupuesto-sicc"

export function calcularKpisObra(
  obra: ObraSicc,
  metrados: EntradaMetrado[],
  libroObra: EntradaLibroObra[]
): KpiObra[] {
  const resumenes = calcularResumenRubros(presupuestoData, metrados)
  const fechaRef = fechaReferenciaDesdeMetrados(
    metrados.map((m) => m.fecha),
    "2026-02-12"
  )
  const resumen = calcularResumenPresupuesto(
    presupuestoData,
    metrados,
    obra.fechaInicio,
    obra.plazoDias,
    fechaRef
  )

  const inicio = new Date(`${obra.fechaInicio}T12:00:00`).getTime()
  const ref = new Date(`${fechaRef}T12:00:00`).getTime()
  const diasTranscurridos = Math.max(0, Math.round((ref - inicio) / (1000 * 60 * 60 * 24)))

  return [
    {
      etiqueta: "Avance físico",
      valor: `${resumen.avanceFisico.toFixed(1)}%`,
      detalle: `${rubrosConAvance(resumenes)} rubros con metrado`,
      tendencia: resumen.desviacionVsProgramado >= 0 ? "positiva" : "negativa",
    },
    {
      etiqueta: "Avance financiero",
      valor: `${resumen.avanceFinanciero.toFixed(1)}%`,
      detalle: "Según metrados acumulados",
      tendencia: "neutral",
    },
    {
      etiqueta: "Días transcurridos",
      valor: String(diasTranscurridos),
      detalle: `Plazo contractual: ${obra.plazoDias} días`,
      tendencia: "neutral",
    },
    {
      etiqueta: "Metrados registrados",
      valor: String(metrados.length),
      detalle: `${libroObra.length} partes en libro de obra`,
      tendencia: "positiva",
    },
  ]
}

export function crearEntradaMetrado(
  datos: Omit<EntradaMetrado, "id">
): EntradaMetrado {
  return { ...datos, id: crearId("met") }
}

export function crearEntradaLibroObra(
  datos: Omit<EntradaLibroObra, "id">
): EntradaLibroObra {
  return { ...datos, id: crearId("lo") }
}

export { montoTotalContrato, calcularResumenRubros, calcularAvanceFisicoGlobal, calcularAvanceFinanciero }
