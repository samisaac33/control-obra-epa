"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

import {
  getProyecto,
  PROYECTO_DEFAULT,
  PROYECTOS_LISTA,
  STORAGE_KEY_PROYECTO_ACTIVO,
  type ProyectoConfig,
} from "@/src/data/proyectos/catalog"

type ProyectoContextValue = {
  proyectoActivo: ProyectoConfig
  proyectoId: string
  setProyectoId: (id: string) => void
  proyectosDisponibles: ProyectoConfig[]
  listo: boolean
}

const ProyectoContext = createContext<ProyectoContextValue | null>(null)

export function ProyectoProvider({ children }: { children: ReactNode }) {
  const [proyectoId, setProyectoIdState] = useState(PROYECTO_DEFAULT)
  const [listo, setListo] = useState(false)

  useEffect(() => {
    try {
      const guardado = localStorage.getItem(STORAGE_KEY_PROYECTO_ACTIVO)
      if (guardado && getProyecto(guardado).id === guardado) {
        setProyectoIdState(guardado)
      }
    } catch {
      // localStorage no disponible
    } finally {
      setListo(true)
    }
  }, [])

  const setProyectoId = useCallback((id: string) => {
    const proyecto = getProyecto(id)
    setProyectoIdState(proyecto.id)
    try {
      localStorage.setItem(STORAGE_KEY_PROYECTO_ACTIVO, proyecto.id)
    } catch {
      // ignorar
    }
  }, [])

  const value = useMemo(
    (): ProyectoContextValue => ({
      proyectoActivo: getProyecto(proyectoId),
      proyectoId,
      setProyectoId,
      proyectosDisponibles: PROYECTOS_LISTA,
      listo,
    }),
    [proyectoId, setProyectoId, listo]
  )

  return <ProyectoContext.Provider value={value}>{children}</ProyectoContext.Provider>
}

export function useProyecto(): ProyectoContextValue {
  const ctx = useContext(ProyectoContext)
  if (!ctx) {
    throw new Error("useProyecto debe usarse dentro de ProyectoProvider")
  }
  return ctx
}
