/**
 * Medición Planilla 1 — pestaña «resumen canal (2)», RESUMEN DE CANTIDADES EPA2.
 * Período: 27-oct-2026 – 25-nov-2026.
 */

import type { FrenteDesazolveVae } from "@/src/data/planilla/canales-desazolve-tramos-vae"

export type IntervencionResumenCanalPlanilla1 = {
  mapa: number
  tramoLabel: string
  sector: string
  longitudM: number
  volumenM3: number
  frente: FrenteDesazolveVae
}

function intervencion(
  mapa: number,
  tramoLabel: string,
  sector: string,
  longitudM: number,
  volumenM3: number,
  frente: FrenteDesazolveVae
): IntervencionResumenCanalPlanilla1 {
  return { mapa, tramoLabel, sector, longitudM, volumenM3, frente }
}

/** Columna I — trasvase (Σ = 447 697,5282 m³). */
export const INTERVENCIONES_TRASVASE_PLANILLA_1: IntervencionResumenCanalPlanilla1[] = [
  intervencion(1, "TRAMO 22", "EL MANGO", 6450, 86_105.565, "trasvase"),
  intervencion(2, "TRAMO 24", "MESIAS PRIMER TRAMO", 9978, 123_863.8986, "trasvase"),
  intervencion(4, "TRAMO18", "GILSES", 3262, 40_264.497, "trasvase"),
  intervencion(5, "TRAMO 23", "SEQUITA", 2008, 23_986.9656, "trasvase"),
  intervencion(6, "TRAMO 19", "LOS RANCHOS", 4396, 52_564.7304, "trasvase"),
  intervencion(7, "TRAMO 40", "LAS JAGUAS SA", 3352, 40_198.86, "trasvase"),
  intervencion(8, "TRAMO 10", "CA LAS MARAVILLAS", 1838, 27_009.7776, "trasvase"),
  intervencion(9, "TRAMO12", "MINA DE ORO", 1444, 17_317.17, "trasvase"),
  intervencion(10, "TRAMO13", "CALIFORNIA", 2945, 36_386.064, "trasvase"),
]

export const INTERVENCION_SAN_ANTONIO_PLANILLA_1 = intervencion(
  11,
  "TRAMO 40",
  "SAN ANTONIO",
  1125,
  54_486.9,
  "san_antonio"
)

export const VOLUMEN_DESAZOLVE_TRASVASE_PLANILLA_1 = INTERVENCIONES_TRASVASE_PLANILLA_1.reduce(
  (s, i) => s + i.volumenM3,
  0
)

export const VOLUMEN_DESAZOLVE_SAN_ANTONIO_PLANILLA_1 = INTERVENCION_SAN_ANTONIO_PLANILLA_1.volumenM3

export const DESALOJO_M3_PLANILLA_1_TRASVASE = 40_000
export const TENDIDO_M3_PLANILLA_1_TRASVASE = 40_000

export const FECHA_INICIO_PLANILLA_1_RESUMEN_CANAL = "2026-10-27"
export const FECHA_FIN_PLANILLA_1_RESUMEN_CANAL = "2026-11-25"

export function esPeriodoPlanilla1ResumenCanal(desde: string, hasta: string): boolean {
  return desde === FECHA_INICIO_PLANILLA_1_RESUMEN_CANAL && hasta === FECHA_FIN_PLANILLA_1_RESUMEN_CANAL
}

export function nombreTramoResumenCanal(i: IntervencionResumenCanalPlanilla1): string {
  return `${i.tramoLabel} — ${i.sector.trim()}`
}