"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import {
  cargarTriangulacionVolumetrica,
  type ResultadoTriangulacionVolumetrica,
  type SemaforoRiesgoCge,
} from "@/src/lib/auditoria-volumetrica"
import { createClient } from "@/src/lib/supabase/client"
import { cn } from "@/lib/utils"

type AuditConsistencyCardProps = {
  compacto?: boolean
}

function hoyIso(): string {
  return new Date().toISOString().slice(0, 10)
}

function IconoSemaforo({ nivel }: { nivel: SemaforoRiesgoCge }) {
  if (nivel === "verde") return <CheckCircle2 className="size-4 text-green-600" aria-hidden />
  return <AlertTriangle className={cn("size-4", nivel === "rojo" ? "text-red-600" : "text-amber-600")} aria-hidden />
}

function badgeSemaforo(nivel: SemaforoRiesgoCge): string {
  switch (nivel) {
    case "verde":
      return "bg-green-600/15 text-green-800 dark:text-green-300"
    case "amarillo":
      return "bg-amber-500/15 text-amber-900 dark:text-amber-200"
    case "rojo":
      return "bg-red-600/15 text-red-800 dark:text-red-300"
  }
}

export function AuditConsistencyCard({ compacto = false }: AuditConsistencyCardProps) {
  const { proyectoId } = useProyecto()
  const supabase = useMemo(() => createClient(), [])
  const [desde, setDesde] = useState(hoyIso())
  const [hasta, setHasta] = useState(hoyIso())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<ResultadoTriangulacionVolumetrica | null>(null)

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      if (desde > hasta) throw new Error("La fecha «desde» no puede ser posterior a «hasta».")
      const res = await cargarTriangulacionVolumetrica(supabase, proyectoId, { desde, hasta })
      setResultado(res)
    } catch (err) {
      setResultado(null)
      setError(err instanceof Error ? err.message : "Error al calcular triangulación.")
    } finally {
      setLoading(false)
    }
  }, [desde, hasta, proyectoId, supabase])

  useEffect(() => {
    void cargar()
  }, [cargar])

  const peorSemaforo: SemaforoRiesgoCge = useMemo(() => {
    if (!resultado) return "amarillo"
    if (resultado.semaforoV1V2 === "rojo" || resultado.semaforoV2V3 === "rojo") return "rojo"
    if (resultado.semaforoV1V2 === "amarillo" || resultado.semaforoV2V3 === "amarillo") return "amarillo"
    return "verde"
  }, [resultado])

  return (
    <Card className="border-foreground/10">
      <CardHeader className={compacto ? "pb-2" : undefined}>
        <CardTitle className={compacto ? "text-base" : undefined}>Consistencia antiglosa (CGE)</CardTitle>
        <CardDescription>Triangulación V₁ topográfico · V₂ desalojo · V₃ horómetro</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!compacto ? (
          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="audit-desde">Desde</Label>
              <Input id="audit-desde" type="date" value={desde} onChange={(e) => setDesde(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="audit-hasta">Hasta</Label>
              <Input id="audit-hasta" type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} />
            </div>
            <Button type="button" variant="secondary" onClick={() => void cargar()} disabled={loading}>
              Actualizar
            </Button>
          </div>
        ) : null}

        {loading ? (
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Calculando indicadores…
          </p>
        ) : null}

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        {resultado && !loading ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <IconoSemaforo nivel={peorSemaforo} />
              <Badge className={badgeSemaforo(peorSemaforo)} variant="secondary">
                Riesgo {peorSemaforo.toUpperCase()}
              </Badge>
            </div>

            <dl className="grid gap-2 text-sm sm:grid-cols-3">
              <div className="rounded-lg border border-foreground/10 p-3">
                <dt className="text-xs uppercase text-muted-foreground">V₁ Topográfico</dt>
                <dd className="text-lg font-semibold">{resultado.v1TopograficoM3.toFixed(2)} m³</dd>
              </div>
              <div className="rounded-lg border border-foreground/10 p-3">
                <dt className="text-xs uppercase text-muted-foreground">V₂ Desalojado</dt>
                <dd className="text-lg font-semibold">{resultado.v2DesalojadoM3.toFixed(2)} m³</dd>
              </div>
              <div className="rounded-lg border border-foreground/10 p-3">
                <dt className="text-xs uppercase text-muted-foreground">V₃ Horómetro</dt>
                <dd className="text-lg font-semibold">{resultado.v3HorometroM3.toFixed(2)} m³</dd>
              </div>
            </dl>

            <div className="space-y-2 text-sm">
              <p>
                <span className="font-medium">V₁ vs V₂:</span> {resultado.mensajeV1V2}
                {resultado.ratioV1V2 != null ? ` (${(resultado.ratioV1V2 * 100).toFixed(1)} %)` : null}
              </p>
              <p>
                <span className="font-medium">V₂ vs V₃:</span> {resultado.mensajeV2V3}
                {resultado.ratioV2V3 != null ? ` (${(resultado.ratioV2V3 * 100).toFixed(1)} %)` : null}
              </p>
            </div>

            {!compacto ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {resultado.medidasCorrectivas.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            ) : null}
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
