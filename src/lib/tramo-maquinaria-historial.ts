import type { SupabaseClient } from "@supabase/supabase-js"

export type TramoRegistroMaquinaria = {
  id: string
  tramo_id: string
  fecha: string
  metros_desasolados: number
  equipo: string
  duracion_horas: number | null
  observaciones: string | null
  created_at: string
  updated_at: string
}

export type TramoRegistroMaquinariaInput = {
  fecha: string
  metros_desasolados: number
  equipo: string
  duracion_horas?: number | null
  observaciones?: string | null
}

function normalizar(row: Record<string, unknown>): TramoRegistroMaquinaria {
  return {
    id: String(row.id),
    tramo_id: String(row.tramo_id),
    fecha: String(row.fecha),
    metros_desasolados: Number(row.metros_desasolados),
    equipo: String(row.equipo),
    duracion_horas: row.duracion_horas != null ? Number(row.duracion_horas) : null,
    observaciones: row.observaciones ? String(row.observaciones) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

export async function cargarRegistrosMaquinariaTramo(
  supabase: SupabaseClient,
  tramoId: string
): Promise<TramoRegistroMaquinaria[]> {
  const { data, error } = await supabase
    .from("tramo_registros_maquinaria")
    .select("*")
    .eq("tramo_id", tramoId)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => normalizar(row as Record<string, unknown>))
}

export async function crearRegistroMaquinariaTramo(
  supabase: SupabaseClient,
  tramoId: string,
  input: TramoRegistroMaquinariaInput
): Promise<void> {
  const { error } = await supabase.from("tramo_registros_maquinaria").insert({
    tramo_id: tramoId,
    fecha: input.fecha,
    metros_desasolados: input.metros_desasolados,
    equipo: input.equipo.trim(),
    duracion_horas: input.duracion_horas ?? null,
    observaciones: input.observaciones?.trim() || null,
    updated_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
}

export async function eliminarRegistroMaquinariaTramo(
  supabase: SupabaseClient,
  registroId: string
): Promise<void> {
  const { error } = await supabase.from("tramo_registros_maquinaria").delete().eq("id", registroId)
  if (error) throw new Error(error.message)
}

export function formatearMetrosDesasolados(metros: number): string {
  if (metros >= 1000) return `${(metros / 1000).toFixed(2)} km`
  return `${metros.toFixed(0)} m`
}

export function formatearFechaRegistro(fechaIso: string): string {
  const [y, m, d] = fechaIso.split("-")
  if (!y || !m || !d) return fechaIso
  return `${d}/${m}/${y}`
}
