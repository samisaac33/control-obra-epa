"use client"

import { useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { useSiccAuth } from "@/components/sicc/sicc-auth-provider"
import { SICC_BASE } from "@/lib/sicc/modules"

const RUTA_INGRESO = `${SICC_BASE}/ingreso`
const RUTA_ADMIN = `${SICC_BASE}/administracion`

export function SiccAuthGate({ children }: { children: React.ReactNode }) {
  const { requiereAuth, listo, session, perfil } = useSiccAuth()
  const pathname = usePathname()
  const router = useRouter()

  const esIngreso = pathname === RUTA_INGRESO || pathname === `${RUTA_INGRESO}/`
  const esAdministracion =
    pathname === RUTA_ADMIN || pathname.startsWith(`${RUTA_ADMIN}/`)

  useEffect(() => {
    if (!requiereAuth || !listo || esIngreso) return
    if (!session || !perfil) {
      router.replace(RUTA_INGRESO)
      return
    }
    if (esAdministracion && perfil.rol !== "administrador") {
      router.replace(SICC_BASE)
    }
  }, [requiereAuth, listo, session, perfil, esIngreso, esAdministracion, router])

  useEffect(() => {
    if (!requiereAuth || !listo || !esIngreso) return
    if (session && perfil) {
      router.replace(SICC_BASE)
    }
  }, [requiereAuth, listo, session, perfil, esIngreso, router])

  if (!listo) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (requiereAuth && !esIngreso && (!session || !perfil)) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  if (requiereAuth && esAdministracion && perfil?.rol !== "administrador") {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
      </div>
    )
  }

  return <>{children}</>
}
