import type { SupabaseClient } from "@supabase/supabase-js"

export type ProyectoEquipoMaquinaria = {
  id: string
  proyecto_id: string
  nombre: string
  activo: boolean
  created_at: string
  updated_at: string
}

export type ActualizarEquipoMaquinariaInput = {
  nombre?: string
  activo?: boolean
}

function normalizar(row: Record<string, unknown>): ProyectoEquipoMaquinaria {
  return {
    id: String(row.id),
    proyecto_id: String(row.proyecto_id),
    nombre: String(row.nombre),
    activo: Boolean(row.activo),
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

export async function cargarEquiposMaquinariaProyecto(
  supabase: SupabaseClient,
  proyectoId: string,
  options?: { soloActivos?: boolean }
): Promise<ProyectoEquipoMaquinaria[]> {
  let query = supabase
    .from("proyecto_equipos_maquinaria")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("nombre", { ascending: true })

  if (options?.soloActivos) {
    query = query.eq("activo", true)
  }

  const { data, error } = await query
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => normalizar(row as Record<string, unknown>))
}

export async function crearEquipoMaquinaria(
  supabase: SupabaseClient,
  proyectoId: string,
  nombre: string
): Promise<ProyectoEquipoMaquinaria> {
  const trimmed = nombre.trim()
  if (!trimmed) throw new Error("El nombre del equipo es obligatorio.")

  const { data, error } = await supabase
    .from("proyecto_equipos_maquinaria")
    .insert({
      proyecto_id: proyectoId,
      nombre: trimmed,
      updated_at: new Date().toISOString(),
    })
    .select("*")
    .single()

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe un equipo con ese nombre en este proyecto.")
    }
    throw new Error(error.message)
  }

  return normalizar(data as Record<string, unknown>)
}

export async function actualizarEquipoMaquinaria(
  supabase: SupabaseClient,
  equipoId: string,
  input: ActualizarEquipoMaquinariaInput
): Promise<void> {
  const payload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }

  if (input.nombre !== undefined) {
    const trimmed = input.nombre.trim()
    if (!trimmed) throw new Error("El nombre del equipo es obligatorio.")
    payload.nombre = trimmed
  }

  if (input.activo !== undefined) {
    payload.activo = input.activo
  }

  const { error } = await supabase
    .from("proyecto_equipos_maquinaria")
    .update(payload)
    .eq("id", equipoId)

  if (error) {
    if (error.code === "23505") {
      throw new Error("Ya existe un equipo con ese nombre en este proyecto.")
    }
    throw new Error(error.message)
  }
}
