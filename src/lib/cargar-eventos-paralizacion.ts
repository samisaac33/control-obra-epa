import type { SupabaseClient } from "@supabase/supabase-js"

import {
  normalizarEventoParalizacion,
  type EventoParalizacion,
  type TipoEventoParalizacion,
} from "@/src/data/auditoria/types"
import { generarTextoLibroObraParalizacion } from "@/src/lib/salva-plazos-texto-libro-obra"

export async function cargarEventosParalizacionProyecto(
  supabase: SupabaseClient,
  proyectoId: string
): Promise<EventoParalizacion[]> {
  const { data, error } = await supabase
    .from("eventos_paralizacion")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("fecha_inicio", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => normalizarEventoParalizacion(row as Record<string, unknown>))
}

export type CrearEventoParalizacionInput = {
  proyecto_id: string
  tipo_evento: TipoEventoParalizacion
  fecha_inicio: string
  fecha_fin?: string | null
  horas_perdidas?: number | null
  descripcion?: string | null
  foto_evidencia_url?: string | null
  registrado_por?: string | null
  sector_nombre?: string
}

function calcularHorasPerdidas(inicio: string, fin: string | null | undefined): number | null {
  if (!fin) return null
  const ms = new Date(fin).getTime() - new Date(inicio).getTime()
  if (!Number.isFinite(ms) || ms < 0) return null
  return Math.round((ms / 3_600_000) * 100) / 100
}

export async function crearEventoParalizacion(
  supabase: SupabaseClient,
  input: CrearEventoParalizacionInput
): Promise<EventoParalizacion> {
  const horas =
    input.horas_perdidas ?? calcularHorasPerdidas(input.fecha_inicio, input.fecha_fin ?? null)

  const texto_libro_obra = generarTextoLibroObraParalizacion({
    tipo_evento: input.tipo_evento,
    fecha_inicio: input.fecha_inicio,
    fecha_fin: input.fecha_fin ?? null,
    horas_perdidas: horas,
    descripcion: input.descripcion ?? null,
    sector_nombre: input.sector_nombre,
  })

  const { data, error } = await supabase
    .from("eventos_paralizacion")
    .insert({
      proyecto_id: input.proyecto_id,
      tipo_evento: input.tipo_evento,
      fecha_inicio: input.fecha_inicio,
      fecha_fin: input.fecha_fin ?? null,
      horas_perdidas: horas,
      descripcion: input.descripcion ?? null,
      texto_libro_obra,
      foto_evidencia_url: input.foto_evidencia_url ?? null,
      registrado_por: input.registrado_por ?? null,
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  return normalizarEventoParalizacion(data as Record<string, unknown>)
}
