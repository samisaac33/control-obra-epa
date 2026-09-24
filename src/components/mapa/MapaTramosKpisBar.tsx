"use client"

import { cn } from "@/lib/utils"
import type { KpisTramos } from "@/src/lib/tramos-avance"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"

type MapaTramosKpisBarProps = {
  kpis: KpisTramos
  modo: "stack" | "overlay"
  className?: string
}

function KpiChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex shrink-0 snap-start flex-col rounded-lg border border-foreground/10 bg-card/95 px-3 py-2 shadow-sm backdrop-blur-sm">
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  )
}

function KpisHero({ kpis, compact }: { kpis: KpisTramos; compact?: boolean }) {
  const pct = Math.min(100, Math.max(0, kpis.avanceGlobalPct))
  return (
    <div
      className={cn(
        "rounded-xl border border-foreground/10 bg-card/95 shadow-sm backdrop-blur-sm ring-1 ring-foreground/5",
        compact ? "px-3 py-2.5" : "p-4"
      )}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Avance global
          </p>
          <p
            className={cn(
              "font-mono font-semibold tabular-nums text-foreground",
              compact ? "text-xl" : "text-3xl"
            )}
          >
            {formatearNumero(pct, 1)}%
          </p>
        </div>
        <p className="text-right text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatearNumero(kpis.kmEjecutados, 2)} km
          </span>
          <span className="block">de {formatearNumero(kpis.kmTotales, 2)} km</span>
        </p>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Avance global del desasolve"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {!compact ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Km ejecutados: minitramos GPS en estado terminado
        </p>
      ) : null}
    </div>
  )
}

function KpisChips({ kpis }: { kpis: KpisTramos }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-0.5 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <KpiChip label="Km totales" value={formatearNumero(kpis.kmTotales, 2)} />
      <KpiChip label="Tramos" value={String(kpis.totalTramos)} />
      <KpiChip label="Terminados" value={String(kpis.tramosPorEstado.terminado)} />
      <KpiChip label="Pendientes" value={String(kpis.tramosPorEstado.pendiente)} />
      <KpiChip label="En ejecución" value={String(kpis.tramosPorEstado.en_ejecucion)} />
    </div>
  )
}

export function MapaTramosKpisBar({ kpis, modo, className }: MapaTramosKpisBarProps) {
  if (modo === "overlay") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-[400] flex flex-col gap-2 p-2 sm:p-3",
          className
        )}
      >
        <div className="pointer-events-auto">
          <KpisHero kpis={kpis} compact />
        </div>
        <div className="pointer-events-auto">
          <KpisChips kpis={kpis} />
        </div>
      </div>
    )
  }

  return (
    <div className={cn("space-y-3", className)}>
      <KpisHero kpis={kpis} />
      <KpisChips kpis={kpis} />
    </div>
  )
}
