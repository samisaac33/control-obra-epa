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
  asignarVolquetasFlotaEnActividades,
  type ActividadTramoCronograma,
  type DiaCronogramaFrente,
  objetivosM3PorDiaProgramatico,
} from "@/src/lib/libro-obra-cronograma-frente"

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
  m3Tendido: number
): ActividadTramoCronograma {
  const m3r = Math.round(m3DelDia * 100) / 100
  const pkDesde = metrosDesdeM3Intervencion(intervencion, acumM3Antes)
  const pkHasta = metrosDesdeM3Intervencion(intervencion, acumM3Antes + m3r)
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
  }
}

/** Reparte nDias entre bloques según peso (m³), mínimo 1 día por bloque con volumen. */
export function repartirDiasEntreBloques(nDias: number, pesos: number[]): number[] {
  if (nDias <= 0 || pesos.length === 0) return []
  const sum = pesos.reduce((a, b) => a + b, 0)
  if (sum <= 0) return pesos.map(() => 0)

  const out = pesos.map((p) => (p > 0 ? Math.max(1, Math.round((p / sum) * nDias)) : 0))
  let drift = nDias - out.reduce((a, b) => a + b, 0)
  let idx = 0
  while (drift > 0 && pesos.length > 0) {
    if (pesos[idx]! > 0) {
      out[idx]!++
      drift--
    }
    idx = (idx + 1) % pesos.length
  }
  while (drift < 0) {
    const j = out.findIndex((d, k) => d > 1 && pesos[k]! > 0)
    if (j < 0) break
    out[j]!--
    drift++
  }
  return out
}

function construirCronogramaTrasvase(dias: string[]): Map<string, ActividadTramoCronograma[]> {
  const porFecha = new Map<string, ActividadTramoCronograma[]>()
  for (const f of dias) porFecha.set(f, [])

  const intervenciones = INTERVENCIONES_TRASVASE_PLANILLA_1
  const diasPorBloque = repartirDiasEntreBloques(
    dias.length,
    intervenciones.map((i) => i.volumenM3)
  )

  let diaIndex = 0
  for (let b = 0; b < intervenciones.length; b++) {
    const intervencion = intervenciones[b]!
    const nDias = diasPorBloque[b] ?? 0
    if (nDias <= 0) continue

    const objetivos = objetivosM3PorDiaProgramatico(nDias, intervencion.volumenM3)
    let acum = 0
    for (let d = 0; d < nDias && diaIndex < dias.length; d++, diaIndex++) {
      const fecha = dias[diaIndex]!
      const m3 = objetivos[d] ?? 0
      if (m3 <= 0) continue
      const act = actividadDesdeIntervencion(intervencion, m3, acum, 0, 0)
      acum += m3
      porFecha.get(fecha)!.push(act)
    }
  }

  return porFecha
}

function construirCronogramaSanAntonio(dias: string[]): Map<string, ActividadTramoCronograma[]> {
  const porFecha = new Map<string, ActividadTramoCronograma[]>()
  const intervencion = INTERVENCION_SAN_ANTONIO_PLANILLA_1
  const objetivos = objetivosM3PorDiaProgramatico(dias.length, intervencion.volumenM3)
  let acum = 0
  for (let i = 0; i < dias.length; i++) {
    const fecha = dias[i]!
    const m3 = objetivos[i] ?? 0
    const acts: ActividadTramoCronograma[] = []
    if (m3 > 0) {
      acts.push(actividadDesdeIntervencion(intervencion, m3, acum, 0, 0))
      acum += m3
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
    dia.actividades = asignarVolquetasFlotaEnActividades(acts)
  }
}

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
      actividades: asignarVolquetasFlotaEnActividades(porFecha.get(fecha) ?? []),
    }))
  }

  return dias.map((fecha) => ({ fecha, frente, actividades: [] }))
}