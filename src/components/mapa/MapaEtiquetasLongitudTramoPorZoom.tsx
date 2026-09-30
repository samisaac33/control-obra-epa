"use client"

import { useEffect, useMemo, useState } from "react"
import L from "leaflet"
import { Marker, useMap, useMapEvents } from "react-leaflet"

import type { CanalTramo } from "@/src/data/tramos/types"
import {
  centroEtiquetaTramo,
  htmlEtiquetaDistanciaMinitramo,
  tamanoIconoDistanciaMinitramo,
} from "@/src/lib/mapa-tramo-etiqueta"
import { ZOOM_MIN_ETIQUETAS_LONGITUD } from "@/src/lib/mapa-tramos-estilo"
import { formatLongitudSegmentoMapa } from "@/src/lib/tramo-geometria"

type MapaEtiquetasLongitudTramoPorZoomProps = {
  tramos: CanalTramo[]
  activo?: boolean
}

export function MapaEtiquetasLongitudTramoPorZoom({
  tramos,
  activo = true,
}: MapaEtiquetasLongitudTramoPorZoomProps) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  })

  useEffect(() => {
    setZoom(map.getZoom())
  }, [map])

  const visiblePorZoom = zoom >= ZOOM_MIN_ETIQUETAS_LONGITUD
  const capaActiva = activo && visiblePorZoom

  const etiquetas = useMemo(() => {
    if (!capaActiva) return []

    const items: {
      id: string
      lat: number
      lng: number
      texto: string
    }[] = []

    for (const tramo of tramos) {
      if (tramo.longitud_m < 1) continue

      const centro = centroEtiquetaTramo(tramo)
      if (!centro) continue

      items.push({
        id: tramo.id,
        lat: centro.lat,
        lng: centro.lng,
        texto: formatLongitudSegmentoMapa(tramo.longitud_m),
      })
    }

    return items
  }, [tramos, capaActiva])

  if (!capaActiva || etiquetas.length === 0) return null

  return (
    <>
      {etiquetas.map((item) => {
        const { width, height } = tamanoIconoDistanciaMinitramo(item.texto)
        return (
          <Marker
            key={`etiqueta-tramo-longitud-${item.id}`}
            position={[item.lat, item.lng]}
            interactive={false}
            zIndexOffset={1080}
            icon={L.divIcon({
              className: "mapa-minitramo-distancia-leaflet",
              html: htmlEtiquetaDistanciaMinitramo(item.texto),
              iconSize: [width, height],
              iconAnchor: [width / 2, height / 2],
            })}
          />
        )
      })}
    </>
  )
}
