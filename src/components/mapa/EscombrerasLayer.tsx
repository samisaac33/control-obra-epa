"use client"

import { useMemo } from "react"
import { GeoJSON } from "react-leaflet"
import type { Layer, PathOptions } from "leaflet"

import type { ProyectoBotadero } from "@/src/data/auditoria/types"
import { estiloEscombreraEnMapa } from "@/src/lib/mapa-escombreras-estilo"

type EscombrerasLayerProps = {
  escombreras: ProyectoBotadero[]
  escombreraResaltadaId?: string | null
}

export function EscombrerasLayer({ escombreras, escombreraResaltadaId }: EscombrerasLayerProps) {
  const collection = useMemo(() => {
    const features = escombreras
      .filter((e) => e.geom_geojson && e.geom_geojson.coordinates[0]?.length >= 4)
      .map((e) => ({
        type: "Feature" as const,
        properties: {
          escombreraId: e.id,
          nombre: e.nombre,
          area_m2: e.area_m2,
        },
        geometry: e.geom_geojson!,
      }))
    return { type: "FeatureCollection" as const, features }
  }, [escombreras])

  if (collection.features.length === 0) return null

  return (
    <GeoJSON
      key={`escombreras-${escombreras.length}-${escombreraResaltadaId ?? "none"}`}
      data={collection}
      style={(feature): PathOptions => {
        const id = (feature?.properties as { escombreraId?: string })?.escombreraId
        return estiloEscombreraEnMapa(id === escombreraResaltadaId)
      }}
      onEachFeature={(feature, layer) => {
        const id = (feature.properties as { escombreraId?: string })?.escombreraId
        const escombrera = escombreras.find((e) => e.id === id)
        if (!escombrera) return
        const area =
          escombrera.area_m2 != null && escombrera.area_m2 > 0
            ? ` · ~${Math.round(escombrera.area_m2).toLocaleString("es-EC")} m²`
            : ""
        layer.bindTooltip(`${escombrera.nombre}${area}`, {
          sticky: true,
          className: "mapa-escombrera-tooltip",
        })
        layer.on("mouseover", (e) => {
          const path = e.target as Layer & { setStyle?: (s: PathOptions) => void }
          path.setStyle?.(estiloEscombreraEnMapa(true))
        })
        layer.on("mouseout", (e) => {
          const path = e.target as Layer & { setStyle?: (s: PathOptions) => void }
          path.setStyle?.(estiloEscombreraEnMapa(escombrera.id === escombreraResaltadaId))
        })
      }}
    />
  )
}
