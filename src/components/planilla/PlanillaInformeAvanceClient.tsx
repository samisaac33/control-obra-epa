"use client"

import { useEffect, useMemo, useState } from "react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { PlanillaPeriodo } from "@/src/data/planilla/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { cargarTriangulacionVolumetrica } from "@/src/lib/auditoria-volumetrica"
import { createClient } from "@/src/lib/supabase/client"

type PlanillaInformeAvanceClientProps = {
  periodo: PlanillaPeriodo
}

export function PlanillaInformeAvanceClient({ periodo }: PlanillaInformeAvanceClientProps) {
  const { proyectoId, proyectoActivo } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [v1, setV1] = useState(0)
  const [v2, setV2] = useState(0)

  useEffect(() => {
    async function run() {
      setLoading(true)
      setError(null)
      try {
        const tri = await cargarTriangulacionVolumetrica(supabase, proyectoId, {
          desde: periodo.fecha_inicio,
          hasta: periodo.fecha_fin,
        })
        setV1(tri.v1TopograficoM3)
        setV2(tri.v2DesalojadoM3)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al calcular avance.")
      } finally {
        setLoading(false)
      }
    }
    void run()
  }, [periodo.fecha_fin, periodo.fecha_inicio, proyectoId, supabase])

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <header>
        <h1 className="text-lg font-semibold">Informe de avance — {periodo.etiqueta}</h1>
        <p className="text-sm text-muted-foreground">
          {proyectoActivo.nombreObra} · {periodo.fecha_inicio} — {periodo.fecha_fin}
        </p>
      </header>

      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle className="text-base">Meta contractual del periodo</CardTitle>
        </CardHeader>
        <CardContent className="text-sm">
          Avance físico programado: <strong>{periodo.porcentaje_avance_objetivo} %</strong>
        </CardContent>
      </Card>

      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle className="text-base">Indicadores de ejecución (referencia)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {loading ? <p className="text-muted-foreground">Calculando…</p> : null}
          {error ? <p className="text-destructive">{error}</p> : null}
          {!loading && !error ? (
            <>
              <p>
                Volumen topográfico acumulado en periodo (V₁):{" "}
                <strong>{v1.toFixed(2)} m³</strong>
              </p>
              <p>
                Volumen desalojado reportado (V₂): <strong>{v2.toFixed(2)} m³</strong>
              </p>
              <p className="text-muted-foreground">
                Complemente con avance lineal del mapa de tramos y rubros del presupuesto al
                exportar la planilla definitiva.
              </p>
            </>
          ) : null}
        </CardContent>
      </Card>
    </div>
  )
}
