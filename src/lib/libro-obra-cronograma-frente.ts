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
  /** Avance lineal del día a lo largo del tramo. */
  metrosLineales: number
  /** Progreso acumulado al cierre del día (m), referencia PK 0+000 = inicio tramo. */
  pkDesdeM: number
  pkHastaM: number
  longitudTramoM: number
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

export function metrosDesdeM3Tramo(tramo: TramoDesazolveVae, m3: number): number {
  if (m3 <= 0 || tramo.volumenM3 <= 0) return 0
  return (m3 / tramo.volumenM3) * tramo.longitudM
}

/**
 * Reparte el volumen del periodo en objetivos diarios distintos (suma exacta al total).
 * Curva determinística: arranque, pico y remate — evita el mismo m³ todos los días.
 */
export function objetivosM3PorDiaProgramatico(nDias: number, volumenTotal: number): number[] {
  if (nDias <= 0) return []
  if (nDias === 1) return [Math.round(volumenTotal * 100) / 100]

  const raw = Array.from({ length: nDias }, (_, i) => {
    const fase = i / (nDias - 1)
    const campana = 0.52 + 0.48 * Math.sin(fase * Math.PI)
    const ondulacion = 0.14 * Math.sin(i * 1.713 + 0.35) + 0.09 * Math.cos(i * 2.41)
    return Math.max(0.12, campana + ondulacion)
  })
  const sumPesos = raw.reduce((a, b) => a + b, 0)
  const targets = raw.map((w) => (w / sumPesos) * volumenTotal)
  const redondeados = targets.map((t) => Math.round(t * 100) / 100)
  const drift = volumenTotal - redondeados.reduce((a, b) => a + b, 0)
  redondeados[redondeados.length - 1] = Math.round((redondeados[redondeados.length - 1]! + drift) * 100) / 100
  return redondeados
}

