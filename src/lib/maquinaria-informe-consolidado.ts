import {
  ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1,
  FRENTE_META,
  type Accionista,
  type FrenteObra,
  type RegistroDia,
  type RegistroEquipo,
} from "@/src/data/registro-maquinaria"
import { esRegistroMaquina, normalizarDuracion, resumenFrenteEtiqueta } from "@/src/lib/maquinaria-resumen"

const HORAS_POR_DIA = 8

const EQUIPO_VOLQUETA = "Volqueta"
const EQUIPO_VIAJES_ARENA = "Viajes de arena"
const EQUIPO_VIAJES_MEJORAMIENTO = "Viajes de material para vía"

const ACCIONISTAS_ORDEN: Accionista[] = ["consorcio", "mauricio"]

/** @deprecated Use ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1 */
export const ETIQUETA_SIN_FRENTE = ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1

const ORDEN_FRENTE: Record<string, number> = {
  cienega: 1,
  poza_honda: 2,
  pechiche: 3,
  "": 4,
  las_penas: 5,
}

type ClaveFrente = FrenteObra | ""

function claveFrente(frente?: FrenteObra): ClaveFrente {
  return frente ?? ""
}

function ordenFrenteClave(clave: ClaveFrente): number {
  return ORDEN_FRENTE[clave] ?? 99
}

function esViajesArena(registro: RegistroEquipo): boolean {
  return registro.duracion === "viajes" && registro.equipo === EQUIPO_VIAJES_ARENA
}

function esViajesMejoramiento(registro: RegistroEquipo): boolean {
  return registro.duracion === "viajes" && registro.equipo === EQUIPO_VIAJES_MEJORAMIENTO
}

export function horasMaquinaDesdeRegistro(registro: RegistroEquipo): number {
  if (!esRegistroMaquina(registro)) return 0
  return normalizarDuracion(registro) * HORAS_POR_DIA
}

export function diasVolquetaDesdeHoras(horasVolqueta: number): number {
  if (horasVolqueta <= 0) return 0
  return Math.round(horasVolqueta / HORAS_POR_DIA)
}

export type MetricasFrenteAccionista = {
  horasMaquina: number
  viajesArena: number
  viajesMejoramiento: number
  diasVolquetas: number
}

export type FilaResumenAccionista = MetricasFrenteAccionista & {
  frente: FrenteObra | null
  label: string
}

export type ResumenInformeAccionista = {
  accionista: Accionista
  filas: FilaResumenAccionista[]
  totales: MetricasFrenteAccionista
}

export type FilaDetalleEquipoPorFrente = {
  equipo: string
  accionista: Accionista
  horasMaquina: number
  viajesVolqueta: number
}

export type SeccionDetalleMaquinasPorFrente = {
  frente: FrenteObra | null
  label: string
  filas: FilaDetalleEquipoPorFrente[]
  subtotalHoras: number
  subtotalViajes: number
}

export type InformeConsolidadoMaquinaria = {
  resumenPorAccionista: ResumenInformeAccionista[]
  detallePorFrente: SeccionDetalleMaquinasPorFrente[]
}

type AcumuladorMetricas = {
  horasMaquina: number
  horasVolqueta: number
  viajesArena: number
  viajesMejoramiento: number
}

function vacioMetricas(): AcumuladorMetricas {
  return { horasMaquina: 0, horasVolqueta: 0, viajesArena: 0, viajesMejoramiento: 0 }
}

function metricasDesdeAcumulador(acum: AcumuladorMetricas): MetricasFrenteAccionista {
  return {
    horasMaquina: acum.horasMaquina,
    viajesArena: acum.viajesArena,
    viajesMejoramiento: acum.viajesMejoramiento,
    diasVolquetas: diasVolquetaDesdeHoras(acum.horasVolqueta),
  }
}

function frenteTieneMetricas(m: MetricasFrenteAccionista): boolean {
  return (
    m.horasMaquina > 0 ||
    m.viajesArena > 0 ||
    m.viajesMejoramiento > 0 ||
    m.diasVolquetas > 0
  )
}

function sumarMetricas(a: MetricasFrenteAccionista, b: MetricasFrenteAccionista): MetricasFrenteAccionista {
  return {
    horasMaquina: a.horasMaquina + b.horasMaquina,
    viajesArena: a.viajesArena + b.viajesArena,
    viajesMejoramiento: a.viajesMejoramiento + b.viajesMejoramiento,
    diasVolquetas: a.diasVolquetas + b.diasVolquetas,
  }
}

function etiquetaDesdeClave(clave: ClaveFrente): string {
  if (clave === "") return ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1
  return FRENTE_META[clave].label
}

function claveEquipoAccionista(equipo: string, accionista: Accionista): string {
  return `${equipo}::${accionista}`
}

type AcumuladorEquipo = {
  equipo: string
  accionista: Accionista
  horasMaquina: number
  viajesVolqueta: number
}

function ordenarFilasDetalle(a: FilaDetalleEquipoPorFrente, b: FilaDetalleEquipoPorFrente): number {
  if (a.accionista !== b.accionista) {
    return a.accionista === "consorcio" ? -1 : 1
  }
  return a.equipo.localeCompare(b.equipo, "es")
}

