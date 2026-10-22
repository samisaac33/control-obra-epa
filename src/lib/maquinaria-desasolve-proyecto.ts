import type { SupabaseClient } from "@supabase/supabase-js"

import type { CanalTramo } from "@/src/data/tramos/types"
import {
  cargarTramosMapaProyecto,
  type TramosMapaProyecto,
} from "@/src/lib/cargar-tramos-mapa-proyecto"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import {
  idsRegistrosMaquinariaCanonicosPorMinitramo,
  mapaLongitudMinitramoPorPuntoFin,
  mapaMinitramoTerminadoPorPuntoFin,
  tramoTienePuntosGpsConfirmados,
} from "@/src/lib/mapa-jornada-minitramo"
import { metrosMinitramosTerminadosTramo } from "@/src/lib/tramo-geometria"
import {
  formatearFechaRegistro,
  normalizarRegistroMaquinaria,
  type TramoRegistroMaquinaria,
} from "@/src/lib/tramo-maquinaria-historial"

export type JornadaMaquinariaProyecto = TramoRegistroMaquinaria & {
  tramo_codigo: string
  tramo_canal: string
}

export type PeriodoJornadasMaquinaria = {
  inicio: string
  fin: string
  etiqueta: string
}

export const PERIODO_JORNADAS_VACIO: PeriodoJornadasMaquinaria = {
  inicio: "",
  fin: "",
  etiqueta: "Sin registros aún",
}

function normalizarJornada(
  row: Record<string, unknown>,
  tramo: { codigo: string; canal: string }
): JornadaMaquinariaProyecto {
  return {
    ...normalizarRegistroMaquinaria(row),
    tramo_codigo: tramo.codigo,
    tramo_canal: tramo.canal,
  }
}

export function periodoDesdeJornadas(jornadas: JornadaMaquinariaProyecto[]): PeriodoJornadasMaquinaria {
  if (jornadas.length === 0) return PERIODO_JORNADAS_VACIO
  const fechas = [...new Set(jornadas.map((j) => j.fecha))].sort()
  const inicio = fechas[0]!
  const fin = fechas[fechas.length - 1]!
  const etiqueta =
    inicio === fin
      ? formatearFechaRegistro(inicio)
      : `${formatearFechaRegistro(inicio)} — ${formatearFechaRegistro(fin)}`
  return { inicio, fin, etiqueta }
}

function metrosDesasoladosEfectivosJornada(
  jornada: TramoRegistroMaquinaria,
  longitudPorPuntoFin: ReadonlyMap<string, number>,
  terminadoPorPuntoFin: ReadonlyMap<string, boolean>
): number {
  if (jornada.punto_avance_id) {
    if (terminadoPorPuntoFin.get(jornada.punto_avance_id) === false) return 0
    const longitudGps = longitudPorPuntoFin.get(jornada.punto_avance_id)
    if (longitudGps != null && longitudGps > 0) return longitudGps
  }
  return jornada.metros_desasolados
}

/**
 * Evita doble conteo frente al mapa: solo jornadas canónicas por minitramo cuando hay GPS,
 * más incidencias y registros manuales en tramos sin puntos confirmados.
 */
export function filtrarJornadasMaquinariaParaConsolidado(
  tramos: CanalTramo[],
  puntos: TramoPuntoAvance[],
  jornadas: JornadaMaquinariaProyecto[]
): JornadaMaquinariaProyecto[] {
  const registros = jornadas as TramoRegistroMaquinaria[]
  const idsCanonicos = idsRegistrosMaquinariaCanonicosPorMinitramo(tramos, puntos, registros)

  return jornadas.filter((j) => {
    if (j.es_incidencia) return true
    if (idsCanonicos.has(j.id)) return true
    if (tramoTienePuntosGpsConfirmados(j.tramo_id, puntos)) return false
    return true
  })
}

/** Totales por tramo con tope igual al avance GPS terminado del mapa (minitramos solapados). */
export function capMetrosResumenTramoConMapa(
  tramos: CanalTramo[],
  puntos: TramoPuntoAvance[],
  resumen: { tramo_id: string; metros: number; jornadas: number; tramo_codigo: string; tramo_canal: string }[]
): typeof resumen {
  const tramoPorId = new Map(tramos.map((t) => [t.id, t]))
  return resumen.map((fila) => {
    const tramo = tramoPorId.get(fila.tramo_id)
    if (!tramo || !tramoTienePuntosGpsConfirmados(fila.tramo_id, puntos)) return fila
    const topeMapa = metrosMinitramosTerminadosTramo(tramo, puntos)
    return {
      ...fila,
      metros: Math.min(fila.metros, topeMapa),
    }
  })
}

export async function cargarJornadasMaquinariaProyecto(
  supabase: SupabaseClient,
  proyectoId: string,
  tramosMapaPrecargado?: TramosMapaProyecto
): Promise<JornadaMaquinariaProyecto[]> {
  const { tramos, puntosAvance } =
    tramosMapaPrecargado ?? (await cargarTramosMapaProyecto(supabase, proyectoId))
  if (!tramos.length) return []

  const tramoPorId = new Map(
    tramos.map((t) => [t.id, { codigo: t.codigo, canal: t.canal }])
  )
  const tramoIds = [...tramoPorId.keys()]
  const longitudPorPuntoFin = mapaLongitudMinitramoPorPuntoFin(tramos, puntosAvance)
  const terminadoPorPuntoFin = mapaMinitramoTerminadoPorPuntoFin(tramos, puntosAvance)

  const { data, error } = await supabase
    .from("tramo_registros_maquinaria")
    .select("*")
    .in("tramo_id", tramoIds)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  const jornadas = (data ?? [])
    .map((row) => {
      const tramo = tramoPorId.get(String((row as Record<string, unknown>).tramo_id))
      if (!tramo) return null
      const jornada = normalizarJornada(row as Record<string, unknown>, tramo)
      return {
        ...jornada,
        metros_desasolados: metrosDesasoladosEfectivosJornada(
          jornada,
          longitudPorPuntoFin,
          terminadoPorPuntoFin
        ),
      }
    })
    .filter((j): j is JornadaMaquinariaProyecto => j != null)

  return filtrarJornadasMaquinariaParaConsolidado(tramos, puntosAvance, jornadas)
}
