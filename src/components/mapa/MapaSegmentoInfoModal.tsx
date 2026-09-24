"use client"

import { Button } from "@/components/ui/button"
import type { CanalTramo } from "@/src/data/tramos/types"
import { infoSegmentoMapa, type SegmentoVisualTramo } from "@/src/lib/tramo-geometria"

type MapaSegmentoInfoModalProps = {
  open: boolean
  segmento: SegmentoVisualTramo | null
  esViewportMovil?: boolean
  onClose: () => void
  onVerDetalleTramo: (tramo: CanalTramo) => void
}

export function MapaSegmentoInfoModal({
  open,
  segmento,
  esViewportMovil = false,
  onClose,
  onVerDetalleTramo,
}: MapaSegmentoInfoModalProps) {
  if (!open || !segmento) return null

  const info = infoSegmentoMapa(segmento)
  const tramo = segmento.tramo
  const tituloModal = info.etiquetaMinitramo
    ? `${info.titulo} · Minitramo ${info.etiquetaMinitramo}`
    : info.titulo

  const esBottomSheet = esViewportMovil

  return (
    <div
      className={
        esBottomSheet
          ? "fixed inset-0 z-[60] flex items-end justify-center bg-black/50"
          : "fixed inset-0 z-[60] flex items-end justify-center bg-black/50 p-4 sm:items-center"
      }
      role="dialog"
      aria-modal="true"
      aria-labelledby="mapa-segmento-info-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className={
          esBottomSheet
            ? "max-h-[85dvh] w-full overflow-y-auto rounded-t-2xl border border-foreground/10 border-b-0 bg-background px-5 pb-6 pt-3 shadow-xl"
            : "w-full max-w-md rounded-xl border border-foreground/10 bg-background p-5 shadow-xl"
        }
      >
        {esBottomSheet ? (
          <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden />
        ) : null}
        <h2 id="mapa-segmento-info-title" className="text-lg font-semibold">
          {tituloModal}
        </h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Canal</dt>
            <dd className="text-right font-medium">{info.canal}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              {info.esMinitramo ? "Estado del minitramo" : "Estado del tramo"}
            </dt>
            <dd className="text-right font-medium">{info.estadoLabel}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">
              {info.esMinitramo ? "Longitud del minitramo" : "Longitud del tramo"}
            </dt>
            <dd className="text-right font-medium">{info.longitudTexto}</dd>
          </div>
          <div className="flex justify-between gap-4 border-t border-foreground/10 pt-2">
            <dt className="text-muted-foreground">Avance del tramo</dt>
            <dd className="text-right font-medium">
              {tramo.avance_pct.toFixed(1)}% · {(tramo.longitud_m / 1000).toFixed(2)} km total
            </dd>
          </div>
        </dl>
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
