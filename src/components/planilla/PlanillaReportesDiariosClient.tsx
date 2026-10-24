"use client"

import Link from "next/link"

import type { PlanillaPeriodo } from "@/src/data/planilla/types"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { rutaObra } from "@/src/lib/rutas-proyecto"

function fechasEnRango(inicio: string, fin: string): string[] {
  const out: string[] = []
  const d = new Date(`${inicio}T12:00:00`)
  const end = new Date(`${fin}T12:00:00`)
  while (d <= end) {
    out.push(d.toISOString().slice(0, 10))
    d.setDate(d.getDate() + 1)
  }
  return out
}

type PlanillaReportesDiariosClientProps = {
  periodo: PlanillaPeriodo
}

export function PlanillaReportesDiariosClient({ periodo }: PlanillaReportesDiariosClientProps) {
  const { proyectoId } = useProyecto()
  const fechas = fechasEnRango(periodo.fecha_inicio, periodo.fecha_fin)

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-4 sm:p-6">
      <header>
        <h1 className="text-lg font-semibold">Reportes diarios CGE — {periodo.etiqueta}</h1>
        <p className="text-sm text-muted-foreground">
          Descargue un PDF por cada día del periodo de planilla.
        </p>
      </header>
      <ul className="divide-y divide-foreground/10 rounded-xl border border-foreground/10 bg-card">
        {fechas.map((fecha) => (
          <li key={fecha} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
            <span>{fecha}</span>
            <Link
              href={`${rutaObra(proyectoId, "reporte-diario")}?fecha=${fecha}`}
              className="font-medium text-primary hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              PDF CGE
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
