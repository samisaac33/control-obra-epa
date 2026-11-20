import type { FrenteDesazolveVae, TramoDesazolveVae } from "@/src/data/planilla/canales-desazolve-tramos-vae"
import type { IntervencionResumenCanalPlanilla1 } from "@/src/data/planilla/libro-obra-resumen-canal-planilla-1"
import {
  horasExcavacionParaM3Dia,
  m3MaximoUnaVolquetaJornada,
  volquetasFlotaDesalojoTrasvaseDia,
  volquetasFlotaParaM3Desalojo,
} from "@/src/lib/libro-obra-cronograma-frente"

/** Jornada típica EPA (mañana + tarde) — alineada a `JORNADA_EXCAVADORA_H`. */
export const JORNADA_OBRA_NOMINAL_H = 9

/** Techo de credibilidad / turno extendido para cálculo de flota. */
export const JORNADA_OBRA_MAX_H = 12

export function tramoSinteticoDesdeIntervencion(
  i: IntervencionResumenCanalPlanilla1
): TramoDesazolveVae {
  return {
    id: `resumen-canal-map-${i.mapa}`,
    nombre: i.sector.trim(),
    frente: i.frente,
    longitudM: i.longitudM,
    volumenM3: i.volumenM3,
  }
}

/** Máx. m³ que una excavadora ejecuta en `horasJornada` (rendimiento contractual + geometría). */
export function m3MaximoUnaExcavadoraJornada(
  intervencion: IntervencionResumenCanalPlanilla1,
  horasJornada: number = JORNADA_OBRA_NOMINAL_H
): number {
  if (horasJornada <= 0 || intervencion.volumenM3 <= 0) return 0
  const tramo = tramoSinteticoDesdeIntervencion(intervencion)
  let lo = 0
  let hi = intervencion.volumenM3
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2
    const h = horasExcavacionParaM3Dia(mid, tramo, intervencion.frente)
    if (h <= horasJornada) lo = mid
    else hi = mid
  }
  return Math.round(lo * 100) / 100
}

export function excavadorasNecesariasParaM3(
  m3: number,
  intervencion: IntervencionResumenCanalPlanilla1,
  horasJornada: number = JORNADA_OBRA_NOMINAL_H
): number {
  if (m3 <= 0) return 0
  const tramo = tramoSinteticoDesdeIntervencion(intervencion)
  const horas = horasExcavacionParaM3Dia(m3, tramo, intervencion.frente)
  if (horas <= 0) return 1
  return Math.max(1, Math.ceil(horas / horasJornada))
}

export function volquetasNecesariasParaM3Desalojo(m3Desalojo: number, excavadorasDia = 0): number {
  if (excavadorasDia > 0) {
    return volquetasFlotaDesalojoTrasvaseDia(m3Desalojo, excavadorasDia)
  }
  return volquetasFlotaParaM3Desalojo(m3Desalojo)
}

export { m3MaximoUnaVolquetaJornada }

type LineaDesalojoVolquetas = {
  m3Desalojo: number
  volquetas: number
  excavadorasEnFrente?: number
}

/** Volquetas por línea: ≥1 por excavadora y m³ ≤ capacidad de transporte jornal. */
export function asignarVolquetasDesalojoPorLinea<T extends LineaDesalojoVolquetas>(actividades: T[]): T[] {
  const cap = m3MaximoUnaVolquetaJornada()
  return actividades.map((a) => {
    if (a.m3Desalojo <= 0) return { ...a, volquetas: 0 }
    const minExc = Math.max(1, a.excavadorasEnFrente ?? 1)
    const porM3 = Math.max(1, Math.ceil(a.m3Desalojo / cap))
    return { ...a, volquetas: Math.max(minExc, porM3) }
  })
}

/** Suma de volquetas asignadas por línea (flota del día en libro). */
export function volquetasTotalesDesdeLineas<T extends LineaDesalojoVolquetas>(actividades: T[]): number {
  return asignarVolquetasDesalojoPorLinea(actividades).reduce((s, a) => s + a.volquetas, 0)
}

/** Reparte volquetas del día entre actividades (mín. 1 volqueta por excavadora con desalojo). */
export function repartirVolquetasDesalojoEnActividades<
  T extends LineaDesalojoVolquetas,
>(actividades: T[], volquetasDia: number): T[] {
  const porLinea = asignarVolquetasDesalojoPorLinea(actividades)
  const sumLinea = porLinea.reduce((s, a) => s + a.volquetas, 0)
  if (volquetasDia <= 0 || actividades.every((a) => a.m3Desalojo <= 0)) {
    return actividades.map((a) => ({ ...a, volquetas: 0 }))
  }
  if (sumLinea >= volquetasDia) return porLinea
  const idxConDes = actividades
    .map((a, i) => (a.m3Desalojo > 0 ? i : -1))
    .filter((i) => i >= 0)
  let rest = volquetasDia - sumLinea
  const out = porLinea.map((a) => ({ ...a }))
  let k = 0
  while (rest > 0 && idxConDes.length > 0) {
    const i = idxConDes[k % idxConDes.length]!
    out[i] = { ...out[i]!, volquetas: out[i]!.volquetas + 1 }
    rest--
    k++
  }
  return out
}