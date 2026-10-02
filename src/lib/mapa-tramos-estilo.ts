import type { PathOptions } from "leaflet"

import type { CanalTramo, EstadoTramo } from "@/src/data/tramos/types"
import { colorEstadoTramoEnMapa } from "@/src/lib/mapa-tramos-zona-color"

export const ALTURA_MAPA_TRAMOS = "min(65vh, 560px)"
export const ALTURA_MAPA_VISITANTE_MOVIL = "min(78dvh, 640px)"
export const MAX_ZOOM_MAPA_TRAMOS = 14
/** A partir de este zoom se muestran números de tramo en el mapa. */
export const ZOOM_MIN_ETIQUETAS_TRAMO = 13
/** A partir de este zoom se muestran longitudes totales de tramos en el mapa. */
export const ZOOM_MIN_ETIQUETAS_LONGITUD = 14
/** Ancho máx. de la etiqueta de minitramo respecto al trazo visible (50% = no tapar más de la mitad). */
export const FRACCION_MAX_ANCHO_ETIQUETA_SOBRE_MINITRAMO = 0.5
/** @deprecated Use ZOOM_MIN_ETIQUETAS_LONGITUD */
export const ZOOM_MIN_ETIQUETAS_MINITRAMO = ZOOM_MIN_ETIQUETAS_LONGITUD

/** Color violeta en vista consolidada (modo por defecto del mapa; no aplica a MTT terminado visible). */
export const COLOR_TRAMO_CONSOLIDADO = "#7c3aed"

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
  return estiloLineaTramo(colorEstadoTramoEnMapa(estado, tramo?.codigo), seleccionado, hover)
}

export function estiloTramoPendienteEnMapa(
  tramo: CanalTramo | undefined,
  seleccionado: boolean,
  hover = false
): PathOptions {
  const estado = tramo?.estado ?? "pendiente"
  return estiloLineaTramo(colorEstadoTramoEnMapa(estado, tramo?.codigo), seleccionado, hover)
}

export function estiloSegmentoTramoEnMapa(
  tramo: CanalTramo | undefined,
  tipo: "minitramo" | "pendiente" | "ejecutado",
  seleccionado: boolean,
  hover = false,
  estadoSegmento?: EstadoTramo,
  mostrarMinitramosTerminados = true,
  mapaConsolidado = false
): PathOptions {
  const codigo = tramo?.codigo
  const esSegmentoColoreado = tipo === "minitramo" || tipo === "ejecutado"
  const segEstado = esSegmentoColoreado
    ? (estadoSegmento ?? "en_ejecucion")
    : (estadoSegmento ?? "pendiente")

  const mttTerminadoVisible =
    esSegmentoColoreado &&
    segEstado === "terminado" &&
    mostrarMinitramosTerminados

  if (mapaConsolidado && !mttTerminadoVisible) {
    return estiloLineaTramo(COLOR_TRAMO_CONSOLIDADO, seleccionado, hover)
  }

  if (esSegmentoColoreado) {
    const color =
      segEstado === "terminado" && !mostrarMinitramosTerminados
        ? colorEstadoTramoEnMapa("pendiente", codigo)
        : colorEstadoTramoEnMapa(segEstado, codigo)
    return estiloLineaTramo(color, seleccionado, hover)
  }
  return estiloLineaTramo(colorEstadoTramoEnMapa(segEstado, codigo), seleccionado, hover)
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
