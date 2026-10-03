import type { SupabaseClient } from "@supabase/supabase-js"

import type { ProyectoEquipoMaquinaria } from "@/src/lib/proyecto-equipos-maquinaria"

export type TramoRegistroMaquinaria = {
  id: string
  tramo_id: string
  fecha: string
  metros_desasolados: number
  equipo: string
  equipo_id: string | null
  punto_avance_id: string | null
  duracion_horas: number | null
  observaciones: string | null
  created_at: string
  updated_at: string
}

export type TramoRegistroMaquinariaInput = {
  fecha: string
  metros_desasolados: number
  equipo: string
  equipo_id?: string | null
  duracion_horas?: number | null
  observaciones?: string | null
}

/** Datos de jornada resumidos para tooltip de minitramo en mapa visitante. */
export type JornadaMinitramoMapa = {
  fecha: string
  metros_desasolados: number
  equipoNombre: string
  duracion_horas: number | null
}

function normalizar(row: Record<string, unknown>): TramoRegistroMaquinaria {
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
  }
}

export function mapaEquiposPorId(
  equipos: ProyectoEquipoMaquinaria[]
): Map<string, ProyectoEquipoMaquinaria> {
  return new Map(equipos.map((e) => [e.id, e]))
}

export function nombreEquipoParaMostrar(
  registro: Pick<TramoRegistroMaquinaria, "equipo" | "equipo_id">,
  equiposPorId: Map<string, ProyectoEquipoMaquinaria>
): string {
  if (registro.equipo_id) {
    const catalogo = equiposPorId.get(registro.equipo_id)
    if (catalogo?.nombre.trim()) return catalogo.nombre.trim()
  }
  return registro.equipo
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

export async function cargarRegistroMaquinariaPorPuntoAvance(
  supabase: SupabaseClient,
  puntoAvanceId: string
): Promise<TramoRegistroMaquinaria | null> {
  const { data, error } = await supabase
    .from("tramo_registros_maquinaria")
    .select("*")
    .eq("punto_avance_id", puntoAvanceId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null
  return normalizar(data as Record<string, unknown>)
}

export async function crearRegistroMaquinariaTramo(
  supabase: SupabaseClient,
  tramoId: string,
  input: TramoRegistroMaquinariaInput,
  options?: { punto_avance_id?: string | null }
): Promise<void> {
  const { error } = await supabase.from("tramo_registros_maquinaria").insert({
    tramo_id: tramoId,
    fecha: input.fecha,
    metros_desasolados: input.metros_desasolados,
    equipo: input.equipo.trim(),
    equipo_id: input.equipo_id ?? null,
    punto_avance_id: options?.punto_avance_id ?? null,
    duracion_horas: input.duracion_horas ?? null,
    observaciones: input.observaciones?.trim() || null,
    updated_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
}

export async function actualizarRegistroMaquinariaTramo(
  supabase: SupabaseClient,
  registroId: string,
  input: TramoRegistroMaquinariaInput,
  options?: { punto_avance_id?: string | null }
): Promise<void> {
  const payload: Record<string, unknown> = {
    fecha: input.fecha,
    metros_desasolados: input.metros_desasolados,
    equipo: input.equipo.trim(),
    equipo_id: input.equipo_id ?? null,
    duracion_horas: input.duracion_horas ?? null,
    observaciones: input.observaciones?.trim() || null,
    updated_at: new Date().toISOString(),
  }

  if (options?.punto_avance_id !== undefined) {
    payload.punto_avance_id = options.punto_avance_id
  }

  const { error } = await supabase
    .from("tramo_registros_maquinaria")
    .update(payload)
    .eq("id", registroId)

  if (error) throw new Error(error.message)
}

export async function guardarJornadaMinitramo(
  supabase: SupabaseClient,
  tramoId: string,
  puntoAvanceId: string,
  input: TramoRegistroMaquinariaInput,
  registroExistenteId?: string | null
): Promise<void> {
  let registroId = registroExistenteId ?? null

  if (!registroId) {
    const porPunto = await cargarRegistroMaquinariaPorPuntoAvance(supabase, puntoAvanceId)
    registroId = porPunto?.id ?? null
  }

  if (registroId) {
    await actualizarRegistroMaquinariaTramo(supabase, registroId, input, {
      punto_avance_id: puntoAvanceId,
    })
    return
  }

  await crearRegistroMaquinariaTramo(supabase, tramoId, input, {
    punto_avance_id: puntoAvanceId,
  })
}

export async function propagarRenombreEquipoEnHistorialTramo(
  supabase: SupabaseClient,
  params: {
    equipoId: string
    proyectoId: string
    nombreAnterior: string
    nombreNuevo: string
  }
): Promise<void> {
  const { equipoId, proyectoId, nombreAnterior, nombreNuevo } = params
  const ahora = new Date().toISOString()

  const { error: errorPorId } = await supabase
    .from("tramo_registros_maquinaria")
    .update({ equipo: nombreNuevo, updated_at: ahora })
    .eq("equipo_id", equipoId)

  if (errorPorId) throw new Error(errorPorId.message)

  const { data: tramos, error: errorTramos } = await supabase
    .from("canal_tramos")
    .select("id")
    .eq("proyecto_id", proyectoId)

  if (errorTramos) throw new Error(errorTramos.message)

  const tramoIds = (tramos ?? []).map((t) => String(t.id))
  if (tramoIds.length === 0) return

  const nombreAnteriorNorm = nombreAnterior.trim().toLowerCase()

  const { data: legacyRows, error: errorLegacySelect } = await supabase
    .from("tramo_registros_maquinaria")
    .select("id, equipo")
    .in("tramo_id", tramoIds)
    .is("equipo_id", null)

  if (errorLegacySelect) throw new Error(errorLegacySelect.message)

  const legacyIds = (legacyRows ?? [])
    .filter((row) => String(row.equipo).trim().toLowerCase() === nombreAnteriorNorm)
    .map((row) => String(row.id))

  if (legacyIds.length === 0) return

  const { error: errorLegacyUpdate } = await supabase
    .from("tramo_registros_maquinaria")
    .update({
      equipo: nombreNuevo,
      equipo_id: equipoId,
      updated_at: ahora,
    })
    .in("id", legacyIds)

  if (errorLegacyUpdate) throw new Error(errorLegacyUpdate.message)
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
