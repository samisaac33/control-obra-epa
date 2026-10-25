"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ArrowLeft, CalendarRange } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  diasPlanMaestroEjecucion,
  diaSemanaPlan,
  metadatosPlanMaestro,
  PCT_AVANCE_PLANILLA_1_REF,
  seccionesFijasPlanMaestro,
} from "@/src/data/planilla/plan-maestro-ejecucion-desasolve"
import type { ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { rutaObra } from "@/src/lib/rutas-proyecto"

type PlanillaPlanMaestroClientProps = {
  config: ProyectoPlanillaConfig
}

export function PlanillaPlanMaestroClient({ config }: PlanillaPlanMaestroClientProps) {
  const { proyectoId } = useProyecto()
  const meta = useMemo(() => metadatosPlanMaestro(config), [config])
  const dias = useMemo(() => diasPlanMaestroEjecucion(config), [config])
  const secciones = useMemo(() => seccionesFijasPlanMaestro(), [])

  const semanas = useMemo(() => {
    const map = new Map<number, typeof dias>()
    for (const d of dias) {
      const w = Math.floor((d.diaObra - 1) / 7) + 1
      const list = map.get(w) ?? []
      list.push(d)
      map.set(w, list)
    }
    return [...map.entries()].sort((a, b) => a[0] - b[0])
  }, [dias])

  const [p1, p2] = meta.periodos

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <Link
          href={rutaObra(proyectoId, "planillas")}
          className="mt-1 inline-flex size-9 items-center justify-center rounded-lg border border-foreground/10 bg-muted/50 hover:bg-muted"
          aria-label="Volver a planillas"
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Plan maestro de ejecución</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {meta.fechaInicioPlazo} → {meta.fechaFinPlazo} · {meta.plazoDias} días ·{" "}
            {meta.resolucion}
          </p>
          {p1 && p2 ? (
            <p className="mt-1 text-xs text-muted-foreground">
              Planilla 1 hasta {p1.fecha_fin} ({PCT_AVANCE_PLANILLA_1_REF} % meta) · Planilla 2
              hasta {p2.fecha_fin} (100 %)
            </p>
          ) : null}
        </div>
      </div>

      {secciones.map((sec) => (
        <Card key={sec.id} className="border-foreground/10">
          <CardHeader>
            <CardTitle className="text-base">{sec.titulo}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {sec.parrafos.map((p, i) => (
              <p key={i} className="text-muted-foreground leading-relaxed">
                {p.replace(/\*\*/g, "")}
              </p>
            ))}
            {sec.viñetas ? (
              <ul className="list-disc space-y-1 pl-5 text-foreground">
                {sec.viñetas.map((v) => (
                  <li key={v}>{v}</li>
                ))}
              </ul>
            ) : null}
          </CardContent>
        </Card>
      ))}

      <Card className="border-foreground/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <CalendarRange className="size-4" aria-hidden />
            Cronograma diario
          </CardTitle>
          <CardDescription>
            Desplegable por semana. Ajuste tramos concretos en el mapa de avance.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {semanas.map(([num, delaSemana]) => (
            <details
              key={num}
              className="group rounded-lg border border-foreground/10 bg-card open:border-primary/20"
            >
              <summary className="cursor-pointer list-none px-4 py-3 font-medium marker:content-none">
                Semana {num} · días {delaSemana[0]?.diaObra}–
                {delaSemana[delaSemana.length - 1]?.diaObra}
              </summary>
              <div className="space-y-4 border-t border-foreground/10 px-4 py-3">
                {delaSemana.map((d) => (
                  <article key={d.fecha} className="text-sm">
                    <h3 className="font-medium">
                      Día {d.diaObra} — {d.fecha} ({diaSemanaPlan(d.fecha)}) · Planilla{" "}
                      {d.planilla}
                    </h3>
                    <p className="mt-0.5 text-muted-foreground">{d.foco}</p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-muted-foreground">
                      <li>
                        <span className="text-foreground">Trasvase:</span> {d.trasvase.join(" ")}
                      </li>
                      <li>
                        <span className="text-foreground">San Antonio:</span>{" "}
                        {d.sanAntonio.join(" ")}
                      </li>
                      <li>
                        <span className="text-foreground">Severino:</span> {d.severino.join(" ")}
                      </li>
                      <li>
                        <span className="text-foreground">Transversal:</span>{" "}
                        {d.transversal.join(" ")}
                      </li>
                    </ul>
                  </article>
                ))}
              </div>
            </details>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
