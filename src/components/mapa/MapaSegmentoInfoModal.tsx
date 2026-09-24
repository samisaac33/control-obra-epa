"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  colorEstadoTramo,
  etiquetaEstadoTramo,
  type CanalTramo,
  type EstadoTramo,
} from "@/src/data/tramos/types"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import {
  etiquetaLetra,
  formatLongitudSegmentoMapa,
  resumenMinitramos,
  segmentosVisualesTramo,
  type SegmentoVisualTramo,
  type TramoPuntoAvance,
} from "@/src/lib/tramo-geometria"
import { avanceDesasolveTramo } from "@/src/lib/tramos-avance"

type MapaSegmentoInfoModalProps = {
  open: boolean
  tramo: CanalTramo | null
  puntosAvance: TramoPuntoAvance[]
  segmentoDestacado: SegmentoVisualTramo | null
  onClose: () => void
  onVerDetalleTramo: (tramo: CanalTramo) => void
}

function estadoSegmentoVisual(segmento: SegmentoVisualTramo): EstadoTramo {
  if (segmento.tipo === "minitramo") {
    return segmento.estadoSegmento ?? "en_ejecucion"
  }
  return segmento.estadoSegmento ?? segmento.tramo.estado
}

function BarraSegmentosTramo({
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

function minitramoCoincideDestacado(
  letraInicio: string,
  letraFin: string,
  segmentoDestacado: SegmentoVisualTramo | null
): boolean {
  if (!segmentoDestacado || segmentoDestacado.tipo !== "minitramo") return false
  return (
    segmentoDestacado.letraInicio === letraInicio &&
    segmentoDestacado.letraFin === letraFin
  )
}

export function MapaSegmentoInfoModal({
  open,
  tramo,
  puntosAvance,
  segmentoDestacado,
  onClose,
  onVerDetalleTramo,
}: MapaSegmentoInfoModalProps) {
  if (!open || !tramo) return null

  const avance = avanceDesasolveTramo(tramo, puntosAvance)
  const minitramos = resumenMinitramos(puntosAvance, tramo.id)
  const kmEjecutados = avance.metrosEjecutados / 1000
  const kmTotales = avance.metrosTotales / 1000

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="mapa-tramo-info-title"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="max-h-[85dvh] w-full overflow-y-auto rounded-t-2xl border border-foreground/10 border-b-0 bg-background px-5 pb-6 pt-3 shadow-xl">
        <div className="mx-auto mb-3 h-1 w-10 shrink-0 rounded-full bg-muted-foreground/30" aria-hidden />

        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 id="mapa-tramo-info-title" className="text-lg font-semibold">
            Tramo {tramo.codigo}
          </h2>
          <span
            className="inline-flex items-center gap-1.5 rounded-full border border-foreground/10 bg-muted/50 px-2.5 py-1 text-xs font-medium"
          >
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

        <section className="mt-4 rounded-xl border border-foreground/10 bg-card/50 p-4">
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
              Km ejecutados según minitramos GPS en estado terminado.
            </p>
          ) : (
            <p className="mt-2 text-xs text-muted-foreground">
              Sin minitramos GPS; avance según registro del tramo.
            </p>
          )}
        </section>

        {minitramos.length > 0 ? (
          <section className="mt-4 space-y-3">
            <div>
              <h3 className="text-sm font-medium">Minitramos</h3>
              <p className="text-xs text-muted-foreground">
                Tramos de desasolve registrados con GPS en este tramo.
              </p>
            </div>
            <BarraSegmentosTramo tramo={tramo} puntosAvance={puntosAvance} />
            <ul className="space-y-2">
              {minitramos.map((item) => {
                if (item.tipo !== "completo") return null
                const destacado = minitramoCoincideDestacado(
                  item.letraInicio,
                  item.letraFin,
                  segmentoDestacado
                )
                return (
                  <li
                    key={item.grupo_id}
                    className={cn(
                      "rounded-lg border px-3 py-2.5 text-sm",
                      destacado
                        ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
                        : "border-foreground/10 bg-background"
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {etiquetaLetra(item.letraInicio)}–{etiquetaLetra(item.letraFin)}
                      </span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className="size-2 shrink-0 rounded-full"
                          style={{ backgroundColor: colorEstadoTramo(item.estado) }}
                          aria-hidden
                        />
                        {etiquetaEstadoTramo(item.estado)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {formatLongitudSegmentoMapa(item.longitud_m)}
                      {destacado ? (
                        <span className="ml-1 font-medium text-foreground">· seleccionado en el mapa</span>
                      ) : null}
                    </p>
                  </li>
                )
              })}
            </ul>
          </section>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-foreground/15 bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground">
            Aún no hay minitramos GPS registrados en este tramo.
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Cerrar
          </Button>
          <Button type="button" onClick={() => onVerDetalleTramo(tramo)}>
            Ver detalle del tramo
          </Button>
        </div>
      </div>
    </div>
  )
}
