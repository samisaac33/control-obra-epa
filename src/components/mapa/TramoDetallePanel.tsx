"use client"

import { cn } from "@/lib/utils"
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
import { TramoDetalleResumen } from "@/src/components/mapa/TramoDetalleResumen"
import { TramoMaquinariaHistorialBlock } from "@/src/components/mapa/TramoMaquinariaHistorialBlock"
import { TramoDetalleVisitanteBottomSheet } from "@/src/components/mapa/TramoDetalleVisitanteBottomSheet"
import { TramoDetalleVisitanteContenido } from "@/src/components/mapa/TramoDetalleVisitanteContenido"
import { tituloTramoMapa } from "@/src/lib/tramo-display"
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
  /** Visitante en layout móvil del mapa: bottom sheet fijo (no Sheet lateral). */
  visitanteUsaBottomSheet?: boolean
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
  visitanteUsaBottomSheet = false,
}: TramoDetallePanelProps) {
  const puntosDelTramo = tramo
    ? puntosAvance.filter((p) => p.tramo_id === tramo.id && p.confirmado)
    : []

  const requiereOrigen = tramo ? tramoRequiereConfigurarOrigen(tramo, puntosDelTramo) : false
  const listoMarcar = tramo ? tramoListoParaMarcar(tramo, puntosDelTramo) : false

  if (!isResident && visitanteUsaBottomSheet) {
    return (
      <TramoDetalleVisitanteBottomSheet
        open={open}
        tramo={tramo}
        puntosAvance={puntosAvance}
        panelError={panelError}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) onClearPanelError?.()
          onOpenChange(nextOpen)
        }}
      />
    )
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) onClearPanelError?.()
        onOpenChange(nextOpen)
      }}
    >
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-lg">
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
          <div className={cn(isResident ? "mt-6 space-y-6" : "space-y-0")}>
            {!isResident ? (
              <TramoDetalleVisitanteContenido
                tramo={tramo}
                puntosAvance={puntosAvance}
                panelError={panelError}
                tituloId="tramo-detalle-sheet-title"
              />
            ) : (
              <>
                {panelError ? (
                  <p
                    className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    role="alert"
                  >
                    {panelError}
                  </p>
                ) : null}
                <TramoDetalleResumen tramo={tramo} puntosAvance={puntosAvance} />

                <TramoMaquinariaHistorialBlock
                  tramoId={tramo.id}
                  isResident
                  refreshKey={puntosRefreshKey}
                />

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

                <TramoPuntosHistorial
                  tramoId={tramo.id}
                  refreshKey={puntosRefreshKey}
                  metrosEjecutados={tramo.metros_ejecutados}
                  isResident={isResident}
                  guardandoEstadoMinitramoId={guardandoEstadoMinitramoId}
                  onEstadoMinitramoChange={onEstadoMinitramoChange}
                  onEliminarMinitramo={onEliminarMinitramo}
                  eliminandoId={eliminandoId}
                />

                <details className="rounded-lg border border-foreground/10 bg-muted/10 px-3 py-2">
                  <summary className="cursor-pointer text-sm font-medium">
                    Datos administrativos del tramo
                  </summary>
                  <div className="mt-3 pb-2">
                    <TramoEditorForm
                      tramo={tramo}
                      isResident={isResident}
                      loading={loading}
                      onSubmit={(values) => onSubmit(tramo.id, values)}
                    />
                  </div>
                </details>
              </>
            )}
          </div>
        ) : null}
      </SheetContent>
    </Sheet>
  )
}
