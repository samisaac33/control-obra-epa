"use client"

import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import type { CanalTramo } from "@/src/data/tramos/types"
import { TramoDetalleResumen } from "@/src/components/mapa/TramoDetalleResumen"
import type { SegmentoVisualTramo, TramoPuntoAvance } from "@/src/lib/tramo-geometria"

type MapaSegmentoInfoModalProps = {
  open: boolean
  tramo: CanalTramo | null
  puntosAvance: TramoPuntoAvance[]
  segmentoDestacado: SegmentoVisualTramo | null
  onClose: () => void
  onVerDetalleTramo: (tramo: CanalTramo) => void
}

export function MapaSegmentoInfoModal({
  open,
  tramo,
  puntosAvance,
  segmentoDestacado,
  onClose,
  onVerDetalleTramo,
}: MapaSegmentoInfoModalProps) {
  useEffect(() => {
    if (!open) return
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [open, onClose])

  if (!open || !tramo) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mapa-tramo-info-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="max-h-[85dvh] w-full overflow-y-auto rounded-t-2xl border border-foreground/10 border-b-0 bg-background px-5 pb-6 pt-3 shadow-xl sm:max-h-[min(85vh,720px)] sm:max-w-lg sm:rounded-2xl sm:border-b">
        <div
          className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30 sm:hidden"
          aria-hidden
        />

        <TramoDetalleResumen
          tramo={tramo}
          puntosAvance={puntosAvance}
          segmentoDestacado={segmentoDestacado}
          tituloId="mapa-tramo-info-title"
        />

        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="button" onClick={() => onVerDetalleTramo(tramo)}>
            Ver detalle del tramo
          </Button>
        </div>
      </div>
    </div>
  )
}
