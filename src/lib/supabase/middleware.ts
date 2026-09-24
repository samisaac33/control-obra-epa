import { createServerClient } from "@supabase/ssr"
import type { User } from "@supabase/supabase-js"
import { type NextRequest, NextResponse } from "next/server"

function hasSupabaseAuthCookie(request: NextRequest) {
  return request.cookies.getAll().some((cookie) => cookie.name.startsWith("sb-"))
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    return { response, user: null as User | null }
  }

  const pathname = request.nextUrl.pathname
  const needsAuthCheck = pathname === "/login" || hasSupabaseAuthCookie(request)

  if (!needsAuthCheck) {
    return { response, user: null as User | null }
  }

  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options))
        },
      },
    })

    const {
      data: { user },
    } = await supabase.auth.getUser()

    return { response, user }
  } catch {
    return { response, user: null as User | null }
  }
}
