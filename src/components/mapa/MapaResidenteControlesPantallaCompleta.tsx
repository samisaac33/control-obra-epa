"use client"

import { MapaBuscarCoordenadasResidente } from "@/src/components/mapa/MapaBuscarCoordenadasResidente"
import { MapaUbicacionResidenteBarra } from "@/src/components/mapa/MapaUbicacionResidenteBlock"

/** Botones GPS y búsqueda por coordenadas superpuestos al mapa en pantalla completa (residente). */
export function MapaResidenteControlesPantallaCompleta() {
  return (
    <div className="space-y-2">
      <div className="flex justify-start">
        <div className="w-full max-w-sm">
          <MapaUbicacionResidenteBarra modo="pantallaCompleta" />
        </div>
      </div>
      <MapaBuscarCoordenadasResidente variant="overlay" />
    </div>
  )
}
