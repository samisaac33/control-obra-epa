"use client"

import { useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"

import { useProyecto } from "@/src/contexts/ProyectoContext"
import type { ProyectoModulo } from "@/src/data/proyectos/catalog"

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
      router.replace("/")
    }
  }, [listo, modulo, proyectoActivo.modulos, router])

  if (!listo || !proyectoActivo.modulos[modulo]) {
    return null
  }

  return <>{children}</>
}
