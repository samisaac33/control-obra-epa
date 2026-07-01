import { cn } from "@/lib/utils"
import type { KpiObra } from "@/lib/sicc/types"

export function KpiCard({ kpi }: { kpi: KpiObra }) {
  return (
    <div className="rounded-xl border border-foreground/10 bg-card p-4 shadow-sm ring-1 ring-foreground/5">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {kpi.etiqueta}
      </p>
      <p
        className={cn(
          "mt-2 font-mono text-2xl font-semibold tabular-nums tracking-tight",
          kpi.tendencia === "positiva" && "text-emerald-700 dark:text-emerald-400",
          kpi.tendencia === "negativa" && "text-red-700 dark:text-red-400"
        )}
      >
        {kpi.valor}
      </p>
      {kpi.detalle ? (
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{kpi.detalle}</p>
      ) : null}
    </div>
  )
}
