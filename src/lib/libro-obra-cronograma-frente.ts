import type { Rubro } from "@/data/presupuesto"
import {
  tramosPorFrente,
  volumenContratoFrente,
  type FrenteDesazolveVae,
  type TramoDesazolveVae,
} from "@/src/data/planilla/canales-desazolve-tramos-vae"
import type { PlanillaNumero, PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { fechasCalendarioInclusive } from "@/src/lib/libro-obra"
import { calcularRequerimientoPago } from "@/src/lib/planilla-requerimiento-pago"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"

/** m³ por viaje (medición tickets). */
export const M3_POR_VIAJE_VOLQUETA = 8
/** Viajes máximos por volqueta en jornada (referencia operativa). */
export const VIAJES_VOLQUETA_POR_DIA = 8

/** Tramos en paralelo en trasvase (simultaneidad). */
export const TRAMOS_SIMULTANEOS_TRASVASE = 4

export type ActividadTramoCronograma = {
  tramoId: string
  tramoNombre: string
  m3Desazolve: number
  m3Desalojo: number
  m3Tendido: number
  metrosLineales: number
  volquetas: number
}

export type DiaCronogramaFrente = {
  fecha: string
  frente: FrenteDesazolveVae
  actividades: ActividadTramoCronograma[]
}

function cantidadPeriodoRubro(
  rubros: Rubro[],
  config: ProyectoPlanillaConfig,
  periodo: PlanillaPeriodo,
  planillaNumero: PlanillaNumero,
  rubroId: number
): number {
  const { lineas } = calcularRequerimientoPago(rubros, config, periodo, planillaNumero)
  return lineas.find((l) => l.rubroId === rubroId)?.cantidadPeriodo ?? 0
}

function volquetasParaM3(m3: number): number {
  if (m3 <= 0) return 0
  const viajes = Math.ceil(m3 / M3_POR_VIAJE_VOLQUETA)
  return Math.max(1, Math.ceil(viajes / VIAJES_VOLQUETA_POR_DIA))
}

function metrosDesdeM3(tramo: TramoDesazolveVae, m3: number): number {
  if (m3 <= 0 || tramo.volumenM3 <= 0) return 0
  return (m3 / tramo.volumenM3) * tramo.longitudM
}

function actividadDesdeM3(tramo: TramoDesazolveVae, m3: number): ActividadTramoCronograma {
  const m3r = Math.round(m3 * 100) / 100
  return {
    tramoId: tramo.id,
    tramoNombre: tramo.nombre,
    m3Desazolve: m3r,
    m3Desalojo: m3r,
    m3Tendido: m3r,
    metrosLineales: Math.round(metrosDesdeM3(tramo, m3r) * 10) / 10,
    volquetas: volquetasParaM3(m3r),
  }
}

/**
 * Distribuye el volumen del periodo (rubro desazolve, VAE) entre tramos y días calendario
 * (incluye sábados y domingos). Desalojo y tendido = mismo m³ (1:1 Excel).
 */
export function cronogramaLibroObraFrente(
  frente: FrenteDesazolveVae,
  desde: string,
  hasta: string,
  rubros: Rubro[],
  config: ProyectoPlanillaConfig,
  periodo: PlanillaPeriodo,
  planillaNumero: PlanillaNumero,
  rubDesazolveId: number
): DiaCronogramaFrente[] {
  const dias = fechasCalendarioInclusive(desde, hasta)
  if (dias.length === 0) return []

  const volumenPeriodo = cantidadPeriodoRubro(rubros, config, periodo, planillaNumero, rubDesazolveId)
  if (volumenPeriodo <= 0) {
    return dias.map((fecha) => ({ fecha, frente, actividades: [] }))
  }

  const tramos = tramosPorFrente(frente)
  const volumenContrato = volumenContratoFrente(frente)
  const cupoTramo = new Map<string, number>()
  for (const t of tramos) {
    cupoTramo.set(t.id, (t.volumenM3 / volumenContrato) * volumenPeriodo)
  }

  const restante = new Map(cupoTramo)
  const m3PorDia = volumenPeriodo / dias.length
  const maxSimultaneos = frente === "trasvase" ? TRAMOS_SIMULTANEOS_TRASVASE : 1
  const porFecha = new Map<string, ActividadTramoCronograma[]>()
  let pendienteGlobal = volumenPeriodo

  for (const fecha of dias) {
    if (pendienteGlobal <= 0.001) {
      porFecha.set(fecha, [])
      continue
    }

    const objetivoDia = Math.min(m3PorDia, pendienteGlobal)
    const cola = tramos
      .filter((t) => (restante.get(t.id) ?? 0) > 0.01)
      .sort((a, b) => (restante.get(b.id) ?? 0) - (restante.get(a.id) ?? 0))

    if (cola.length === 0) {
      porFecha.set(fecha, [])
      continue
    }

    const acts: ActividadTramoCronograma[] = []
    let asignadoDia = 0
    let faltante = objetivoDia
    const activosIds = new Set<string>()

    function registrar(tramo: TramoDesazolveVae, m3: number) {
      if (m3 <= 0.001) return
      const rest = restante.get(tramo.id) ?? 0
      const uso = Math.min(rest, m3)
      if (uso <= 0.001) return
      restante.set(tramo.id, rest - uso)
      asignadoDia += uso
      faltante -= uso
      activosIds.add(tramo.id)
      const prev = acts.find((a) => a.tramoId === tramo.id)
      if (prev) {
        const idx = acts.indexOf(prev)
        acts[idx] = actividadDesdeM3(tramo, prev.m3Desazolve + uso)
      } else {
        acts.push(actividadDesdeM3(tramo, uso))
      }
    }

    while (faltante > 0.01 && activosIds.size < maxSimultaneos) {
      const candidatos = cola.filter((t) => (restante.get(t.id) ?? 0) > 0.01)
      if (candidatos.length === 0) break
      const tramo = candidatos[0]!
      const share = faltante / (maxSimultaneos - activosIds.size)
      registrar(tramo, share)
    }

    while (faltante > 0.01) {
      const candidatos = cola.filter((t) => (restante.get(t.id) ?? 0) > 0.01)
      if (candidatos.length === 0) break
      registrar(candidatos[0]!, faltante)
    }

    pendienteGlobal -= asignadoDia
    porFecha.set(fecha, acts)
  }

  if (pendienteGlobal > 0.5) {
    const ultimaFecha = [...dias].reverse().find((f) => (porFecha.get(f)?.length ?? 0) > 0)
    if (ultimaFecha) {
      const acts = porFecha.get(ultimaFecha) ?? []
      const tramo = tramos.find((t) => (restante.get(t.id) ?? 0) > 0.01) ?? tramos[0]!
      const prev = acts.find((a) => a.tramoId === tramo.id)
      const add = Math.min(restante.get(tramo.id) ?? pendienteGlobal, pendienteGlobal)
      restante.set(tramo.id, (restante.get(tramo.id) ?? 0) - add)
      if (prev) {
        const idx = acts.indexOf(prev)
        acts[idx] = actividadDesdeM3(tramo, prev.m3Desazolve + add)
      } else {
        acts.push(actividadDesdeM3(tramo, add))
      }
      porFecha.set(ultimaFecha, acts)
    }
  }

  return dias.map((fecha) => ({
    fecha,
    frente,
    actividades: porFecha.get(fecha) ?? [],
  }))
}

export function textoTrabajosDesdeCronograma(
  frenteTitulo: string,
  actividades: ActividadTramoCronograma[]
): string {
  if (actividades.length === 0) {
    return "Sin actividades programadas en este frente para la fecha (jornada de descanso o frente sin producción)."
  }

  const lineas = actividades.map((a) => {
    const m3 = formatearNumero(a.m3Desazolve, 1)
    const ml = formatearNumero(a.metrosLineales, 0)
    return `- Tramo «${a.tramoNombre}»: desazolve y reconformación de taludes ${m3} m³ (avance ref. ${ml} m); desalojo ${m3} m³; tendido de material ${m3} m³; ${a.volquetas} volqueta(s) en este tramo.`
  })

  return `Frente: ${frenteTitulo}.\nSe ejecutó:\n${lineas.join("\n")}`
}

export function equiposDesdeCronograma(actividades: ActividadTramoCronograma[]): {
  excavadoras: number
  volquetas: number
  tractor: number
  motoniveladora: number
  rtk: number
} {
  const m3Total = actividades.reduce((s, a) => s + a.m3Desazolve, 0)
  if (m3Total <= 0) {
    return { excavadoras: 0, volquetas: 0, tractor: 0, motoniveladora: 0, rtk: 0 }
  }

  const volquetas = actividades.reduce((s, a) => s + a.volquetas, 0)
  const excavadoras = actividades.length >= 2 ? 2 : 1

  return {
    excavadoras,
    volquetas,
    tractor: 1,
    motoniveladora: 1,
    rtk: 1,
  }
}
