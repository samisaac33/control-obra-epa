"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ID_TODOS_LOS_SECTORES,
  RUBROS_SECTORES,
  TODOS_LOS_SECTORES,
} from "@/src/data/sectores-fotos"
import { cn } from "@/lib/utils"

type SectorSelectProps = {
  value: string
  onChange: (value: string) => void
  variant?: "filter" | "form"
  /** Incluye «Todos los sectores» como primera opción. Por defecto solo en filtros. */
  includeAllOption?: boolean
  placeholder?: string
  id?: string
  className?: string
  "aria-invalid"?: boolean
}

export function SectorSelect({
  value,
  onChange,
  variant = "form",
  includeAllOption,
  placeholder,
  id,
  className,
  "aria-invalid": ariaInvalid,
}: SectorSelectProps) {
  const isFilter = variant === "filter"
  const showAllOption = includeAllOption ?? isFilter
  const opciones = showAllOption ? TODOS_LOS_SECTORES : RUBROS_SECTORES
  const selectValue = value || (showAllOption ? ID_TODOS_LOS_SECTORES : undefined)

  return (
    <Select
      value={selectValue}
      onValueChange={onChange}
    >
      <SelectTrigger
        id={id}
        aria-invalid={ariaInvalid}
        className={cn(
          "w-full",
          isFilter && "h-12 border-primary/30 bg-primary/5 px-4 text-base shadow-sm",
          !isFilter && "h-10",
          className
        )}
      >
        <SelectValue
          placeholder={
            placeholder ?? (isFilter ? "Todos los sectores" : "Selecciona un sector")
          }
        />
      </SelectTrigger>
      <SelectContent position="popper" className="max-h-72 w-(--radix-select-trigger-width)">
        {opciones.map((sector) => (
          <SelectItem key={sector.id} value={sector.id}>
            {sector.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
