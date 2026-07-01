import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { ModuloEstado } from "@/lib/sicc/types"

const ETIQUETAS: Record<ModuloEstado, string> = {
  activo: "Activo",
  en_desarrollo: "En desarrollo",
  proximamente: "Próximamente",
}

const ESTILOS: Record<ModuloEstado, string> = {
  activo: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  en_desarrollo: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  proximamente: "border-foreground/15 bg-muted/60 text-muted-foreground",
}

export function EstadoModuloBadge({
  estado,
  className,
}: {
  estado: ModuloEstado
  className?: string
}) {
  return (
    <Badge variant="outline" className={cn("font-normal", ESTILOS[estado], className)}>
      {ETIQUETAS[estado]}
    </Badge>
  )
}
