"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  cargarJornadasMaquinariaProyecto,
  periodoDesdeJornadas,
  type JornadaMaquinariaProyecto,
  type PeriodoJornadasMaquinaria,
} from "@/src/lib/maquinaria-desasolve-proyecto"
import {
  cargarTramosMapaProyecto,
  type TramosMapaProyecto,
} from "@/src/lib/cargar-tramos-mapa-proyecto"
import { createClient } from "@/src/lib/supabase/client"

export function useJornadasMaquinariaProyecto(): {
  jornadas: JornadaMaquinariaProyecto[]
  tramosMapa: TramosMapaProyecto | null
  periodo: PeriodoJornadasMaquinaria
  loading: boolean
  error: string | null
  recargar: () => Promise<void>
} {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const [jornadas, setJornadas] = useState<JornadaMaquinariaProyecto[]>([])
  const [tramosMapa, setTramosMapa] = useState<TramosMapaProyecto | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const mapa = await cargarTramosMapaProyecto(supabase, proyectoId)
      const data = await cargarJornadasMaquinariaProyecto(supabase, proyectoId, mapa)
      setTramosMapa(mapa)
      setJornadas(data)
    } catch (err) {
      setJornadas([])
      setTramosMapa(null)
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

  return { jornadas, tramosMapa, periodo, loading, error, recargar }
}
