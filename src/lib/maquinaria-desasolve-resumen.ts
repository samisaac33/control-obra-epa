import type { CanalTramo } from "@/src/data/tramos/types"
import {
  capMetrosResumenTramoConMapa,
  type JornadaMaquinariaProyecto,
} from "@/src/lib/maquinaria-desasolve-proyecto"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"
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
  totalIncidencias: number
}

export type ResumenEquipoDesasolve = {
  clave: string
  nombreEquipo: string
  jornadas: number
  metros: number
  horas: number
}

export type ResumenTramoDesasolve = {
  tramo_id: string
  tramo_codigo: string
  tramo_canal: string
  jornadas: number
  metros: number
  horas: number
}

/** Una fila por tramo y por equipo (p. ej. tramo 19 · brazo largo y tramo 19 · brazo corto). */
export type ResumenTramoEquipoDesasolve = ResumenTramoDesasolve & {
  claveEquipo: string
  nombreEquipo: string
}

function claveEquipo(jornada: JornadaMaquinariaProyecto): string {
  return jornada.equipo_id ?? jornada.equipo.trim().toLowerCase()
}

function jornadasOperativas(jornadas: JornadaMaquinariaProyecto[]): JornadaMaquinariaProyecto[] {
  return jornadas.filter((j) => !j.es_incidencia)
}

export function kpisMaquinariaDesasolve(jornadas: JornadaMaquinariaProyecto[]): KpisMaquinariaDesasolve {
  const operativas = jornadasOperativas(jornadas)
  const fechas = new Set(jornadas.map((j) => j.fecha))
  const tramos = new Set(operativas.map((j) => j.tramo_id))
  let totalHoras = 0
  let totalMetros = 0
  for (const j of operativas) {
    totalMetros += j.metros_desasolados
    if (j.duracion_horas != null) totalHoras += j.duracion_horas
  }
  return {
    totalJornadas: operativas.length,
    totalMetros,
    diasConActividad: fechas.size,
    totalHoras,
    tramosConJornada: tramos.size,
    totalIncidencias: jornadas.filter((j) => j.es_incidencia).length,
  }
}

