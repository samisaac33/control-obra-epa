import { colorEstadoTramo } from "@/src/data/tramos/types"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import { etiquetaLetra, puntoEnEjecucionOperativo } from "@/src/lib/tramo-geometria"

export function htmlMarcadorPuntoAvance(
  punto: TramoPuntoAvance,
  iconSize: number,
  fontSize: number
): string {
  const label = punto.rol ? etiquetaLetra(punto.rol) : ""
  const enEjecucion = puntoEnEjecucionOperativo(punto)
  const orden = punto.rol ? punto.rol.charCodeAt(0) - 96 : 0
  const fillColor = label
    ? enEjecucion
      ? colorEstadoTramo("en_ejecucion")
      : orden % 2 === 0
        ? "#ea580c"
        : "#2563eb"
    : enEjecucion
      ? colorEstadoTramo("en_ejecucion")
      : "#16a34a"

  const pulseClass = enEjecucion ? " mapa-punto-en-ejecucion" : ""
  const inner = label
    ? `<span>${label}</span>`
    : `<span class="mapa-punto-sin-rol" aria-hidden="true"></span>`

  return `<div class="mapa-punto-marcador${pulseClass}" style="--mapa-punto-fill:${fillColor};width:${iconSize}px;height:${iconSize}px;font-size:${fontSize}px">${inner}</div>`
}
