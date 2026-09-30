"use client"

import { MapaOverlayPortal } from "@/src/components/mapa/MapaOverlayPortal"
import {
  TramoOrigenInicioBlock,
  type ConfirmarOrigenInicioOptions,
} from "@/src/components/mapa/TramoOrigenInicioBlock"
import type { CanalTramo, OrigenExtremoTramo } from "@/src/data/tramos/types"
import { Z_MAPA_DIALOG } from "@/src/lib/mapa-capas-z"
import { cn } from "@/lib/utils"

type RegistrarPuntoOrigenDialogProps = {
  open: boolean
  tramo: CanalTramo | null
  loading?: boolean
  onConfirmar: (
    origen: OrigenExtremoTramo,
    opciones?: ConfirmarOrigenInicioOptions
  ) => Promise<void>
  onCancel: () => void
}

export function RegistrarPuntoOrigenDialog({
  open,
  tramo,
  loading = false,
  onConfirmar,
  onCancel,
}: RegistrarPuntoOrigenDialogProps) {
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
        aria-labelledby="registrar-punto-origen-title"
        onClick={(e) => {
          if (e.target === e.currentTarget) onCancel()
        }}
      >
        <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-foreground/10 bg-background p-5 shadow-xl">
          <h2 id="registrar-punto-origen-title" className="text-lg font-semibold">
            Inicio del tramo {tramo.codigo}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Antes de registrar su ubicación como punto de avance, indique desde qué extremo inicia el
            desasolve en este tramo.
          </p>
          <div className="mt-4">
            <TramoOrigenInicioBlock tramo={tramo} loading={loading} onConfirmar={onConfirmar} />
          </div>
        </div>
      </div>
    </MapaOverlayPortal>
  )
}
