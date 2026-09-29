import { NextResponse } from "next/server"

import {
  VISITA_COOKIE_NAME,
  crearValorCookieVisita,
  isVisitaGateConfigured,
  opcionesCookieVisita,
  verificarPin,
} from "@/src/lib/visita-acceso"
import { ipDesdeRequest, registrarIntentoPin } from "@/src/lib/visita-rate-limit"

type Body = {
  pin?: string
}

export async function POST(request: Request) {
  if (!isVisitaGateConfigured()) {
    return NextResponse.json({ error: "Acceso por PIN no configurado." }, { status: 503 })
  }

  const ip = ipDesdeRequest(request)
  const rate = registrarIntentoPin(ip)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: "Demasiados intentos. Espere unos minutos e intente de nuevo." },
      {
        status: 429,
        headers: rate.retryAfterSec ? { "Retry-After": String(rate.retryAfterSec) } : undefined,
      }
    )
  }

  let body: Body
  try {
    body = (await request.json()) as Body
  } catch {
    return NextResponse.json({ error: "Solicitud inválida." }, { status: 400 })
  }

  const pin = typeof body.pin === "string" ? body.pin : ""
  const ok = await verificarPin(pin)
  if (!ok) {
    return NextResponse.json({ error: "PIN incorrecto." }, { status: 401 })
  }

  const cookieValue = await crearValorCookieVisita()
  if (!cookieValue) {
    return NextResponse.json({ error: "No se pudo iniciar la sesión de visita." }, { status: 500 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set(VISITA_COOKIE_NAME, cookieValue, opcionesCookieVisita())
  return response
}
