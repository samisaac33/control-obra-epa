import type { SupabaseClient } from "@supabase/supabase-js"

import { normalizarPlanillaConfig, type ProyectoPlanillaConfig } from "@/src/data/planilla/types"

export async function cargarPlanillaConfigProyecto(
  supabase: SupabaseClient,
  proyectoId: string
): Promise<ProyectoPlanillaConfig | null> {
  const { data, error } = await supabase
    .from("proyecto_planilla_config")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return normalizarPlanillaConfig(data as Record<string, unknown>)
}

export type GuardarPlanillaConfigInput = {
  proyecto_id: string
  fecha_inicio_plazo: string
  plazo_dias?: number
  dias_por_planilla?: number
  porcentaje_avance_planilla_1: number
  observaciones?: string | null
  registrado_por?: string | null
}

export async function guardarPlanillaConfigProyecto(
  supabase: SupabaseClient,
  input: GuardarPlanillaConfigInput
): Promise<ProyectoPlanillaConfig> {
  const payload = {
    proyecto_id: input.proyecto_id,
    fecha_inicio_plazo: input.fecha_inicio_plazo,
    plazo_dias: input.plazo_dias ?? 60,
    dias_por_planilla: input.dias_por_planilla ?? 30,
    porcentaje_avance_planilla_1: input.porcentaje_avance_planilla_1,
    observaciones: input.observaciones ?? null,
    registrado_por: input.registrado_por ?? null,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from("proyecto_planilla_config")
    .upsert(payload, { onConflict: "proyecto_id" })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return normalizarPlanillaConfig(data as Record<string, unknown>)
}
