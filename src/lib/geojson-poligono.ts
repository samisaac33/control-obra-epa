import type { GeoJsonPolygon } from "@/src/data/tramos/types"

const METROS_POR_GRADO_LAT = 111_320

function anilloExterior(polygon: GeoJsonPolygon): [number, number][] {
  const ring = polygon.coordinates[0] ?? []
  if (ring.length < 4) return ring
  const first = ring[0]
  const last = ring[ring.length - 1]
  if (first[0] === last[0] && first[1] === last[1]) {
    return ring.slice(0, -1)
  }
  return ring
}

/** Centroide simple (promedio de vértices) — adecuado para polígonos de escombrera locales. */
export function centroidePoligono(polygon: GeoJsonPolygon): { lat: number; lng: number } {
  const ring = anilloExterior(polygon)
  if (ring.length === 0) return { lat: 0, lng: 0 }
  let sumLng = 0
  let sumLat = 0
  for (const [lng, lat] of ring) {
    sumLng += lng
    sumLat += lat
  }
  const n = ring.length
  return { lat: sumLat / n, lng: sumLng / n }
}

/** Área en m² (proyección local en el centroide). */
export function areaPoligonoM2(polygon: GeoJsonPolygon): number {
  const ring = anilloExterior(polygon)
  if (ring.length < 3) return 0
  const { lat: lat0 } = centroidePoligono(polygon)
  const cosLat = Math.cos((lat0 * Math.PI) / 180)
  const mPorGradoLng = METROS_POR_GRADO_LAT * cosLat

  let area = 0
  for (let i = 0; i < ring.length; i++) {
    const [lng1, lat1] = ring[i]!
    const [lng2, lat2] = ring[(i + 1) % ring.length]!
    const x1 = lng1 * mPorGradoLng
    const y1 = lat1 * METROS_POR_GRADO_LAT
    const x2 = lng2 * mPorGradoLng
    const y2 = lat2 * METROS_POR_GRADO_LAT
    area += x1 * y2 - x2 * y1
  }
  return Math.abs(area) / 2
}

export function esGeoJsonPolygon(value: unknown): value is GeoJsonPolygon {
  return (
    typeof value === "object" &&
    value !== null &&
    (value as GeoJsonPolygon).type === "Polygon" &&
    Array.isArray((value as GeoJsonPolygon).coordinates)
  )
}
