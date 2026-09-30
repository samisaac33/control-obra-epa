"use client"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type MapaOpcionesCapasMapaProps = {
  vistaSoloTramos1a24: boolean
  onVistaSoloTramos1a24Change: (value: boolean) => void
  mostrarNumerosTramo: boolean
  onMostrarNumerosTramoChange: (value: boolean) => void
  ocultarPuntosAvance: boolean
  onOcultarPuntosAvanceChange: (value: boolean) => void
  ocultarMinitramosTerminados: boolean
  onOcultarMinitramosTerminadosChange: (value: boolean) => void
  mapaConsolidado: boolean
  onMapaConsolidadoChange: (value: boolean) => void
  idPrefix: string
  className?: string
}

type OpcionCheckboxProps = {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  titulo: string
  ariaLabel?: string
}

function OpcionCheckbox({ id, checked, onChange, titulo, ariaLabel }: OpcionCheckboxProps) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
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
  mostrarNumerosTramo,
  onMostrarNumerosTramoChange,
  ocultarPuntosAvance,
  onOcultarPuntosAvanceChange,
  ocultarMinitramosTerminados,
  onOcultarMinitramosTerminadosChange,
  mapaConsolidado,
  onMapaConsolidadoChange,
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
        id={`${idPrefix}-mostrar-numeros-tramos`}
        checked={mostrarNumerosTramo}
        onChange={onMostrarNumerosTramoChange}
        titulo="Mostrar números de tramos"
      />
      <OpcionCheckbox
        id={`${idPrefix}-ocultar-puntos-avance`}
        checked={ocultarPuntosAvance}
        onChange={onOcultarPuntosAvanceChange}
        titulo="Ocultar puntos A, B, C…"
        ariaLabel="Ocultar marcadores de avance"
      />
      <OpcionCheckbox
        id={`${idPrefix}-ocultar-mtt`}
        checked={ocultarMinitramosTerminados}
        onChange={onOcultarMinitramosTerminadosChange}
        titulo="Ocultar MTT"
        ariaLabel="Ocultar resaltado de minitramos terminados"
      />
      <OpcionCheckbox
        id={`${idPrefix}-consolidado`}
        checked={mapaConsolidado}
        onChange={onMapaConsolidadoChange}
        titulo="Consolidado"
        ariaLabel="Vista consolidada: todos los tramos del mismo color"
      />
    </div>
  )
}
