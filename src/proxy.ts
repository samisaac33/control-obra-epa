import { NextResponse, type NextRequest } from "next/server"

import {
  PROYECTO_DESASOLVE_CANALES,
  PROYECTO_EMERGENCIA_MANABI,
} from "@/src/data/proyectos/catalog"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import { updateSession } from "@/src/lib/supabase/middleware"

const REDIRECTS_EMERGENCIA: Record<string, string> = {
  "/presupuesto": rutaObra(PROYECTO_EMERGENCIA_MANABI, "presupuesto"),
  "/emergencia": rutaObra(PROYECTO_EMERGENCIA_MANABI, "emergencia"),
  "/libro-obra": rutaObra(PROYECTO_EMERGENCIA_MANABI, "libro-obra"),
}

const REDIRECTS_AMBIGUOS: Record<string, string> = {
  "/fotos": "/",
  "/maquinaria": "/",
}

export async function proxy(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  const residenteEmail = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()
  const isResident = !residenteEmail || user?.email?.toLowerCase() === residenteEmail

  if (user && isResident && pathname === "/login") {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = "/"
    return NextResponse.redirect(homeUrl)
  }

  if (pathname === "/mapa") {
    const url = request.nextUrl.clone()
    url.pathname = rutaObra(PROYECTO_DESASOLVE_CANALES, "mapa")
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
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
