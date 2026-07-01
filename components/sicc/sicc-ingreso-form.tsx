"use client"

import { useState } from "react"
import { Building2, LogIn, UserPlus } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSiccAuth } from "@/components/sicc/sicc-auth-provider"
import { etiquetaRol } from "@/lib/supabase/auth"
import { ROLES_REGISTRO, type RolSicc } from "@/lib/sicc/types"

type Modo = "login" | "registro"

export function SiccIngresoForm() {
  const { login, register } = useSiccAuth()
  const [modo, setModo] = useState<Modo>("login")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nombre, setNombre] = useState("")
  const [rol, setRol] = useState<RolSicc>("visitante")
  const [error, setError] = useState<string | null>(null)
  const [cargando, setCargando] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setCargando(true)

    try {
      if (modo === "login") {
        await login(email, password)
      } else {
        if (!nombre.trim()) {
          setError("Ingrese su nombre")
          return
        }
        await register({ email, password, nombre: nombre.trim(), rol })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de autenticación")
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="mx-auto flex min-h-[80vh] w-full max-w-md flex-col justify-center px-4 py-12">
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl bg-[oklch(0.42_0.12_250)] text-white">
          <Building2 className="size-6" />
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">SICC</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Ingrese con su rol para acceder al sistema integrado de obra
        </p>
      </div>

      <Card className="border-foreground/10">
        <CardHeader>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={modo === "login" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setModo("login")}
            >
              <LogIn className="size-4" />
              Iniciar sesión
            </Button>
            <Button
              type="button"
              variant={modo === "registro" ? "default" : "outline"}
              size="sm"
              className="flex-1"
              onClick={() => setModo("registro")}
            >
              <UserPlus className="size-4" />
              Registrarse
            </Button>
          </div>
          <CardTitle className="pt-2 text-base">
            {modo === "login" ? "Acceso al sistema" : "Crear cuenta"}
          </CardTitle>
          <CardDescription>
            {modo === "login"
              ? "Residentes, visitantes y fiscalizadores de la obra"
              : "Seleccione su rol al registrarse"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {modo === "registro" ? (
              <>
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre completo</Label>
                  <Input
                    id="nombre"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ing. Juan Pérez"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rol">Rol en la obra</Label>
                  <Select value={rol} onValueChange={(v) => setRol(v as RolSicc)}>
                    <SelectTrigger id="rol">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLES_REGISTRO.map((r) => (
                        <SelectItem key={r} value={r}>
                          {etiquetaRol(r)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Residente: registra metrados y partes. Visitante y fiscalizador: solo
                    consulta e impresión.
                  </p>
                </div>
              </>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={modo === "login" ? "current-password" : "new-password"}
                minLength={6}
                required
              />
            </div>

            {error ? (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-300">
                {error}
              </p>
            ) : null}

            <Button type="submit" className="w-full" disabled={cargando}>
              {cargando
                ? "Procesando…"
                : modo === "login"
                  ? "Entrar al SICC"
                  : "Crear cuenta y entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
