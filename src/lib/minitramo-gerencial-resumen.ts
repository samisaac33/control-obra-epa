import type { CanalTramo } from "@/src/data/tramos/types"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import { fechaRegistroAMs } from "@/src/lib/tramo-maquinaria-historial"
import type { ItemResumenMinitramo } from "@/src/lib/tramo-geometria"
import { formatLongitudSegmentoMapa } from "@/src/lib/tramo-geometria"

export type MinitramoCompletoResumen = Extract<ItemResumenMinitramo, { tipo: "completo" }>

export function minitramosCompletosOrdenados(
  items: ItemResumenMinitramo[]
): MinitramoCompletoResumen[] {
  return items.filter((item): item is MinitramoCompletoResumen => item.tipo === "completo")
}

/** Solo minitramos en estado terminado (vista gerencial y acumulados). */
export function minitramosTerminadosGerencial(
  items: MinitramoCompletoResumen[]
): MinitramoCompletoResumen[] {
  return items.filter((item) => item.estado === "terminado")
}

export function metrosTerminadosMinitramos(items: MinitramoCompletoResumen[]): number {
  return items.reduce(
    (sum, item) => (item.estado === "terminado" ? sum + item.longitud_m : sum),
    0
  )
}

export function fechaMsMinitramoGerencial(
  _item: MinitramoCompletoResumen,
  opts?: {
    jornadaFecha?: string | null
    puntoFinCreatedAt?: string | null
  }
): number {
  const desdeJornada = opts?.jornadaFecha ? fechaRegistroAMs(opts.jornadaFecha) : null
  if (desdeJornada != null) return desdeJornada
  const desdeGps = opts?.puntoFinCreatedAt
    ? fechaRegistroAMs(opts.puntoFinCreatedAt.slice(0, 10))
    : null
  if (desdeGps != null) return desdeGps
  return 0
}

/** Vista gerencial: jornada más reciente arriba; empate por abscisa (más avanzado en canal primero). */
export function minitramosTerminadosParaVistaGerencial(
  items: MinitramoCompletoResumen[],
  fechaMsPorPuntoFin: (puntoFinId: string) => number
): MinitramoCompletoResumen[] {
  return [...minitramosTerminadosGerencial(items)].sort((a, b) => {
    const da = fechaMsPorPuntoFin(a.puntoFinId)
    const db = fechaMsPorPuntoFin(b.puntoFinId)
    if (da !== db) return db - da
    return b.abscisaFin - a.abscisaFin
  })
}

/**
 * Acumulado de minitramos terminados en orden cronológico (fecha jornada o confirmación GPS).
 * La lista en pantalla puede ir de más reciente a más antiguo; cada card usa su propio acumulado.
 */
export function mapaAcumuladoTerminadoPorFecha(
  items: MinitramoCompletoResumen[],
  fechaMsPorPuntoFin: (puntoFinId: string) => number
): ReadonlyMap<string, number> {
  const soloTerminados = minitramosTerminadosGerencial(items)
  const sorted = [...soloTerminados].sort((a, b) => {
    const da = fechaMsPorPuntoFin(a.puntoFinId)
    const db = fechaMsPorPuntoFin(b.puntoFinId)
    if (da !== db) return da - db
    return a.abscisaFin - b.abscisaFin
  })
  const map = new Map<string, number>()
  let sum = 0
  for (const item of sorted) {
    sum += item.longitud_m
    map.set(item.puntoFinId, sum)
  }
  return map
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
