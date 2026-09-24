import { NextResponse, type NextRequest } from "next/server"

import { updateSession } from "@/src/lib/supabase/middleware"

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request)
  const pathname = request.nextUrl.pathname

  const residenteEmail = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()
  const isResident = !residenteEmail || user?.email?.toLowerCase() === residenteEmail

  if (user && isResident && pathname === "/login") {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = "/"
    return NextResponse.redirect(homeUrl)
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
