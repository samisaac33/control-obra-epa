"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { CanalTramo } from "@/src/data/tramos/types"
import { TramoDetalleVisitanteContenido } from "@/src/components/mapa/TramoDetalleVisitanteContenido"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"

type TramoDetalleVisitanteBottomSheetProps = {
  open: boolean
  tramo: CanalTramo | null
  puntosAvance: TramoPuntoAvance[]
  panelError?: string | null
  onOpenChange: (open: boolean) => void
}

export function TramoDetalleVisitanteBottomSheet({
  open,
  tramo,
  puntosAvance,
  panelError = null,
  onOpenChange,
}: TramoDetalleVisitanteBottomSheetProps) {
  if (!open || !tramo) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tramo-detalle-visitante-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
    >
      <div className="relative max-h-[90dvh] w-full overflow-y-auto rounded-t-2xl border border-foreground/10 border-b-0 bg-background px-5 pb-8 pt-3 shadow-xl">
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 size-9 rounded-full"
          aria-label="Cerrar detalle del tramo"
          onClick={() => onOpenChange(false)}
        >
          <X className="size-4" />
        </Button>

        <TramoDetalleVisitanteContenido
          tramo={tramo}
          puntosAvance={puntosAvance}
          panelError={panelError}
          tituloId="tramo-detalle-visitante-title"
        />

        <Button type="button" variant="outline" className="mt-6 w-full" onClick={() => onOpenChange(false)}>
          Cerrar
        </Button>
      </div>
    </div>
  )
}
