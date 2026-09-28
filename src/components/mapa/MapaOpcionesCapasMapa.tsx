"use client"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type MapaOpcionesCapasMapaProps = {
  vistaSoloTramos1a24: boolean
  onVistaSoloTramos1a24Change: (value: boolean) => void
  ocultarEtiquetasTramo: boolean
  onOcultarEtiquetasTramoChange: (value: boolean) => void
  ocultarPuntosAvance: boolean
  onOcultarPuntosAvanceChange: (value: boolean) => void
  idPrefix: string
  className?: string
}

type OpcionCheckboxProps = {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  titulo: string
  descripcion: string
}

function OpcionCheckbox({ id, checked, onChange, titulo, descripcion }: OpcionCheckboxProps) {
  return (
    <div className="flex min-w-0 items-start gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 size-4 shrink-0 rounded border-border"
      />
      <div className="min-w-0">
        <Label htmlFor={id} className="cursor-pointer font-medium">
          {titulo}
        </Label>
        <p className="text-xs text-muted-foreground">{descripcion}</p>
      </div>
    </div>
  )
}

export function MapaOpcionesCapasMapa({
  vistaSoloTramos1a24,
  onVistaSoloTramos1a24Change,
  ocultarEtiquetasTramo,
  onOcultarEtiquetasTramoChange,
  ocultarPuntosAvance,
  onOcultarPuntosAvanceChange,
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
        descripcion="Enfoca el mapa en los tramos 1 al 24. Desactivado: todos los tramos del proyecto."
      />
      <OpcionCheckbox
        id={`${idPrefix}-ocultar-etiquetas-tramo`}
        checked={ocultarEtiquetasTramo}
        onChange={onOcultarEtiquetasTramoChange}
        titulo="Ocultar números de tramos"
        descripcion="No muestra la etiqueta del número en el centro del tramo (sigue aplicando el zoom mínimo cuando están visibles)."
      />
      <OpcionCheckbox
        id={`${idPrefix}-ocultar-puntos-avance`}
        checked={ocultarPuntosAvance}
        onChange={onOcultarPuntosAvanceChange}
        titulo="Ocultar puntos A, B, C…"
        descripcion="Oculta marcadores de avance GPS en el mapa."
      />
    </div>
  )
}
