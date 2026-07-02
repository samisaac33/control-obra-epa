"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ESTADOS_HITO } from "@/src/data/estados-hito"
import { cn } from "@/lib/utils"

type EstadoHitoSelectProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  className?: string
  "aria-invalid"?: boolean
}

export function EstadoHitoSelect({
  value,
  onChange,
  id,
  className,
  "aria-invalid": ariaInvalid,
}: EstadoHitoSelectProps) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger
        id={id}
        aria-invalid={ariaInvalid}
        className={cn("h-10 w-full", className)}
      >
        <SelectValue placeholder="Selecciona el estado del hito" />
      </SelectTrigger>
      <SelectContent position="popper" className="w-(--radix-select-trigger-width)">
        {ESTADOS_HITO.map((estado) => (
          <SelectItem key={estado.id} value={estado.id}>
            {estado.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
