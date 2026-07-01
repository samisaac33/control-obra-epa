"use client"

import { useRouter } from "next/navigation"
import { LogOut, User } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useSiccAuth } from "@/components/sicc/sicc-auth-provider"
import { etiquetaRol } from "@/lib/supabase/auth"
import { cn } from "@/lib/utils"

const ROL_ESTILOS = {
  residente: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  visitante: "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300",
  fiscalizador: "border-violet-500/30 bg-violet-500/10 text-violet-800 dark:text-violet-300",
} as const

export function SiccUserMenu() {
  const { requiereAuth, perfil, logout } = useSiccAuth()
  const router = useRouter()

  if (!requiereAuth || !perfil) return null

  return (
    <div className="ml-auto flex items-center gap-2">
      <div className="hidden text-right sm:block">
        <p className="truncate text-sm font-medium leading-tight">{perfil.nombre}</p>
        <p className="truncate text-xs text-muted-foreground">{perfil.email}</p>
      </div>
      <Badge
        variant="outline"
        className={cn("hidden font-normal sm:inline-flex", ROL_ESTILOS[perfil.rol])}
      >
        <User className="mr-1 size-3" />
        {etiquetaRol(perfil.rol)}
      </Badge>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        onClick={() => {
          void logout().then(() => router.replace("/sicc/ingreso"))
        }}
        title="Cerrar sesión"
      >
        <LogOut className="size-4" />
      </Button>
    </div>
  )
}
