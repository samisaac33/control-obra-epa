import type { SupabaseClient } from "@supabase/supabase-js"

import type { PlanillaNumero } from "@/src/data/planilla/types"
import type { MedicionRubroGuardada } from "@/src/lib/planilla-requerimiento-pago"

export async function cargarMedicionesRubrosPlanilla(
  supabase: SupabaseClient,
  proyectoId: string,
  planillaNumero: PlanillaNumero
): Promise<MedicionRubroGuardada[]> {
  const { data, error } = await supabase
    .from("planilla_medicion_rubros")
    .select("rubro_id, cantidad_periodo, cantidad_acumulada_anterior")
    .eq("proyecto_id", proyectoId)
    .eq("planilla_numero", planillaNumero)

  if (error) throw new Error(error.message)

  return (data ?? []).map((row) => ({
    rubro_id: Number(row.rubro_id),
    cantidad_periodo: Number(row.cantidad_periodo),
    cantidad_acumulada_anterior: Number(row.cantidad_acumulada_anterior),
  }))
}

export type GuardarMedicionRubroInput = {
  proyecto_id: string
  planilla_numero: PlanillaNumero
  rubro_id: number
  cantidad_periodo: number
  cantidad_acumulada_anterior: number
  observaciones?: string | null
}

export async function guardarMedicionesRubrosPlanilla(
  supabase: SupabaseClient,
  filas: GuardarMedicionRubroInput[]
): Promise<void> {
  if (filas.length === 0) return

  const payload = filas.map((f) => ({
    proyecto_id: f.proyecto_id,
    planilla_numero: f.planilla_numero,
    rubro_id: f.rubro_id,
    cantidad_periodo: f.cantidad_periodo,
    cantidad_acumulada_anterior: f.cantidad_acumulada_anterior,
    observaciones: f.observaciones ?? null,
    updated_at: new Date().toISOString(),
  }))

  const { error } = await supabase
    .from("planilla_medicion_rubros")
    .upsert(payload, { onConflict: "proyecto_id,planilla_numero,rubro_id" })

  if (error) throw new Error(error.message)
}
