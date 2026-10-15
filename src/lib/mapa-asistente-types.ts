import type { UIMessage } from "ai"

import type { CoordenadasMapaAplicables } from "@/src/lib/mapa-coordenadas-gps"

export type MapaAsistenteDataTypes = {
  "map-coords": CoordenadasMapaAplicables
}

export type MapaAsistenteUIMessage = UIMessage<unknown, MapaAsistenteDataTypes>
