import type { SupabaseClient } from "@supabase/supabase-js"

import {
  normalizarRegistroMaquinariaJornada,
  type RegistroMaquinariaJornada,
  type TipoMaquinaJornada,
} from "@/src/data/auditoria/types"

export async function cargarRegistrosMaquinariaJornadaProyecto(
  supabase: SupabaseClient,
  proyectoId: string,
  rango?: { desde: string; hasta: string }
): Promise<RegistroMaquinariaJornada[]> {
  let q = supabase
    .from("registros_maquinaria_jornada")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("fecha", { ascending: false })

  if (rango) {
    q = q.gte("fecha", rango.desde).lte("fecha", rango.hasta)
  }

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) =>
    normalizarRegistroMaquinariaJornada(row as Record<string, unknown>)
  )
}

export type CrearRegistroMaquinariaJornadaInput = {
  proyecto_id: string
  maquina_codigo: string
  tipo_maquina: TipoMaquinaJornada
  horometro_inicio: number
  horometro_fin: number
  fecha: string
  combustible_galones?: number | null
}

export async function crearRegistroMaquinariaJornada(
  supabase: SupabaseClient,
  input: CrearRegistroMaquinariaJornadaInput
): Promise<RegistroMaquinariaJornada> {
  const { data, error } = await supabase
    .from("registros_maquinaria_jornada")
    .insert({
      proyecto_id: input.proyecto_id,
      maquina_codigo: input.maquina_codigo,
      tipo_maquina: input.tipo_maquina,
      horometro_inicio: input.horometro_inicio,
      horometro_fin: input.horometro_fin,
      fecha: input.fecha,
      combustible_galones: input.combustible_galones ?? null,
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return normalizarRegistroMaquinariaJornada(data as Record<string, unknown>)
}
