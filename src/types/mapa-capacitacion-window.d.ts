import type { Map as LeafletMap } from "leaflet"

declare global {
  interface Window {
    /** Expuesto por MapaTramosLeaflet para automatización de capacitación (screencast). */
    __mapaTramosLeaflet?: LeafletMap
    /** Encuadra la red visible (misma lógica que AjustarBounds). */
    __mapaCapacitacionFitBoundsRed?: () => boolean
  }
}

export {}
