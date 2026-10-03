"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { CircleMarker, GeoJSON, MapContainer, Marker, TileLayer, useMap } from "react-leaflet"
import type { Layer, PathOptions } from "leaflet"
import L from "leaflet"
import { Expand, Minimize2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { CanalTramo, EstadoTramo } from "@/src/data/tramos/types"
import { etiquetaEstadoTramo } from "@/src/data/tramos/types"
import type { JornadaMinitramoMapa } from "@/src/lib/mapa-jornada-minitramo"
import {
  claveSegmentoMapaHover,
  htmlTooltipVisitanteMinitramo,
  htmlTooltipVisitanteTramo,
  segmentosVisualesTramo,
  type SegmentoVisualTramo,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"
import { boundsDesdeTramos } from "@/src/lib/tramos-avance"
import {
  Z_MAPA_MARCADOR_FRENTE_PARPADEO,
  Z_MAPA_MARCADOR_PUNTO,
  Z_MAPA_PANTALLA_COMPLETA,
} from "@/src/lib/mapa-capas-z"
import {
  ALTURA_MAPA_TRAMOS,
  ALTURA_MAPA_VISITANTE_MOVIL,
  estiloContornoOscuroTramo,
  estiloHaloBlancoTramo,
  estiloSegmentoTramoEnMapa,
  MAX_ZOOM_MAPA_TRAMOS,
  OPACIDAD_TRAMO_ATENUADO_MAPA,
  pesoTramoEnMapa,
} from "@/src/lib/mapa-tramos-estilo"
import { MapaEtiquetasLongitudTramoPorZoom } from "@/src/components/mapa/MapaEtiquetasLongitudTramoPorZoom"
import { MapaEtiquetasMinitramoPorZoom } from "@/src/components/mapa/MapaEtiquetasMinitramoPorZoom"
import { MapaEtiquetasTramoPorZoom } from "@/src/components/mapa/MapaEtiquetasTramoPorZoom"
import { useEsViewportMovil } from "@/src/hooks/useEsViewportMovil"
import {
  UbicacionUsuarioEnMapa,
  type UbicacionUsuario,
} from "@/src/components/mapa/UbicacionUsuarioEnMapa"
import { htmlMarcadorPuntoAvance } from "@/src/lib/mapa-punto-marker"

import "leaflet/dist/leaflet.css"

type MapaTramosLeafletProps = {
  tramos: CanalTramo[]
  tramoSeleccionadoId: string | null
  puntosAvance?: TramoPuntoAvance[]
  isResident: boolean
  esViewportMovil: boolean
  modoMapaVisitanteMovil?: boolean
  /** Altura del contenedor vía Tailwind (78dvh móvil / 65vh desktop) para residente */
  alturaResponsiveResidente?: boolean
  marcadoresCompactos?: boolean
  mostrarEtiquetasTramo?: boolean
  mostrarPuntosAvance?: boolean
  mostrarMinitramosTerminados?: boolean
  mapaConsolidado?: boolean
  onTramoClick: (tramo: CanalTramo) => void
  onSegmentoVisitanteClick?: (segmento: SegmentoVisualTramo) => void
  ubicacionUsuario?: UbicacionUsuario | null
  seguirUbicacionUsuario?: boolean
  centrarUbicacionVersion?: number
  puntoIdsParpadeoFrente?: ReadonlySet<string>
  jornadaPorPuntoFin?: ReadonlyMap<string, JornadaMinitramoMapa>
}

type HoverVisitanteMapa = {
  tramoId: string
  segmentoClave: string
} | null

type CapaSegmentoRegistrada = {
  path: L.Path
  props: FeatureProps
  clave: string
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
    map.fitBounds(bounds, {
      padding: [24, 24],
      maxZoom: MAX_ZOOM_MAPA_TRAMOS,
    })
  }, [map, tramos])

  return null
}

