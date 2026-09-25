"use client"

import { useState } from "react"

import type { CanalTramo, EstadoTramo, OrigenExtremoTramo } from "@/src/data/tramos/types"
import { MarcarPuntoTramoBlock } from "@/src/components/mapa/MarcarPuntoTramoBlock"
import {
  TramoOrigenInicioBlock,
  type ConfirmarOrigenInicioOptions,
} from "@/src/components/mapa/TramoOrigenInicioBlock"
import { TramoPuntosOperativosBlock } from "@/src/components/mapa/TramoPuntosOperativosBlock"
import { TramoReiniciarOrigenBlock } from "@/src/components/mapa/TramoReiniciarOrigenBlock"
import { tramoListoParaMarcar, tramoRequiereConfigurarOrigen } from "@/src/lib/tramo-geometria"
import { TramoEditorForm, type TramoFormValues } from "@/src/components/mapa/TramoEditorForm"
import { TramoEvidenciaUploadBlock } from "@/src/components/mapa/TramoEvidenciaUploadBlock"
import { TramoPuntosHistorial } from "@/src/components/mapa/TramoPuntosHistorial"
import { TramoDetalleResumen } from "@/src/components/mapa/TramoDetalleResumen"
import { TramoMaquinariaHistorialBlock } from "@/src/components/mapa/TramoMaquinariaHistorialBlock"
import type { PropuestaPuntoMinitramo, TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import type { SolicitarConfirmacionAvanceOptions } from "@/src/components/mapa/TramoDetallePanel"

export type TramoDetalleResidenteContenidoProps = {
  tramo: CanalTramo
  loading: boolean
  proyectoId: string
  puntosAvance: TramoPuntoAvance[]
  puntosRefreshKey: number
  eliminandoId?: string | null
  panelError?: string | null
  guardandoEstadoMinitramoId?: string | null
  guardandoOrigen?: boolean
  reiniciandoOrigen?: boolean
  tituloId?: string
  mostrarEncabezadoResumen?: boolean
  onSubmit: (tramoId: string, values: TramoFormValues) => Promise<void>
  onSolicitarConfirmacionAvance: (
    propuesta: PropuestaPuntoMinitramo,
    opciones?: SolicitarConfirmacionAvanceOptions
  ) => void
  onEliminarMinitramo?: (grupoId: string) => void
  onEstadoMinitramoChange?: (puntoFinId: string, estado: EstadoTramo) => void | Promise<void>
  onEstadoPuntoChange?: (puntoId: string, estado: EstadoTramo | null) => void | Promise<void>
  onEvidenciaSubida?: () => void
  onGuardarOrigenInicio?: (
    origen: OrigenExtremoTramo,
    opciones?: ConfirmarOrigenInicioOptions
  ) => Promise<void>
  onReiniciarOrigenTramo?: () => Promise<void>
}

export function TramoDetalleResidenteContenido({
  tramo,
  loading,
  proyectoId,
  puntosAvance,
  puntosRefreshKey,
  eliminandoId = null,
  panelError = null,
  guardandoEstadoMinitramoId = null,
  guardandoOrigen = false,
  reiniciandoOrigen = false,
  tituloId,
  mostrarEncabezadoResumen = true,
  onSubmit,
  onSolicitarConfirmacionAvance,
  onEliminarMinitramo,
  onEstadoMinitramoChange,
  onEstadoPuntoChange,
  onEvidenciaSubida,
  onGuardarOrigenInicio,
  onReiniciarOrigenTramo,
}: TramoDetalleResidenteContenidoProps) {
  const [adminDatosAbierto, setAdminDatosAbierto] = useState(false)

  const puntosDelTramo = puntosAvance.filter((p) => p.tramo_id === tramo.id && p.confirmado)
  const requiereOrigen = tramoRequiereConfigurarOrigen(tramo, puntosDelTramo)
  const listoMarcar = tramoListoParaMarcar(tramo, puntosDelTramo)

  return (
    <div className="space-y-6">
      {panelError ? (
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {panelError}
        </p>
      ) : null}

      <TramoDetalleResumen
        tramo={tramo}
        puntosAvance={puntosAvance}
        tituloId={tituloId}
        mostrarEncabezado={mostrarEncabezadoResumen}
      />

      <TramoMaquinariaHistorialBlock
        tramoId={tramo.id}
        proyectoId={tramo.proyecto_id}
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
      {listoMarcar && onEstadoPuntoChange ? (
        <TramoPuntosOperativosBlock
          tramoId={tramo.id}
          puntos={puntosDelTramo}
          guardandoPuntoId={guardandoEstadoMinitramoId}
          onEstadoPuntoChange={onEstadoPuntoChange}
        />
      ) : null}
      {listoMarcar ? (
        <MarcarPuntoTramoBlock
          tramo={tramo}
          puntosPrevios={puntosDelTramo}
          isResident
          guardandoEstadoMinitramoId={guardandoEstadoMinitramoId}
          eliminandoId={eliminandoId}
          onEstadoMinitramoChange={onEstadoMinitramoChange}
          onEliminarMinitramo={onEliminarMinitramo}
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
        isResident
        guardandoEstadoMinitramoId={guardandoEstadoMinitramoId}
        onEstadoMinitramoChange={onEstadoMinitramoChange}
        onEliminarMinitramo={onEliminarMinitramo}
        eliminandoId={eliminandoId}
      />

      <details
        className="rounded-lg border border-foreground/10 bg-muted/10 px-3 py-2"
        open={adminDatosAbierto}
        onToggle={(event) => setAdminDatosAbierto((event.target as HTMLDetailsElement).open)}
      >
        <summary className="cursor-pointer text-sm font-medium">Datos administrativos del tramo</summary>
        {adminDatosAbierto ? (
          <div className="mt-3 pb-2">
            <TramoEditorForm
              tramo={tramo}
              isResident
              loading={loading}
              onSubmit={(values) => onSubmit(tramo.id, values)}
            />
          </div>
        ) : null}
      </details>
    </div>
  )
}
