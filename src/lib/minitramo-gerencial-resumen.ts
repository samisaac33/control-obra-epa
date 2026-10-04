import type { CanalTramo } from "@/src/data/tramos/types"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import type { ItemResumenMinitramo } from "@/src/lib/tramo-geometria"
import { formatLongitudSegmentoMapa } from "@/src/lib/tramo-geometria"

export type MinitramoCompletoResumen = Extract<ItemResumenMinitramo, { tipo: "completo" }>

export function minitramosCompletosOrdenados(
  items: ItemResumenMinitramo[]
): MinitramoCompletoResumen[] {
  return items.filter((item): item is MinitramoCompletoResumen => item.tipo === "completo")
}

export function metrosTerminadosMinitramos(items: MinitramoCompletoResumen[]): number {
  return items.reduce(
    (sum, item) => (item.estado === "terminado" ? sum + item.longitud_m : sum),
    0
  )
}

/** Suma de longitudes GPS en estado terminado hasta incluir `indice` (orden A→B→C). */
export function acumuladoTerminadoHastaIndice(
  items: MinitramoCompletoResumen[],
  indice: number
): number {
  let sum = 0
  for (let i = 0; i <= indice; i++) {
    const item = items[i]
    if (item && item.estado === "terminado") sum += item.longitud_m
  }
  return sum
}

export function pctSobreTramo(longitud_m: number, tramo: Pick<CanalTramo, "longitud_m">): number {
  if (tramo.longitud_m <= 0) return 0
  return (longitud_m / tramo.longitud_m) * 100
}

export function textoAcumuladoTramo(
  acumulado_m: number,
  tramo: Pick<CanalTramo, "longitud_m">
): string {
  const pct = pctSobreTramo(acumulado_m, tramo)
  return `${formatLongitudSegmentoMapa(acumulado_m)} de ${formatLongitudSegmentoMapa(tramo.longitud_m)} (${formatearNumero(pct, 1)} %)`
}
