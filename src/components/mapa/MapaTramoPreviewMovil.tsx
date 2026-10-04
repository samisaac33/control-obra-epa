"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  colorEstadoTramo,
  etiquetaEstadoTramo,
  type CanalTramo,
} from "@/src/data/tramos/types"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import { Z_MAPA_BARRA_CONTROLES } from "@/src/lib/mapa-capas-z"
import { tituloTramoMapa } from "@/src/lib/tramo-display"
import { infoSegmentoMapa, type SegmentoVisualTramo, type TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import { avanceDesasolveTramo } from "@/src/lib/tramos-avance"

type MapaTramoPreviewMovilProps = {
  tramo: CanalTramo
  puntosAvance: TramoPuntoAvance[]
  segmentoDestacado?: SegmentoVisualTramo | null
  /** Espacio inferior cuando hay barra GPS u otros controles sobre el mapa. */
  className?: string
  onVerMas: () => void
  onCerrar: () => void
}

export function MapaTramoPreviewMovil({
  tramo,
  puntosAvance,
  segmentoDestacado = null,
  className,
  onVerMas,
  onCerrar,
}: MapaTramoPreviewMovilProps) {
  const avance = avanceDesasolveTramo(tramo, puntosAvance)
  const kmEjecutados = avance.metrosEjecutados / 1000
  const kmTotales = avance.metrosTotales / 1000
  const etiquetaSegmento =
    segmentoDestacado?.tipo === "minitramo"
      ? infoSegmentoMapa(segmentoDestacado).etiquetaMinitramo
      : null

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 px-2 pb-[max(0.35rem,env(safe-area-inset-bottom))]",
        Z_MAPA_BARRA_CONTROLES,
        className
      )}
      role="region"
      aria-label="Resumen del tramo seleccionado"
    >
      <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-foreground/10 bg-background/95 py-2 pl-3 pr-1.5 shadow-md backdrop-blur-sm">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p
              id="mapa-tramo-preview-movil-title"
              className="truncate text-sm font-semibold leading-tight"
            >
              {tituloTramoMapa(tramo.codigo)}
            </p>
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-foreground/10 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium">
              <span
                className="size-1.5 rounded-full"
                style={{ backgroundColor: colorEstadoTramo(tramo.estado) }}
                aria-hidden
              />
              {etiquetaEstadoTramo(tramo.estado)}
            </span>
          </div>
          <p className="mt-0.5 truncate text-[11px] text-muted-foreground tabular-nums">
            {formatearNumero(avance.avancePct, 1)}% · {formatearNumero(kmEjecutados, 2)}/
            {formatearNumero(kmTotales, 2)} km
            {etiquetaSegmento ? (
              <span className="text-foreground/80"> · {etiquetaSegmento}</span>
            ) : null}
          </p>
        </div>
        <Button type="button" size="sm" className="h-8 shrink-0 px-3 text-xs" onClick={onVerMas}>
          Ver más
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0 rounded-full"
          aria-label="Cerrar resumen del tramo"
          onClick={onCerrar}
        >
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
