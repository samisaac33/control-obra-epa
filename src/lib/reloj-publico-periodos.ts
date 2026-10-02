import type { RelojPublicoFechasPeriodo, RelojPublicoInformeFila } from "@/src/data/infimas/reloj-publico-types"

const MESES_CORTOS = [
  "ene",
  "feb",
  "mar",
  "abr",
  "may",
  "jun",
  "jul",
  "ago",
  "sep",
  "oct",
  "nov",
  "dic",
] as const

const MESES_LARGOS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const

function padIso(y: number, m: number, d: number): string {
  return `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`
}

function parseIso(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number)
  return new Date(y, m - 1, d)
}

function addMonths(year: number, monthIndex: number, delta: number): { year: number; monthIndex: number } {
  const d = new Date(year, monthIndex + delta, 1)
  return { year: d.getFullYear(), monthIndex: d.getMonth() }
}

export function calcularFechasPeriodo(anioInicio: number, mesInicio: number): RelojPublicoFechasPeriodo {
  const inicio = padIso(anioInicio, mesInicio, 7)
  const finMes = addMonths(anioInicio, mesInicio - 1, 1)
  const fin = padIso(finMes.year, finMes.monthIndex + 1, 6)
  const notificacion = padIso(anioInicio, mesInicio, 4)
  const entregaInforme = fin
  return { inicio, fin, notificacion, entregaInforme }
}

export function formatearDiaMesCorto(fecha: Date): string {
  return `${fecha.getDate()} ${MESES_CORTOS[fecha.getMonth()]}`
}

export function formatearDiaMesLargo(fecha: Date): string {
  return `${fecha.getDate()} de ${MESES_LARGOS[fecha.getMonth()]}`
}

export function formatearFechaCarta(iso: string, ciudad = "Portoviejo"): string {
  const f = parseIso(iso)
  const mes = MESES_LARGOS[f.getMonth()]
  const anio = f.getFullYear()
  return `${ciudad}, ${f.getDate()} de ${mes} del ${anio}`
}

export function formatearPeriodoLargo(inicioIso: string, finIso: string): string {
  const ini = parseIso(inicioIso)
  const fin = parseIso(finIso)
  return `del ${formatearDiaMesLargo(ini)} de ${ini.getFullYear()} al ${formatearDiaMesLargo(fin)} de ${fin.getFullYear()}`
}

export function formatearPeriodoCorto(inicioIso: string, finIso: string): string {
  const ini = parseIso(inicioIso)
  const fin = parseIso(finIso)
  return `del ${formatearDiaMesCorto(ini)} ${ini.getFullYear()} al ${formatearDiaMesCorto(fin)} ${fin.getFullYear()}`
}

export function etiquetaPeriodo(anioInicio: number, mesInicio: number): string {
  const finMes = addMonths(anioInicio, mesInicio - 1, 1)
  const iniLabel = `${MESES_CORTOS[mesInicio - 1]} ${String(anioInicio).slice(-2)}`
  const finLabel = `${MESES_CORTOS[finMes.monthIndex]} ${String(finMes.year).slice(-2)}`
  return `${iniLabel} – ${finLabel}`
}

export function partirEnSemanas(inicioIso: string, finIso: string): { inicio: Date; fin: Date }[] {
  const inicio = parseIso(inicioIso)
  const fin = parseIso(finIso)
  const semanas: { inicio: Date; fin: Date }[] = []
  let cursor = new Date(inicio)

  while (cursor <= fin) {
    const weekStart = new Date(cursor)
    const weekEnd = new Date(cursor)
    weekEnd.setDate(weekEnd.getDate() + 6)
    if (weekEnd > fin) {
      semanas.push({ inicio: weekStart, fin: new Date(fin) })
      break
    }
    semanas.push({ inicio: weekStart, fin: weekEnd })
    cursor = new Date(weekEnd)
    cursor.setDate(cursor.getDate() + 1)
  }

  return semanas
}

function etiquetaSemana(inicio: Date, fin: Date): string {
  const iniMes = MESES_CORTOS[inicio.getMonth()]
  const finMes = MESES_CORTOS[fin.getMonth()]
  if (iniMes === finMes) {
    return `${inicio.getDate()} ${iniMes} - ${fin.getDate()} ${finMes}`
  }
  return `${inicio.getDate()} ${iniMes} - ${fin.getDate()} ${finMes}`
}

const ACTIVIDAD_BASE = `Mantenimiento preventivo semanal (OC ítem 1): limpieza general del reloj (ruedas dentadas, engranajes, mecanismo de disparo, campanas, cuerdas y pesas).
Engrasamiento de cuerdas en los tres rollos y carretes; suministro de cuerda a pesas, campanas y reloj con aceites técnicos.`

function diaSemana(fecha: Date): number {
  return fecha.getDay()
}

function nombreDia(fecha: Date): string {
  const nombres = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"]
  return nombres[diaSemana(fecha)]
}

function formatearDiaMesParaObs(fecha: Date): string {
  return `${nombreDia(fecha)} ${fecha.getDate()}`
}

function generarObservacionSemana(inicio: Date, fin: Date): string {
  const aceites: string[] = []
  const engrasadas: string[] = []
  const cursor = new Date(inicio)
  while (cursor <= fin) {
    const d = diaSemana(cursor)
    if (d === 1 || d === 4) {
      aceites.push(formatearDiaMesParaObs(cursor))
    }
    if (d === 3) {
      engrasadas.push(formatearDiaMesParaObs(cursor))
    }
    cursor.setDate(cursor.getDate() + 1)
  }

  const partes: string[] = []
  if (aceites.length > 0) {
    const conectores = aceites.length === 1 ? aceites[0] : `${aceites.slice(0, -1).join(", ")} y ${aceites[aceites.length - 1]}`
    partes.push(`Aceitada de ruedas ${conectores}.`)
  }
  if (engrasadas.length > 0) {
    partes.push(`Engrasada de ruedas ${engrasadas.join(" y ")}.`)
  }

  return partes.join("\n")
}

export function generarFilasInformePlantilla(
  inicioIso: string,
  finIso: string,
  overrides?: Partial<Record<number, Partial<RelojPublicoInformeFila>>>
): RelojPublicoInformeFila[] {
  const semanas = partirEnSemanas(inicioIso, finIso)
  return semanas.map((sem, index) => {
    const anio = sem.inicio.getFullYear()
    const base: RelojPublicoInformeFila = {
      semanaLabel: etiquetaSemana(sem.inicio, sem.fin),
      anio,
      actividad: ACTIVIDAD_BASE,
      observacion: generarObservacionSemana(sem.inicio, sem.fin),
    }
    const override = overrides?.[index]
    return override ? { ...base, ...override } : base
  })
}

export function construirTextosPeriodo(anioInicio: number, mesInicio: number) {
  const fechas = calcularFechasPeriodo(anioInicio, mesInicio)
  return {
    fechas,
    fechasTexto: {
      periodoLargo: formatearPeriodoLargo(fechas.inicio, fechas.fin),
      periodoCorto: formatearPeriodoCorto(fechas.inicio, fechas.fin),
      notificacion: formatearFechaCarta(fechas.notificacion),
      entregaInforme: formatearFechaCarta(fechas.entregaInforme),
    },
    etiqueta: etiquetaPeriodo(anioInicio, mesInicio),
    id: `${anioInicio}-${String(mesInicio).padStart(2, "0")}`,
  }
}
