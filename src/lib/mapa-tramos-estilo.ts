import type { PathOptions } from "leaflet"

import type { CanalTramo } from "@/src/data/tramos/types"
import { COLOR_MINITRAMO, colorEstadoTramo } from "@/src/data/tramos/types"

export const ALTURA_MAPA_TRAMOS = "min(65vh, 560px)"
export const MAX_ZOOM_MAPA_TRAMOS = 14

const PESO_NORMAL = 6
const PESO_SELECCIONADO = 8
const PESO_HOVER_EXTRA = 1
const HALO_BLANCO_EXTRA = 4
const CONTORNO_OSCURO_EXTRA = 6

export function pesoTramoEnMapa(seleccionado: boolean, hover = false): number {
  const base = seleccionado ? PESO_SELECCIONADO : PESO_NORMAL
  return hover ? base + PESO_HOVER_EXTRA : base
}

function estiloLineaTramo(color: string, seleccionado: boolean, hover = false): PathOptions {
  return {
    color,
    weight: pesoTramoEnMapa(seleccionado, hover),
    opacity: 1,
    lineCap: "round",
    lineJoin: "round",
  }
}

export function estiloTramoEnMapa(
  tramo: CanalTramo | undefined,
  seleccionado: boolean,
  hover = false
): PathOptions {
  const estado = tramo?.estado ?? "pendiente"
  return estiloLineaTramo(colorEstadoTramo(estado), seleccionado, hover)
}

export function estiloTramoPendienteEnMapa(
  tramo: CanalTramo | undefined,
  seleccionado: boolean,
  hover = false
): PathOptions {
  const estado = tramo?.estado ?? "pendiente"
  return estiloLineaTramo(colorEstadoTramo(estado), seleccionado, hover)
}

export function estiloMinitramoEnMapa(seleccionado: boolean, hover = false): PathOptions {
  return estiloLineaTramo(COLOR_MINITRAMO, seleccionado, hover)
}

export function estiloSegmentoTramoEnMapa(
  tramo: CanalTramo | undefined,
  tipo: "minitramo" | "pendiente" | "ejecutado",
  seleccionado: boolean,
  hover = false
): PathOptions {
  const estado = tramo?.estado ?? "pendiente"
  const esMinitramoEjecutado =
    estado === "en_ejecucion" && (tipo === "minitramo" || tipo === "ejecutado")

  if (esMinitramoEjecutado) {
    return estiloMinitramoEnMapa(seleccionado, hover)
  }
  return estiloTramoPendienteEnMapa(tramo, seleccionado, hover)
}

export function estiloHaloBlancoTramo(seleccionado: boolean): PathOptions {
  return {
    color: "#ffffff",
    weight: pesoTramoEnMapa(seleccionado) + HALO_BLANCO_EXTRA,
    opacity: 0.9,
    lineCap: "round",
    lineJoin: "round",
  }
}

export function estiloContornoOscuroTramo(seleccionado: boolean): PathOptions {
  return {
    color: "#1e293b",
    weight: pesoTramoEnMapa(seleccionado) + CONTORNO_OSCURO_EXTRA,
    opacity: 0.55,
    lineCap: "round",
    lineJoin: "round",
  }
}
