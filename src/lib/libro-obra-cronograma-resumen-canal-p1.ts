import {
  DESALOJO_M3_PLANILLA_1_TRASVASE,
  INTERVENCIONES_TRASVASE_PLANILLA_1,
  INTERVENCION_SAN_ANTONIO_PLANILLA_1,
  nombreTramoResumenCanal,
  TENDIDO_M3_PLANILLA_1_TRASVASE,
  type IntervencionResumenCanalPlanilla1,
} from "@/src/data/planilla/libro-obra-resumen-canal-planilla-1"
import type { FrenteDesazolveVae } from "@/src/data/planilla/canales-desazolve-tramos-vae"
import { fechasCalendarioInclusive } from "@/src/lib/libro-obra"
import {
  excavadorasNecesariasParaM3,
  JORNADA_OBRA_MAX_H,
  JORNADA_OBRA_NOMINAL_H,
  m3MaximoUnaExcavadoraJornada,
  asignarVolquetasDesalojoPorLinea,
  volquetasNecesariasParaM3Desalojo,
} from "@/src/lib/libro-obra-capacidad-maquinaria"
import {
  type ActividadTramoCronograma,
  type DiaCronogramaFrente,
} from "@/src/lib/libro-obra-cronograma-frente"

/** Tramos trasvase en paralelo por día (con SA suma 4–6 líneas en hoja consolidada). */
export const TRAMOS_TRASVASE_PARALELOS_POR_DIA = 5

/** Solo estos 3 días San Antonio trabaja con 1 excavadora (resto del período: 2). */
export const FECHAS_SAN_ANTONIO_UNA_EXCAVADORA = new Set([
  "2026-11-23",
  "2026-11-24",
  "2026-11-25",
])

type EstadoIntervencion = {
  intervencion: IntervencionResumenCanalPlanilla1
  restanteM3: number
  acumuladoM3: number
}

function metrosDesdeM3Intervencion(intervencion: IntervencionResumenCanalPlanilla1, m3: number): number {
  if (m3 <= 0 || intervencion.volumenM3 <= 0) return 0
  return (m3 / intervencion.volumenM3) * intervencion.longitudM
}

function idIntervencion(i: IntervencionResumenCanalPlanilla1): string {
  return `resumen-canal-map-${i.mapa}`
}

function actividadDesdeIntervencion(
  intervencion: IntervencionResumenCanalPlanilla1,
  m3DelDia: number,
  acumM3Antes: number,
  m3Desalojo: number,
  m3Tendido: number,
  excavadorasOverride?: number
): ActividadTramoCronograma {
  const m3r = Math.round(m3DelDia * 100) / 100
  const pkDesde = metrosDesdeM3Intervencion(intervencion, acumM3Antes)
  const pkHasta = metrosDesdeM3Intervencion(intervencion, acumM3Antes + m3r)
  const excavadoras =
    excavadorasOverride ??
    excavadorasNecesariasParaM3(m3r, intervencion, JORNADA_OBRA_NOMINAL_H)
  return {
    tramoId: idIntervencion(intervencion),
    tramoNombre: nombreTramoResumenCanal(intervencion),
    m3Desazolve: m3r,
    m3Desalojo: Math.round(m3Desalojo * 100) / 100,
    m3Tendido: Math.round(m3Tendido * 100) / 100,
    metrosLineales: Math.round((pkHasta - pkDesde) * 10) / 10,
    pkDesdeM: Math.round(pkDesde * 10) / 10,
    pkHastaM: Math.round(pkHasta * 10) / 10,
    longitudTramoM: intervencion.longitudM,
    volquetas: 0,
    excavadorasEnFrente: excavadoras,
  }
}

function capM3DiaIntervencion(
  intervencion: IntervencionResumenCanalPlanilla1,
  excavadoras: number,
  horasJornada = JORNADA_OBRA_NOMINAL_H
): number {
  const porExc = m3MaximoUnaExcavadoraJornada(intervencion, horasJornada)
  return Math.round(porExc * excavadoras * 100) / 100
}

function redondearReparto(pesos: number[], total: number): number[] {
  if (pesos.length === 0) return []
  const sum = pesos.reduce((a, b) => a + b, 0)
  if (sum <= 0) return pesos.map(() => 0)
  const raw = pesos.map((p) => (p / sum) * total)
  const out = raw.map((x) => Math.round(x * 100) / 100)
  const drift = total - out.reduce((a, b) => a + b, 0)
  if (out.length > 0) out[out.length - 1]! += Math.round(drift * 100) / 100
  return out
}

