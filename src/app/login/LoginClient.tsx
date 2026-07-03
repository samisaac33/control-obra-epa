"use client"

import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/src/lib/supabase/client"

const EMAIL_RESIDENTE = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()

export default function LoginClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = useMemo(() => searchParams.get("next") || "/", [searchParams])
  const [email, setEmail] = useState(EMAIL_RESIDENTE ?? "")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!EMAIL_RESIDENTE) return

    async function validateSession() {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user && user.email?.toLowerCase() !== EMAIL_RESIDENTE) {
        await supabase.auth.signOut()
        setError("Esta cuenta no tiene permisos de residente de obra.")
      }
    }

    void validateSession()
  }, [])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      })

      if (authError) {
        setError(authError.message)
        return
      }

      if (EMAIL_RESIDENTE && data.user?.email?.toLowerCase() !== EMAIL_RESIDENTE) {
        await supabase.auth.signOut()
        setError("Esta cuenta no tiene permisos de residente de obra.")
        return
      }

      router.replace(nextPath)
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[oklch(0.98_0.002_264)] px-4 py-8">
      <Card className="w-full max-w-md border-foreground/10 shadow-sm">
        <CardHeader>
          <CardTitle>Ingreso del residente</CardTitle>
          <CardDescription>Solo usuarios autorizados pueden editar información de obra.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-sm font-medium text-foreground">
                Correo
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="password" className="text-sm font-medium text-foreground">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none ring-0 transition focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Ingresando..." : "Iniciar sesión"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
