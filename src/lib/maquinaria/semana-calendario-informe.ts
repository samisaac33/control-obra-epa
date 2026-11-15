import { formatearFechaCorta } from "@/src/lib/maquinaria-resumen"

/** Lunes = 1 … domingo = 7 (zona local estable con mediodía UTC). */
export function diaSemanaNumeroInforme(fechaIso: string): number {
  const d = new Date(`${fechaIso}T12:00:00Z`)
  const day = d.getUTCDay()
  return day === 0 ? 7 : day
}

/** ISO del lunes de la semana calendario que contiene `fechaIso`. */
export function lunesSemanaCalendario(fechaIso: string): string {
  const d = new Date(`${fechaIso}T12:00:00Z`)
  const diff = diaSemanaNumeroInforme(fechaIso) - 1
  d.setUTCDate(d.getUTCDate() - diff)
  return d.toISOString().slice(0, 10)
}

export function domingoSemanaCalendario(lunesIso: string): string {
  const d = new Date(`${lunesIso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + 6)
  return d.toISOString().slice(0, 10)
}

export function etiquetaSemanaCalendario(lunesIso: string): string {
  const domingo = domingoSemanaCalendario(lunesIso)
  return `${formatearFechaCorta(lunesIso)} – ${formatearFechaCorta(domingo)}`
}