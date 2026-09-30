"use client"

import { useCallback, useMemo, useState } from "react"
import L from "leaflet"
import { Marker, useMap, useMapEvents } from "react-leaflet"

import {
  htmlEtiquetaDistanciaMinitramo,
  tamanoIconoDistanciaMinitramo,
} from "@/src/lib/mapa-tramo-etiqueta"
import {
  etiquetaMinitramoCabeEnSegmento,
  longitudGeometriaEnPixelesMapa,
} from "@/src/lib/mapa-etiqueta-longitud-visibilidad"
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
  const [mapViewRevision, setMapViewRevision] = useState(0)

  const refrescarVista = useCallback(() => {
    setMapViewRevision((n) => n + 1)
  }, [])

  useMapEvents({
    zoomend: refrescarVista,
    moveend: refrescarVista,
  })

  const etiquetas = useMemo(() => {
    if (!activo) return []

    void mapViewRevision

    const items: {
      id: string
      lat: number
      lng: number
      texto: string
      width: number
      height: number
    }[] = []

    for (const segmento of segmentos) {
      if (segmento.tipo !== "minitramo") continue
      if (segmento.longitud_m < 1) continue

      const texto = formatLongitudSegmentoMapa(segmento.longitud_m)
      const { width, height } = tamanoIconoDistanciaMinitramo(texto)
      const longitudPx = longitudGeometriaEnPixelesMapa(map, segmento.geometria)
      if (!etiquetaMinitramoCabeEnSegmento(width, longitudPx)) continue

      const centro = centroSegmentoEnMapa(segmento.geometria)
      if (!centro) continue

      const letraInicio = segmento.letraInicio ?? "?"
      const letraFin = segmento.letraFin ?? "?"
      items.push({
        id: `${segmento.tramo.id}-${letraInicio}-${letraFin}`,
        lat: centro.lat,
        lng: centro.lng,
        texto,
        width,
        height,
      })
    }

    return items
  }, [segmentos, activo, mapViewRevision, map])

  if (!activo || etiquetas.length === 0) return null

  return (
    <>
      {etiquetas.map((item) => (
        <Marker
          key={`etiqueta-minitramo-${item.id}`}
          position={[item.lat, item.lng]}
          interactive={false}
          zIndexOffset={1100}
          icon={L.divIcon({
            className: "mapa-minitramo-distancia-leaflet",
            html: htmlEtiquetaDistanciaMinitramo(item.texto),
            iconSize: [item.width, item.height],
            iconAnchor: [item.width / 2, item.height / 2],
          })}
        />
      ))}
    </>
  )
}
