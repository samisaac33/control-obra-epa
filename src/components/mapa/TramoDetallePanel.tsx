"use client"

import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { CanalTramo } from "@/src/data/tramos/types"
import { MarcarPuntoTramoBlock } from "@/src/components/mapa/MarcarPuntoTramoBlock"
import { TramoOrigenInicioBlock } from "@/src/components/mapa/TramoOrigenInicioBlock"
import { TramoReiniciarOrigenBlock } from "@/src/components/mapa/TramoReiniciarOrigenBlock"
import type { EstadoTramo, OrigenExtremoTramo } from "@/src/data/tramos/types"
import { tramoListoParaMarcar, tramoRequiereConfigurarOrigen } from "@/src/lib/tramo-geometria"
import { TramoEditorForm, type TramoFormValues } from "@/src/components/mapa/TramoEditorForm"
import { TramoEvidenciaUploadBlock } from "@/src/components/mapa/TramoEvidenciaUploadBlock"
import { TramoPuntosHistorial } from "@/src/components/mapa/TramoPuntosHistorial"
import type { PropuestaPuntoMinitramo, TramoPuntoAvance } from "@/src/lib/tramo-geometria"

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
  guardandoEstadoMinitramoId?: string | null
  onEvidenciaSubida?: () => void
  onGuardarOrigenInicio?: (origen: OrigenExtremoTramo) => Promise<void>
  guardandoOrigen?: boolean
  onReiniciarOrigenTramo?: () => Promise<void>
  reiniciandoOrigen?: boolean
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
  guardandoEstadoMinitramoId = null,
  onEvidenciaSubida,
  onGuardarOrigenInicio,
  guardandoOrigen = false,
  onReiniciarOrigenTramo,
  reiniciandoOrigen = false,
}: TramoDetallePanelProps) {
  const puntosDelTramo = tramo
    ? puntosAvance.filter((p) => p.tramo_id === tramo.id && p.confirmado)
    : []

  const requiereOrigen = tramo ? tramoRequiereConfigurarOrigen(tramo, puntosDelTramo) : false
  const listoMarcar = tramo ? tramoListoParaMarcar(tramo, puntosDelTramo) : false

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClearPanelError?.()
        onOpenChange(nextOpen)
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{tramo ? `Tramo ${tramo.codigo}` : "Detalle del tramo"}</SheetTitle>
          <SheetDescription>
            {tramo
              ? `${tramo.canal} — ${(tramo.longitud_m / 1000).toFixed(2)} km`
              : "Seleccione un tramo en el mapa"}
          </SheetDescription>
        </SheetHeader>
        {tramo ? (
          <div className="mt-6 space-y-6">
            {panelError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                {panelError}
              </p>
            ) : null}

            {isResident ? (
              <>
                {requiereOrigen && onGuardarOrigenInicio ? (
                  <TramoOrigenInicioBlock
                    tramo={tramo}
                    loading={guardandoOrigen}
                    onConfirmar={onGuardarOrigenInicio}
                  />
                ) : null}
                {tramo.origen_extremo && onReiniciarOrigenTramo ? (
                  <TramoReiniciarOrigenBlock
                    tramo={tramo}
                    loading={reiniciandoOrigen}
                    onReiniciar={onReiniciarOrigenTramo}
                  />
                ) : null}
                {listoMarcar ? (
                  <MarcarPuntoTramoBlock
                    tramo={tramo}
                    puntosPrevios={puntosDelTramo}
                    isResident={isResident}
                    guardandoEstadoMinitramoId={guardandoEstadoMinitramoId}
                    onEstadoMinitramoChange={onEstadoMinitramoChange}
                    onSolicitarConfirmacion={(propuesta, opciones) =>
                      onSolicitarConfirmacionAvance(propuesta, opciones)
                    }
                  />
                ) : null}
                <TramoEvidenciaUploadBlock
                  tramo={tramo}
                  proyectoId={proyectoId}
                  puntosPrevios={puntosDelTramo}
                  onEvidenciaSubida={onEvidenciaSubida}
                  onSolicitarConfirmacion={(propuesta, opciones) =>
                    onSolicitarConfirmacionAvance(propuesta, {
                      registroFotoId: opciones.registroFotoId,
                    })
                  }
                />
              </>
            ) : null}

            <TramoPuntosHistorial
              tramoId={tramo.id}
              refreshKey={puntosRefreshKey}
              metrosEjecutados={tramo.metros_ejecutados}
              isResident={isResident}
              guardandoEstadoMinitramoId={guardandoEstadoMinitramoId}
              onEstadoMinitramoChange={isResident ? onEstadoMinitramoChange : undefined}
              onEliminarMinitramo={isResident ? onEliminarMinitramo : undefined}
              eliminandoId={eliminandoId}
            />

            <TramoEditorForm
              tramo={tramo}
              isResident={isResident}
              loading={loading}
              onSubmit={(values) => onSubmit(tramo.id, values)}
            />
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
