import type { SupabaseClient } from "@supabase/supabase-js"

import { formatearFechaRegistro } from "@/src/lib/tramo-maquinaria-historial"

export type MovimientoCamaBaja = {
  id: string
  proyecto_id: string
  fecha: string
  cama_baja: string
  maquina_transportada: string
  maquina_equipo_id: string | null
  origen: string | null
  destino: string | null
  duracion_horas: number | null
  observaciones: string | null
  created_at: string
  updated_at: string
}

export type MovimientoCamaBajaInput = {
  fecha: string
  cama_baja: string
  maquina_transportada: string
  maquina_equipo_id?: string | null
  origen?: string | null
  destino?: string | null
  duracion_horas?: number | null
  observaciones?: string | null
}

export type PeriodoMovimientosCamaBaja = {
  inicio: string
  fin: string
  etiqueta: string
}

export const PERIODO_CAMA_BAJA_VACIO: PeriodoMovimientosCamaBaja = {
  inicio: "",
  fin: "",
  etiqueta: "Sin movimientos aún",
}

function normalizar(row: Record<string, unknown>): MovimientoCamaBaja {
  return {
    id: String(row.id),
    proyecto_id: String(row.proyecto_id),
    fecha: String(row.fecha),
    cama_baja: String(row.cama_baja),
    maquina_transportada: String(row.maquina_transportada),
    maquina_equipo_id: row.maquina_equipo_id != null ? String(row.maquina_equipo_id) : null,
    origen: row.origen ? String(row.origen) : null,
    destino: row.destino ? String(row.destino) : null,
    duracion_horas: row.duracion_horas != null ? Number(row.duracion_horas) : null,
    observaciones: row.observaciones ? String(row.observaciones) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

export function periodoDesdeMovimientosCamaBaja(
  movimientos: MovimientoCamaBaja[]
): PeriodoMovimientosCamaBaja {
  if (movimientos.length === 0) return PERIODO_CAMA_BAJA_VACIO
  const fechas = [...new Set(movimientos.map((m) => m.fecha))].sort()
  const inicio = fechas[0]!
  const fin = fechas[fechas.length - 1]!
  const etiqueta =
    inicio === fin
      ? formatearFechaRegistro(inicio)
      : `${formatearFechaRegistro(inicio)} — ${formatearFechaRegistro(fin)}`
  return { inicio, fin, etiqueta }
}

export function totalHorasMovimientosCamaBaja(movimientos: readonly MovimientoCamaBaja[]): number {
  let total = 0
  for (const m of movimientos) {
    if (m.duracion_horas != null) total += m.duracion_horas
  }
  return total
}

export function agruparMovimientosCamaBajaPorFecha(
  movimientos: MovimientoCamaBaja[]
): { fecha: string; movimientos: MovimientoCamaBaja[] }[] {
  const map = new Map<string, MovimientoCamaBaja[]>()
  for (const m of movimientos) {
    const lista = map.get(m.fecha) ?? []
    lista.push(m)
    map.set(m.fecha, lista)
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, items]) => ({
      fecha,
      movimientos: items.sort((x, y) => y.created_at.localeCompare(x.created_at)),
    }))
}

export async function listarMovimientosCamaBaja(
  supabase: SupabaseClient,
  proyectoId: string
): Promise<MovimientoCamaBaja[]> {
  const { data, error } = await supabase
    .from("proyecto_movimientos_cama_baja")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => normalizar(row as Record<string, unknown>))
}

export async function crearMovimientoCamaBaja(
  supabase: SupabaseClient,
  proyectoId: string,
  input: MovimientoCamaBajaInput
): Promise<void> {
  const { error } = await supabase.from("proyecto_movimientos_cama_baja").insert({
    proyecto_id: proyectoId,
    fecha: input.fecha,
    cama_baja: input.cama_baja.trim(),
    maquina_transportada: input.maquina_transportada.trim(),
    maquina_equipo_id: input.maquina_equipo_id ?? null,
    origen: input.origen?.trim() || null,
    destino: input.destino?.trim() || null,
    duracion_horas: input.duracion_horas ?? null,
    observaciones: input.observaciones?.trim() || null,
    updated_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
}

export async function actualizarMovimientoCamaBaja(
  supabase: SupabaseClient,
  movimientoId: string,
  input: MovimientoCamaBajaInput
): Promise<void> {
  const { error } = await supabase
    .from("proyecto_movimientos_cama_baja")
    .update({
      fecha: input.fecha,
      cama_baja: input.cama_baja.trim(),
      maquina_transportada: input.maquina_transportada.trim(),
      maquina_equipo_id: input.maquina_equipo_id ?? null,
      origen: input.origen?.trim() || null,
      destino: input.destino?.trim() || null,
      duracion_horas: input.duracion_horas ?? null,
      observaciones: input.observaciones?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", movimientoId)

  if (error) throw new Error(error.message)
}

export async function eliminarMovimientoCamaBaja(
  supabase: SupabaseClient,
  movimientoId: string
): Promise<void> {
  const { error } = await supabase.from("proyecto_movimientos_cama_baja").delete().eq("id", movimientoId)
  if (error) throw new Error(error.message)
}
