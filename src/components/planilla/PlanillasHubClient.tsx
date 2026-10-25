"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import { CalendarRange, ChevronRight, FileStack } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PlanillaAnalisisIntegralCard } from "@/src/components/planilla/PlanillaAnalisisIntegralCard"
import { PlanillaConfigForm } from "@/src/components/planilla/PlanillaConfigForm"
import type { PlanillaPeriodo, ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { cargarPlanillaConfigProyecto } from "@/src/lib/cargar-planilla-config"
import { analisisIntegralPlanilla, calcularPeriodosPlanilla } from "@/src/lib/planilla-calculo"
import { resumenContractualPlanilla } from "@/src/lib/planilla-contexto-proyecto"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import { createClient } from "@/src/lib/supabase/client"

function PlanillaPeriodoLink({
  periodo,
  proyectoId,
}: {
  periodo: PlanillaPeriodo
  proyectoId: string
}) {
  const href = rutaObra(proyectoId, `planillas/${periodo.numero}`)
  return (
    <Link
      href={href}
      className="group flex items-center gap-3 rounded-xl border border-foreground/10 bg-card p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
    >
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <FileStack className="size-5" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold text-foreground">{periodo.etiqueta}</p>
        <p className="text-sm text-muted-foreground">
          {periodo.fecha_inicio} — {periodo.fecha_fin} · meta {periodo.porcentaje_avance_objetivo} %
        </p>
      </div>
      <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" aria-hidden />
    </Link>
  )
}

export function PlanillasHubClient() {
  const { proyectoId, proyectoActivo } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const [config, setConfig] = useState<ProyectoPlanillaConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const row = await cargarPlanillaConfigProyecto(supabase, proyectoId)
      setConfig(row)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cargar configuración.")
    } finally {
      setLoading(false)
    }
  }, [proyectoId, supabase])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const periodos = useMemo(
    () => (config ? calcularPeriodosPlanilla(config) : []),
    [config]
  )

  const analisis = useMemo(() => {
    if (!config) return null
    return analisisIntegralPlanilla(config, resumenContractualPlanilla(proyectoId))
  }, [config, proyectoId])

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <header>
        <h1 className="text-xl font-semibold tracking-tight">Planillas de pago</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {proyectoActivo.nombreObra} — generador de documentación para presentación contractual
        </p>
      </header>

      {loading ? <p className="text-sm text-muted-foreground">Cargando…</p> : null}
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <PlanillaConfigForm
        configInicial={config}
        onGuardado={(c) => {
          setConfig(c)
        }}
      />

      {analisis ? <PlanillaAnalisisIntegralCard analisis={analisis} /> : null}

      {config ? (
        <Link
          href={rutaObra(proyectoId, "planillas/plan-maestro")}
          className="group flex items-center gap-3 rounded-xl border border-primary/20 bg-primary/5 p-4 transition-colors hover:border-primary/40 hover:bg-primary/10"
        >
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
            <CalendarRange className="size-5" aria-hidden />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">Plan maestro de ejecución</p>
            <p className="text-sm text-muted-foreground">
              Cronograma diario 60 días, flujo desazolve/reconformación/desalojo y roles por frente.
            </p>
          </div>
          <ChevronRight className="size-4 text-muted-foreground group-hover:text-primary" aria-hidden />
        </Link>
      ) : null}

      {config && periodos.length > 0 ? (
        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle className="text-base">Planillas del contrato</CardTitle>
            <CardDescription>
              Cada planilla agrupa libro de obra, informes, memorandos y anexos del periodo.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {periodos.map((p) => (
              <PlanillaPeriodoLink key={p.numero} periodo={p} proyectoId={proyectoId} />
            ))}
          </CardContent>
        </Card>
      ) : (
        <p className="text-sm text-muted-foreground">
          Guarde la fecha de inicio y el avance de la Planilla 1 para habilitar los generadores.
        </p>
      )}
    </div>
  )
}
