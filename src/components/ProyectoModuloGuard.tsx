"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

import { useProyecto } from "@/src/contexts/ProyectoContext"
import type { ProyectoModulo } from "@/src/data/proyectos/catalog"
import { rutaObra } from "@/src/lib/rutas-proyecto"

type ProyectoModuloGuardProps = {
  modulo: ProyectoModulo
  children: ReactNode
}

export function ProyectoModuloGuard({ modulo, children }: ProyectoModuloGuardProps) {
  const router = useRouter()
  const { proyectoActivo, listo } = useProyecto()

  useEffect(() => {
    if (!listo) return
    if (!proyectoActivo.modulos[modulo]) {
      router.replace(rutaObra(proyectoActivo.id))
    }
  }, [listo, modulo, proyectoActivo.id, proyectoActivo.modulos, router])

  if (!listo || !proyectoActivo.modulos[modulo]) {
    return null
  }

  return <>{children}</>
}
