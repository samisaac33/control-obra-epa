import { createClient } from "@/src/lib/supabase/server"
import { getProyecto, proyectoTieneModulo } from "@/src/data/proyectos/catalog"

export type MapaAsistenteAuthOk = {
  ok: true
  userEmail: string
}

export type MapaAsistenteAuthFail = {
  ok: false
  status: number
  error: string
}

export async function autorizarMapaAsistente(
  proyectoId: string
): Promise<MapaAsistenteAuthOk | MapaAsistenteAuthFail> {
  if (!proyectoTieneModulo(proyectoId, "mapaTramos")) {
    return { ok: false, status: 404, error: "Proyecto o módulo de mapa no disponible." }
  }

  getProyecto(proyectoId)

  const residentEmail = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()
  if (!residentEmail) {
    return { ok: false, status: 503, error: "Residente no configurado en el servidor." }
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const email = user?.email?.trim().toLowerCase()
  if (!email || email !== residentEmail) {
    return { ok: false, status: 403, error: "Solo el residente autorizado puede usar el asistente." }
  }

  return { ok: true, userEmail: email }
}
