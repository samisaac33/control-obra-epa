import { getProyecto, proyectoTieneModulo } from "@/src/data/proyectos/catalog"
import { createClient } from "@/src/lib/supabase/server"
import {
  isVisitaGateConfigured,
  validarCookieVisitaDesdeRequest,
} from "@/src/lib/visita-acceso"

export type MapaAsistentePerfil = "residente" | "visitante"

export type MapaAsistenteAuthOk = {
  ok: true
  perfil: MapaAsistentePerfil
  rateLimitKey: string
  userEmail?: string
}

export type MapaAsistenteAuthFail = {
  ok: false
  status: number
  error: string
}

export async function autorizarAsistenteMapa(
  request: Request,
  proyectoId: string
): Promise<MapaAsistenteAuthOk | MapaAsistenteAuthFail> {
  if (!proyectoTieneModulo(proyectoId, "mapaTramos")) {
    return { ok: false, status: 404, error: "Proyecto o módulo de mapa no disponible." }
  }

  getProyecto(proyectoId)

  const residentEmail = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const email = user?.email?.trim().toLowerCase()
  if (residentEmail && email === residentEmail) {
    return {
      ok: true,
      perfil: "residente",
      rateLimitKey: `residente:${email}`,
      userEmail: email,
    }
  }

  const visitaGateActivo = isVisitaGateConfigured()
  if (visitaGateActivo) {
    const visitaOk = await validarCookieVisitaDesdeRequest(request)
    if (!visitaOk) {
      return {
        ok: false,
        status: 403,
        error: "Ingrese con el PIN de visita en /ingreso para usar la consulta del mapa.",
      }
    }
  }

  return {
    ok: true,
    perfil: "visitante",
    rateLimitKey: "visitante",
  }
}

/** @deprecated Usar autorizarAsistenteMapa */
export async function autorizarMapaAsistente(
  proyectoId: string
): Promise<{ ok: true; userEmail: string } | MapaAsistenteAuthFail> {
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
