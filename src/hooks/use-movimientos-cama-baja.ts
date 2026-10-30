"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  listarMovimientosCamaBaja,
  periodoDesdeMovimientosCamaBaja,
  type MovimientoCamaBaja,
  type PeriodoMovimientosCamaBaja,
} from "@/src/lib/maquinaria-cama-baja-movimientos"
import { createClient } from "@/src/lib/supabase/client"

export function useMovimientosCamaBaja(): {
  movimientos: MovimientoCamaBaja[]
  periodo: PeriodoMovimientosCamaBaja
  loading: boolean
  error: string | null
  recargar: () => Promise<void>
} {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const [movimientos, setMovimientos] = useState<MovimientoCamaBaja[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    if (!proyectoId) return
    setLoading(true)
    setError(null)
    try {
      const data = await listarMovimientosCamaBaja(supabase, proyectoId)
      setMovimientos(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los movimientos.")
      setMovimientos([])
    } finally {
      setLoading(false)
    }
  }, [proyectoId, supabase])

  useEffect(() => {
    void recargar()
  }, [recargar])

  const periodo = useMemo(() => periodoDesdeMovimientosCamaBaja(movimientos), [movimientos])

  return { movimientos, periodo, loading, error, recargar }
}
