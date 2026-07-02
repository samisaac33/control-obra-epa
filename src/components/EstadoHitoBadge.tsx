import {
  clasesBadgeEstadoHito,
  etiquetaEstadoHito,
  normalizarEstadoHito,
} from "@/src/data/estados-hito"
import { cn } from "@/lib/utils"

type EstadoHitoBadgeProps = {
  estadoHito?: string | null
  className?: string
}

export function EstadoHitoBadge({ estadoHito, className }: EstadoHitoBadgeProps) {
  const id = normalizarEstadoHito(estadoHito)
  const label = etiquetaEstadoHito(estadoHito)
  const badgeClass = clasesBadgeEstadoHito(estadoHito)

  if (!id || !label || !badgeClass) return null

  return (
    <span
      className={cn(
        "inline-flex w-fit max-w-full rounded-lg border px-3 py-1.5 text-sm font-semibold",
        badgeClass,
        className
      )}
    >
      {label}
    </span>
  )
}
