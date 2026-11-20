import type { FrenteDesazolveVae, TramoDesazolveVae } from "@/src/data/planilla/canales-desazolve-tramos-vae"
import type { IntervencionResumenCanalPlanilla1 } from "@/src/data/planilla/libro-obra-resumen-canal-planilla-1"
import {
  horasExcavacionParaM3Dia,
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

export function volquetasNecesariasParaM3Desalojo(m3Desalojo: number): number {
  return volquetasFlotaParaM3Desalojo(m3Desalojo)
}

/** Reparte volquetas del día entre actividades según m³ desalojo por línea. */
export function repartirVolquetasDesalojoEnActividades<
  T extends { m3Desalojo: number; volquetas: number },
>(actividades: T[], volquetasDia: number): T[] {
  if (actividades.length === 0 || volquetasDia <= 0) {
    return actividades.map((a) => ({ ...a, volquetas: 0 }))
  }
  const totalDes = actividades.reduce((s, a) => s + a.m3Desalojo, 0)
  if (totalDes <= 0) {
    return actividades.map((a) => ({ ...a, volquetas: 0 }))
  }
  let asignado = 0
  const out = actividades.map((a, idx) => {
    const isLast = idx === actividades.length - 1
    const n = isLast
      ? Math.max(0, volquetasDia - asignado)
      : Math.round((a.m3Desalojo / totalDes) * volquetasDia)
    asignado += n
    return { ...a, volquetas: n }
  })
  const drift = volquetasDia - out.reduce((s, a) => s + a.volquetas, 0)
  if (drift !== 0 && out.length > 0) {
    const last = out[out.length - 1]!
    out[out.length - 1] = { ...last, volquetas: last.volquetas + drift }
  }
  return out
}