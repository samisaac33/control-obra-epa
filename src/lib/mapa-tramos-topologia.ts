import type { CanalTramo } from "@/src/data/tramos/types"
import { distanciaHaversineM, TOLERANCIA_CONTINUACION_M } from "@/src/lib/tramo-geometria"
import { numeroEtiquetaMapa } from "@/src/lib/mapa-tramo-etiqueta"

/** Máxima distancia para dibujar una brecha automática en el mapa. */
export const UMBRAL_BRECHA_AUTO_M = 800

export type ExtremoTramo = {
  tramoId: string
  codigo: string
  numero: string | null
  tipo: "inicio" | "fin"
  lat: number
  lng: number
}

export type BrechaConexion = {
  tramoAId: string
  tramoBId: string
  codigoA: string
  codigoB: string
  numeroA: string | null
  numeroB: string | null
  distancia_m: number
  latA: number
  lngA: number
  latB: number
  lngB: number
  origen: "propuesta" | "auto"
  nota?: string
  prioridad?: "alta" | "media" | "baja"
}

export function numeroTramoDesdeCodigo(codigo: string): string | null {
  return numeroEtiquetaMapa(codigo)
}

export function extremosTramo(tramo: CanalTramo): ExtremoTramo[] {
  const coords = tramo.geometria.coordinates
  if (coords.length < 2) return []

  const numero = numeroTramoDesdeCodigo(tramo.codigo)
  const [lng0, lat0] = coords[0]
  const [lng1, lat1] = coords[coords.length - 1]

  return [
    {
      tramoId: tramo.id,
      codigo: tramo.codigo,
      numero,
      tipo: "inicio",
      lat: lat0,
      lng: lng0,
    },
    {
      tramoId: tramo.id,
      codigo: tramo.codigo,
      numero,
      tipo: "fin",
      lat: lat1,
      lng: lng1,
    },
  ]
}

function menorDistanciaExtremos(a: ExtremoTramo, b: ExtremoTramo): number {
  return distanciaHaversineM(a.lat, a.lng, b.lat, b.lng)
}

export function brechaEntreTramos(tramoA: CanalTramo, tramoB: CanalTramo): BrechaConexion | null {
  if (tramoA.id === tramoB.id) return null

  const extA = extremosTramo(tramoA)
  const extB = extremosTramo(tramoB)
  let mejor: BrechaConexion | null = null

  for (const ea of extA) {
    for (const eb of extB) {
      const d = menorDistanciaExtremos(ea, eb)
      if (d <= TOLERANCIA_CONTINUACION_M) continue

      if (!mejor || d < mejor.distancia_m) {
        mejor = {
          tramoAId: tramoA.id,
          tramoBId: tramoB.id,
          codigoA: tramoA.codigo,
          codigoB: tramoB.codigo,
          numeroA: ea.numero,
          numeroB: eb.numero,
          distancia_m: d,
          latA: ea.lat,
          lngA: ea.lng,
          latB: eb.lat,
          lngB: eb.lng,
          origen: "auto",
        }
      }
    }
  }

  return mejor
}

export type ConexionPropuestaDef = {
  /** Números del KMZ (ej. "3" y "5"), no el UUID. */
  tramoNumeroA: string
  tramoNumeroB: string
  nota: string
  prioridad: "alta" | "media" | "baja"
}

export function resolverBrechasPropuestas(
  tramos: CanalTramo[],
  definiciones: ConexionPropuestaDef[]
): BrechaConexion[] {
  const porNumero = new Map<string, CanalTramo>()
  for (const t of tramos) {
    const n = numeroTramoDesdeCodigo(t.codigo)
    if (n) porNumero.set(n, t)
  }

  const out: BrechaConexion[] = []
  for (const def of definiciones) {
    const a = porNumero.get(def.tramoNumeroA)
    const b = porNumero.get(def.tramoNumeroB)
    if (!a || !b) continue
    const brecha = brechaEntreTramos(a, b)
    if (!brecha) continue
    out.push({
      ...brecha,
      origen: "propuesta",
      nota: def.nota,
      prioridad: def.prioridad,
    })
  }
  return out
}

/** Brechas automáticas: pares con distancia mínima entre extremos en (5 m, umbral]. */
export function detectarBrechasAutomaticas(
  tramos: CanalTramo[],
  umbralM = UMBRAL_BRECHA_AUTO_M
): BrechaConexion[] {
  const candidatas: BrechaConexion[] = []

  for (let i = 0; i < tramos.length; i++) {
    for (let j = i + 1; j < tramos.length; j++) {
      const brecha = brechaEntreTramos(tramos[i], tramos[j])
      if (!brecha || brecha.distancia_m > umbralM) continue
      candidatas.push(brecha)
    }
  }

  candidatas.sort((a, b) => a.distancia_m - b.distancia_m)

  const usados = new Set<string>()
  const seleccionadas: BrechaConexion[] = []
  for (const b of candidatas) {
    const keyA = `${b.tramoAId}:${b.tramoBId}`
    const keyB = `${b.tramoBId}:${b.tramoAId}`
    if (usados.has(keyA) || usados.has(keyB)) continue
    usados.add(keyA)
    seleccionadas.push(b)
  }

  return seleccionadas
}

export function listarBrechasMapa(
  tramos: CanalTramo[],
  propuestas: ConexionPropuestaDef[],
  incluirAuto: boolean
): BrechaConexion[] {
  const prop = resolverBrechasPropuestas(tramos, propuestas)
  if (!incluirAuto) return prop

  const auto = detectarBrechasAutomaticas(tramos)
  const keysProp = new Set(prop.map((p) => `${p.tramoAId}|${p.tramoBId}`))
  const autoFiltradas = auto.filter((a) => !keysProp.has(`${a.tramoAId}|${a.tramoBId}`))
  return [...prop, ...autoFiltradas]
}
