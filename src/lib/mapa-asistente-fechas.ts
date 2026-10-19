const ZONA_ECUADOR = "America/Guayaquil"

export type IntencionFechaConsulta =
  | { tipo: "dia"; fechas: [string] }
  | { tipo: "rango"; desde: string; hasta: string }
  | { tipo: "reciente" }

function partesYmdEnEcuador(ref: Date): { y: number; m: number; d: number } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_ECUADOR,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(ref)
  const y = Number(parts.find((p) => p.type === "year")?.value)
  const m = Number(parts.find((p) => p.type === "month")?.value)
  const d = Number(parts.find((p) => p.type === "day")?.value)
  return { y, m, d }
}

function ymdDesdePartes(y: number, m: number, d: number): string {
  const dt = new Date(Date.UTC(y, m - 1, d))
  return dt.toISOString().slice(0, 10)
}

/** Fecha calendario YYYY-MM-DD en Ecuador para `ref` + desplazamiento en días. */
export function fechaCalendarioEcuador(ref: Date, offsetDias: number): string {
  const { y, m, d } = partesYmdEnEcuador(ref)
  return ymdDesdePartes(y, m, d + offsetDias)
}

/** Convierte un instante ISO a fecha calendario en Ecuador. */
export function fechaCalendarioDesdeIso(iso: string): string {
  const ref = new Date(iso)
  if (Number.isNaN(ref.getTime())) return ""
  const { y, m, d } = partesYmdEnEcuador(ref)
  return ymdDesdePartes(y, m, d)
}

function addDaysYmd(ymd: string, days: number): string {
  const [y, m, d] = ymd.split("-").map(Number)
  return ymdDesdePartes(y, m, d + days)
}

const ISO_DATE = /\b(20\d{2})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])\b/

/**
 * Interpreta referencias temporales en español dentro de la pregunta del usuario.
 * `ahora` es inyectable en tests.
 */
export function detectarIntencionFechaConsulta(
  texto: string,
  ahora: Date = new Date()
): IntencionFechaConsulta {
  const t = texto.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()

  const iso = ISO_DATE.exec(texto)
  if (iso) {
    return { tipo: "dia", fechas: [iso[0] as string] }
  }

  if (/\bantier\b/.test(t)) {
    const f = fechaCalendarioEcuador(ahora, -2)
    return { tipo: "dia", fechas: [f] }
  }

  if (/\bayer\b/.test(t)) {
    const f = fechaCalendarioEcuador(ahora, -1)
    return { tipo: "dia", fechas: [f] }
  }

  if (/\bhoy\b/.test(t)) {
    const f = fechaCalendarioEcuador(ahora, 0)
    return { tipo: "dia", fechas: [f] }
  }

  if (/ultima semana|ultimos 7 dias|última semana|últimos 7 días/.test(t)) {
    const hasta = fechaCalendarioEcuador(ahora, 0)
    const desde = fechaCalendarioEcuador(ahora, -6)
    return { tipo: "rango", desde, hasta }
  }

  return { tipo: "reciente" }
}

export function fechasEnRango(desde: string, hasta: string): string[] {
  const out: string[] = []
  let cur = desde
  while (cur <= hasta) {
    out.push(cur)
    if (cur === hasta) break
    cur = addDaysYmd(cur, 1)
  }
  return out
}

export function etiquetaZonaHorariaAsistente(): string {
  return ZONA_ECUADOR
}
