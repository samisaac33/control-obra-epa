"use client"

import { useCallback, useEffect, useMemo, useState } from "react"

import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  listarRegistrosMaquinariaComplementaria,
  periodoDesdeRegistrosComplementarios,
  type PeriodoMaquinariaComplementaria,
  type RegistroMaquinariaComplementaria,
} from "@/src/lib/maquinaria-complementaria"
import { createClient } from "@/src/lib/supabase/client"

export function useMaquinariaComplementaria(): {
  registros: RegistroMaquinariaComplementaria[]
  periodo: PeriodoMaquinariaComplementaria
  loading: boolean
  error: string | null
  recargar: () => Promise<void>
} {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const [registros, setRegistros] = useState<RegistroMaquinariaComplementaria[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const recargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await listarRegistrosMaquinariaComplementaria(supabase, proyectoId)
      setRegistros(data)
    } catch (err) {
      setRegistros([])
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los trabajos complementarios."
      )
    } finally {
      setLoading(false)
    }
  }, [proyectoId, supabase])

  useEffect(() => {
    void recargar()
  }, [recargar])

  const periodo = useMemo(() => periodoDesdeRegistrosComplementarios(registros), [registros])

  return { registros, periodo, loading, error, recargar }
}
