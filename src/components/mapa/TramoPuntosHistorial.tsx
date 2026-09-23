"use client"

import { useEffect, useMemo, useState } from "react"

import { MinitramosResumenAccordion } from "@/src/components/mapa/MinitramosResumenAccordion"
import type { EstadoTramo } from "@/src/data/tramos/types"
import { resumenMinitramos } from "@/src/lib/tramo-geometria"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import { cargarPuntosAvancePorTramo } from "@/src/lib/tramo-avance-coordenadas"
import { createClient } from "@/src/lib/supabase/client"

type TramoPuntosHistorialProps = {
  tramoId: string
  refreshKey?: number
  metrosEjecutados?: number
  isResident?: boolean
  guardandoEstadoMinitramoId?: string | null
  onEstadoMinitramoChange?: (puntoFinId: string, estado: EstadoTramo) => void | Promise<void>
  onEliminarMinitramo?: (grupoId: string) => void
  onEliminarPuntoHuérfano?: (puntoId: string) => void
  eliminandoId?: string | null
}

export function TramoPuntosHistorial({
  tramoId,
  refreshKey = 0,
  metrosEjecutados = 0,
  isResident = false,
  guardandoEstadoMinitramoId = null,
  onEstadoMinitramoChange,
  onEliminarMinitramo,
  eliminandoId = null,
}: TramoPuntosHistorialProps) {
  const [puntos, setPuntos] = useState<TramoPuntoAvance[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function cargar() {
      setLoading(true)
      try {
        const supabase = createClient()
        const data = await cargarPuntosAvancePorTramo(supabase, tramoId)
        setPuntos(data)
      } catch {
        setPuntos([])
      } finally {
        setLoading(false)
      }
    }

    void cargar()
  }, [tramoId, refreshKey])

  const historial = useMemo(() => resumenMinitramos(puntos, tramoId), [puntos, tramoId])

  if (loading) {
    return <p className="text-xs text-muted-foreground">Cargando minitramos...</p>
  }

  if (historial.length === 0) {
    return (
      <div className="space-y-1 text-xs text-muted-foreground">
        <p>Sin minitramos confirmados para este tramo.</p>
        {metrosEjecutados > 0 ? (
          <p>
            Avance editado manualmente ({metrosEjecutados.toFixed(1)} m). Marque puntos A, B, C…
            en el mapa para registrar minitramos GPS.
          </p>
        ) : null}
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <h4 className="text-sm font-medium">Historial de minitramos</h4>
      <MinitramosResumenAccordion
        items={historial}
        isResident={isResident}
        guardandoEstadoId={guardandoEstadoMinitramoId}
        onEstadoChange={onEstadoMinitramoChange}
        onEliminar={onEliminarMinitramo}
        eliminandoId={eliminandoId}
      />
    </div>
  )
}
