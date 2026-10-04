"use client"

import {
  colorEstadoTramo,
  etiquetaEstadoTramo,
  type CanalTramo,
  type EstadoTramo,
} from "@/src/data/tramos/types"
import { MinitramoGerencialCard } from "@/src/components/mapa/MinitramoGerencialCard"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import {
  minitramosCompletosOrdenados,
  metrosTerminadosMinitramos,
} from "@/src/lib/minitramo-gerencial-resumen"
import { tituloTramoMapa } from "@/src/lib/tramo-display"
import type { JornadaMinitramoMapa } from "@/src/lib/tramo-maquinaria-historial"
import {
  etiquetaLetra,
  formatLongitudSegmentoMapa,
  resumenMinitramos,
  segmentosVisualesTramo,
  type SegmentoVisualTramo,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"
import { avanceDesasolveTramo } from "@/src/lib/tramos-avance"

function estadoSegmentoVisual(segmento: SegmentoVisualTramo): EstadoTramo {
  if (segmento.tipo === "minitramo") {
    return segmento.estadoSegmento ?? "en_ejecucion"
  }
  return segmento.estadoSegmento ?? "pendiente"
}

export function BarraSegmentosTramo({
  tramo,
  puntosAvance,
}: {
  tramo: CanalTramo
  puntosAvance: TramoPuntoAvance[]
}) {
  const segmentos = segmentosVisualesTramo(tramo, puntosAvance)
  const total = tramo.longitud_m

  if (total <= 0) return null

  return (
    <div
      className="flex h-3 overflow-hidden rounded-full bg-muted ring-1 ring-foreground/10"
      role="img"
      aria-label="Distribución del tramo por tramos y minitramos"
    >
      {segmentos.map((segmento, index) => {
        const pct = Math.max(0.5, (segmento.longitud_m / total) * 100)
        const estado = estadoSegmentoVisual(segmento)
        return (
          <div
            key={`${segmento.tipo}-${index}-${segmento.letraInicio ?? ""}-${segmento.letraFin ?? ""}`}
            className="h-full min-w-[2px] transition-[width]"
            style={{
              width: `${pct}%`,
              backgroundColor: colorEstadoTramo(estado),
            }}
            title={
              segmento.tipo === "minitramo" && segmento.letraInicio && segmento.letraFin
                ? `Minitramo ${etiquetaLetra(segmento.letraInicio)}–${etiquetaLetra(segmento.letraFin)}: ${etiquetaEstadoTramo(estado)}`
                : `Pendiente: ${etiquetaEstadoTramo(estado)}`
            }
          />
        )
      })}
    </div>
  )
}

type TramoDetalleResumenProps = {
  tramo: CanalTramo
  puntosAvance: TramoPuntoAvance[]
  jornadaPorPuntoFin?: ReadonlyMap<string, JornadaMinitramoMapa>
  segmentoDestacado?: SegmentoVisualTramo | null
  mostrarEncabezado?: boolean
  tituloId?: string
}

export function TramoDetalleEncabezado({
  tramo,
  tituloId,
}: {
  tramo: CanalTramo
  tituloId?: string
}) {
  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-2">
        <h2 id={tituloId} className="text-lg font-semibold">
          {tituloTramoMapa(tramo.codigo)}
        </h2>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-muted/50 px-2.5 py-1 text-xs font-medium">
          <span
            className="size-2 rounded-full ring-1 ring-foreground/10"
            style={{ backgroundColor: colorEstadoTramo(tramo.estado) }}
            aria-hidden
          />
          {etiquetaEstadoTramo(tramo.estado)}
        </span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Longitud total: {formatLongitudSegmentoMapa(tramo.longitud_m)}
      </p>
    </>
  )
}

export function TramoDetalleResumen({
  tramo,
  puntosAvance,
  jornadaPorPuntoFin,
  segmentoDestacado = null,
  mostrarEncabezado = true,
  tituloId,
}: TramoDetalleResumenProps) {
  const avance = avanceDesasolveTramo(tramo, puntosAvance)
  const minitramos = resumenMinitramos(puntosAvance, tramo.id, tramo)
  const minitramosCompletos = minitramosCompletosOrdenados(minitramos)
  const kmTerminadosGps = metrosTerminadosMinitramos(minitramosCompletos) / 1000
  const puntosPorId = new Map(
    puntosAvance.filter((p) => p.tramo_id === tramo.id).map((p) => [p.id, p] as const)
  )
  const kmEjecutados = avance.metrosEjecutados / 1000
  const kmTotales = avance.metrosTotales / 1000

  return (
    <div className="space-y-4">
      {mostrarEncabezado ? <TramoDetalleEncabezado tramo={tramo} tituloId={tituloId} /> : null}

      <section className="rounded-xl border border-foreground/10 bg-card/50 p-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Avance del desasolve
            </p>
            <p className="font-mono text-2xl font-semibold tabular-nums">
              {formatearNumero(avance.avancePct, 1)}%
            </p>
          </div>
          <p className="text-right text-xs text-muted-foreground">
            <span className="font-medium text-foreground">
              {formatearNumero(kmEjecutados, 2)} km
            </span>
            <span className="block">de {formatearNumero(kmTotales, 2)} km</span>
          </p>
        </div>
        <div
          className="mt-3 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-valuenow={avance.avancePct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Avance ejecutado del tramo"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width]"
            style={{ width: `${Math.min(100, avance.avancePct)}%` }}
          />
        </div>
        {avance.usaAvanceGps ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Avance según minitramos GPS en estado terminado.
          </p>
        ) : (
          <p className="mt-2 text-xs text-muted-foreground">
            Avance según registro administrativo del tramo.
          </p>
        )}
      </section>

      {minitramosCompletos.length > 0 ? (
        <section className="space-y-3">
          <div>
            <h3 className="text-sm font-medium">Minitramos GPS</h3>
            <p className="text-xs text-muted-foreground">
              {minitramosCompletos.length} minitramo
              {minitramosCompletos.length === 1 ? "" : "s"} confirmado
              {minitramosCompletos.length === 1 ? "" : "s"}
              {avance.usaAvanceGps ? (
                <>
                  {" "}
                  · {formatearNumero(kmTerminadosGps, 2)} km terminados (GPS)
                </>
              ) : null}
            </p>
          </div>
          <BarraSegmentosTramo tramo={tramo} puntosAvance={puntosAvance} />
          <ul className="space-y-3">
            {minitramosCompletos.map((item, indice) => {
              const destacado =
                segmentoDestacado?.tipo === "minitramo" &&
                segmentoDestacado.letraInicio === item.letraInicio &&
                segmentoDestacado.letraFin === item.letraFin
              return (
                <MinitramoGerencialCard
                  key={item.grupo_id}
                  item={item}
                  indice={indice}
                  itemsOrdenados={minitramosCompletos}
                  tramo={tramo}
                  jornada={jornadaPorPuntoFin?.get(item.puntoFinId)}
                  puntoFin={puntosPorId.get(item.puntoFinId) ?? null}
                  destacado={destacado}
                />
              )
            })}
          </ul>
        </section>
      ) : (
        <p className="rounded-lg border border-dashed border-foreground/15 bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground">
          Aún no hay minitramos GPS registrados en este tramo.
        </p>
      )}
    </div>
  )
}