/** Referencia global para scripts de grabación de capacitación (flyTo / fitBounds). */
function ExponerMapaCapacitacion({ tramos }: { tramos: CanalTramo[] }) {
  const map = useMap()

  useEffect(() => {
    window.__mapaTramosLeaflet = map
    window.__mapaCapacitacionFitBoundsRed = () => {
      const bounds = boundsDesdeTramos(tramos)
      if (!bounds) return false
      map.fitBounds(bounds, {
        padding: [24, 24],
        maxZoom: MAX_ZOOM_MAPA_TRAMOS,
      })
      return true
    }
    return () => {
      delete window.__mapaTramosLeaflet
      delete window.__mapaCapacitacionFitBoundsRed
    }
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

function estiloCapaSegmentoVisitante(
  props: FeatureProps,
  ctx: {
    tramoSeleccionadoId: string | null
    mostrarMinitramosTerminados: boolean
    mapaConsolidado: boolean
    mostrarPuntosAvance: boolean
    hover: HoverVisitanteMapa
    claveSegmento: string
  }
): PathOptions {
  const { tramo, tipo, estadoSegmento } = props
  const seleccionado = tramo.id === ctx.tramoSeleccionadoId
  const base = estiloSegmentoTramoEnMapa(
    tramo,
    tipo ?? "pendiente",
    seleccionado,
    false,
    estadoSegmento,
    ctx.mostrarMinitramosTerminados,
    ctx.mapaConsolidado
  )

  if (!ctx.hover) return base

  const mismoTramo = ctx.hover.tramoId === tramo.id
  if (!ctx.mostrarPuntosAvance) {
    if (mismoTramo) {
      return { ...base, weight: pesoTramoEnMapa(seleccionado, true), opacity: 1 }
    }
    return { ...base, opacity: OPACIDAD_TRAMO_ATENUADO_MAPA }
  }

  const resaltado = mismoTramo && ctx.hover.segmentoClave === ctx.claveSegmento
  if (resaltado) {
    return { ...base, weight: pesoTramoEnMapa(seleccionado, true), opacity: 1 }
  }
  return { ...base, opacity: OPACIDAD_TRAMO_ATENUADO_MAPA }
}

function registrarInteraccionTramo(
  layer: Layer,
  segmento: SegmentoVisualTramo,
  props: FeatureProps,
  claveSegmento: string,
  ctx: {
    tramoSeleccionadoId: string | null
    isResident: boolean
    esViewportMovil: boolean
    mostrarMinitramosTerminados: boolean
    mapaConsolidado: boolean
    mostrarPuntosAvance: boolean
    puntosAvance: TramoPuntoAvance[]
    jornadaPorPuntoFin: ReadonlyMap<string, JornadaMinitramoMapa>
    hover: HoverVisitanteMapa
    onHoverChange: (hover: HoverVisitanteMapa) => void
    onTramoClick: (tramo: CanalTramo) => void
    onSegmentoVisitanteClick?: (segmento: SegmentoVisualTramo) => void
    registrarCapa: (capa: CapaSegmentoRegistrada) => void
  }
) {
  const { tramo } = segmento
  const path = layer as L.Path

  ctx.registrarCapa({ path, props, clave: claveSegmento })

  path.setStyle(
    estiloCapaSegmentoVisitante(props, {
      tramoSeleccionadoId: ctx.tramoSeleccionadoId,
      mostrarMinitramosTerminados: ctx.mostrarMinitramosTerminados,
      mapaConsolidado: ctx.mapaConsolidado,
      mostrarPuntosAvance: ctx.mostrarPuntosAvance,
      hover: ctx.hover,
      claveSegmento,
    })
  )

  if (ctx.isResident) {
    layer.bindTooltip(`${tramo.codigo} · ${etiquetaEstadoTramo(tramo.estado)} · ${tramo.canal}`, {
      sticky: true,
      direction: "top",
    })
  } else if (!ctx.esViewportMovil) {
    const tooltipHtml = ctx.mostrarPuntosAvance
      ? segmento.tipo === "minitramo"
        ? htmlTooltipVisitanteMinitramo(
            segmento,
            segmento.puntoFinId
              ? ctx.jornadaPorPuntoFin.get(segmento.puntoFinId)
              : undefined
          )
        : htmlTooltipVisitanteTramo(tramo, ctx.puntosAvance)
      : htmlTooltipVisitanteTramo(tramo, ctx.puntosAvance)

    layer.bindTooltip(tooltipHtml, {
      sticky: true,
      direction: "auto",
      className: "mapa-segmento-tooltip",
    })
  }

  layer.on({
    click: () => {
      if (!ctx.isResident && ctx.onSegmentoVisitanteClick) {
        ctx.onSegmentoVisitanteClick(segmento)
        return
      }
      ctx.onTramoClick(tramo)
    },
    mouseover: () => {
      if (ctx.isResident || ctx.esViewportMovil) {
        path.setStyle({
          weight: pesoTramoEnMapa(tramo.id === ctx.tramoSeleccionadoId, true),
          opacity: 1,
        })
        return
      }
      ctx.onHoverChange({
        tramoId: tramo.id,
        segmentoClave: claveSegmento,
      })
    },
    mouseout: () => {
      if (ctx.isResident || ctx.esViewportMovil) {
        const seleccionado = tramo.id === ctx.tramoSeleccionadoId
        path.setStyle(
          estiloSegmentoTramoEnMapa(
            tramo,
            props.tipo ?? "pendiente",
            seleccionado,
            false,
            props.estadoSegmento,
            ctx.mostrarMinitramosTerminados,
            ctx.mapaConsolidado
          )
        )
        return
      }
      ctx.onHoverChange(null)
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
  alturaResponsiveResidente = false,
  marcadoresCompactos = false,
  mostrarEtiquetasTramo = true,
  mostrarPuntosAvance = false,
  mostrarMinitramosTerminados = true,
  mapaConsolidado = true,
  onTramoClick,
  onSegmentoVisitanteClick,
  ubicacionUsuario = null,
  seguirUbicacionUsuario = false,
  centrarUbicacionVersion = 0,
  puntoIdsParpadeoFrente,
  jornadaPorPuntoFin,
}: MapaTramosLeafletProps) {
  const idsParpadeoFrente = puntoIdsParpadeoFrente ?? new Set<string>()
  const jornadasMapa = jornadaPorPuntoFin ?? new Map<string, JornadaMinitramoMapa>()
  const [pantallaCompleta, setPantallaCompleta] = useState(false)
  const [hoverVisitante, setHoverVisitante] = useState<HoverVisitanteMapa>(null)
  const capasSegmentoRef = useRef<CapaSegmentoRegistrada[]>([])
  const capasLayerKeyRef = useRef<string | null>(null)
  const esViewportMovilHook = useEsViewportMovil()
  const alturaNormal = modoMapaVisitanteMovil ? ALTURA_MAPA_VISITANTE_MOVIL : ALTURA_MAPA_TRAMOS
  const usaAlturaCssResidente = alturaResponsiveResidente && !pantallaCompleta
  const alturaMapaContenedor = pantallaCompleta
    ? "100%"
    : usaAlturaCssResidente
      ? "100%"
      : alturaNormal
  const marcadoresRealmenteCompactos =
    marcadoresCompactos || (alturaResponsiveResidente && esViewportMovilHook)

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
  const iconSize = marcadoresRealmenteCompactos ? 16 : 20
  const fontSize = marcadoresRealmenteCompactos ? 9 : 10
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
        className={cn(
          "flex items-center justify-center rounded-xl border border-dashed border-foreground/15 bg-muted/20 text-sm text-muted-foreground",
          usaAlturaCssResidente && "h-[min(78dvh,640px)] md:h-[min(65vh,560px)]"
        )}
        style={usaAlturaCssResidente ? undefined : { height: alturaNormal }}
      >
        No hay tramos visibles con los filtros actuales.
      </div>
    )
  }

  const layerKey = `${isResident ? "r" : "v"}-${esViewportMovil ? "m" : "d"}-${mostrarPuntosAvance ? "pts1" : "pts0"}-${mostrarMinitramosTerminados ? "mtt1" : "mtt0"}-${mapaConsolidado ? "cons1" : "cons0"}-${tramoSeleccionadoId ?? "none"}-${tramos
    .map((t) => `${t.id}:${t.metros_ejecutados}:${t.estado}`)
    .join("|")}-${puntosVisibles.map((p) => `${p.id}:${p.estado_minitramo ?? ""}`).join(",")}-${[...idsParpadeoFrente].sort().join(",")}`

  useEffect(() => {
    setHoverVisitante(null)
  }, [layerKey])

  const registrarCapaSegmento = useCallback((capa: CapaSegmentoRegistrada) => {
    capasSegmentoRef.current.push(capa)
  }, [])

  useEffect(() => {
    if (isResident || esViewportMovil) return
    for (const capa of capasSegmentoRef.current) {
      capa.path.setStyle(
        estiloCapaSegmentoVisitante(capa.props, {
          tramoSeleccionadoId,
          mostrarMinitramosTerminados,
          mapaConsolidado,
          mostrarPuntosAvance,
          hover: hoverVisitante,
          claveSegmento: capa.clave,
        })
      )
    }
  }, [
    hoverVisitante,
    isResident,
    esViewportMovil,
    tramoSeleccionadoId,
    mostrarMinitramosTerminados,
    mapaConsolidado,
    mostrarPuntosAvance,
  ])

  const mapaShell = (
    <div
      className={cn(
        pantallaCompleta
          ? cn(
              "fixed inset-0 flex h-dvh w-screen max-w-none flex-col overflow-hidden bg-background pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)]",
              Z_MAPA_PANTALLA_COMPLETA
            )
          : cn(
              "relative overflow-hidden rounded-xl border border-foreground/10 ring-1 ring-foreground/5",
              usaAlturaCssResidente && "h-[min(78dvh,640px)] md:h-[min(65vh,560px)]"
            )
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
        dragging
        doubleClickZoom
        touchZoom
        boxZoom
        keyboard
        className={cn("z-0 w-full", pantallaCompleta && "min-h-0 flex-1")}
        style={{ height: alturaMapaContenedor }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <InvalidarTamanoMapa pantallaCompleta={pantallaCompleta} />
        <MapaEtiquetasTramoPorZoom
          tramos={tramos}
          tramoSeleccionadoId={tramoSeleccionadoId}
          mostrar={mostrarEtiquetasTramo}
        />
        <MapaEtiquetasLongitudTramoPorZoom tramos={tramos} />
        <MapaEtiquetasMinitramoPorZoom segmentos={segmentosColoreados} />
        <AjustarBounds tramos={tramos} />
        <ExponerMapaCapacitacion tramos={tramos} />
        {ubicacionUsuario ? (
          <UbicacionUsuarioEnMapa
            ubicacion={ubicacionUsuario}
            seguir={seguirUbicacionUsuario}
            centrarVersion={centrarUbicacionVersion}
          />
        ) : null}
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
              props?.estadoSegmento,
              mostrarMinitramosTerminados,
              mapaConsolidado
            )
          }}
          onEachFeature={(feature, layer) => {
            const props = feature.properties as FeatureProps
            if (!props.tramo || !props.segmento) return
            if (capasLayerKeyRef.current !== layerKey) {
              capasLayerKeyRef.current = layerKey
              capasSegmentoRef.current = []
            }
            const claveSegmento = claveSegmentoMapaHover(props.segmento)
            registrarInteraccionTramo(layer, props.segmento, props, claveSegmento, {
              tramoSeleccionadoId,
              isResident,
              esViewportMovil,
              mostrarMinitramosTerminados,
              mapaConsolidado,
              mostrarPuntosAvance,
              puntosAvance: puntosVisibles,
              jornadaPorPuntoFin: jornadasMapa,
              hover: hoverVisitante,
              onHoverChange: setHoverVisitante,
              onTramoClick,
              onSegmentoVisitanteClick,
              registrarCapa: registrarCapaSegmento,
            })
          }}
        />
        {(() => {
          const puntosFrente = puntosVisibles.filter((p) => idsParpadeoFrente.has(p.id))
          const puntosResto = mostrarPuntosAvance
            ? puntosVisibles.filter((p) => !idsParpadeoFrente.has(p.id))
            : []

          const renderMarcadorDiv = (punto: TramoPuntoAvance, parpadeoFrente: boolean) => (
            <Marker
              key={punto.id}
              position={[punto.lat, punto.lng]}
              zIndexOffset={
                parpadeoFrente ? Z_MAPA_MARCADOR_FRENTE_PARPADEO : Z_MAPA_MARCADOR_PUNTO
              }
              icon={L.divIcon({
                className: "",
                html: htmlMarcadorPuntoAvance(punto, iconSize, fontSize, parpadeoFrente),
                iconSize: [iconSize, iconSize],
                iconAnchor: [iconSize / 2, iconSize / 2],
              })}
            />
          )

          if (puntosResto.length === 0 && puntosFrente.length === 0) return null

          return (
            <>
              {puntosResto.map((punto) => {
                if (punto.rol) {
                  return renderMarcadorDiv(punto, false)
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
              {puntosFrente.map((punto) => renderMarcadorDiv(punto, true))}
            </>
          )
        })()}
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
