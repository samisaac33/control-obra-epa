"use client"

import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { CanalTramo } from "@/src/data/tramos/types"
import {
  TramoDetalleResidenteContenido,
  type TramoDetalleResidenteContenidoProps,
} from "@/src/components/mapa/TramoDetalleResidenteContenido"
import { tituloTramoMapa } from "@/src/lib/tramo-display"

type TramoDetalleResidenteBottomSheetProps = Omit<
  TramoDetalleResidenteContenidoProps,
  "tituloId"
> & {
  open: boolean
  tramo: CanalTramo | null
  onOpenChange: (open: boolean) => void
}

export function TramoDetalleResidenteBottomSheet({
  open,
  tramo,
  onOpenChange,
  ...contenidoProps
}: TramoDetalleResidenteBottomSheetProps) {
  if (!open || !tramo) return null

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tramo-detalle-residente-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onOpenChange(false)
      }}
    >
      <div className="relative max-h-[92dvh] w-full overflow-y-auto rounded-t-2xl border border-foreground/10 border-b-0 bg-background px-5 pb-8 pt-3 shadow-xl">
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 size-9 rounded-full"
          aria-label="Cerrar detalle del tramo"
          onClick={() => onOpenChange(false)}
        />

        <p className="pr-10 text-xs text-muted-foreground">Registro de avance y maquinaria</p>
        <h2 id="tramo-detalle-residente-title" className="pr-10 text-lg font-semibold">
          {tituloTramoMapa(tramo.codigo)}
        </h2>

        <div className="mt-4">
          <TramoDetalleResidenteContenido
            {...contenidoProps}
            tramo={tramo}
            mostrarEncabezadoResumen={false}
          />
        </div>

        <Button type="button" variant="outline" className="mt-6 w-full" onClick={() => onOpenChange(false)}>
          Cerrar
        </Button>
      </div>
    </div>
  )
}
