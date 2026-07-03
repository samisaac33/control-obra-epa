import { cn } from "@/lib/utils"

type KpiCardProps = {
  label: string
  valor: string
  detalle?: string
  className?: string
}

export function KpiCard({ label, valor, detalle, className }: KpiCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-foreground/10 bg-card p-4 shadow-sm ring-1 ring-foreground/5",
        className
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">{valor}</p>
      {detalle ? <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{detalle}</p> : null}
    </div>
  )
}
