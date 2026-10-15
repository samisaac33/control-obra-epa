import { cn } from "@/lib/utils"

type KpiCardProps = {
  label: string
  valor: string
  detalle?: string
  compact?: boolean
  className?: string
}

export function KpiCard({ label, valor, detalle, compact, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-foreground/10 bg-card shadow-sm ring-1 ring-foreground/5",
        compact ? "p-3" : "p-4",
        className
      )}
    >
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground sm:text-xs">
        {label}
      </p>
      <p
        className={cn(
          "mt-1 font-mono font-semibold tabular-nums text-foreground",
          compact ? "text-xl" : "text-2xl"
        )}
      >
        {valor}
      </p>
      {detalle ? (
        <p className={cn("mt-1 leading-relaxed text-muted-foreground", compact ? "text-[10px] line-clamp-2 sm:text-xs" : "text-xs")}>
          {detalle}
        </p>
      ) : null}
    </div>
  )
}
