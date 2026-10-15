import { NextResponse, type NextRequest } from "next/server"

import {
  PROYECTO_DESASOLVE_CANALES,
  PROYECTO_EMERGENCIA_MANABI,
} from "@/src/data/proyectos/catalog"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import { updateSession } from "@/src/lib/supabase/middleware"
import {
  isVisitaGateConfigured,
  rutasPublicasVisita,
  validarCookieVisita,
} from "@/src/lib/visita-acceso"

const REDIRECTS_EMERGENCIA: Record<string, string> = {
  "/presupuesto": rutaObra(PROYECTO_EMERGENCIA_MANABI, "presupuesto"),
  "/emergencia": rutaObra(PROYECTO_EMERGENCIA_MANABI, "emergencia"),
  "/libro-obra": rutaObra(PROYECTO_EMERGENCIA_MANABI, "libro-obra"),
}

const REDIRECTS_AMBIGUOS: Record<string, string> = {
  "/fotos": "/",
  "/maquinaria": "/",
}

const RUTA_MAPA_DESASOLVE = rutaObra(PROYECTO_DESASOLVE_CANALES, "mapa")

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  const residenteEmail = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()
  const isResident = Boolean(
    residenteEmail && user?.email?.toLowerCase() === residenteEmail
  )

  const visitaGateActivo = isVisitaGateConfigured()
  const visitaAutenticada = visitaGateActivo ? await validarCookieVisita(request) : false

  if (visitaGateActivo && !isResident && visitaAutenticada && pathname === "/") {
    const mapaUrl = request.nextUrl.clone()
    mapaUrl.pathname = RUTA_MAPA_DESASOLVE
    return NextResponse.redirect(mapaUrl)
  }

  if (
    visitaGateActivo &&
    !rutasPublicasVisita(pathname) &&
    !isResident &&
    !visitaAutenticada
  ) {
    const ingresoUrl = request.nextUrl.clone()
    ingresoUrl.pathname = "/ingreso"
    const destinoTrasIngreso =
      pathname === "/" ? RUTA_MAPA_DESASOLVE : `${pathname}${request.nextUrl.search}`
    ingresoUrl.searchParams.set("next", destinoTrasIngreso)
    return NextResponse.redirect(ingresoUrl)
  }

  if (user && isResident && pathname === "/login") {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = "/"
    return NextResponse.redirect(homeUrl)
  }

  if (pathname === "/infima") {
    const url = request.nextUrl.clone()
    url.pathname = "/infimas"
    return NextResponse.redirect(url)
  }

  if (pathname === "/mapa") {
    const url = request.nextUrl.clone()
    url.pathname = RUTA_MAPA_DESASOLVE
    return NextResponse.redirect(url)
  }

  const destinoEmergencia = REDIRECTS_EMERGENCIA[pathname]
  if (destinoEmergencia) {
    const url = request.nextUrl.clone()
    url.pathname = destinoEmergencia
    return NextResponse.redirect(url)
  }

  const destinoAmbiguo = REDIRECTS_AMBIGUOS[pathname]
  if (destinoAmbiguo) {
    const url = request.nextUrl.clone()
    url.pathname = destinoAmbiguo
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)",
  ],
}