export function resumenPorEquipoDesasolve(
  jornadas: JornadaMaquinariaProyecto[],
  equipos: ProyectoEquipoMaquinaria[]
): ResumenEquipoDesasolve[] {
  const equiposPorId = mapaEquiposPorId(equipos)
  const map = new Map<string, ResumenEquipoDesasolve>()

  for (const j of jornadasOperativas(jornadas)) {
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

  for (const j of jornadasOperativas(jornadas)) {
    const clave = j.tramo_id
    const prev = map.get(clave) ?? {
      tramo_id: j.tramo_id,
      tramo_codigo: j.tramo_codigo,
      tramo_canal: j.tramo_canal,
      jornadas: 0,
      metros: 0,
      horas: 0,
    }
    prev.jornadas += 1
    prev.metros += j.metros_desasolados
    if (j.duracion_horas != null) prev.horas += j.duracion_horas
    map.set(clave, prev)
  }

  return [...map.values()].sort(
    (a, b) =>
      Number(a.tramo_codigo) - Number(b.tramo_codigo) ||
      a.tramo_codigo.localeCompare(b.tramo_codigo, undefined, { numeric: true })
  )
}

export function resumenPorTramoEquipoDesasolve(
  jornadas: JornadaMaquinariaProyecto[],
  equipos: ProyectoEquipoMaquinaria[]
): ResumenTramoEquipoDesasolve[] {
  const equiposPorId = mapaEquiposPorId(equipos)
  const map = new Map<string, ResumenTramoEquipoDesasolve>()

  for (const j of jornadasOperativas(jornadas)) {
    const claveEq = claveEquipo(j)
    const clave = `${j.tramo_id}\0${claveEq}`
    const nombreEquipo = nombreEquipoParaMostrar(j, equiposPorId)
    const prev = map.get(clave) ?? {
      tramo_id: j.tramo_id,
      tramo_codigo: j.tramo_codigo,
      tramo_canal: j.tramo_canal,
      claveEquipo: claveEq,
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

  return [...map.values()].sort(
    (a, b) =>
      Number(a.tramo_codigo) - Number(b.tramo_codigo) ||
      a.tramo_codigo.localeCompare(b.tramo_codigo, undefined, { numeric: true }) ||
      a.nombreEquipo.localeCompare(b.nombreEquipo, "es")
  )
}

/** Resumen por tramo con metros acotados al avance GPS del mapa (evita solapes ABC). */
export function resumenPorTramoDesasolveAlineadoMapa(
  jornadas: JornadaMaquinariaProyecto[],
  tramos: CanalTramo[],
  puntosAvance: TramoPuntoAvance[]
): ResumenTramoDesasolve[] {
  return capMetrosResumenTramoConMapa(tramos, puntosAvance, resumenPorTramoDesasolve(jornadas))
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

export type DetalleJornadasDia = {
  fecha: string
  equiposDistintos: number
  totalHoras: number
  totalMetros: number
  porEquipo: ResumenEquipoDesasolve[]
  porTramo: ResumenTramoDesasolve[]
  lineasJornada: string[]
  incidencias: number
}

export function detalleJornadasDia(
  fecha: string,
  jornadas: JornadaMaquinariaProyecto[],
  equipos: ProyectoEquipoMaquinaria[]
): DetalleJornadasDia {
  const delDia = jornadas.filter((j) => j.fecha === fecha)
  const operativas = jornadasOperativas(delDia)
  const porEquipo = resumenPorEquipoDesasolve(delDia, equipos)
  const porTramo = resumenPorTramoDesasolve(delDia)
  const kpis = kpisMaquinariaDesasolve(delDia)
  const equiposPorId = mapaEquiposPorId(equipos)

  const lineasJornada = operativas.map((j) => {
    const nombre = nombreEquipoParaMostrar(j, equiposPorId)
    const horas =
      j.duracion_horas != null ? `${formatearNumero(j.duracion_horas, 1)} h` : "horas no registradas"
    const obs = j.observaciones?.trim() ? ` — ${j.observaciones.trim()}` : ""
    return `- ${nombre}: tramo ${j.tramo_codigo} (${j.tramo_canal}), ${formatearMetrosDesasolveResumen(j.metros_desasolados)}, ${horas}${obs}`
  })

  return {
    fecha,
    equiposDistintos: porEquipo.length,
    totalHoras: kpis.totalHoras,
    totalMetros: kpis.totalMetros,
    porEquipo,
    porTramo,
    lineasJornada,
    incidencias: delDia.filter((j) => j.es_incidencia).length,
  }
}

export function formatearDetalleJornadasDia(detalle: DetalleJornadasDia): string {
  const lineas: string[] = [
    `Fecha ${detalle.fecha}:`,
    `- Equipos distintos (jornadas operativas): ${detalle.equiposDistintos}`,
    `- Total horas registradas: ${formatearNumero(detalle.totalHoras, 1)} h`,
    `- Total metros desasolados: ${formatearMetrosDesasolveResumen(detalle.totalMetros)}`,
  ]

  if (detalle.porTramo.length > 0) {
    lineas.push("- Tramos intervenidos:")
    for (const t of detalle.porTramo) {
      lineas.push(
        `  · tramo ${t.tramo_codigo} (${t.tramo_canal}): ${t.jornadas} jornada(s), ${formatearMetrosDesasolveResumen(t.metros)}${t.horas > 0 ? `, ${formatearNumero(t.horas, 1)} h` : ""}`
      )
    }
  } else {
    lineas.push("- Tramos intervenidos: ninguno registrado en maquinaria para esta fecha.")
  }

  if (detalle.porEquipo.length > 0) {
    lineas.push("- Desglose por equipo:")
    for (const e of detalle.porEquipo) {
      lineas.push(
        `  · ${e.nombreEquipo}: ${e.jornadas} jornada(s), ${formatearNumero(e.horas, 1)} h, ${formatearMetrosDesasolveResumen(e.metros)}`
      )
    }
  }

  if (detalle.lineasJornada.length > 0) {
    lineas.push("- Detalle de jornadas:")
    lineas.push(...detalle.lineasJornada)
  }

  if (detalle.incidencias > 0) {
    lineas.push(`- Incidencias registradas (no operativas): ${detalle.incidencias}`)
  }

  return lineas.join("\n")
}
