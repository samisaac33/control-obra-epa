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

/** m³ por viaje (medición tickets / VAE). */
export const M3_POR_VIAJE_VOLQUETA = 8

/** Jornada efectiva de transporte (h), alineada a tabla EPA mañana/tarde. */
const JORNADA_TRANSPORTE_H = 9
/** Tiempo fijo carga + maniobra + descarga por ciclo (min). */
const MINUTOS_FIJO_CICLO_VOLQUETA = 4
const VELOCIDAD_PROMEDIO_VOLQUETA_KMH = 20

/**
 * Distancia frente–botadero usada solo para dimensionar flota (no se imprime en libro).
 * En campo el botadero contractual puede estar más lejos; aquí se usa ~20 m de recorrido
 * efectivo para no sobredimensionar volquetas como si todo fuera ida/vuelta de 5 km.
 */
const DISTANCIA_DESALOJO_CALCULO_M = 20

/** Viajes que puede hacer una volqueta en la jornada según distancia de cálculo. */
export function viajesVolquetaPorDiaUnaUnidad(): number {
  const dKm = DISTANCIA_DESALOJO_CALCULO_M / 1000
  const minDesplazamiento = ((2 * dKm) / VELOCIDAD_PROMEDIO_VOLQUETA_KMH) * 60
  const cicloMin = MINUTOS_FIJO_CICLO_VOLQUETA + minDesplazamiento
  const minutosUtiles = JORNADA_TRANSPORTE_H * 60
  return Math.max(1, Math.floor(minutosUtiles / cicloMin))
}

/** Flota del día (unidades), no suma por tramo. */
export function volquetasFlotaParaM3Desalojo(m3: number): number {
  if (m3 <= 0) return 0
  const viajesNecesarios = Math.ceil(m3 / M3_POR_VIAJE_VOLQUETA)
  const viajesPorCamion = viajesVolquetaPorDiaUnaUnidad()
  return Math.max(1, Math.ceil(viajesNecesarios / viajesPorCamion))
}

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
    volquetas: 0,
  }
}

/** Reparte la flota del día entre tramos (proporcional al m³); evita sumar 165 camiones. */
export function asignarVolquetasFlotaEnActividades(
  actividades: ActividadTramoCronograma[]
): ActividadTramoCronograma[] {
  if (actividades.length === 0) return actividades

  const m3Total = actividades.reduce((s, a) => s + a.m3Desalojo, 0)
  const flota = volquetasFlotaParaM3Desalojo(m3Total)
  if (flota === 0) return actividades.map((a) => ({ ...a, volquetas: 0 }))

  if (actividades.length === 1) {
    return [{ ...actividades[0]!, volquetas: flota }]
  }

  let repartido = 0
  return actividades.map((a, index) => {
    if (index === actividades.length - 1) {
      return { ...a, volquetas: Math.max(0, flota - repartido) }
    }
    const share =
      m3Total > 0
        ? Math.max(a.m3Desalojo > 0 ? 1 : 0, Math.round((flota * a.m3Desalojo) / m3Total))
        : 0
    repartido += share
    return { ...a, volquetas: share }
  })
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
    porFecha.set(fecha, asignarVolquetasFlotaEnActividades(acts))
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
      porFecha.set(ultimaFecha, asignarVolquetasFlotaEnActividades(acts))
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

  const volquetas = volquetasFlotaParaM3Desalojo(m3Total)
  const excavadoras = actividades.length >= 2 ? 2 : 1

  return {
    excavadoras,
    volquetas,
    tractor: 1,
    motoniveladora: 1,
    rtk: 1,
  }
}
