"use client"

import type { PlanillaAnalisisIntegral } from "@/src/data/planilla/types"

type PlanillaAnalisisIntegralCardProps = {
  analisis: PlanillaAnalisisIntegral
}

export function PlanillaAnalisisIntegralCard({ analisis }: PlanillaAnalisisIntegralCardProps) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-card p-4 shadow-sm ring-1 ring-foreground/5">
      <h2 className="text-sm font-semibold tracking-tight">Análisis integral del proyecto</h2>
      <p className="mt-1 text-xs text-muted-foreground">
        Plazo {analisis.fecha_inicio_plazo} → {analisis.fecha_fin_plazo} ({analisis.plazo_dias}{" "}
        días) · {analisis.cantidad_planillas} planillas
      </p>
      <pre className="mt-3 max-h-48 overflow-auto whitespace-pre-wrap rounded-lg bg-muted/30 p-3 text-xs leading-relaxed text-foreground">
        {analisis.resumen_contractual}
      </pre>
    </div>
  )
}
