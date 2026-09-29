"use client"

import Link from "next/link"
import { FormEvent, useEffect, useMemo, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

function rutaSegura(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/"
  if (next.startsWith("/ingreso") || next.startsWith("/login")) return "/"
  return next
}

export default function IngresoClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const nextPath = useMemo(() => rutaSegura(searchParams.get("next")), [searchParams])
  const loginHref = useMemo(() => {
    const params = new URLSearchParams()
    if (nextPath !== "/") params.set("next", nextPath)
    const qs = params.toString()
    return qs ? `/login?${qs}` : "/login"
  }, [nextPath])

  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function redirigirSiYaAutenticado() {
      try {
        const res = await fetch("/api/visita/estado")
        if (!res.ok) return
        const data = (await res.json()) as { gateEnabled?: boolean; authenticated?: boolean }
        if (data.gateEnabled && data.authenticated) {
          router.replace(nextPath)
        }
      } catch {
        /* ignore */
      }
    }

    void redirigirSiYaAutenticado()
  }, [nextPath, router])

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const res = await fetch("/api/visita/verificar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pin }),
      })

      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null
        setError(data?.error ?? "No se pudo verificar el PIN.")
        return
      }

      router.replace(nextPath)
      router.refresh()
    } catch {
      setError("Error de conexión. Intente de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-[oklch(0.98_0.002_264)] px-4 py-8">
      <Card className="w-full max-w-md border-foreground/10 shadow-sm">
        <CardHeader>
          <CardTitle>Ingreso de visita</CardTitle>
          <CardDescription>
            Ingrese el PIN de obra compartido por el residente. No necesita crear una cuenta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="pin" className="text-sm font-medium text-foreground">
                PIN de acceso
              </label>
              <input
                id="pin"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                required
                className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm tracking-widest outline-none ring-0 transition focus-visible:ring-2 focus-visible:ring-ring/40"
              />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verificando..." : "Entrar"}
            </Button>
            <p className="text-center text-sm text-muted-foreground">
              ¿Es residente de obra?{" "}
              <Link href={loginHref} className="font-medium text-primary underline-offset-4 hover:underline">
                Iniciar sesión con correo
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
