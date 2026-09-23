"use client"

import { useEffect, useMemo } from "react"
import { GeoJSON, MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet"
import type { PathOptions } from "leaflet"
import L from "leaflet"

import type { CanalTramo, EstadoTramo } from "@/src/data/tramos/types"
import {
  estiloContornoOscuroTramo,
  estiloHaloBlancoTramo,
  estiloSegmentoTramoEnMapa,
} from "@/src/lib/mapa-tramos-estilo"
import {
  proyectarPuntoEnLinea,
  segmentosVisualesTramo,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"
import {
  UbicacionUsuarioEnMapa,
  type UbicacionUsuario,
} from "@/src/components/mapa/UbicacionUsuarioEnMapa"

import "leaflet/dist/leaflet.css"

type PuntoMapa = { lat: number; lng: number; letra: string; editable?: boolean }

type MiniMapaTramoPuntoProps = {
  tramo: CanalTramo
  puntoEdicion: PuntoMapa
  puntosConfirmados?: PuntoMapa[]
  puntosAvance?: TramoPuntoAvance[]
  onPointMove?: (lat: number, lng: number) => void
  height?: string
  scrollWheelZoom?: boolean
  ubicacionUsuario?: UbicacionUsuario | null
  seguirUbicacion?: boolean
}

function iconoMarcador(letra: string, color: string, editable: boolean) {
  const borde = editable ? "3px solid #fbbf24" : "2px solid #fff"
  return L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:50%;background:${color};border:${borde};box-shadow:0 1px 4px rgba(0,0,0,.35);font-size:11px;font-weight:700;color:#fff">${letra}</div>`,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

function CentrarVista({
  tramo,
  puntos,
  seguirUbicacion,
}: {
  tramo: CanalTramo
  puntos: { lat: number; lng: number }[]
  seguirUbicacion?: boolean
}) {
  const map = useMap()

  useEffect(() => {
    if (seguirUbicacion) return
    const coords = tramo.geometria.coordinates
    const bounds = coords.map(([lngC, latC]) => [latC, lngC] as [number, number])
    for (const p of puntos) bounds.push([p.lat, p.lng])
    map.fitBounds(bounds, { padding: [20, 20], maxZoom: 16 })
  }, [map, tramo.id, puntos, seguirUbicacion])

  return null
}

function CapturarClicMapa({
  tramo,
  onPointMove,
}: {
  tramo: CanalTramo
  onPointMove: (lat: number, lng: number) => void
}) {
  useMapEvents({
    click(event) {
      const proyeccion = proyectarPuntoEnLinea(event.latlng.lat, event.latlng.lng, tramo.geometria)
      if (!proyeccion) return
      onPointMove(proyeccion.lat, proyeccion.lng)
    },
  })
  return null
}

function reproyectarSobreTramo(tramo: CanalTramo, lat: number, lng: number): { lat: number; lng: number } {
  const proyeccion = proyectarPuntoEnLinea(lat, lng, tramo.geometria)
  return proyeccion ? { lat: proyeccion.lat, lng: proyeccion.lng } : { lat, lng }
}

export function MiniMapaTramoPunto({
  tramo,
  puntoEdicion,
  puntosConfirmados = [],
  puntosAvance,
  onPointMove,
  height = "220px",
  scrollWheelZoom = false,
  ubicacionUsuario = null,
  seguirUbicacion = false,
}: MiniMapaTramoPuntoProps) {
  const featureCollectionCompleta = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: [{ type: "Feature", properties: { tramo }, geometry: tramo.geometria }],
    }),
    [tramo]
  )

  const segmentos = useMemo(
    () => segmentosVisualesTramo(tramo, puntosAvance),
    [tramo, puntosAvance]
  )

  const featureCollectionColoreada = useMemo(
    (): GeoJSON.FeatureCollection => ({
      type: "FeatureCollection",
      features: segmentos.map((segmento) => ({
        type: "Feature",
        properties: {
          tramo: segmento.tramo,
          tipo: segmento.tipo,
          estadoSegmento: segmento.estadoSegmento,
        },
        geometry: segmento.geometria,
      })),
    }),
    [segmentos]
  )

  const interactivo = Boolean(onPointMove)
  const layerKey = `${tramo.id}-${tramo.metros_ejecutados}-${tramo.estado}`
  const todosLosPuntos = [...puntosConfirmados, puntoEdicion]

  return (
    <div className="overflow-hidden rounded-lg border border-foreground/10">
      <MapContainer
        center={[puntoEdicion.lat, puntoEdicion.lng]}
        zoom={15}
        scrollWheelZoom={scrollWheelZoom}
        className="w-full z-0"
        style={{ height }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <CentrarVista
          tramo={tramo}
          puntos={todosLosPuntos}
          seguirUbicacion={seguirUbicacion}
        />
        {interactivo ? <CapturarClicMapa tramo={tramo} onPointMove={onPointMove!} /> : null}
        {ubicacionUsuario ? (
          <UbicacionUsuarioEnMapa ubicacion={ubicacionUsuario} seguir={seguirUbicacion} />
        ) : null}
        <GeoJSON
          key={`mini-contorno-${layerKey}`}
          data={featureCollectionCompleta}
          style={(): PathOptions => estiloContornoOscuroTramo(false)}
          interactive={false}
        />
        <GeoJSON
          key={`mini-halo-${layerKey}`}
          data={featureCollectionCompleta}
          style={(): PathOptions => estiloHaloBlancoTramo(false)}
          interactive={false}
        />
        <GeoJSON
          key={`mini-main-${layerKey}`}
          data={featureCollectionColoreada}
          style={(feature): PathOptions => {
            const props = feature?.properties as {
              tramo?: CanalTramo
              tipo?: "minitramo" | "pendiente" | "ejecutado"
              estadoSegmento?: EstadoTramo
            }
            return estiloSegmentoTramoEnMapa(
              props?.tramo,
              props?.tipo ?? "pendiente",
              true,
              false,
              props?.estadoSegmento
            )
          }}
          interactive={false}
        />
        {puntosConfirmados.map((punto) => (
          <Marker
            key={`conf-${punto.letra}-${punto.lat.toFixed(6)}`}
            position={[punto.lat, punto.lng]}
            draggable={false}
            icon={iconoMarcador(punto.letra, "#64748b", false)}
          />
        ))}
        <Marker
          key={`edit-${puntoEdicion.letra}-${puntoEdicion.lat.toFixed(6)}`}
          position={[puntoEdicion.lat, puntoEdicion.lng]}
          draggable={interactivo}
          icon={iconoMarcador(
            puntoEdicion.letra,
            esPar(puntoEdicion.letra) ? "#ea580c" : "#2563eb",
            true
          )}
          eventHandlers={
            interactivo
              ? {
                  dragend: (event) => {
                    const pos = event.target.getLatLng()
                    const proyectado = reproyectarSobreTramo(tramo, pos.lat, pos.lng)
                    onPointMove?.(proyectado.lat, proyectado.lng)
                  },
                }
              : undefined
          }
        />
      </MapContainer>
    </div>
  )
}

function esPar(letra: string): boolean {
  const code = letra.toUpperCase().charCodeAt(0) - 64
  return code > 0 && code % 2 === 0
}
