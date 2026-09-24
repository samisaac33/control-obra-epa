"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { cn } from "@/lib/utils"

type ProyectoSelectProps = {
  className?: string
  compact?: boolean
}

export function ProyectoSelect({ className, compact }: ProyectoSelectProps) {
  const { proyectoId, setProyectoId, proyectosDisponibles, listo } = useProyecto()

  if (!listo) {
    return null
  }

  return (
    <Select value={proyectoId} onValueChange={setProyectoId}>
      <SelectTrigger
        size={compact ? "sm" : "default"}
        className={cn(
          "max-w-[min(100%,14rem)] border-foreground/15 bg-background/80 sm:max-w-xs",
          className
        )}
        aria-label="Seleccionar proyecto activo"
      >
        <SelectValue placeholder="Proyecto" />
      </SelectTrigger>
      <SelectContent align="end">
        {proyectosDisponibles.map((proyecto) => (
          <SelectItem key={proyecto.id} value={proyecto.id}>
            {proyecto.nombreObra}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
