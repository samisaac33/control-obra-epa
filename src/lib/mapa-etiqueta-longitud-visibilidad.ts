import type { Map } from "leaflet"

import type { GeoJsonLineString } from "@/src/data/tramos/types"
import { FRACCION_MAX_ANCHO_ETIQUETA_SOBRE_MINITRAMO } from "@/src/lib/mapa-tramos-estilo"

/** Longitud del trazo del segmento proyectada a píxeles del contenedor del mapa. */
export function longitudGeometriaEnPixelesMapa(
  map: Map,
  geometria: GeoJsonLineString
): number {
  const coords = geometria.coordinates
  if (coords.length < 2) return 0

  let total = 0
  for (let i = 1; i < coords.length; i++) {
    const [lng1, lat1] = coords[i - 1]
    const [lng2, lat2] = coords[i]
    const p1 = map.latLngToContainerPoint([lat1, lng1])
    const p2 = map.latLngToContainerPoint([lat2, lng2])
    total += p1.distanceTo(p2)
  }

  return total
}

/** Etiqueta visible si su ancho no supera `fraccionMax` de la longitud del segmento en pantalla. */
export function etiquetaMinitramoCabeEnSegmento(
  anchoEtiquetaPx: number,
  longitudSegmentoPx: number,
  fraccionMax = FRACCION_MAX_ANCHO_ETIQUETA_SOBRE_MINITRAMO
): boolean {
  if (longitudSegmentoPx <= 0 || anchoEtiquetaPx <= 0) return false
  return anchoEtiquetaPx <= fraccionMax * longitudSegmentoPx
}
