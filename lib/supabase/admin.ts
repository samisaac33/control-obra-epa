import type { SupabaseClient } from "@supabase/supabase-js"

import type { PerfilSicc, RolSicc } from "@/lib/sicc/types"

interface PerfilRow {
  id: string
  obra_id: string
  rol: RolSicc
  nombre: string
  email: string
  created_at: string
}

function perfilDesdeFila(row: PerfilRow): PerfilSicc & { creadoEn: string } {
  return {
    id: row.id,
    obraId: row.obra_id,
    rol: row.rol,
    nombre: row.nombre,
    email: row.email,
    creadoEn: row.created_at,
  }
}

export async function listarPerfilesObra(
  supabase: SupabaseClient,
  obraId: string
): Promise<(PerfilSicc & { creadoEn: string })[]> {
  const { data, error } = await supabase
    .from("sicc_perfiles")
    .select("*")
    .eq("obra_id", obraId)
    .order("created_at", { ascending: true })

  if (error) throw error
  return (data as PerfilRow[]).map(perfilDesdeFila)
}

export async function actualizarRolPerfil(
  supabase: SupabaseClient,
  perfilId: string,
  rol: RolSicc
): Promise<void> {
  const { error } = await supabase
    .from("sicc_perfiles")
    .update({ rol })
    .eq("id", perfilId)

  if (error) throw error
}

export async function actualizarNombrePerfil(
  supabase: SupabaseClient,
  perfilId: string,
  nombre: string
): Promise<void> {
  const { error } = await supabase
    .from("sicc_perfiles")
    .update({ nombre })
    .eq("id", perfilId)

  if (error) throw error
}
