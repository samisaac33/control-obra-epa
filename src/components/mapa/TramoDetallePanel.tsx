"use client"

import { cn } from "@/lib/utils"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { CanalTramo } from "@/src/data/tramos/types"
import type { TramoFormValues } from "@/src/components/mapa/TramoEditorForm"
import { TramoDetalleVisitanteBottomSheet } from "@/src/components/mapa/TramoDetalleVisitanteBottomSheet"
import { TramoDetalleVisitanteContenido } from "@/src/components/mapa/TramoDetalleVisitanteContenido"
import { TramoDetalleResidenteBottomSheet } from "@/src/components/mapa/TramoDetalleResidenteBottomSheet"
import { TramoDetalleResidenteContenido } from "@/src/components/mapa/TramoDetalleResidenteContenido"
import { tituloTramoMapa } from "@/src/lib/tramo-display"
import type { PropuestaPuntoMinitramo, TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import type { ConfirmarOrigenInicioOptions } from "@/src/components/mapa/TramoOrigenInicioBlock"
import type { EstadoTramo, OrigenExtremoTramo } from "@/src/data/tramos/types"

export type SolicitarConfirmacionAvanceOptions = {
  modo?: "nuevo" | "corregir"
  puntoId?: string
  registroFotoId?: string
}

type TramoDetallePanelProps = {
  tramo: CanalTramo | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isResident: boolean
  loading: boolean
  proyectoId: string
  puntosAvance: TramoPuntoAvance[]
  puntosRefreshKey: number
  eliminandoId?: string | null
  panelError?: string | null
  onClearPanelError?: () => void
  onSubmit: (tramoId: string, values: TramoFormValues) => Promise<void>
  onSolicitarConfirmacionAvance: (
    propuesta: PropuestaPuntoMinitramo,
    opciones?: SolicitarConfirmacionAvanceOptions
  ) => void
  onEliminarMinitramo?: (grupoId: string) => void
  onEliminarPuntoHuérfano?: (puntoId: string) => void
  onEstadoMinitramoChange?: (puntoFinId: string, estado: EstadoTramo) => void | Promise<void>
  onEstadoPuntoChange?: (puntoId: string, estado: EstadoTramo | null) => void | Promise<void>
  guardandoEstadoMinitramoId?: string | null
  onEvidenciaSubida?: () => void
  onGuardarOrigenInicio?: (
    origen: OrigenExtremoTramo,
    opciones?: ConfirmarOrigenInicioOptions
  ) => Promise<void>
  guardandoOrigen?: boolean
  onReiniciarOrigenTramo?: () => Promise<void>
  reiniciandoOrigen?: boolean
  /** Mapa en viewport móvil: bottom sheet fijo en lugar de Sheet lateral. */
  detalleEnBottomSheet?: boolean
}

export function TramoDetallePanel({
  tramo,
  open,
  onOpenChange,
  isResident,
  loading,
  proyectoId,
  puntosAvance,
  puntosRefreshKey,
  eliminandoId = null,
  panelError = null,
  onClearPanelError,
  onSubmit,
  onSolicitarConfirmacionAvance,
  onEliminarMinitramo,
  onEliminarPuntoHuérfano,
  onEstadoMinitramoChange,
  onEstadoPuntoChange,
  guardandoEstadoMinitramoId = null,
  onEvidenciaSubida,
  onGuardarOrigenInicio,
  guardandoOrigen = false,
  onReiniciarOrigenTramo,
  reiniciandoOrigen = false,
  detalleEnBottomSheet = false,
}: TramoDetallePanelProps) {
  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen) onClearPanelError?.()
    onOpenChange(nextOpen)
  }

  const contenidoResidenteProps = {
    loading,
    proyectoId,
    puntosAvance,
    puntosRefreshKey,
    eliminandoId,
    panelError,
    guardandoEstadoMinitramoId,
    guardandoOrigen,
    reiniciandoOrigen,
    onSubmit,
    onSolicitarConfirmacionAvance,
    onEliminarMinitramo,
    onEstadoMinitramoChange,
    onEstadoPuntoChange,
    onEvidenciaSubida,
    onGuardarOrigenInicio,
    onReiniciarOrigenTramo,
  }

  if (detalleEnBottomSheet && !isResident) {
    return (
      <TramoDetalleVisitanteBottomSheet
        open={open}
        tramo={tramo}
        puntosAvance={puntosAvance}
        panelError={panelError}
        onOpenChange={handleOpenChange}
      />
    )
  }

  if (detalleEnBottomSheet && isResident) {
    return (
      <TramoDetalleResidenteBottomSheet
        open={open}
        tramo={tramo}
        onOpenChange={handleOpenChange}
        {...contenidoResidenteProps}
      />
    )
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto sm:max-w-lg"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <SheetHeader className={!isResident ? "sr-only" : undefined}>
          <SheetTitle id={isResident ? "tramo-detalle-sheet-title" : undefined}>
            {tramo ? tituloTramoMapa(tramo.codigo) : "Detalle del tramo"}
          </SheetTitle>
          <SheetDescription>
            {isResident
              ? "Registro de avance, minitramos GPS y maquinaria"
              : "Avance del desasolve e historial de jornadas"}
          </SheetDescription>
        </SheetHeader>

        {tramo ? (
          <div className={cn(isResident ? "mt-6" : "space-y-0")}>
            {!isResident ? (
              <TramoDetalleVisitanteContenido
                tramo={tramo}
                puntosAvance={puntosAvance}
                panelError={panelError}
                tituloId="tramo-detalle-sheet-title"
              />
            ) : (
              <TramoDetalleResidenteContenido
                tramo={tramo}
                {...contenidoResidenteProps}
                tituloId="tramo-detalle-sheet-title"
              />
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
