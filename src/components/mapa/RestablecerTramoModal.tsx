"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MapaOverlayPortal } from "@/src/components/mapa/MapaOverlayPortal"
import type { CanalTramo } from "@/src/data/tramos/types"
import { Z_MAPA_DIALOG } from "@/src/lib/mapa-capas-z"

type RestablecerTramoModalProps = {
  open: boolean
  tramo: CanalTramo | null
  loading?: boolean
  onConfirm: () => void | Promise<void>
  onCancel: () => void
}

export function RestablecerTramoModal({
  open,
  tramo,
  loading = false,
  onConfirm,
  onCancel,
}: RestablecerTramoModalProps) {
  if (!open || !tramo) return null

  return (
    <MapaOverlayPortal open>
      <div
        className={cn(
          "fixed inset-0 flex items-end justify-center bg-black/50 p-4 sm:items-center",
          Z_MAPA_DIALOG
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="restablecer-tramo-title"
        onClick={(event) => {
          if (event.target === event.currentTarget && !loading) onCancel()
        }}
      >
      <div className="w-full max-w-md rounded-xl border border-foreground/10 bg-background p-5 shadow-xl">
        <h2 id="restablecer-tramo-title" className="text-lg font-semibold">
          Restablecer todo
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Se borrarán <span className="font-medium text-foreground">todos</span> los puntos GPS del
          tramo {tramo.codigo} (A, B, C…) y el extremo de inicio elegido. Deberá volver a indicar
          desde qué extremo inicia el desasolve.
        </p>
        <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" disabled={loading} onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={loading}
            onClick={() => void onConfirm()}
          >
            {loading ? "Restableciendo…" : "Confirmar restablecimiento"}
          </Button>
        </div>
      </div>
    </div>
    </MapaOverlayPortal>
  )
}
