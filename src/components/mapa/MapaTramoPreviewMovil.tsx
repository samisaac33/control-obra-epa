"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { TramoDetalleResumen } from "@/src/components/mapa/TramoDetalleResumen"
import type { CanalTramo } from "@/src/data/tramos/types"
import { Z_MAPA_BARRA_CONTROLES } from "@/src/lib/mapa-capas-z"
import type { JornadaMinitramoMapa } from "@/src/lib/tramo-maquinaria-historial"
import { infoSegmentoMapa, type SegmentoVisualTramo, type TramoPuntoAvance } from "@/src/lib/tramo-geometria"

type MapaTramoPreviewMovilProps = {
  tramo: CanalTramo
  puntosAvance: TramoPuntoAvance[]
  jornadaPorPuntoFin?: ReadonlyMap<string, JornadaMinitramoMapa>
  segmentoDestacado?: SegmentoVisualTramo | null
  /** Espacio inferior cuando hay barra GPS u otros controles sobre el mapa. */
  className?: string
  onVerMas: () => void
  onCerrar: () => void
}

export function MapaTramoPreviewMovil({
  tramo,
  puntosAvance,
  jornadaPorPuntoFin,
  segmentoDestacado = null,
  className,
  onVerMas,
  onCerrar,
}: MapaTramoPreviewMovilProps) {
  const etiquetaSegmento =
    segmentoDestacado?.tipo === "minitramo"
      ? infoSegmentoMapa(segmentoDestacado).etiquetaMinitramo
      : null

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
        Z_MAPA_BARRA_CONTROLES,
        className
      )}
      role="region"
      aria-label="Resumen del tramo seleccionado"
    >
      <div className="pointer-events-auto relative max-h-[min(52dvh,420px)] overflow-y-auto rounded-2xl border border-foreground/10 bg-background/95 p-4 shadow-lg backdrop-blur-sm">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-1.5 right-1.5 size-8 rounded-full"
          aria-label="Cerrar resumen del tramo"
          onClick={onCerrar}
        >
          <X className="size-4" />
        </Button>

        {etiquetaSegmento ? (
          <p className="mb-1 pr-9 text-xs font-medium text-primary">
            Segmento seleccionado: minitramo {etiquetaSegmento}
          </p>
        ) : null}

        <div className="pr-8">
          <TramoDetalleResumen
            tramo={tramo}
            puntosAvance={puntosAvance}
            jornadaPorPuntoFin={jornadaPorPuntoFin}
            segmentoDestacado={segmentoDestacado}
            mostrarListadoMinitramos={false}
            tituloId="mapa-tramo-preview-movil-title"
          />
        </div>

        <Button type="button" className="mt-4 w-full" onClick={onVerMas}>
          Ver más
        </Button>
      </div>
    </div>
  )
}
