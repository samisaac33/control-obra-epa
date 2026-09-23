"use client"

import { useEffect, useMemo } from "react"
import { CircleMarker, GeoJSON, MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import type { Layer, PathOptions } from "leaflet"
import L from "leaflet"

import type { CanalTramo } from "@/src/data/tramos/types"
import { etiquetaEstadoTramo } from "@/src/data/tramos/types"
import {
  segmentosVisualesTramo,
  type SegmentoVisualTramo,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"
import { boundsDesdeTramos } from "@/src/lib/tramos-avance"
import {
  ALTURA_MAPA_TRAMOS,
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
  onTramoClick: (tramo: CanalTramo) => void
}

type FeatureProps = {
  tramo: CanalTramo
  id: string
  tipo?: "minitramo" | "pendiente" | "ejecutado"
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
  tramo: CanalTramo,
  tipo: "minitramo" | "pendiente" | "ejecutado" | undefined,
  tramoSeleccionadoId: string | null,
  onTramoClick: (tramo: CanalTramo) => void
) {
  layer.bindTooltip(
    `${tramo.codigo} · ${etiquetaEstadoTramo(tramo.estado)} · ${tramo.canal}`,
    {
      sticky: true,
      direction: "top",
    }
  )

  layer.on({
    click: () => onTramoClick(tramo),
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
        estiloSegmentoTramoEnMapa(tramo, tipo ?? "pendiente", seleccionado)
      )
    },
  })
}

function featureCollectionDesdeTramos(tramos: CanalTramo[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: tramos.map((tramo) => ({
      type: "Feature",
      properties: { tramo, id: tramo.id } satisfies FeatureProps,
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
        tipo: segmento.tipo,
      } satisfies FeatureProps,
      geometry: segmento.geometria,
    })),
  }
}

export function MapaTramosLeaflet({
  tramos,
  tramoSeleccionadoId,
  puntosAvance = [],
  onTramoClick,
}: MapaTramosLeafletProps) {
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
        style={{ height: ALTURA_MAPA_TRAMOS }}
      >
        No hay tramos cargados. Importe el KMZ con{" "}
        <code className="mx-1 rounded bg-muted px-1">npm run import:kmz</code>.
      </div>
    )
  }

  const layerKey = `${tramoSeleccionadoId ?? "none"}-${tramos
    .map((t) => `${t.id}:${t.metros_ejecutados}:${t.estado}`)
    .join("|")}`

  return (
    <div className="overflow-hidden rounded-xl border border-foreground/10 ring-1 ring-foreground/5">
      <MapContainer
        center={centroInicial}
        zoom={12}
        scrollWheelZoom
        className="w-full z-0"
        style={{ height: ALTURA_MAPA_TRAMOS }}
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
              seleccionado
            )
          }}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as FeatureProps
            if (!props.tramo) return
            registrarInteraccionTramo(
              layer,
              props.tramo,
              props.tipo,
              tramoSeleccionadoId,
              onTramoClick
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
                  html: `<div style="display:flex;align-items:center;justify-content:center;width:20px;height:20px;border-radius:50%;background:${fillColor};border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.35);font-size:10px;font-weight:700;color:#fff">${label}</div>`,
                  iconSize: [20, 20],
                  iconAnchor: [10, 10],
                })}
              />
            )
          }

          return (
            <CircleMarker
              key={punto.id}
              center={[punto.lat, punto.lng]}
              radius={6}
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
