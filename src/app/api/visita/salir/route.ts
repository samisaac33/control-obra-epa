import { NextResponse } from "next/server"

import { VISITA_COOKIE_NAME } from "@/src/lib/visita-acceso"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(VISITA_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  })
  return response
}
