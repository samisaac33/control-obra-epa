import type { CanalTramo, EstadoTramo, GeoJsonLineString } from "@/src/data/tramos/types"
import {
  metrosMinitramosTerminadosTramo,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"

const EARTH_RADIUS_M = 6_371_000

function toRad(deg: number): number {
  return (deg * Math.PI) / 180
}

export function longitudDesdeGeometria(geometria: GeoJsonLineString): number {
  const coords = geometria.coordinates
  if (coords.length < 2) return 0

  let total = 0
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1]
    const [lng2, lat2] = coords[i]
    const dLat = toRad(lat2 - lat1)
    const dLng = toRad(lng2 - lng1)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
    total += 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }
  return total
}

export function sincronizarAvanceDesdePct(longitudM: number, avancePct: number): number {
  const pct = Math.min(100, Math.max(0, avancePct))
  return Math.round(((pct / 100) * longitudM) * 100) / 100
}

export function sincronizarAvanceDesdeMetros(longitudM: number, metrosEjecutados: number): number {
  if (longitudM <= 0) return 0
  const metros = Math.min(longitudM, Math.max(0, metrosEjecutados))
  return Math.round((metros / longitudM) * 10000) / 100
}

export type KpisTramos = {
  kmTotales: number
  kmEjecutados: number
  avanceGlobalPct: number
  totalTramos: number
  tramosPorEstado: Record<EstadoTramo, number>
}

export function calcularKpisTramos(
  tramos: CanalTramo[],
  puntosAvance?: TramoPuntoAvance[]
): KpisTramos {
  let metrosTotales = 0
  let metrosEjecutados = 0
  const tramosPorEstado: Record<EstadoTramo, number> = {
    pendiente: 0,
    programado: 0,
    en_ejecucion: 0,
    terminado: 0,
    suspendido: 0,
  }

  const puntosConfirmados =
    puntosAvance?.filter((p) => p.confirmado) ?? undefined

  for (const tramo of tramos) {
    metrosTotales += tramo.longitud_m
    if (puntosConfirmados) {
      metrosEjecutados += metrosMinitramosTerminadosTramo(tramo, puntosConfirmados)
    } else {
      metrosEjecutados += tramo.metros_ejecutados
    }
    tramosPorEstado[tramo.estado] += 1
  }

  return {
    kmTotales: metrosTotales / 1000,
    kmEjecutados: metrosEjecutados / 1000,
    avanceGlobalPct:
      metrosTotales > 0 ? Math.round((metrosEjecutados / metrosTotales) * 10000) / 100 : 0,
    totalTramos: tramos.length,
    tramosPorEstado,
  }
}

export type AvanceDesasolveTramo = {
  metrosEjecutados: number
  metrosTotales: number
  avancePct: number
  usaAvanceGps: boolean
}

/** Km ejecutados alineados con KPIs del mapa (minitramos GPS terminados si hay puntos). */
export function avanceDesasolveTramo(
  tramo: CanalTramo,
  puntosAvance: TramoPuntoAvance[]
): AvanceDesasolveTramo {
  const usaAvanceGps = puntosAvance.some((p) => p.confirmado && p.tramo_id === tramo.id)
  const metrosEjecutados = usaAvanceGps
    ? metrosMinitramosTerminadosTramo(tramo, puntosAvance)
    : tramo.metros_ejecutados
  const metrosTotales = tramo.longitud_m
  const avancePct = sincronizarAvanceDesdeMetros(metrosTotales, metrosEjecutados)

  return { metrosEjecutados, metrosTotales, avancePct, usaAvanceGps }
}

export function filtrarTramos(
  tramos: CanalTramo[],
  filtros: {
    estado?: EstadoTramo | "todos"
    tramoId?: string | "todos"
    semanaProgramada?: string
  }
): CanalTramo[] {
  return tramos.filter((tramo) => {
    if (filtros.estado && filtros.estado !== "todos" && tramo.estado !== filtros.estado) {
      return false
    }
    if (filtros.tramoId && filtros.tramoId !== "todos" && tramo.id !== filtros.tramoId) {
      return false
    }
    if (
      filtros.semanaProgramada &&
      filtros.semanaProgramada !== "todos" &&
      tramo.semana_programada !== filtros.semanaProgramada
    ) {
      return false
    }
    return true
  })
}

export function compararCodigoTramo(a: string, b: string): number {
  return a.localeCompare(b, "es", { numeric: true, sensitivity: "base" })
}

export function tramosOrdenadosPorCodigo<T extends { codigo: string }>(tramos: readonly T[]): T[] {
  return [...tramos].sort((a, b) => compararCodigoTramo(a.codigo, b.codigo))
}

export function canalesUnicos(tramos: CanalTramo[]): string[] {
  return [...new Set(tramos.map((t) => t.canal))].sort((a, b) => a.localeCompare(b, "es"))
}

export function semanasProgramadasUnicas(tramos: CanalTramo[]): string[] {
  return [...new Set(tramos.map((t) => t.semana_programada).filter(Boolean) as string[])].sort()
}

export function boundsDesdeTramos(tramos: CanalTramo[]): [[number, number], [number, number]] | null {
  if (tramos.length === 0) return null

  let minLat = Infinity
  let minLng = Infinity
  let maxLat = -Infinity
  let maxLng = -Infinity

  for (const tramo of tramos) {
    for (const [lng, lat] of tramo.geometria.coordinates) {
      minLat = Math.min(minLat, lat)
      minLng = Math.min(minLng, lng)
      maxLat = Math.max(maxLat, lat)
      maxLng = Math.max(maxLng, lng)
    }
  }

  return [
    [minLat, minLng],
    [maxLat, maxLng],
  ]
}