/**
 * Varias intervenciones MAP en paralelo cada día (~5 frentes trasvase).
 * El cupo del día se reparte entre las primeras N con volumen pendiente.
 */
function construirCronogramaTrasvase(dias: string[]): Map<string, ActividadTramoCronograma[]> {
  const porFecha = new Map<string, ActividadTramoCronograma[]>()
  for (const f of dias) porFecha.set(f, [])

  const estados: EstadoIntervencion[] = INTERVENCIONES_TRASVASE_PLANILLA_1.map((intervencion) => ({
    intervencion,
    restanteM3: intervencion.volumenM3,
    acumuladoM3: 0,
  }))

  for (let dayIdx = 0; dayIdx < dias.length; dayIdx++) {
    const fecha = dias[dayIdx]!
    const pendientes = estados.filter((e) => e.restanteM3 > 0.01)
    if (pendientes.length === 0) continue

    const nLineas = Math.min(TRAMOS_TRASVASE_PARALELOS_POR_DIA, pendientes.length)
    const activas = pendientes.slice(0, nLineas)
    const diasRestantes = dias.length - dayIdx
    const totalPendiente = pendientes.reduce((s, e) => s + e.restanteM3, 0)
    const objetivoDia = totalPendiente / diasRestantes

    const pesos = activas.map((e) => e.restanteM3)
    const cuotas = redondearReparto(pesos, objetivoDia)

    for (let i = 0; i < activas.length; i++) {
      const est = activas[i]!
      let m3 = Math.min(est.restanteM3, cuotas[i] ?? 0)
      if (m3 <= 0.001) continue

      const exc = excavadorasNecesariasParaM3(m3, est.intervencion, JORNADA_OBRA_NOMINAL_H)
      const cap = capM3DiaIntervencion(est.intervencion, exc, JORNADA_OBRA_MAX_H)
      if (m3 > cap && cap > 0) m3 = Math.min(m3, cap)

      if (i === activas.length - 1) {
        const ya = porFecha.get(fecha)!.reduce((s, a) => s + a.m3Desazolve, 0)
        const ajuste = Math.min(
          est.restanteM3,
          Math.max(0, objetivoDia - ya)
        )
        if (ajuste > m3) m3 = ajuste
      }

      m3 = Math.round(m3 * 100) / 100
      if (m3 <= 0) continue

      const act = actividadDesdeIntervencion(est.intervencion, m3, est.acumuladoM3, 0, 0)
      est.restanteM3 = Math.round((est.restanteM3 - m3) * 100) / 100
      est.acumuladoM3 += m3
      porFecha.get(fecha)!.push(act)
    }
  }

  for (const est of estados) {
    if (est.restanteM3 <= 0.5) continue
    const ultima = dias[dias.length - 1]!
    const m3 = est.restanteM3
    const acts = porFecha.get(ultima) ?? []
    const prev = acts.find((a) => a.tramoId === idIntervencion(est.intervencion))
    if (prev) {
      const acumAntes = est.acumuladoM3 - prev.m3Desazolve
      const idx = acts.indexOf(prev)
      acts[idx] = actividadDesdeIntervencion(
        est.intervencion,
        prev.m3Desazolve + m3,
        acumAntes,
        prev.m3Desalojo,
        prev.m3Tendido
      )
    } else {
      acts.push(actividadDesdeIntervencion(est.intervencion, m3, est.acumuladoM3, 0, 0))
      porFecha.set(ultima, acts)
    }
    est.restanteM3 = 0
    est.acumuladoM3 += m3
  }

  return porFecha
}

function excavadorasSanAntonioEnFecha(fecha: string): number {
  return FECHAS_SAN_ANTONIO_UNA_EXCAVADORA.has(fecha) ? 1 : 2
}

