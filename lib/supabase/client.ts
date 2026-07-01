import { createBrowserClient } from "@supabase/ssr"
import type { SupabaseClient } from "@supabase/supabase-js"

export type FuenteDatosSicc = "supabase" | "local"

export function supabaseConfigurado(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )
}

let cliente: SupabaseClient | null = null

export function obtenerClienteSupabase(): SupabaseClient | null {
  if (!supabaseConfigurado()) return null
  if (!cliente) {
    cliente = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return cliente
}

/** Reinicia el singleton (p. ej. tras cerrar sesión). */
export function reiniciarClienteSupabase(): void {
  cliente = null
}
