"use client"

import { useEffect, useMemo, useState } from "react"
import { createPortal } from "react-dom"
import { CircleMarker, GeoJSON, MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import type { Layer, PathOptions } from "leaflet"
import L from "leaflet"
import { Expand, Minimize2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
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
import { htmlMarcadorPuntoAvance } from "@/src/lib/mapa-punto-marker"
import { puntoEnEjecucionOperativo } from "@/src/lib/tramo-geometria"

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

/** Leaflet no detecta cambios de tamaño del contenedor al pasar a pantalla completa. */
function InvalidarTamanoMapa({ pantallaCompleta }: { pantallaCompleta: boolean }) {
  const map = useMap()

  useEffect(() => {
    const id = window.requestAnimationFrame(() => {
      map.invalidateSize()
    })
    const timeout = window.setTimeout(() => map.invalidateSize(), 150)
    return () => {
      window.cancelAnimationFrame(id)
      window.clearTimeout(timeout)
    }
  }, [map, pantallaCompleta])

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
  alturaMapa: alturaMapaProp,
  onTramoClick,
  onSegmentoVisitanteClick,
}: MapaTramosLeafletProps) {
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const alturaNormal =
    alturaMapaProp ?? (modoMapaVisitanteMovil ? ALTURA_MAPA_VISITANTE_MOVIL : ALTURA_MAPA_TRAMOS)
  const alturaMapaContenedor = pantallaCompleta ? "100%" : alturaNormal

  useEffect(() => {
    if (!pantallaCompleta) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [pantallaCompleta])

  useEffect(() => {
    if (!pantallaCompleta) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setPantallaCompleta(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [pantallaCompleta])
  const iconSize = marcadoresCompactos ? 16 : 20
  const fontSize = marcadoresCompactos ? 9 : 10
  const featureCollectionCompleta = useMemo(
    () => featureCollectionDesdeTramos(tramos),
    [tramos]
  )

  const puntosVisibles = useMemo(() => {
    const ids = new Set(tramos.map((t) => t.id))
    return puntosAvance.filter((p) => ids.has(p.tramo_id))
  }, [tramos, puntosAvance])

  const segmentosColoreados = useMemo(
    () => tramos.flatMap((tramo) => segmentosVisualesTramo(tramo, puntosVisibles)),
    [tramos, puntosVisibles]
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
        style={{ height: alturaNormal }}
      >
        No hay tramos cargados. Importe el KMZ con{" "}
        <code className="mx-1 rounded bg-muted px-1">npm run import:kmz</code>.
      </div>
    )
  }

  const layerKey = `${isResident ? "r" : "v"}-${esViewportMovil ? "m" : "d"}-${tramoSeleccionadoId ?? "none"}-${tramos
    .map((t) => `${t.id}:${t.metros_ejecutados}:${t.estado}`)
    .join("|")}-${puntosVisibles.map((p) => `${p.id}:${p.estado_minitramo ?? ""}`).join(",")}`

  const mapaShell = (
    <div
      className={cn(
        pantallaCompleta
          ? "fixed inset-0 z-[200] flex h-dvh w-screen max-w-none flex-col overflow-hidden bg-background pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]"
          : "relative overflow-hidden rounded-xl border border-foreground/10 ring-1 ring-foreground/5"
      )}
    >
      <Button
        type="button"
        variant="secondary"
        size="icon"
        className="absolute top-2 right-2 z-[1000] size-9 border border-foreground/15 bg-background/95 shadow-md backdrop-blur-sm touch-manipulation"
        aria-label={pantallaCompleta ? "Salir de pantalla completa" : "Expandir mapa a pantalla completa"}
        aria-pressed={pantallaCompleta}
        onClick={() => setPantallaCompleta((prev) => !prev)}
      >
        {pantallaCompleta ? (
          <Minimize2 className="size-4" aria-hidden />
        ) : (
          <Expand className="size-4" aria-hidden />
        )}
      </Button>
      <MapContainer
        center={centroInicial}
        zoom={12}
        scrollWheelZoom
        className={cn("z-0 w-full", pantallaCompleta && "min-h-0 flex-1")}
        style={{ height: alturaMapaContenedor }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InvalidarTamanoMapa pantallaCompleta={pantallaCompleta} />
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
        {puntosVisibles.map((punto) => {
          const enEjecucion = puntoEnEjecucionOperativo(punto)
          const html = htmlMarcadorPuntoAvance(punto, iconSize, fontSize)

          if (punto.rol || enEjecucion) {
            return (
              <Marker
                key={punto.id}
                position={[punto.lat, punto.lng]}
                icon={L.divIcon({
                  className: "",
                  html,
                  iconSize: [iconSize, iconSize],
                  iconAnchor: [iconSize / 2, iconSize / 2],
                })}
              />
            )
          }

          const seleccionado = punto.tramo_id === tramoSeleccionadoId
          return (
            <CircleMarker
              key={punto.id}
              center={[punto.lat, punto.lng]}
              radius={marcadoresCompactos ? 5 : 6}
              pathOptions={{
                color: "#ffffff",
                weight: 2,
                fillColor: seleccionado ? "#2563eb" : "#16a34a",
                fillOpacity: 0.95,
              }}
            />
          )
        })}
      </MapContainer>
    </div>
  )

  if (pantallaCompleta && typeof document !== "undefined") {
    return (
      <>
        <div
          aria-hidden
          className="overflow-hidden rounded-xl ring-1 ring-foreground/5 ring-inset"
          style={{ height: alturaNormal }}
        />
        {createPortal(mapaShell, document.body)}
      </>
    )
  }

  return mapaShell
}
