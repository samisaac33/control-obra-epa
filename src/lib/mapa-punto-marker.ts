import { colorEstadoTramo } from "@/src/data/tramos/types"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import { etiquetaLetra } from "@/src/lib/tramo-geometria"

export function htmlMarcadorPuntoAvance(
  punto: TramoPuntoAvance,
  iconSize: number,
  fontSize: number,
  parpadeoFrente = false
): string {
  const label = punto.rol ? etiquetaLetra(punto.rol) : ""
  const orden = punto.rol ? punto.rol.charCodeAt(0) - 96 : 0
  const fillColor = label
    ? parpadeoFrente
      ? colorEstadoTramo("en_ejecucion")
      : orden % 2 === 0
        ? "#ea580c"
        : "#2563eb"
    : parpadeoFrente
      ? colorEstadoTramo("en_ejecucion")
      : "#16a34a"

  const pulseClass = parpadeoFrente ? " mapa-punto-en-ejecucion" : ""
  const inner = label
    ? `<span>${label}</span>`
    : `<span class="mapa-punto-sin-rol" aria-hidden="true"></span>`

  return `<div class="mapa-punto-marcador${pulseClass}" style="--mapa-punto-fill:${fillColor};width:${iconSize}px;height:${iconSize}px;font-size:${fontSize}px">${inner}</div>`
}
