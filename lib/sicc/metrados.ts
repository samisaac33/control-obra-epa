import type { Rubro } from "@/data/presupuesto"
import { subtotalRubro } from "@/data/presupuesto"
import type {
  EntradaMetrado,
  EstadoAvanceRubro,
  ResumenRubroMetrado,
} from "@/lib/sicc/types"

export function cantidadEjecutadaRubro(
  rubroId: number,
  entradas: EntradaMetrado[]
): number {
  return entradas
    .filter((e) => e.rubroId === rubroId)
    .reduce((sum, e) => sum + e.cantidad, 0)
}

export function estadoAvance(
  ejecutada: number,
  contratada: number
): EstadoAvanceRubro {
  if (ejecutada <= 0) return "sin_inicio"
  if (ejecutada > contratada) return "sobre_ejecucion"
  if (ejecutada >= contratada) return "completado"
  return "en_ejecucion"
}

export function avancePorcentaje(ejecutada: number, contratada: number): number {
  if (contratada <= 0) return 0
  return Math.min((ejecutada / contratada) * 100, 999)
}

export function calcularResumenRubros(
  rubros: Rubro[],
  entradas: EntradaMetrado[]
): ResumenRubroMetrado[] {
  return rubros.map((rubro) => {
    const cantidadEjecutada = cantidadEjecutadaRubro(rubro.id, entradas)
    const subtotalContratado = subtotalRubro(rubro)
    const subtotalEjecutado = cantidadEjecutada * rubro.precioUnitario

    return {
      rubroId: rubro.id,
      detalle: rubro.detalle,
      categoria: rubro.categoria,
      unidad: rubro.unidad,
      cantidadContratada: rubro.cantidad,
      cantidadEjecutada,
      precioUnitario: rubro.precioUnitario,
      avancePorcentaje: avancePorcentaje(cantidadEjecutada, rubro.cantidad),
      estado: estadoAvance(cantidadEjecutada, rubro.cantidad),
      subtotalContratado,
      subtotalEjecutado,
    }
  })
}

/** Avance físico ponderado por valor contractual de cada rubro. */
export function calcularAvanceFisicoGlobal(resumenes: ResumenRubroMetrado[]): number {
  const totalContratado = resumenes.reduce((sum, r) => sum + r.subtotalContratado, 0)
  if (totalContratado <= 0) return 0

  const valorAvanzado = resumenes.reduce((sum, r) => {
    const ratio = Math.min(r.cantidadEjecutada / r.cantidadContratada, 1)
    return sum + r.subtotalContratado * ratio
  }, 0)

  return (valorAvanzado / totalContratado) * 100
}

export function rubrosConAvance(resumenes: ResumenRubroMetrado[]): number {
  return resumenes.filter((r) => r.estado !== "sin_inicio").length
}

export function rubrosSobreEjecucion(resumenes: ResumenRubroMetrado[]): number {
  return resumenes.filter((r) => r.estado === "sobre_ejecucion").length
}
