"use client"

import { useEffect, useMemo } from "react"
import { CircleMarker, GeoJSON, MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import type { Layer, PathOptions } from "leaflet"
import L from "leaflet"

import type { CanalTramo, EstadoTramo } from "@/src/data/tramos/types"
import { etiquetaEstadoTramo } from "@/src/data/tramos/types"
import {
  htmlTooltipVisitanteSegmento,
  segmentosVisualesTramo,
  type SegmentoVisualTramo,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"
import { boundsDesdeTramos } from "@/src/lib/tramos-avance"
import {
  ALTURA_MAPA_TRAMOS,
  ALTURA_MAPA_VISITANTE_MOVIL,
  estiloContornoOscuroTramo,
  estiloHaloBlancoTramo,
  estiloSegmentoTramoEnMapa,
  MAX_ZOOM_MAPA_TRAMOS,
  pesoTramoEnMapa,
} from "@/src/lib/mapa-tramos-estilo"

import "leaflet/dist/leaflet.css"

type MapaTramosLeafletProps = {
  tramos: CanalTramo[]
  tramoSeleccionadoId: string | null
  puntosAvance?: TramoPuntoAvance[]
  isResident: boolean
  esViewportMovil: boolean
  modoMapaVisitanteMovil?: boolean
  marcadoresCompactos?: boolean
  alturaMapa?: string
  onTramoClick: (tramo: CanalTramo) => void
  onSegmentoVisitanteClick?: (segmento: SegmentoVisualTramo) => void
}

type FeatureProps = {
  tramo: CanalTramo
  id: string
  segmento: SegmentoVisualTramo
  tipo?: "minitramo" | "pendiente" | "ejecutado"
  estadoSegmento?: EstadoTramo
}

function AjustarBounds({ tramos }: { tramos: CanalTramo[] }) {
  const map = useMap()

  useEffect(() => {
    const bounds = boundsDesdeTramos(tramos)
    if (!bounds) return
    map.fitBounds(bounds, { padding: [24, 24], maxZoom: MAX_ZOOM_MAPA_TRAMOS })
  }, [map, tramos])

  return null
}

function registrarInteraccionTramo(
  layer: Layer,
  segmento: SegmentoVisualTramo,
  tramoSeleccionadoId: string | null,
  isResident: boolean,
  esViewportMovil: boolean,
  onTramoClick: (tramo: CanalTramo) => void,
  onSegmentoVisitanteClick?: (segmento: SegmentoVisualTramo) => void
) {
  const { tramo, tipo, estadoSegmento } = segmento

  if (isResident) {
    layer.bindTooltip(`${tramo.codigo} · ${etiquetaEstadoTramo(tramo.estado)} · ${tramo.canal}`, {
      sticky: true,
      direction: "top",
    })
  } else if (!esViewportMovil) {
    layer.bindTooltip(htmlTooltipVisitanteSegmento(segmento), {
      sticky: true,
      direction: "auto",
      className: "mapa-segmento-tooltip",
    })
  }

  layer.on({
    click: () => {
      if (!isResident && onSegmentoVisitanteClick) {
        onSegmentoVisitanteClick(segmento)
        return
      }
      onTramoClick(tramo)
    },
    mouseover: (event) => {
      const target = event.target as L.Path
      target.setStyle({
        weight: pesoTramoEnMapa(tramo.id === tramoSeleccionadoId, true),
        opacity: 1,
      })
    },
    mouseout: (event) => {
      const seleccionado = tramo.id === tramoSeleccionadoId
      const target = event.target as L.Path
      target.setStyle(
        estiloSegmentoTramoEnMapa(tramo, tipo ?? "pendiente", seleccionado, false, estadoSegmento)
      )
    },
  })
}

function featureCollectionDesdeTramos(tramos: CanalTramo[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: tramos.map((tramo) => ({
      type: "Feature",
      properties: { tramo, id: tramo.id } satisfies Partial<FeatureProps>,
      geometry: tramo.geometria,
    })),
  }
}

function featureCollectionDesdeSegmentos(
  segmentos: SegmentoVisualTramo[]
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: segmentos.map((segmento) => ({
      type: "Feature",
      properties: {
        tramo: segmento.tramo,
        id: segmento.tramo.id,
        segmento,
        tipo: segmento.tipo,
        estadoSegmento: segmento.estadoSegmento,
      } satisfies FeatureProps,
      geometry: segmento.geometria,
    })),
  }
}

export function MapaTramosLeaflet({
  tramos,
  tramoSeleccionadoId,
  puntosAvance = [],
  isResident,
  esViewportMovil,
  modoMapaVisitanteMovil = false,
  marcadoresCompactos = false,
  alturaMapa,
  onTramoClick,
  onSegmentoVisitanteClick,
}: MapaTramosLeafletProps) {
  const altura = alturaMapa ?? (modoMapaVisitanteMovil ? ALTURA_MAPA_VISITANTE_MOVIL : ALTURA_MAPA_TRAMOS)
  const iconSize = marcadoresCompactos ? 16 : 20
  const fontSize = marcadoresCompactos ? 9 : 10
  const featureCollectionCompleta = useMemo(
    () => featureCollectionDesdeTramos(tramos),
    [tramos]
  )

  const segmentosColoreados = useMemo(
    () => tramos.flatMap((tramo) => segmentosVisualesTramo(tramo, puntosAvance)),
    [tramos, puntosAvance]
  )

  const featureCollectionColoreada = useMemo(
    () => featureCollectionDesdeSegmentos(segmentosColoreados),
    [segmentosColoreados]
  )

  const centroInicial = useMemo((): [number, number] => {
    const bounds = boundsDesdeTramos(tramos)
    if (!bounds) return [-1.054, -80.454]
    const [[minLat, minLng], [maxLat, maxLng]] = bounds
    return [(minLat + maxLat) / 2, (minLng + maxLng) / 2]
  }, [tramos])

  if (tramos.length === 0) {
    return (
      <div
        className="flex items-center justify-center rounded-xl border border-dashed border-foreground/15 bg-muted/20 text-sm text-muted-foreground"
        style={{ height: altura }}
      >
        No hay tramos cargados. Importe el KMZ con{" "}
        <code className="mx-1 rounded bg-muted px-1">npm run import:kmz</code>.
      </div>
    )
  }

  const layerKey = `${isResident ? "r" : "v"}-${esViewportMovil ? "m" : "d"}-${tramoSeleccionadoId ?? "none"}-${tramos
    .map((t) => `${t.id}:${t.metros_ejecutados}:${t.estado}`)
    .join("|")}-${puntosAvance.map((p) => `${p.id}:${p.estado_minitramo ?? ""}`).join(",")}`

  return (
    <div className="overflow-hidden rounded-xl border border-foreground/10 ring-1 ring-foreground/5">
      <MapContainer
        center={centroInicial}
        zoom={12}
        scrollWheelZoom
        className="w-full z-0"
        style={{ height: altura }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AjustarBounds tramos={tramos} />
        <GeoJSON
          key={`contorno-${layerKey}`}
          data={featureCollectionCompleta}
          style={(feature): PathOptions => {
            const tramo = (feature?.properties as FeatureProps | undefined)?.tramo
            const seleccionado = tramo?.id === tramoSeleccionadoId
            return estiloContornoOscuroTramo(seleccionado)
          }}
          interactive={false}
        />
        <GeoJSON
          key={`halo-${layerKey}`}
          data={featureCollectionCompleta}
          style={(feature): PathOptions => {
            const tramo = (feature?.properties as FeatureProps | undefined)?.tramo
            const seleccionado = tramo?.id === tramoSeleccionadoId
            return estiloHaloBlancoTramo(seleccionado)
          }}
          interactive={false}
        />
        <GeoJSON
          key={`main-${layerKey}`}
          data={featureCollectionColoreada}
          style={(feature): PathOptions => {
            const props = feature?.properties as FeatureProps | undefined
            const seleccionado = props?.tramo?.id === tramoSeleccionadoId
            return estiloSegmentoTramoEnMapa(
              props?.tramo,
              props?.tipo ?? "pendiente",
              seleccionado,
              false,
              props?.estadoSegmento
            )
          }}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as FeatureProps
            if (!props.tramo || !props.segmento) return
            registrarInteraccionTramo(
              layer,
              props.segmento,
              tramoSeleccionadoId,
              isResident,
              esViewportMovil,
              onTramoClick,
              onSegmentoVisitanteClick
            )
          }}
        />
        {puntosAvance.map((punto) => {
          const seleccionado = punto.tramo_id === tramoSeleccionadoId
          const label = punto.rol ? punto.rol.toUpperCase() : ""
          const orden = punto.rol ? punto.rol.charCodeAt(0) - 96 : 0
          const fillColor = label
            ? orden % 2 === 0
              ? "#ea580c"
              : "#2563eb"
            : seleccionado
              ? "#2563eb"
              : "#16a34a"

          if (label) {
            return (
              <Marker
                key={punto.id}
                position={[punto.lat, punto.lng]}
                icon={L.divIcon({
                  className: "",
                  html: `<div style="display:flex;align-items:center;justify-content:center;width:${iconSize}px;height:${iconSize}px;border-radius:50%;background:${fillColor};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);font-size:${fontSize}px;font-weight:700;color:#fff">${label}</div>`,
                  iconSize: [iconSize, iconSize],
                  iconAnchor: [iconSize / 2, iconSize / 2],
                })}
              />
            )
          }

          return (
            <CircleMarker
              key={punto.id}
              center={[punto.lat, punto.lng]}
              radius={marcadoresCompactos ? 5 : 6}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor,
                fillOpacity: 0.95,
              }}
            />
          )
        })}
      </MapContainer>
    </div>
  )
}
