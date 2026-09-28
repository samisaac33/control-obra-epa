"use client"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type MapaOpcionesCapasMapaProps = {
  vistaSoloTramos1a24: boolean
  onVistaSoloTramos1a24Change: (value: boolean) => void
  mostrarNumerosYPuntosAvance: boolean
  onMostrarNumerosYPuntosAvanceChange: (value: boolean) => void
  idPrefix: string
  className?: string
}

type OpcionCheckboxProps = {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  titulo: string
}

function OpcionCheckbox({ id, checked, onChange, titulo }: OpcionCheckboxProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 shrink-0 rounded border-border"
      />
      <Label htmlFor={id} className="min-w-0 cursor-pointer font-medium">
        {titulo}
      </Label>
    </div>
  )
}

export function MapaOpcionesCapasMapa({
  vistaSoloTramos1a24,
  onVistaSoloTramos1a24Change,
  mostrarNumerosYPuntosAvance,
  onMostrarNumerosYPuntosAvanceChange,
  idPrefix,
  className,
}: MapaOpcionesCapasMapaProps) {
  return (
    <div
      className={cn(
        "space-y-3 rounded-lg border border-foreground/10 bg-muted/10 px-3 py-2.5",
        className
      )}
    >
      <OpcionCheckbox
        id={`${idPrefix}-vista-tramos-1-24`}
        checked={vistaSoloTramos1a24}
        onChange={onVistaSoloTramos1a24Change}
        titulo="Vista tramos 1–24"
      />
      <OpcionCheckbox
        id={`${idPrefix}-mostrar-numeros-puntos`}
        checked={mostrarNumerosYPuntosAvance}
        onChange={onMostrarNumerosYPuntosAvanceChange}
        titulo="Mostrar números de tramos y puntos A, B, C…"
      />
    </div>
  )
}
