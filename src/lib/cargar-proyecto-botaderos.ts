import type { SupabaseClient } from "@supabase/supabase-js"

import { normalizarProyectoBotadero, type ProyectoBotadero } from "@/src/data/auditoria/types"

export async function cargarProyectoBotaderos(
  supabase: SupabaseClient,
  proyectoId: string,
  soloActivos = true
): Promise<ProyectoBotadero[]> {
  let q = supabase.from("proyecto_botaderos").select("*").eq("proyecto_id", proyectoId)
  if (soloActivos) q = q.eq("activo", true)
  const { data, error } = await q.order("nombre")
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => normalizarProyectoBotadero(row as Record<string, unknown>))
}
