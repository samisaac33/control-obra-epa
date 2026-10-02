import type { RelojPublicoFechasPeriodo } from "@/src/data/infimas/reloj-publico-types"

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

export function mesInicioPeriodoDesdeIndice(indice: number, anioBase = 2026, mesBase = 7): { anio: number; mes: number } {
  const offset = mesBase - 1 + indice
  return { anio: anioBase + Math.floor(offset / 12), mes: (offset % 12) + 1 }
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
