"use client"

import { useMemo } from "react"
import { Polyline, Tooltip } from "react-leaflet"

import type { CanalTramo } from "@/src/data/tramos/types"
import { CONEXIONES_PROPUESTAS_DESASOLVE } from "@/src/data/tramos/conexiones-propuestas-desasolve"
import { listarBrechasMapa, type BrechaConexion } from "@/src/lib/mapa-tramos-topologia"

type MapaTramosBrechasCapaProps = {
  tramos: CanalTramo[]
  mostrarBrechas: boolean
  incluirBrechasAuto: boolean
}

function estiloBrecha(b: BrechaConexion): { color: string; weight: number; dashArray: string } {
  if (b.origen === "propuesta") {
    if (b.prioridad === "alta" || b.distancia_m > 500) {
      return { color: "#dc2626", weight: 4, dashArray: "10 8" }
    }
    return { color: "#ea580c", weight: 3, dashArray: "8 6" }
  }
  return { color: "#94a3b8", weight: 2, dashArray: "4 6" }
}

function etiquetaBrecha(b: BrechaConexion): string {
  const na = b.numeroA ?? b.codigoA
  const nb = b.numeroB ?? b.codigoB
  const dist = `${Math.round(b.distancia_m)} m`
  if (b.nota) return `Tramo ${na} ↔ ${nb} (${dist})\n${b.nota}`
  return `Brecha ${na} ↔ ${nb}: ${dist}`
}

export function MapaTramosBrechasCapa({
  tramos,
  mostrarBrechas,
  incluirBrechasAuto,
}: MapaTramosBrechasCapaProps) {
  const brechas = useMemo(
    () =>
      mostrarBrechas
        ? listarBrechasMapa(tramos, CONEXIONES_PROPUESTAS_DESASOLVE, incluirBrechasAuto)
        : [],
    [tramos, mostrarBrechas, incluirBrechasAuto]
  )

  if (!mostrarBrechas || brechas.length === 0) return null

  return (
    <>
      {brechas.map((b) => {
        const key = `${b.origen}-${b.tramoAId}-${b.tramoBId}`
        const style = estiloBrecha(b)
        return (
          <Polyline
            key={key}
            positions={[
              [b.latA, b.lngA],
              [b.latB, b.lngB],
            ]}
            pathOptions={{
              color: style.color,
              weight: style.weight,
              opacity: 0.85,
              dashArray: style.dashArray,
              lineCap: "round",
            }}
            interactive
          >
            <Tooltip sticky direction="top" className="mapa-brecha-tooltip">
              {etiquetaBrecha(b)}
            </Tooltip>
          </Polyline>
        )
      })}
    </>
  )
}
