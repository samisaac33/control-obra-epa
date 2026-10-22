import type { CanalTramo, GeoJsonLineString } from "@/src/data/tramos/types"
import { codigoEstacionDesdeRango } from "@/src/data/auditoria/types"
import {
  abscisaNaturalDesdeLogica,
  geometriaEntreAbscisas,
} from "@/src/lib/tramo-geometria"

export type SegmentoAbscisaGenerado = {
  tramo_id: string
  sector_nombre: string
  abscisa_inicio: number
  abscisa_fin: number
  codigo_estacion: string
  geom_geojson: GeoJsonLineString | null
}

const PASO_ABSCISA_M = 20

export function generarSegmentosAbscisaDesdeTramo(
  tramo: CanalTramo,
  pasoM = PASO_ABSCISA_M
): SegmentoAbscisaGenerado[] {
  const sector = tramo.canal.trim() || tramo.codigo
  const longitud = tramo.longitud_m
  const segmentos: SegmentoAbscisaGenerado[] = []

  for (let logInicio = 0; logInicio < longitud; logInicio += pasoM) {
    const logFin = Math.min(longitud, logInicio + pasoM)
    const natInicio = abscisaNaturalDesdeLogica(tramo, logInicio)
    const natFin = abscisaNaturalDesdeLogica(tramo, logFin)
    const geom = geometriaEntreAbscisas(tramo.geometria, natInicio, natFin)

    segmentos.push({
      tramo_id: tramo.id,
      sector_nombre: sector,
      abscisa_inicio: logInicio,
      abscisa_fin: logFin,
      codigo_estacion: codigoEstacionDesdeRango(logInicio, logFin),
      geom_geojson: geom,
    })
  }

  return segmentos
}
