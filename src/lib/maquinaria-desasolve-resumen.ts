import type { JornadaMaquinariaProyecto } from "@/src/lib/maquinaria-desasolve-proyecto"
import {
  mapaEquiposPorId,
  nombreEquipoParaMostrar,
} from "@/src/lib/tramo-maquinaria-historial"
import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"

export type KpisMaquinariaDesasolve = {
  totalJornadas: number
  totalMetros: number
  diasConActividad: number
  totalHoras: number
  tramosConJornada: number
}

export type ResumenEquipoDesasolve = {
  clave: string
  nombreEquipo: string
  jornadas: number
  metros: number
  horas: number
}

export type ResumenTramoDesasolve = {
  tramo_codigo: string
  tramo_canal: string
  jornadas: number
  metros: number
}

function claveEquipo(jornada: JornadaMaquinariaProyecto): string {
  return jornada.equipo_id ?? jornada.equipo.trim().toLowerCase()
}

export function kpisMaquinariaDesasolve(jornadas: JornadaMaquinariaProyecto[]): KpisMaquinariaDesasolve {
  const fechas = new Set(jornadas.map((j) => j.fecha))
  const tramos = new Set(jornadas.map((j) => j.tramo_id))
  let totalHoras = 0
  let totalMetros = 0
  for (const j of jornadas) {
    totalMetros += j.metros_desasolados
    if (j.duracion_horas != null) totalHoras += j.duracion_horas
  }
  return {
    totalJornadas: jornadas.length,
    totalMetros,
    diasConActividad: fechas.size,
    totalHoras,
    tramosConJornada: tramos.size,
  }
}

export function resumenPorEquipoDesasolve(
  jornadas: JornadaMaquinariaProyecto[],
  equipos: ProyectoEquipoMaquinaria[]
): ResumenEquipoDesasolve[] {
  const equiposPorId = mapaEquiposPorId(equipos)
  const map = new Map<string, ResumenEquipoDesasolve>()

  for (const j of jornadas) {
    const clave = claveEquipo(j)
    const nombreEquipo = nombreEquipoParaMostrar(j, equiposPorId)
    const prev = map.get(clave) ?? {
      clave,
      nombreEquipo,
      jornadas: 0,
      metros: 0,
      horas: 0,
    }
    prev.jornadas += 1
    prev.metros += j.metros_desasolados
    if (j.duracion_horas != null) prev.horas += j.duracion_horas
    map.set(clave, prev)
  }

  return [...map.values()].sort((a, b) => b.metros - a.metros || a.nombreEquipo.localeCompare(b.nombreEquipo))
}

export function resumenPorTramoDesasolve(jornadas: JornadaMaquinariaProyecto[]): ResumenTramoDesasolve[] {
  const map = new Map<string, ResumenTramoDesasolve>()

  for (const j of jornadas) {
    const clave = j.tramo_id
    const prev = map.get(clave) ?? {
      tramo_codigo: j.tramo_codigo,
      tramo_canal: j.tramo_canal,
      jornadas: 0,
      metros: 0,
    }
    prev.jornadas += 1
    prev.metros += j.metros_desasolados
    map.set(clave, prev)
  }

  return [...map.values()].sort(
    (a, b) =>
      Number(a.tramo_codigo) - Number(b.tramo_codigo) ||
      a.tramo_codigo.localeCompare(b.tramo_codigo, undefined, { numeric: true })
  )
}

export function agruparJornadasPorFecha(
  jornadas: JornadaMaquinariaProyecto[]
): { fecha: string; jornadas: JornadaMaquinariaProyecto[] }[] {
  const map = new Map<string, JornadaMaquinariaProyecto[]>()
  for (const j of jornadas) {
    const lista = map.get(j.fecha) ?? []
    lista.push(j)
    map.set(j.fecha, lista)
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, lista]) => ({
      fecha,
      jornadas: lista.sort((x, y) => y.created_at.localeCompare(x.created_at)),
    }))
}

export function formatearMetrosDesasolveResumen(metros: number): string {
  if (metros >= 1000) return `${formatearNumero(metros / 1000, 2)} km`
  return `${formatearNumero(metros, 0)} m`
}
