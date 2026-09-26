import type { CanalTramo } from "@/src/data/tramos/types"
import { coordenadaDesdeAbscisa } from "@/src/lib/tramo-geometria"

/** Número corto para etiqueta en mapa (p. ej. «21» desde «tramo 21»). */
export function numeroEtiquetaMapa(codigo: string): string | null {
  const trimmed = codigo.trim()
  if (!trimmed) return null

  const sinPrefijo = trimmed.replace(/^tremo\s+/i, "").replace(/^tramo\s+/i, "").trim()
  if (/^\d+$/.test(sinPrefijo)) return sinPrefijo

  const extraido = sinPrefijo.match(/\d+/)?.[0] ?? trimmed.match(/\d+/)?.[0]
  if (extraido) return extraido

  if (sinPrefijo.length <= 6) return sinPrefijo
  return null
}

export function centroEtiquetaTramo(tramo: CanalTramo): { lat: number; lng: number } | null {
  const abscisa = Math.max(0, tramo.longitud_m / 2)
  return coordenadaDesdeAbscisa(tramo.geometria, abscisa)
}

export function htmlEtiquetaTramoMapa(
  etiqueta: string,
  seleccionado: boolean,
  fontSizePx: number
): string {
  const selectedClass = seleccionado ? " mapa-tramo-etiqueta--selected" : ""
  return `<div class="mapa-tramo-etiqueta${selectedClass}" style="font-size:${fontSizePx}px" aria-hidden="true"><span>${etiqueta}</span></div>`
}

/** Tamaño del divIcon según dígitos de la etiqueta. */
export function tamanoIconoEtiquetaTramo(etiqueta: string): { size: number; fontSize: number } {
  const len = etiqueta.length
  if (len >= 3) return { size: 30, fontSize: 10 }
  if (len === 2) return { size: 26, fontSize: 11 }
  return { size: 22, fontSize: 12 }
}
