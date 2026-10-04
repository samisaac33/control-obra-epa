"use client"

import type { CanalTramo } from "@/src/data/tramos/types"
import { TramoDetalleResumen } from "@/src/components/mapa/TramoDetalleResumen"
import { TramoMaquinariaHistorialBlock } from "@/src/components/mapa/TramoMaquinariaHistorialBlock"
import type { SegmentoVisualTramo, TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import type { JornadaMinitramoMapa } from "@/src/lib/tramo-maquinaria-historial"

type TramoDetalleVisitanteContenidoProps = {
  tramo: CanalTramo
  puntosAvance: TramoPuntoAvance[]
  jornadaPorPuntoFin?: ReadonlyMap<string, JornadaMinitramoMapa>
  segmentoDestacado?: SegmentoVisualTramo | null
  panelError?: string | null
  tituloId: string
}

export function TramoDetalleVisitanteContenido({
  tramo,
  puntosAvance,
  jornadaPorPuntoFin,
  segmentoDestacado = null,
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

      <TramoDetalleResumen
        tramo={tramo}
        puntosAvance={puntosAvance}
        jornadaPorPuntoFin={jornadaPorPuntoFin}
        segmentoDestacado={segmentoDestacado}
        tituloId={tituloId}
      />

      <div className="mt-6">
        <TramoMaquinariaHistorialBlock
          tramoId={tramo.id}
          proyectoId={tramo.proyecto_id}
          isResident={false}
        />
      </div>
    </>
  )
}
