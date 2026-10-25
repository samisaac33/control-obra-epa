import type { EquipoMinimoArrendamiento } from "@/src/data/planilla/equipo-minimo-arrendamiento"
import { EQUIPO_MINIMO_ARRENDAMIENTO } from "@/src/data/planilla/equipo-minimo-arrendamiento"
import type { JornadaMaquinariaProyecto } from "@/src/lib/maquinaria-desasolve-proyecto"
import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"
import {
  mapaEquiposPorId,
  nombreEquipoParaMostrar,
} from "@/src/lib/tramo-maquinaria-historial"

export type FilaConsolidadoMaquinariaPlanilla = {
  equipo: EquipoMinimoArrendamiento
  horasTeoricas: number | null
  horasReales: number
  jornadas: number
  deltaHoras: number | null
  notasTeorico?: string
}

function normalizarTexto(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

function tokensEquipoMinimo(e: EquipoMinimoArrendamiento): string[] {
  const partes = [e.marca, e.modelo, e.placa?.replace(/\./g, ""), e.nombre]
    .filter(Boolean)
    .map((p) => normalizarTexto(String(p)))
  const tokens = new Set<string>()
  for (const p of partes) {
    for (const t of p.split(/\s+/)) {
      if (t.length >= 3) tokens.add(t)
    }
  }
  if (e.placa) {
    const placa = normalizarTexto(e.placa.replace(/\./g, ""))
    tokens.add(placa.replace(/\s/g, ""))
  }
  return [...tokens]
}

export function jornadaCorrespondeEquipoMinimo(
  jornada: JornadaMaquinariaProyecto,
  equipo: EquipoMinimoArrendamiento,
  equiposPorId: Map<string, ProyectoEquipoMaquinaria>
): boolean {
  if (jornada.es_incidencia) return false
  if (equipo.categoria === "topografia" || equipo.categoria === "pruebas_electricas_severino") {
    return false
  }

  const nombre = normalizarTexto(nombreEquipoParaMostrar(jornada, equiposPorId))
  const tokens = tokensEquipoMinimo(equipo)
  if (tokens.length === 0) return false

  let hits = 0
  for (const t of tokens) {
    if (nombre.includes(t)) hits += 1
  }
  if (equipo.placa) {
    const placaNorm = normalizarTexto(equipo.placa.replace(/\./g, "")).replace(/\s/g, "")
    if (placaNorm && nombre.replace(/\s/g, "").includes(placaNorm)) hits += 2
  }
  return hits >= 2 || (tokens.length === 1 && hits >= 1)
}

export function filtrarJornadasMaquinariaEnPeriodo(
  jornadas: JornadaMaquinariaProyecto[],
  fechaInicio: string,
  fechaFin: string
): JornadaMaquinariaProyecto[] {
  return jornadas.filter((j) => j.fecha >= fechaInicio && j.fecha <= fechaFin)
}

export function horasRealesEquipoMinimoEnPeriodo(
  jornadasPeriodo: JornadaMaquinariaProyecto[],
  equipo: EquipoMinimoArrendamiento,
  equipos: ProyectoEquipoMaquinaria[]
): { horas: number; jornadas: number } {
  const equiposPorId = mapaEquiposPorId(equipos)
  let horas = 0
  let jornadas = 0
  for (const j of jornadasPeriodo) {
    if (!jornadaCorrespondeEquipoMinimo(j, equipo, equiposPorId)) continue
    jornadas += 1
    if (j.duracion_horas != null && Number.isFinite(j.duracion_horas)) {
      horas += j.duracion_horas
    }
  }
  return { horas, jornadas }
}

export function armarFilasConsolidadoMaquinariaPlanilla(
  horasTeoricasPorId: Map<string, number>,
  jornadasPeriodo: JornadaMaquinariaProyecto[],
  equipos: ProyectoEquipoMaquinaria[]
): FilaConsolidadoMaquinariaPlanilla[] {
  return EQUIPO_MINIMO_ARRENDAMIENTO.map((equipo) => {
    const teoricoRaw = horasTeoricasPorId.get(equipo.id)
    const sinTeorico =
      equipo.categoria === "topografia" || equipo.categoria === "pruebas_electricas_severino"
    const horasTeoricas = sinTeorico ? null : (teoricoRaw ?? 0)
    const { horas: horasReales, jornadas } = horasRealesEquipoMinimoEnPeriodo(
      jornadasPeriodo,
      equipo,
      equipos
    )
    const deltaHoras =
      horasTeoricas != null ? horasReales - horasTeoricas : null

    return {
      equipo,
      horasTeoricas,
      horasReales,
      jornadas,
      deltaHoras,
      notasTeorico: sinTeorico
        ? "Sin horas APU por m³ en rubros de planilla (replanteo / pruebas Severino)."
        : undefined,
    }
  })
}
