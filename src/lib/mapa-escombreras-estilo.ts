import type { PathOptions } from "leaflet"

const FILL = "#b45309"
const STROKE = "#92400e"

export function estiloEscombreraEnMapa(resaltada = false): PathOptions {
  return {
    color: STROKE,
    weight: resaltada ? 3 : 2,
    opacity: 0.95,
    fillColor: FILL,
    fillOpacity: resaltada ? 0.45 : 0.28,
    dashArray: resaltada ? undefined : "4 3",
  }
}
