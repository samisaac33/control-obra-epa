import { createClient, type SupabaseClient } from "@supabase/supabase-js"

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
    cliente = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  }
  return cliente
}
