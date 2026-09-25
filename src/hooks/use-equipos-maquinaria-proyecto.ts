"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  actualizarEquipoMaquinaria,
  cargarEquiposMaquinariaProyecto,
  crearEquipoMaquinaria,
  type ProyectoEquipoMaquinaria,
} from "@/src/lib/proyecto-equipos-maquinaria"
import { createClient } from "@/src/lib/supabase/client"

type UseEquiposMaquinariaProyectoOptions = {
  soloActivos?: boolean
  /** Si false, no carga automáticamente (útil cuando el hook se monta antes de abrir un formulario). */
  habilitado?: boolean
}

export function useEquiposMaquinariaProyecto(options?: UseEquiposMaquinariaProyectoOptions) {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const soloActivos = options?.soloActivos ?? false
  const habilitado = options?.habilitado ?? true

  const [equipos, setEquipos] = useState<ProyectoEquipoMaquinaria[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    if (!proyectoId) return
    setLoading(true)
    setError(null)
    try {
      const data = await cargarEquiposMaquinariaProyecto(supabase, proyectoId, { soloActivos })
      setEquipos(data)
    } catch (err) {
      setEquipos([])
      setError(err instanceof Error ? err.message : "No se pudieron cargar los equipos.")
    } finally {
      setLoading(false)
    }
  }, [proyectoId, soloActivos, supabase])

  useEffect(() => {
    if (!habilitado) return
    void recargar()
  }, [habilitado, recargar])

  async function agregarEquipo(nombre: string) {
    if (!proyectoId) return
    setError(null)
    await crearEquipoMaquinaria(supabase, proyectoId, nombre)
    await recargar()
  }

  async function cambiarActivo(equipoId: string, activo: boolean) {
    setError(null)
    await actualizarEquipoMaquinaria(supabase, equipoId, { activo })
    await recargar()
  }

  async function renombrarEquipo(equipoId: string, nombre: string) {
    setError(null)
    await actualizarEquipoMaquinaria(supabase, equipoId, { nombre })
    await recargar()
  }

  return {
    equipos,
    loading,
    error,
    setError,
    recargar,
    agregarEquipo,
    cambiarActivo,
    renombrarEquipo,
  }
}
