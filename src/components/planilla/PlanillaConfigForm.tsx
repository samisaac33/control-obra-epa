"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { PLAZO_CALENDARIO_DIAS } from "@/src/data/contrato-emergencia-severino-trasvase"
import type { ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { guardarPlanillaConfigProyecto } from "@/src/lib/cargar-planilla-config"
import { calcularPeriodosPlanilla } from "@/src/lib/planilla-calculo"
import { createClient } from "@/src/lib/supabase/client"

type PlanillaConfigFormProps = {
  configInicial: ProyectoPlanillaConfig | null
  onGuardado: (config: ProyectoPlanillaConfig) => void
}

export function PlanillaConfigForm({ configInicial, onGuardado }: PlanillaConfigFormProps) {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const [fechaInicio, setFechaInicio] = useState(configInicial?.fecha_inicio_plazo ?? "")
  const [pctPlanilla1, setPctPlanilla1] = useState(
    configInicial?.porcentaje_avance_planilla_1 != null
      ? String(configInicial.porcentaje_avance_planilla_1)
      : "50"
  )
  const [observaciones, setObservaciones] = useState(configInicial?.observaciones ?? "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const vistaPrevia = useMemo(() => {
    if (!fechaInicio || !/^\d{4}-\d{2}-\d{2}$/.test(fechaInicio)) return null
    const pct = Number(pctPlanilla1.replace(",", "."))
    if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) return null
    return calcularPeriodosPlanilla({
      fecha_inicio_plazo: fechaInicio,
      plazo_dias: configInicial?.plazo_dias ?? PLAZO_CALENDARIO_DIAS,
      dias_por_planilla: configInicial?.dias_por_planilla ?? 30,
      porcentaje_avance_planilla_1: pct,
    })
  }, [configInicial?.dias_por_planilla, configInicial?.plazo_dias, fechaInicio, pctPlanilla1])

  async function guardar() {
    setLoading(true)
    setError(null)
    try {
      if (!fechaInicio) throw new Error("Registre la fecha de inicio del plazo.")
      const pct = Number(pctPlanilla1.replace(",", "."))
      if (!Number.isFinite(pct) || pct <= 0 || pct >= 100) {
        throw new Error("El avance objetivo de la Planilla 1 debe estar entre 0 y 100 %.")
      }

      const { data: auth } = await supabase.auth.getUser()
      const config = await guardarPlanillaConfigProyecto(supabase, {
        proyecto_id: proyectoId,
        fecha_inicio_plazo: fechaInicio,
        plazo_dias: PLAZO_CALENDARIO_DIAS,
        dias_por_planilla: 30,
        porcentaje_avance_planilla_1: pct,
        observaciones: observaciones.trim() || null,
        registrado_por: auth.user?.id ?? null,
      })
      onGuardado(config)
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-foreground/10">
      <CardHeader>
        <CardTitle className="text-base">Parámetros de planillaje</CardTitle>
        <CardDescription>
          Fecha de inicio del plazo ({PLAZO_CALENDARIO_DIAS} días) y avance físico objetivo de la
          Planilla 1. La Planilla 2 cierra al 100 %.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="planilla-fecha-inicio">Fecha inicio del plazo</Label>
            <Input
              id="planilla-fecha-inicio"
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="planilla-pct-1">Avance objetivo Planilla 1 (%)</Label>
            <Input
              id="planilla-pct-1"
              inputMode="decimal"
              value={pctPlanilla1}
              onChange={(e) => setPctPlanilla1(e.target.value)}
              placeholder="Ej. 50"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="planilla-obs">Observaciones (opcional)</Label>
          <Textarea
            id="planilla-obs"
            rows={2}
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />
        </div>

        {vistaPrevia ? (
          <div className="rounded-lg border border-foreground/10 bg-muted/20 p-3 text-sm">
            <p className="font-medium">Vista previa de periodos</p>
            <ul className="mt-2 space-y-2 text-muted-foreground">
              {vistaPrevia.map((p) => (
                <li key={p.numero}>
                  <span className="font-medium text-foreground">{p.etiqueta}:</span> {p.fecha_inicio}{" "}
                  → {p.fecha_fin} · objetivo {p.porcentaje_avance_objetivo} % · {p.dias_calendario}{" "}
                  días
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button type="button" disabled={loading} onClick={() => void guardar()}>
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Guardando…
            </>
          ) : (
            "Guardar configuración"
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
