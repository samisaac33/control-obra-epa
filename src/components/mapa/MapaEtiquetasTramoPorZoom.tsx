"use client"

import { useEffect, useMemo, useState } from "react"
import L from "leaflet"
import { Marker, useMap, useMapEvents } from "react-leaflet"

import type { CanalTramo } from "@/src/data/tramos/types"
import {
  centroEtiquetaTramo,
  htmlEtiquetaTramoMapa,
  numeroEtiquetaMapa,
  tamanoIconoEtiquetaTramo,
} from "@/src/lib/mapa-tramo-etiqueta"
import { ZOOM_MIN_ETIQUETAS_TRAMO } from "@/src/lib/mapa-tramos-estilo"

type MapaEtiquetasTramoPorZoomProps = {
  tramos: CanalTramo[]
  tramoSeleccionadoId: string | null
}

export function MapaEtiquetasTramoPorZoom({
  tramos,
  tramoSeleccionadoId,
}: MapaEtiquetasTramoPorZoomProps) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  })

  useEffect(() => {
    setZoom(map.getZoom())
  }, [map])

  const mostrar = zoom >= ZOOM_MIN_ETIQUETAS_TRAMO

  const etiquetas = useMemo(() => {
    if (!mostrar) return []

    const items: {
      id: string
      lat: number
      lng: number
      texto: string
      seleccionado: boolean
    }[] = []

    for (const tramo of tramos) {
      const texto = numeroEtiquetaMapa(tramo.codigo)
      const centro = centroEtiquetaTramo(tramo)
      if (!texto || !centro) continue
      items.push({
        id: tramo.id,
        lat: centro.lat,
        lng: centro.lng,
        texto,
        seleccionado: tramo.id === tramoSeleccionadoId,
      })
    }

    return items
  }, [tramos, tramoSeleccionadoId, mostrar])

  if (!mostrar || etiquetas.length === 0) return null

  return (
    <>
      {etiquetas.map((item) => {
        const { size, fontSize } = tamanoIconoEtiquetaTramo(item.texto)
        return (
          <Marker
            key={`etiqueta-tramo-${item.id}`}
            position={[item.lat, item.lng]}
            interactive={false}
            zIndexOffset={item.seleccionado ? 1200 : 1000}
            icon={L.divIcon({
              className: "mapa-tramo-etiqueta-leaflet",
              html: htmlEtiquetaTramoMapa(item.texto, item.seleccionado, fontSize),
              iconSize: [size, size],
              iconAnchor: [size / 2, size / 2],
            })}
          />
        )
      })}
    </>
  )
}
