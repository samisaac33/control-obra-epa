"use client"

import { MapaBuscarCoordenadasResidente } from "@/src/components/mapa/MapaBuscarCoordenadasResidente"
import { MapaUbicacionResidenteBarra } from "@/src/components/mapa/MapaUbicacionResidenteBlock"

/** Botones GPS y búsqueda por coordenadas superpuestos al mapa en pantalla completa (residente). */
export function MapaResidenteControlesPantallaCompleta() {
  return (
    <div className="space-y-2">
      <MapaUbicacionResidenteBarra modo="pantallaCompleta" />
      <MapaBuscarCoordenadasResidente variant="overlay" conBotonUbicacion />
    </div>
  )
}
