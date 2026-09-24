"use client"

import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import type { KpisTramos } from "@/src/lib/tramos-avance"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"

type MapaTramosKpisBarProps = {
  kpis: KpisTramos
  modo: "stack" | "overlay"
  chipsCarrusel?: boolean
  className?: string
}

function KpiChip({ label, value, integrado }: { label: string; value: string; integrado?: boolean }) {
  return (
    <div
      className={cn(
        "flex w-[7.25rem] shrink-0 snap-start flex-col rounded-lg px-3 py-2 sm:w-auto sm:min-w-[6.5rem]",
        integrado
          ? "border border-foreground/10 bg-muted/40"
          : "border border-foreground/10 bg-card/95 shadow-sm backdrop-blur-sm"
      )}
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </span>
      <span className="mt-0.5 font-mono text-sm font-semibold tabular-nums text-foreground">
        {value}
      </span>
    </div>
  )
}

function chipsDesdeKpis(kpis: KpisTramos) {
  return [
    { label: "Km totales", value: formatearNumero(kpis.kmTotales, 2) },
    { label: "Tramos", value: String(kpis.totalTramos) },
    { label: "Terminados", value: String(kpis.tramosPorEstado.terminado) },
    { label: "Pendientes", value: String(kpis.tramosPorEstado.pendiente) },
    { label: "En ejecución", value: String(kpis.tramosPorEstado.en_ejecucion) },
  ] as const
}

function KpisChips({
  kpis,
  integrado,
}: {
  kpis: KpisTramos
  integrado?: boolean
}) {
  return (
    <div className="flex gap-2 overflow-x-auto overscroll-x-contain pb-0.5 snap-x snap-mandatory touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {chipsDesdeKpis(kpis).map((chip) => (
        <KpiChip key={chip.label} label={chip.label} value={chip.value} integrado={integrado} />
      ))}
    </div>
  )
}

function KpisChipsCarrusel({ kpis, integrado }: { kpis: KpisTramos; integrado?: boolean }) {
  const contenedorRef = useRef<HTMLDivElement>(null)
  const pausaUsuarioHastaRef = useRef(0)
  const [soloManual, setSoloManual] = useState(false)
  const chips = chipsDesdeKpis(kpis)

  useEffect(() => {
    if (soloManual) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (reduceMotion) {
      setSoloManual(true)
      return
    }

    let cancelado = false
    let rafId = 0
    let direction = 1
    let pausaHasta = 0
    const velocidadPx = 0.55
    const pausaMs = 1500

    function iniciarCuandoListo() {
      const el = contenedorRef.current
      if (!el || cancelado) return

      const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth)
      if (maxScroll <= 2) {
        rafId = requestAnimationFrame(() => iniciarCuandoListo())
        return
      }

      function tick(now: number) {
        if (cancelado || !el) return

        const max = Math.max(0, el.scrollWidth - el.clientWidth)
        if (max <= 2) {
          rafId = requestAnimationFrame(tick)
          return
        }

        if (now < pausaHasta || now < pausaUsuarioHastaRef.current) {
          rafId = requestAnimationFrame(tick)
          return
        }

        el.scrollLeft += direction * velocidadPx

        if (direction > 0 && el.scrollLeft >= max - 1) {
          el.scrollLeft = max
          direction = -1
          pausaHasta = now + pausaMs
        } else if (direction < 0 && el.scrollLeft <= 1) {
          el.scrollLeft = 0
          direction = 1
          pausaHasta = now + pausaMs
        }

        rafId = requestAnimationFrame(tick)
      }

      rafId = requestAnimationFrame(tick)
    }

    rafId = requestAnimationFrame(iniciarCuandoListo)

    return () => {
      cancelado = true
      cancelAnimationFrame(rafId)
    }
  }, [kpis, soloManual])

  if (soloManual) {
    return <KpisChips kpis={kpis} integrado={integrado} />
  }

  return (
    <div
      ref={contenedorRef}
      className="flex gap-2 overflow-x-auto overscroll-x-contain pb-0.5 snap-x snap-mandatory touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Indicadores del mapa"
      onTouchStart={() => {
        pausaUsuarioHastaRef.current = performance.now() + 4000
      }}
      onPointerDown={() => {
        pausaUsuarioHastaRef.current = performance.now() + 4000
      }}
    >
      {chips.map((chip) => (
        <KpiChip key={chip.label} label={chip.label} value={chip.value} integrado={integrado} />
      ))}
    </div>
  )
}

function KpisChipsRow({
  kpis,
  carrusel,
  integrado,
}: {
  kpis: KpisTramos
  carrusel?: boolean
  integrado?: boolean
}) {
  if (carrusel) return <KpisChipsCarrusel kpis={kpis} integrado={integrado} />
  return <KpisChips kpis={kpis} integrado={integrado} />
}

function KpisHero({
  kpis,
  compact,
  mostrarChips,
  chipsCarrusel,
}: {
  kpis: KpisTramos
  compact?: boolean
  mostrarChips?: boolean
  chipsCarrusel?: boolean
}) {
  const pct = Math.min(100, Math.max(0, kpis.avanceGlobalPct))
  return (
    <div
      className={cn(
        "rounded-xl border border-foreground/10 bg-card/95 shadow-sm backdrop-blur-sm ring-1 ring-foreground/5",
        compact ? "px-3 py-2.5" : "p-4"
      )}
    >
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Avance global
          </p>
          <p
            className={cn(
              "font-mono font-semibold tabular-nums text-foreground",
              compact ? "text-xl" : "text-3xl"
            )}
          >
            {formatearNumero(pct, 1)}%
          </p>
        </div>
        <p className="text-right text-xs text-muted-foreground">
          <span className="font-medium text-foreground">
            {formatearNumero(kpis.kmEjecutados, 2)} km
          </span>
          <span className="block">de {formatearNumero(kpis.kmTotales, 2)} km</span>
        </p>
      </div>
      <div
        className="mt-2 h-2 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Avance global del desasolve"
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      {mostrarChips ? (
        <div className="mt-3 border-t border-foreground/10 pt-3">
          <KpisChipsRow kpis={kpis} carrusel={chipsCarrusel} integrado />
        </div>
      ) : null}
    </div>
  )
}

export function MapaTramosKpisBar({ kpis, modo, chipsCarrusel, className }: MapaTramosKpisBarProps) {
  if (modo === "overlay") {
    return (
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 z-[400] flex flex-col gap-2 p-2 sm:p-3",
          className
        )}
      >
        <div className="pointer-events-auto">
          <KpisHero kpis={kpis} compact mostrarChips chipsCarrusel={chipsCarrusel} />
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <KpisHero kpis={kpis} mostrarChips chipsCarrusel={chipsCarrusel} />
    </div>
  )
}
