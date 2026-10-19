import type { SupabaseClient } from "@supabase/supabase-js"

import {
  cargarTramosMapaProyecto,
  type TramosMapaProyecto,
} from "@/src/lib/cargar-tramos-mapa-proyecto"
import { mapaLongitudMinitramoPorPuntoFin } from "@/src/lib/mapa-jornada-minitramo"
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
  longitudPorPuntoFin: ReadonlyMap<string, number>
): number {
  if (jornada.punto_avance_id) {
    const longitudGps = longitudPorPuntoFin.get(jornada.punto_avance_id)
    if (longitudGps != null && longitudGps > 0) return longitudGps
  }
  return jornada.metros_desasolados
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

  const { data, error } = await supabase
    .from("tramo_registros_maquinaria")
    .select("*")
    .in("tramo_id", tramoIds)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)

  return (data ?? [])
    .map((row) => {
      const tramo = tramoPorId.get(String((row as Record<string, unknown>).tramo_id))
      if (!tramo) return null
      const jornada = normalizarJornada(row as Record<string, unknown>, tramo)
      return {
        ...jornada,
        metros_desasolados: metrosDesasoladosEfectivosJornada(jornada, longitudPorPuntoFin),
      }
    })
    .filter((j): j is JornadaMaquinariaProyecto => j != null)
}
