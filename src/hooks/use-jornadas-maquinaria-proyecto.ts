"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  cargarJornadasMaquinariaProyecto,
  periodoDesdeJornadas,
  type JornadaMaquinariaProyecto,
  type PeriodoJornadasMaquinaria,
} from "@/src/lib/maquinaria-desasolve-proyecto"
import { createClient } from "@/src/lib/supabase/client"

export function useJornadasMaquinariaProyecto(): {
  jornadas: JornadaMaquinariaProyecto[]
  periodo: PeriodoJornadasMaquinaria
  loading: boolean
  error: string | null
  recargar: () => Promise<void>
} {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const [jornadas, setJornadas] = useState<JornadaMaquinariaProyecto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await cargarJornadasMaquinariaProyecto(supabase, proyectoId)
      setJornadas(data)
    } catch (err) {
      setJornadas([])
      setError(err instanceof Error ? err.message : "No se pudieron cargar las jornadas de maquinaria.")
    } finally {
      setLoading(false)
    }
  }, [proyectoId, supabase])

  useEffect(() => {
    void recargar()
  }, [recargar])

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void recargar()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [recargar])

  const periodo = useMemo(() => periodoDesdeJornadas(jornadas), [jornadas])

  return { jornadas, periodo, loading, error, recargar }
}