function construirDetallePorFrente(
  mapaEquipos: Map<ClaveFrente, Map<string, AcumuladorEquipo>>,
  clavesOrdenadas: ClaveFrente[]
): SeccionDetalleMaquinasPorFrente[] {
  return clavesOrdenadas
    .map((clave) => {
      const equipos = mapaEquipos.get(clave)
      const filas = equipos
        ? [...equipos.values()]
            .map((item) => ({
              equipo: item.equipo,
              accionista: item.accionista,
              horasMaquina: item.horasMaquina,
              viajesVolqueta: item.viajesVolqueta,
            }))
            .filter((f) => f.horasMaquina > 0 || f.viajesVolqueta > 0)
            .sort(ordenarFilasDetalle)
        : []

      const subtotalHoras = filas.reduce(
        (s, f) => s + (f.equipo === EQUIPO_VOLQUETA ? 0 : f.horasMaquina),
        0
      )
      const subtotalViajes = filas.reduce((s, f) => s + f.viajesVolqueta, 0)

      return {
        frente: clave === "" ? null : clave,
        label: etiquetaDesdeClave(clave),
        filas,
        subtotalHoras,
        subtotalViajes,
      }
    })
    .filter((s) => s.filas.length > 0)
}

function acumularRegistro(acum: AcumuladorMetricas, registro: RegistroEquipo): void {
  if (esRegistroMaquina(registro)) {
    const horas = horasMaquinaDesdeRegistro(registro)
    if (registro.equipo === EQUIPO_VOLQUETA) {
      acum.horasVolqueta += horas
    } else {
      acum.horasMaquina += horas
    }
  }

  if (esViajesArena(registro)) {
    acum.viajesArena += registro.cantidad ?? 0
  }

  if (esViajesMejoramiento(registro)) {
    acum.viajesMejoramiento += registro.cantidad ?? 0
  }
}

export function construirInformeConsolidadoMaquinaria(dias: RegistroDia[]): InformeConsolidadoMaquinaria {
  const porAccionistaFrente = new Map<Accionista, Map<ClaveFrente, AcumuladorMetricas>>()
  const mapaEquipos = new Map<ClaveFrente, Map<string, AcumuladorEquipo>>()
  const clavesActivas = new Set<ClaveFrente>()

  function obtenerMetricas(accionista: Accionista, clave: ClaveFrente): AcumuladorMetricas {
    let porFrente = porAccionistaFrente.get(accionista)
    if (!porFrente) {
      porFrente = new Map()
      porAccionistaFrente.set(accionista, porFrente)
    }
    const prev = porFrente.get(clave) ?? vacioMetricas()
    porFrente.set(clave, prev)
    return prev
  }

  function obtenerEquipo(clave: ClaveFrente, registro: RegistroEquipo): AcumuladorEquipo {
    let porFrente = mapaEquipos.get(clave)
    if (!porFrente) {
      porFrente = new Map()
      mapaEquipos.set(clave, porFrente)
    }
    const id = claveEquipoAccionista(registro.equipo, registro.accionista)
    const prev =
      porFrente.get(id) ??
      ({
        equipo: registro.equipo,
        accionista: registro.accionista,
        horasMaquina: 0,
        viajesVolqueta: 0,
      } satisfies AcumuladorEquipo)
    porFrente.set(id, prev)
    return prev
  }

  for (const dia of dias) {
    if (!dia.trabajado) continue

    for (const registro of dia.registros) {
      const clave = claveFrente(registro.frente)
      clavesActivas.add(clave)

      acumularRegistro(obtenerMetricas(registro.accionista, clave), registro)

      const detalle = obtenerEquipo(clave, registro)

      if (esRegistroMaquina(registro)) {
        detalle.horasMaquina += horasMaquinaDesdeRegistro(registro)
      }

      if (esViajesArena(registro) || esViajesMejoramiento(registro)) {
        detalle.viajesVolqueta += registro.cantidad ?? 0
      }
    }
  }

  const clavesOrdenadas = [...clavesActivas].sort((a, b) => ordenFrenteClave(a) - ordenFrenteClave(b))

  const resumenPorAccionista = ACCIONISTAS_ORDEN.map((accionista) => {
    const porFrente = porAccionistaFrente.get(accionista) ?? new Map()
    const filas: FilaResumenAccionista[] = []

    for (const clave of clavesOrdenadas) {
      const acum = porFrente.get(clave) ?? vacioMetricas()
      const metricas = metricasDesdeAcumulador(acum)
      if (!frenteTieneMetricas(metricas)) continue

      filas.push({
        frente: clave === "" ? null : clave,
        label: etiquetaDesdeClave(clave),
        ...metricas,
      })
    }

    const totales = filas.reduce(
      (acc, fila) => sumarMetricas(acc, fila),
      {
        horasMaquina: 0,
        viajesArena: 0,
        viajesMejoramiento: 0,
        diasVolquetas: 0,
      } satisfies MetricasFrenteAccionista
    )

    return { accionista, filas, totales }
  })

  const detallePorFrente = construirDetallePorFrente(mapaEquipos, clavesOrdenadas)

  return { resumenPorAccionista, detallePorFrente }
}

/** Etiqueta de frente para exportaciones (reutiliza resumen estándar salvo sin frente). */
export function etiquetaFrenteInformeConsolidado(frente: FrenteObra | null): string {
  if (frente === null) return ETIQUETA_FRENTE_LAS_PENAS_ETAPA_1
  return resumenFrenteEtiqueta(frente)
}

export function informeConsolidadoTieneDatos(informe: InformeConsolidadoMaquinaria): boolean {
  if (informe.detallePorFrente.length > 0) return true
  return informe.resumenPorAccionista.some((r) => r.filas.length > 0)
}
