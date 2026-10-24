"use client"

import { useEffect, useState } from "react"

import { AuditConsistencyCard } from "@/src/components/auditoria/AuditConsistencyCard"
import type { PlanillaPeriodo } from "@/src/data/planilla/types"

type PlanillaAuditoriaPeriodoClientProps = {
  periodo: PlanillaPeriodo
}

/** Muestra la tarjeta de auditoría con rango fijado al periodo (wrapper informativo). */
export function PlanillaAuditoriaPeriodoClient({ periodo }: PlanillaAuditoriaPeriodoClientProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  return (
    <div className="mx-auto max-w-4xl space-y-4 p-4 sm:p-6">
      <header>
        <h1 className="text-lg font-semibold">Conciliación antiglosa — {periodo.etiqueta}</h1>
        <p className="text-sm text-muted-foreground">
          Periodo {periodo.fecha_inicio} — {periodo.fecha_fin}. Ajuste el rango en la tarjeta si
          necesita refinar el corte.
        </p>
      </header>
      {mounted ? (
        <AuditConsistencyCard defaultDesde={periodo.fecha_inicio} defaultHasta={periodo.fecha_fin} />
      ) : null}
    </div>
  )
}
