"use client"

import { useEffect } from "react"
import { Circle, Marker, useMap } from "react-leaflet"
import L from "leaflet"

export type UbicacionUsuario = {
  lat: number
  lng: number
  precision_m: number
}

type UbicacionUsuarioEnMapaProps = {
  ubicacion: UbicacionUsuario
  seguir?: boolean
}

const iconoUbicacionUsuario = L.divIcon({
  className: "ubicacion-usuario-marker",
  html: `<div class="ubicacion-usuario-dot"><div class="ubicacion-usuario-pulse"></div></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
})

function SeguirUbicacionEnMapa({
  lat,
  lng,
  seguir,
}: {
  lat: number
  lng: number
  seguir: boolean
}) {
  const map = useMap()

  useEffect(() => {
    if (!seguir) return
    map.panTo([lat, lng], { animate: true, duration: 0.5 })
  }, [map, lat, lng, seguir])

  return null
}

export function UbicacionUsuarioEnMapa({
  ubicacion,
  seguir = false,
}: UbicacionUsuarioEnMapaProps) {
  const { lat, lng, precision_m } = ubicacion
  const radioPrecision = Math.max(precision_m, 5)

  return (
    <>
      <style>{`
        .ubicacion-usuario-marker { background: transparent; border: none; }
        .ubicacion-usuario-dot {
          position: relative;
          width: 16px;
          height: 16px;
        }
        .ubicacion-usuario-dot::after {
          content: "";
          position: absolute;
          inset: 3px;
          border-radius: 50%;
          background: #4285F4;
          border: 2px solid #fff;
          box-shadow: 0 1px 4px rgba(0,0,0,.35);
          z-index: 2;
        }
        .ubicacion-usuario-pulse {
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: rgba(66, 133, 244, 0.35);
          animation: ubicacion-usuario-pulse 2s ease-out infinite;
        }
        @keyframes ubicacion-usuario-pulse {
          0% { transform: scale(0.6); opacity: 0.8; }
          70% { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>
      <SeguirUbicacionEnMapa lat={lat} lng={lng} seguir={seguir} />
      <Circle
        center={[lat, lng]}
        radius={radioPrecision}
        pathOptions={{
          color: "#4285F4",
          fillColor: "#4285F4",
          fillOpacity: 0.12,
          weight: 1,
          opacity: 0.35,
        }}
        interactive={false}
      />
      <Marker position={[lat, lng]} icon={iconoUbicacionUsuario} interactive={false} />
    </>
  )
}
