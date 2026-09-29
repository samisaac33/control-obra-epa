import { NextResponse, type NextRequest } from "next/server"

import { isVisitaGateConfigured, validarCookieVisita } from "@/src/lib/visita-acceso"

export async function GET(request: NextRequest) {
  const gateEnabled = isVisitaGateConfigured()
  const authenticated = gateEnabled ? await validarCookieVisita(request) : false
  return NextResponse.json({ gateEnabled, authenticated })
}
