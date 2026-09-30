"use client"

import { useEffect, useMemo, useState } from "react"
import L from "leaflet"
import { Marker, useMap, useMapEvents } from "react-leaflet"

import {
  htmlEtiquetaDistanciaMinitramo,
  tamanoIconoDistanciaMinitramo,
} from "@/src/lib/mapa-tramo-etiqueta"
import { ZOOM_MIN_ETIQUETAS_MINITRAMO } from "@/src/lib/mapa-tramos-estilo"
import {
  centroSegmentoEnMapa,
  formatLongitudSegmentoMapa,
  type SegmentoVisualTramo,
} from "@/src/lib/tramo-geometria"

type MapaEtiquetasMinitramoPorZoomProps = {
  segmentos: SegmentoVisualTramo[]
  activo?: boolean
}

export function MapaEtiquetasMinitramoPorZoom({
  segmentos,
  activo = true,
}: MapaEtiquetasMinitramoPorZoomProps) {
  const map = useMap()
  const [zoom, setZoom] = useState(() => map.getZoom())

  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  })

  useEffect(() => {
    setZoom(map.getZoom())
  }, [map])

  const visiblePorZoom = zoom >= ZOOM_MIN_ETIQUETAS_MINITRAMO
  const capaActiva = activo && visiblePorZoom

  const etiquetas = useMemo(() => {
    if (!capaActiva) return []

    const items: {
      id: string
      lat: number
      lng: number
      texto: string
    }[] = []

    for (const segmento of segmentos) {
      if (segmento.tipo !== "minitramo") continue
      if (segmento.longitud_m < 1) continue

      const centro = centroSegmentoEnMapa(segmento.geometria)
      if (!centro) continue

      const letraInicio = segmento.letraInicio ?? "?"
      const letraFin = segmento.letraFin ?? "?"
      items.push({
        id: `${segmento.tramo.id}-${letraInicio}-${letraFin}`,
        lat: centro.lat,
        lng: centro.lng,
        texto: formatLongitudSegmentoMapa(segmento.longitud_m),
      })
    }

    return items
  }, [segmentos, capaActiva])

  if (!capaActiva || etiquetas.length === 0) return null

  return (
    <>
      {etiquetas.map((item) => {
        const { width, height } = tamanoIconoDistanciaMinitramo(item.texto)
        return (
          <Marker
            key={`etiqueta-minitramo-${item.id}`}
            position={[item.lat, item.lng]}
            interactive={false}
            zIndexOffset={1100}
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
