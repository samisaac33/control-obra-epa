import type { SupabaseClient } from "@supabase/supabase-js"

import { cargarTramosMapaProyecto } from "@/src/lib/cargar-tramos-mapa-proyecto"
import { mapaLongitudMinitramoPorPuntoFin } from "@/src/lib/mapa-jornada-minitramo"
import type { TramoRegistroMaquinaria } from "@/src/lib/tramo-maquinaria-historial"
import { formatearFechaRegistro } from "@/src/lib/tramo-maquinaria-historial"

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
    id: String(row.id),
    tramo_id: String(row.tramo_id),
    fecha: String(row.fecha),
    metros_desasolados: Number(row.metros_desasolados),
    equipo: String(row.equipo),
    equipo_id: row.equipo_id != null ? String(row.equipo_id) : null,
    punto_avance_id: row.punto_avance_id != null ? String(row.punto_avance_id) : null,
    duracion_horas: row.duracion_horas != null ? Number(row.duracion_horas) : null,
    observaciones: row.observaciones ? String(row.observaciones) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
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
  proyectoId: string
): Promise<JornadaMaquinariaProyecto[]> {
  const { tramos, puntosAvance } = await cargarTramosMapaProyecto(supabase, proyectoId)
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
