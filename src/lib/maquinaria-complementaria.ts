import type { SupabaseClient } from "@supabase/supabase-js"

import { formatearFechaRegistro } from "@/src/lib/tramo-maquinaria-historial"

export type RegistroMaquinariaComplementaria = {
  id: string
  proyecto_id: string
  fecha: string
  equipo: string
  equipo_id: string | null
  duracion_horas: number | null
  descripcion_trabajo: string
  ubicacion_referencia: string | null
  observaciones: string | null
  created_at: string
  updated_at: string
}

export type RegistroMaquinariaComplementariaInput = {
  fecha: string
  equipo: string
  equipo_id?: string | null
  duracion_horas?: number | null
  descripcion_trabajo: string
  ubicacion_referencia?: string | null
  observaciones?: string | null
}

export type KpisMaquinariaComplementaria = {
  totalRegistros: number
  totalHoras: number
  equiposDistintos: number
}

export type PeriodoMaquinariaComplementaria = {
  inicio: string
  fin: string
  etiqueta: string
}

export const PERIODO_COMPLEMENTARIA_VACIO: PeriodoMaquinariaComplementaria = {
  inicio: "",
  fin: "",
  etiqueta: "Sin registros aún",
}

function normalizar(row: Record<string, unknown>): RegistroMaquinariaComplementaria {
  return {
    id: String(row.id),
    proyecto_id: String(row.proyecto_id),
    fecha: String(row.fecha),
    equipo: String(row.equipo),
    equipo_id: row.equipo_id != null ? String(row.equipo_id) : null,
    duracion_horas: row.duracion_horas != null ? Number(row.duracion_horas) : null,
    descripcion_trabajo: String(row.descripcion_trabajo),
    ubicacion_referencia: row.ubicacion_referencia ? String(row.ubicacion_referencia) : null,
    observaciones: row.observaciones ? String(row.observaciones) : null,
    created_at: String(row.created_at),
    updated_at: String(row.updated_at),
  }
}

export function periodoDesdeRegistrosComplementarios(
  registros: RegistroMaquinariaComplementaria[]
): PeriodoMaquinariaComplementaria {
  if (registros.length === 0) return PERIODO_COMPLEMENTARIA_VACIO
  const fechas = [...new Set(registros.map((r) => r.fecha))].sort()
  const inicio = fechas[0]!
  const fin = fechas[fechas.length - 1]!
  const etiqueta =
    inicio === fin
      ? formatearFechaRegistro(inicio)
      : `${formatearFechaRegistro(inicio)} — ${formatearFechaRegistro(fin)}`
  return { inicio, fin, etiqueta }
}

export function kpisMaquinariaComplementaria(
  registros: RegistroMaquinariaComplementaria[]
): KpisMaquinariaComplementaria {
  const equipos = new Set<string>()
  let totalHoras = 0

  for (const r of registros) {
    equipos.add(r.equipo_id ?? r.equipo.trim().toLowerCase())
    if (r.duracion_horas != null && r.duracion_horas > 0) {
      totalHoras += r.duracion_horas
    }
  }

  return {
    totalRegistros: registros.length,
    totalHoras,
    equiposDistintos: equipos.size,
  }
}

export function agruparRegistrosComplementariosPorFecha(
  registros: RegistroMaquinariaComplementaria[]
): { fecha: string; registros: RegistroMaquinariaComplementaria[] }[] {
  const map = new Map<string, RegistroMaquinariaComplementaria[]>()
  for (const r of registros) {
    const lista = map.get(r.fecha) ?? []
    lista.push(r)
    map.set(r.fecha, lista)
  }
  return [...map.entries()]
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([fecha, items]) => ({ fecha, registros: items }))
}

export async function listarRegistrosMaquinariaComplementaria(
  supabase: SupabaseClient,
  proyectoId: string
): Promise<RegistroMaquinariaComplementaria[]> {
  const { data, error } = await supabase
    .from("proyecto_maquinaria_complementaria")
    .select("*")
    .eq("proyecto_id", proyectoId)
    .order("fecha", { ascending: false })
    .order("created_at", { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []).map((row) => normalizar(row as Record<string, unknown>))
}

export async function crearRegistroMaquinariaComplementaria(
  supabase: SupabaseClient,
  proyectoId: string,
  input: RegistroMaquinariaComplementariaInput
): Promise<void> {
  const { error } = await supabase.from("proyecto_maquinaria_complementaria").insert({
    proyecto_id: proyectoId,
    fecha: input.fecha,
    equipo: input.equipo.trim(),
    equipo_id: input.equipo_id ?? null,
    duracion_horas: input.duracion_horas ?? null,
    descripcion_trabajo: input.descripcion_trabajo.trim(),
    ubicacion_referencia: input.ubicacion_referencia?.trim() || null,
    observaciones: input.observaciones?.trim() || null,
    updated_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
}

export async function actualizarRegistroMaquinariaComplementaria(
  supabase: SupabaseClient,
  registroId: string,
  input: RegistroMaquinariaComplementariaInput
): Promise<void> {
  const { error } = await supabase
    .from("proyecto_maquinaria_complementaria")
    .update({
      fecha: input.fecha,
      equipo: input.equipo.trim(),
      equipo_id: input.equipo_id ?? null,
      duracion_horas: input.duracion_horas ?? null,
      descripcion_trabajo: input.descripcion_trabajo.trim(),
      ubicacion_referencia: input.ubicacion_referencia?.trim() || null,
      observaciones: input.observaciones?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", registroId)

  if (error) throw new Error(error.message)
}

export async function eliminarRegistroMaquinariaComplementaria(
  supabase: SupabaseClient,
  registroId: string
): Promise<void> {
  const { error } = await supabase.from("proyecto_maquinaria_complementaria").delete().eq("id", registroId)
  if (error) throw new Error(error.message)
}
