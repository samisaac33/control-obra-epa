"use client"

import { useMemo } from "react"
import { GeoJSON } from "react-leaflet"
import type { Layer, PathOptions } from "leaflet"

import type { CanalAbscisa } from "@/src/data/auditoria/types"
import { estiloAbscisaEnMapa } from "@/src/lib/mapa-abscisas-estilo"

type CanalAbscisasLayerProps = {
  abscisas: CanalAbscisa[]
  abscisaSeleccionadaId?: string | null
  onAbscisaClick?: (abscisa: CanalAbscisa) => void
}

export function CanalAbscisasLayer({
  abscisas,
  abscisaSeleccionadaId,
  onAbscisaClick,
}: CanalAbscisasLayerProps) {
  const collection = useMemo(() => {
    const features = abscisas
      .filter((a) => a.geom_geojson && a.geom_geojson.coordinates.length >= 2)
      .map((a) => ({
        type: "Feature" as const,
        properties: { abscisaId: a.id, estado: a.estado, codigo: a.codigo_estacion },
        geometry: a.geom_geojson!,
      }))
    return { type: "FeatureCollection" as const, features }
  }, [abscisas])

  if (featuresLength(collection.features) === 0) return null

  return (
    <GeoJSON
      key={`abscisas-${abscisas.length}-${abscisaSeleccionadaId ?? "none"}`}
      data={collection}
      style={(feature): PathOptions => {
        const estado = (feature?.properties as { estado?: CanalAbscisa["estado"] })?.estado ?? "pendiente"
        const id = (feature?.properties as { abscisaId?: string })?.abscisaId
        return estiloAbscisaEnMapa(estado, id === abscisaSeleccionadaId)
      }}
      onEachFeature={(feature, layer) => {
        const id = (feature.properties as { abscisaId?: string })?.abscisaId
        const abscisa = abscisas.find((a) => a.id === id)
        if (!abscisa) return
        const codigo = abscisa.codigo_estacion
        layer.bindTooltip(codigo, { sticky: true, className: "mapa-abscisa-tooltip" })
        layer.on("click", () => onAbscisaClick?.(abscisa))
        layer.on("mouseover", (e) => {
          const path = e.target as Layer & { setStyle?: (s: PathOptions) => void }
          path.setStyle?.(estiloAbscisaEnMapa(abscisa.estado, true))
        })
        layer.on("mouseout", (e) => {
          const path = e.target as Layer & { setStyle?: (s: PathOptions) => void }
          path.setStyle?.(estiloAbscisaEnMapa(abscisa.estado, abscisa.id === abscisaSeleccionadaId))
        })
      }}
    />
  )
}

function featuresLength(features: unknown[]): number {
  return features.length
}
