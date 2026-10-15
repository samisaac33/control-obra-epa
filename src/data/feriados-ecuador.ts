/** Feriados nacionales Ecuador (fechas ISO). Incluye 2026 y 2027. */
export const FERIADOS_ECUADOR_ISO = new Set<string>([
  // 2026
  "2026-01-01",
  "2026-02-16",
  "2026-02-17",
  "2026-04-03",
  "2026-05-01",
  "2026-05-24",
  "2026-08-10",
  "2026-10-09",
  "2026-11-02",
  "2026-11-03",
  "2026-12-25",
  // 2027
  "2027-01-01",
  "2027-02-07",
  "2027-02-08",
  "2027-03-26",
  "2027-05-01",
  "2027-05-24",
  "2027-08-10",
  "2027-10-09",
  "2027-11-02",
  "2027-11-03",
  "2027-12-25",
])

export function isoDeFecha(fecha: Date): string {
  const y = fecha.getFullYear()
  const m = String(fecha.getMonth() + 1).padStart(2, "0")
  const d = String(fecha.getDate()).padStart(2, "0")
  return `${y}-${m}-${d}`
}

export function esFeriadoEcuador(fecha: Date): boolean {
  return FERIADOS_ECUADOR_ISO.has(isoDeFecha(fecha))
}

export function esFinDeSemana(fecha: Date): boolean {
  const d = fecha.getDay()
  return d === 0 || d === 6
}

export function esDiaLaborable(fecha: Date): boolean {
  return !esFinDeSemana(fecha) && !esFeriadoEcuador(fecha)
}

export function parseIsoLocal(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

export function siguienteDiaLaborable(fecha: Date): Date {
  const next = new Date(fecha)
  next.setDate(next.getDate() + 1)
  while (!esDiaLaborable(next)) {
    next.setDate(next.getDate() + 1)
  }
  return next
}

export function ajustarDiaLaborable(fecha: Date, maxDesplazamiento = 3): Date | null {
  const cursor = new Date(fecha)
  for (let i = 0; i <= maxDesplazamiento; i++) {
    if (esDiaLaborable(cursor)) return new Date(cursor)
    cursor.setDate(cursor.getDate() + 1)
  }
  return null
}
