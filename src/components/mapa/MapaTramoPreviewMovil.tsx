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
import {
  formatLongitudSegmentoMapa,
  infoSegmentoMapa,
  type SegmentoVisualTramo,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"
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
        "pointer-events-none absolute inset-x-0 bottom-0 px-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        Z_MAPA_BARRA_CONTROLES,
        className
      )}
      role="region"
      aria-label="Resumen del tramo seleccionado"
    >
      <div className="pointer-events-auto rounded-2xl border border-foreground/10 bg-background/95 p-3.5 shadow-lg backdrop-blur-sm">
        <div className="flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <p
                id="mapa-tramo-preview-movil-title"
                className="text-base font-semibold leading-tight"
              >
                {tituloTramoMapa(tramo.codigo)}
              </p>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-muted/50 px-2 py-0.5 text-[11px] font-medium">
                <span
                  className="size-2 rounded-full ring-1 ring-foreground/10"
                  style={{ backgroundColor: colorEstadoTramo(tramo.estado) }}
                  aria-hidden
                />
                {etiquetaEstadoTramo(tramo.estado)}
              </span>
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Longitud total: {formatLongitudSegmentoMapa(tramo.longitud_m)}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="-mt-1 -mr-1 size-8 shrink-0 rounded-full"
            aria-label="Cerrar resumen del tramo"
            onClick={onCerrar}
          >
            <X className="size-4" />
          </Button>
        </div>

        {etiquetaSegmento ? (
          <p className="mt-2 text-xs font-medium text-primary">
            Minitramo {etiquetaSegmento}
          </p>
        ) : null}

        <div className="mt-2.5 rounded-xl border border-foreground/10 bg-card/60 px-3 py-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Avance del desasolve
          </p>
          <div className="mt-1 flex items-end justify-between gap-3">
            <p className="font-mono text-xl font-semibold tabular-nums">
              {formatearNumero(avance.avancePct, 1)}%
            </p>
            <p className="text-right text-xs text-muted-foreground tabular-nums">
              <span className="font-medium text-foreground">
                {formatearNumero(kmEjecutados, 2)} km
              </span>
              <span className="block">de {formatearNumero(kmTotales, 2)} km</span>
            </p>
          </div>
          <div
            className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={avance.avancePct}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Avance ejecutado del tramo"
          >
            <div
              className="h-full rounded-full bg-primary transition-[width]"
              style={{ width: `${Math.min(100, avance.avancePct)}%` }}
            />
          </div>
        </div>

        <Button type="button" className="mt-3 h-9 w-full" onClick={onVerMas}>
          Ver más
        </Button>
      </div>
    </div>
  )
}
