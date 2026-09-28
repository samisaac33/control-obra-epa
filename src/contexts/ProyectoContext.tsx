"use client"

import { createContext, useContext, useMemo, type ReactNode } from "react"

import { getProyecto, type ProyectoConfig } from "@/src/data/proyectos/catalog"

type ProyectoContextValue = {
  proyectoActivo: ProyectoConfig
  proyectoId: string
  listo: boolean
}

const ProyectoContext = createContext<ProyectoContextValue | null>(null)

export function ProyectoProvider({
  proyectoId,
  children,
}: {
  proyectoId: string
  children: ReactNode
}) {
  const value = useMemo((): ProyectoContextValue => {
    const proyectoActivo = getProyecto(proyectoId)
    return {
      proyectoActivo,
      proyectoId: proyectoActivo.id,
      listo: true,
    }
  }, [proyectoId])

  return <ProyectoContext.Provider value={value}>{children}</ProyectoContext.Provider>
}

export function useProyecto(): ProyectoContextValue {
  const ctx = useContext(ProyectoContext)
  if (!ctx) {
    throw new Error("useProyecto debe usarse dentro de ProyectoProvider")
  }
  return ctx
}
