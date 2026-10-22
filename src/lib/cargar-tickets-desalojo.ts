import type { SupabaseClient } from "@supabase/supabase-js"

import { normalizarTicketDesalojo, type TicketDesalojo } from "@/src/data/auditoria/types"

export type RangoFechasIso = { desde: string; hasta: string }

export async function cargarTicketsDesalojoProyecto(
  supabase: SupabaseClient,
  proyectoId: string,
  rango?: RangoFechasIso
): Promise<TicketDesalojo[]> {
  let q = supabase
    .from("tickets_desalojo")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("fecha_hora_despacho", { ascending: false })

  if (rango) {
    q = q
      .gte("fecha_hora_despacho", `${rango.desde}T00:00:00.000Z`)
      .lte("fecha_hora_despacho", `${rango.hasta}T23:59:59.999Z`)
  }

  const { data, error } = await q
  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => normalizarTicketDesalojo(row as Record<string, unknown>))
}

export type CrearTicketDesalojoInput = {
  proyecto_id: string
  placa_volqueta: string
  chofer?: string | null
  capacidad_m3?: number
  abscisa_id?: string | null
  lat_origen?: number | null
  lng_origen?: number | null
  botadero_nombre: string
  lat_destino?: number | null
  lng_destino?: number | null
  distancia_km?: number | null
  observaciones?: string | null
}

export async function crearTicketDesalojo(
  supabase: SupabaseClient,
  input: CrearTicketDesalojoInput
): Promise<TicketDesalojo> {
  const qr_hash = crypto.randomUUID()

  const { data, error } = await supabase
    .from("tickets_desalojo")
    .insert({
      proyecto_id: input.proyecto_id,
      numero_ticket: "",
      placa_volqueta: input.placa_volqueta.trim().toUpperCase(),
      chofer: input.chofer?.trim() || null,
      capacidad_m3: input.capacidad_m3 ?? 8,
      abscisa_id: input.abscisa_id ?? null,
      lat_origen: input.lat_origen ?? null,
      lng_origen: input.lng_origen ?? null,
      botadero_nombre: input.botadero_nombre,
      lat_destino: input.lat_destino ?? null,
      lng_destino: input.lng_destino ?? null,
      distancia_km: input.distancia_km ?? null,
      qr_hash,
      observaciones: input.observaciones ?? null,
      estado: "en_transito",
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return normalizarTicketDesalojo(data as Record<string, unknown>)
}
