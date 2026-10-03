import type { CanalTramo } from "@/src/data/tramos/types"
import { numeroTramoDesdeCodigo } from "@/src/lib/mapa-tramo-etiqueta"

/** Tramos ocultos en la vista general del mapa/KPIs (proyecto desasolve-canales). Siguen en BD y en «Primer levantamiento» (1–24). */
export const NUMEROS_TRAMO_EXCLUIDOS_DESASOLVE = [4, 21] as const

export function esTramoExcluidoDesasolve(codigo: string): boolean {
  const n = numeroTramoDesdeCodigo(codigo)
  if (n === null) return false
  return (NUMEROS_TRAMO_EXCLUIDOS_DESASOLVE as readonly number[]).includes(n)
}

export function tramosMapaDesasolveSinExcluidos(tramos: CanalTramo[]): CanalTramo[] {
  return tramos.filter((t) => !esTramoExcluidoDesasolve(t.codigo))
}
