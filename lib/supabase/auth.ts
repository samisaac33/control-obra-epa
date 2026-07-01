import type { SupabaseClient, User } from "@supabase/supabase-js"

import { OBRA_DEMO } from "@/lib/sicc/demo-obra"
import type { PerfilSicc, RolSicc } from "@/lib/sicc/types"
import { ROLES_REGISTRO } from "@/lib/sicc/types"

interface PerfilRow {
  id: string
  obra_id: string
  rol: RolSicc
  nombre: string
  email: string
}

function perfilDesdeFila(row: PerfilRow): PerfilSicc {
  return {
    id: row.id,
    obraId: row.obra_id,
    rol: row.rol,
    nombre: row.nombre,
    email: row.email,
  }
}

export async function cargarPerfil(
  supabase: SupabaseClient,
  userId: string
): Promise<PerfilSicc | null> {
  const { data, error } = await supabase
    .from("sicc_perfiles")
    .select("*")
    .eq("id", userId)
    .maybeSingle()

  if (error) throw error
  if (!data) return null
  return perfilDesdeFila(data as PerfilRow)
}

export async function registrarUsuario(
  supabase: SupabaseClient,
  datos: {
    email: string
    password: string
    nombre: string
    rol: RolSicc
  }
): Promise<{ user: User; perfil: PerfilSicc }> {
  if (!ROLES_REGISTRO.includes(datos.rol)) {
    throw new Error("Rol no permitido en el registro público")
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: datos.email,
    password: datos.password,
  })

  if (authError) throw authError
  if (!authData.user) throw new Error("No se pudo crear la cuenta")
  if (!authData.session) {
    throw new Error(
      "Cuenta creada. Revise su correo para confirmar, o desactive la confirmación en Supabase Auth."
    )
  }

  const perfilRow = {
    id: authData.user.id,
    obra_id: OBRA_DEMO.id,
    rol: datos.rol,
    nombre: datos.nombre,
    email: datos.email,
  }

  const { error: perfilError } = await supabase.from("sicc_perfiles").insert(perfilRow)
  if (perfilError) throw perfilError

  return {
    user: authData.user,
    perfil: perfilDesdeFila(perfilRow),
  }
}

export async function iniciarSesion(
  supabase: SupabaseClient,
  email: string,
  password: string
): Promise<{ user: User; perfil: PerfilSicc | null }> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  if (!data.user) throw new Error("Credenciales inválidas")

  const perfil = await cargarPerfil(supabase, data.user.id)
  return { user: data.user, perfil }
}

export async function cerrarSesion(supabase: SupabaseClient): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export function puedeEditarCampo(rol: RolSicc | null): boolean {
  return rol === "residente"
}

export function puedeReiniciarDemo(rol: RolSicc | null): boolean {
  return rol === "residente" || rol === "administrador"
}

export function puedeAdministrar(rol: RolSicc | null): boolean {
  return rol === "administrador"
}

export function etiquetaRol(rol: RolSicc): string {
  const etiquetas: Record<RolSicc, string> = {
    residente: "Residente de obra",
    visitante: "Visitante",
    fiscalizador: "Fiscalizador",
    administrador: "Administrador",
  }
  return etiquetas[rol]
}