function actividadDesdeM3(
  tramo: TramoDesazolveVae,
  m3DelDia: number,
  acumM3Antes: number
): ActividadTramoCronograma {
  const m3r = Math.round(m3DelDia * 100) / 100
  const pkDesde = metrosDesdeM3Tramo(tramo, acumM3Antes)
  const pkHasta = metrosDesdeM3Tramo(tramo, acumM3Antes + m3r)
  return {
    tramoId: tramo.id,
    tramoNombre: tramo.nombre,
    m3Desazolve: m3r,
    m3Desalojo: m3r,
    m3Tendido: m3r,
    metrosLineales: Math.round((pkHasta - pkDesde) * 10) / 10,
    pkDesdeM: Math.round(pkDesde * 10) / 10,
    pkHastaM: Math.round(pkHasta * 10) / 10,
    longitudTramoM: tramo.longitudM,
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
 * Libro programático: secuencia de tramos (orden catálogo VAE), objetivos diarios variables,
 * hasta N tramos simultáneos en trasvase. Cuadra Σ m³ del periodo con el requerimiento de pago.
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
  const acumM3 = new Map<string, number>()
  for (const t of tramos) acumM3.set(t.id, 0)

  const objetivosDiarios = objetivosM3PorDiaProgramatico(dias.length, volumenPeriodo)
  const maxSimultaneos = frente === "trasvase" ? TRAMOS_SIMULTANEOS_TRASVASE : 1
  const porFecha = new Map<string, ActividadTramoCronograma[]>()
  let pendienteGlobal = volumenPeriodo

  for (let diaIndex = 0; diaIndex < dias.length; diaIndex++) {
    const fecha = dias[diaIndex]!
    if (pendienteGlobal <= 0.001) {
      porFecha.set(fecha, [])
      continue
    }

    const objetivoDia = Math.min(objetivosDiarios[diaIndex] ?? pendienteGlobal, pendienteGlobal)
    const colaOrdenada = tramos.filter((t) => (restante.get(t.id) ?? 0) > 0.01)
    if (colaOrdenada.length === 0) {
      porFecha.set(fecha, [])
      continue
    }

    const activos = colaOrdenada.slice(0, maxSimultaneos)
    const pesoActivos = activos.map((t) => restante.get(t.id) ?? 0)
    const sumPeso = pesoActivos.reduce((a, b) => a + b, 0)

    const acts: ActividadTramoCronograma[] = []
    let asignadoDia = 0

    for (let i = 0; i < activos.length; i++) {
      const tramo = activos[i]!
      const rest = restante.get(tramo.id) ?? 0
      if (rest <= 0.001) continue

      let cuota =
        sumPeso > 0 && activos.length > 1
          ? (objetivoDia * (pesoActivos[i] ?? 0)) / sumPeso
          : objetivoDia / activos.length

      if (i === activos.length - 1) {
        cuota = Math.max(0, objetivoDia - asignadoDia)
      }

      const uso = Math.min(rest, cuota, pendienteGlobal - asignadoDia)
      if (uso <= 0.001) continue

      const acumAntes = acumM3.get(tramo.id) ?? 0
      restante.set(tramo.id, rest - uso)
      acumM3.set(tramo.id, acumAntes + uso)
      asignadoDia += uso

      const prev = acts.find((a) => a.tramoId === tramo.id)
      if (prev) {
        const idx = acts.indexOf(prev)
        const m3Total = prev.m3Desazolve + uso
        const acumRebuilt = acumAntes - prev.m3Desazolve
        acts[idx] = actividadDesdeM3(tramo, m3Total, acumRebuilt)
      } else {
        acts.push(actividadDesdeM3(tramo, uso, acumAntes))
      }
    }

    if (asignadoDia < objetivoDia - 0.01) {
      let faltante = objetivoDia - asignadoDia
      for (const tramo of colaOrdenada) {
        if (faltante <= 0.01) break
        const rest = restante.get(tramo.id) ?? 0
        if (rest <= 0.001) continue
        const uso = Math.min(rest, faltante, pendienteGlobal - asignadoDia)
        if (uso <= 0.001) continue
        const acumAntes = acumM3.get(tramo.id) ?? 0
        restante.set(tramo.id, rest - uso)
        acumM3.set(tramo.id, acumAntes + uso)
        asignadoDia += uso
        faltante -= uso
        const prev = acts.find((a) => a.tramoId === tramo.id)
        if (prev) {
          const idx = acts.indexOf(prev)
          const acumRebuilt = acumAntes - prev.m3Desazolve
          acts[idx] = actividadDesdeM3(tramo, prev.m3Desazolve + uso, acumRebuilt)
        } else {
          acts.push(actividadDesdeM3(tramo, uso, acumAntes))
        }
      }
    }

    pendienteGlobal -= asignadoDia
    porFecha.set(fecha, asignarVolquetasFlotaEnActividades(acts))
  }

  if (pendienteGlobal > 0.5) {
    const ultimaFecha = [...dias].reverse().find((f) => (porFecha.get(f)?.length ?? 0) > 0)
    if (ultimaFecha) {
      const acts = [...(porFecha.get(ultimaFecha) ?? [])]
      for (const tramo of tramos) {
        const rest = restante.get(tramo.id) ?? 0
        if (rest <= 0.001 || pendienteGlobal <= 0.001) continue
        const add = Math.min(rest, pendienteGlobal)
        const acumAntes = acumM3.get(tramo.id) ?? 0
        restante.set(tramo.id, rest - add)
        acumM3.set(tramo.id, acumAntes + add)
        pendienteGlobal -= add
        const prev = acts.find((a) => a.tramoId === tramo.id)
        if (prev) {
          const idx = acts.indexOf(prev)
          const acumRebuilt = acumAntes - prev.m3Desazolve
          acts[idx] = actividadDesdeM3(tramo, prev.m3Desazolve + add, acumRebuilt)
        } else {
          acts.push(actividadDesdeM3(tramo, add, acumAntes))
        }
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

function formatoPk(m: number): string {
  return formatearNumero(m, 0)
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
    const mlDia = formatearNumero(a.metrosLineales, 0)
    const pkIni = formatoPk(a.pkDesdeM)
    const pkFin = formatoPk(a.pkHastaM)
    const pkTot = formatoPk(a.longitudTramoM)
    return `- Tramo «${a.tramoNombre}» (producción del día): desazolve y reconformación de taludes ${m3} m³; avance lineal ${mlDia} m (PK ${pkIni}–${pkFin} m de ${pkTot} m); desalojo ${m3} m³; tendido de material ${m3} m³; ${a.volquetas} volqueta(s) asignada(s) a este tramo.`
  })

  return (
    `Frente: ${frenteTitulo}.\n` +
    `Programación de ejecución (libro programático — cuadre planilla VAE):\n` +
    lineas.join("\n")
  )
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
