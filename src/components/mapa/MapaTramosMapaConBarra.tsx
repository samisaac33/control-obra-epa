"use client"

import type { ReactNode } from "react"

import { Z_MAPA_BARRA_CONTROLES } from "@/src/lib/mapa-capas-z"
import { cn } from "@/lib/utils"

type MapaTramosMapaConBarraProps = {
  children: ReactNode
  barraInferior?: ReactNode
  className?: string
}

export function MapaTramosMapaConBarra({
  children,
  barraInferior,
  className,
}: MapaTramosMapaConBarraProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      {barraInferior ? (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 p-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]",
            Z_MAPA_BARRA_CONTROLES
          )}
          aria-live="polite"
        >
          <div className="pointer-events-auto">{barraInferior}</div>
        </div>
      ) : null}
    </div>
  )
}
