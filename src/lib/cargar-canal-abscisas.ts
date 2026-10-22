import type { SupabaseClient } from "@supabase/supabase-js"

import {
  normalizarCanalAbscisa,
  type CanalAbscisa,
  type EstadoAbscisaCanal,
} from "@/src/data/auditoria/types"

export async function cargarCanalAbscisasProyecto(
  supabase: SupabaseClient,
  proyectoId: string
): Promise<CanalAbscisa[]> {
  const { data, error } = await supabase
    .from("canal_abscisas")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("sector_nombre")
    .order("abscisa_inicio")

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => normalizarCanalAbscisa(row as Record<string, unknown>))
}

export type ActualizarAreasAbscisaInput = {
  area_inicial_m2: number | null
  area_final_m2: number | null
  estado?: EstadoAbscisaCanal
  fecha_ejecucion?: string | null
}

export async function actualizarAreasCanalAbscisa(
  supabase: SupabaseClient,
  abscisaId: string,
  input: ActualizarAreasAbscisaInput
): Promise<CanalAbscisa> {
  const payload: Record<string, unknown> = {
    area_inicial_m2: input.area_inicial_m2,
    area_final_m2: input.area_final_m2,
    updated_at: new Date().toISOString(),
  }
  if (input.estado) payload.estado = input.estado
  if (input.fecha_ejecucion !== undefined) payload.fecha_ejecucion = input.fecha_ejecucion

  const { data, error } = await supabase
    .from("canal_abscisas")
    .update(payload)
    .eq("id", abscisaId)
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return normalizarCanalAbscisa(data as Record<string, unknown>)
}
