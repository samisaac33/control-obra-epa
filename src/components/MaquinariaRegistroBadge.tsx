import { ACCIONISTA_META, type RegistroEquipo } from "@/src/data/registro-maquinaria"
import { etiquetaDuracion } from "@/src/lib/maquinaria-resumen"
import { cn } from "@/lib/utils"

type MaquinariaRegistroBadgeProps = {
  registro: RegistroEquipo
  className?: string
}

export function MaquinariaRegistroBadge({ registro, className }: MaquinariaRegistroBadgeProps) {
  const meta = ACCIONISTA_META[registro.accionista]
  const duracion = etiquetaDuracion(registro)

  return (
    <span
      className={cn(
        "inline-flex max-w-full flex-wrap items-center gap-x-2 gap-y-0.5 rounded-lg border px-2.5 py-1.5 text-sm",
        meta.badgeClass,
        className
      )}
    >
      <span className={cn("size-2 shrink-0 rounded-full", meta.dotClass)} aria-hidden />
      <span className="font-medium">{registro.equipo}</span>
      <span className="text-xs opacity-80">· {duracion}</span>
      {registro.nota ? <span className="text-xs font-medium opacity-90">({registro.nota})</span> : null}
    </span>
  )
}

type MaquinariaAccionistaChipProps = {
  accionista: keyof typeof ACCIONISTA_META
}

export function MaquinariaAccionistaChip({ accionista }: MaquinariaAccionistaChipProps) {
  const meta = ACCIONISTA_META[accionista]

  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-medium",
        meta.chipClass
      )}
    >
      <span className={cn("size-2.5 rounded-full", meta.dotClass)} aria-hidden />
      {meta.label}
    </span>
  )
}