function construirCronogramaSanAntonio(dias: string[]): Map<string, ActividadTramoCronograma[]> {
  const porFecha = new Map<string, ActividadTramoCronograma[]>()
  const intervencion = INTERVENCION_SAN_ANTONIO_PLANILLA_1
  const objetivosBase = intervencion.volumenM3 / dias.length
  let acum = 0
  let drift = intervencion.volumenM3

  for (let dayIdx = 0; dayIdx < dias.length; dayIdx++) {
    const fecha = dias[dayIdx]!
    const excavadoras = excavadorasSanAntonioEnFecha(fecha)
    const capDia = capM3DiaIntervencion(intervencion, excavadoras, JORNADA_OBRA_MAX_H)
    let m3 =
      dayIdx === dias.length - 1
        ? Math.round(drift * 100) / 100
        : Math.min(capDia, objetivosBase, drift)
    m3 = Math.round(m3 * 100) / 100

    const acts: ActividadTramoCronograma[] = []
    if (m3 > 0) {
      acts.push(actividadDesdeIntervencion(intervencion, m3, acum, 0, 0, excavadoras))
      acum += m3
      drift -= m3
    }
    porFecha.set(fecha, acts)
  }

  return porFecha
}

/** Distribuye desalojo/tendido trasvase en el período (Σ = capM3). */
export function aplicarDesalojoTendidoTrasvaseCap(
  cronograma: DiaCronogramaFrente[],
  capDesalojo: number,
  capTendido: number
): void {
  const targets = cronograma.map((d) =>
    d.actividades.reduce((s, a) => s + a.m3Desazolve, 0)
  )
  const totalDesazolve = targets.reduce((a, b) => a + b, 0)
  if (totalDesazolve <= 0) return

  const desalojos = targets.map((t) => (t / totalDesazolve) * capDesalojo)
  const tendidos = targets.map((t) => (t / totalDesazolve) * capTendido)
  const redDes = desalojos.map((x) => Math.round(x * 100) / 100)
  const redTen = tendidos.map((x) => Math.round(x * 100) / 100)

  let driftD = capDesalojo - redDes.reduce((a, b) => a + b, 0)
  let driftT = capTendido - redTen.reduce((a, b) => a + b, 0)
  const lastIdx = redDes.length - 1
  if (lastIdx >= 0) {
    redDes[lastIdx] = Math.round((redDes[lastIdx]! + driftD) * 100) / 100
    redTen[lastIdx] = Math.round((redTen[lastIdx]! + driftT) * 100) / 100
  }

  for (let i = 0; i < cronograma.length; i++) {
    const dia = cronograma[i]!
    if (dia.actividades.length === 0) continue
    const m3DesDia = redDes[i] ?? 0
    const m3TenDia = redTen[i] ?? 0
    const totalM3 = dia.actividades.reduce((s, a) => s + a.m3Desazolve, 0)
    let asignadoD = 0
    let asignadoT = 0
    const acts = dia.actividades.map((a, j) => {
      const isLast = j === dia.actividades.length - 1
      const d = isLast
        ? Math.round((m3DesDia - asignadoD) * 100) / 100
        : Math.round(((a.m3Desazolve / totalM3) * m3DesDia) * 100) / 100
      const t = isLast
        ? Math.round((m3TenDia - asignadoT) * 100) / 100
        : Math.round(((a.m3Desazolve / totalM3) * m3TenDia) * 100) / 100
      asignadoD += d
      asignadoT += t
      return { ...a, m3Desalojo: d, m3Tendido: t }
    })
    dia.actividades = asignarVolquetasDesalojoPorLinea(acts)
  }
}

export { m3MaximoUnaExcavadoraJornada }

export function cronogramaLibroObraResumenCanalPlanilla1(
  frente: FrenteDesazolveVae,
  desde: string,
  hasta: string
): DiaCronogramaFrente[] {
  const dias = fechasCalendarioInclusive(desde, hasta)
  if (dias.length === 0) return []

  if (frente === "trasvase") {
    const porFecha = construirCronogramaTrasvase(dias)
    const result = dias.map((fecha) => ({
      fecha,
      frente,
      actividades: porFecha.get(fecha) ?? [],
    }))
    aplicarDesalojoTendidoTrasvaseCap(
      result,
      DESALOJO_M3_PLANILLA_1_TRASVASE,
      TENDIDO_M3_PLANILLA_1_TRASVASE
    )
    return result
  }

  if (frente === "san_antonio") {
    const porFecha = construirCronogramaSanAntonio(dias)
    return dias.map((fecha) => ({
      fecha,
      frente,
      actividades: porFecha.get(fecha) ?? [],
    }))
  }

  return dias.map((fecha) => ({ fecha, frente, actividades: [] }))
}