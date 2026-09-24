"use client"

import type { CanalTramo } from "@/src/data/tramos/types"
import { TramoDetalleResumen } from "@/src/components/mapa/TramoDetalleResumen"
import { TramoMaquinariaHistorialBlock } from "@/src/components/mapa/TramoMaquinariaHistorialBlock"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"

type TramoDetalleVisitanteContenidoProps = {
  tramo: CanalTramo
  puntosAvance: TramoPuntoAvance[]
  panelError?: string | null
  tituloId: string
}

export function TramoDetalleVisitanteContenido({
  tramo,
  puntosAvance,
  panelError = null,
  tituloId,
}: TramoDetalleVisitanteContenidoProps) {
  return (
    <>
      {panelError ? (
        <p
          className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
          role="alert"
        >
          {panelError}
        </p>
      ) : null}

      <TramoDetalleResumen tramo={tramo} puntosAvance={puntosAvance} tituloId={tituloId} />

      <div className="mt-6">
        <TramoMaquinariaHistorialBlock tramoId={tramo.id} isResident={false} />
      </div>
    </>
  )
}
