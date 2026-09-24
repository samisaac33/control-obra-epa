"use client"

import { ACCIONISTA_META } from "@/src/data/registro-maquinaria"
import { useRegistroMaquinariaProyecto } from "@/src/hooks/use-registro-maquinaria-proyecto"
import { formatearNumero, resumenFrenteEtiqueta, resumenPorEquipo } from "@/src/lib/maquinaria-resumen"
import { cn } from "@/lib/utils"

export function MaquinariaResumenTabla() {
  const { registros } = useRegistroMaquinariaProyecto()
  const filas = resumenPorEquipo(registros)

  if (filas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay registros de maquinaria para este proyecto.
      </p>
    )
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-foreground/10">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="border-b border-foreground/10 bg-muted/30 text-left">
            <th className="px-3 py-2.5 font-semibold">Equipo</th>
            <th className="px-3 py-2.5 font-semibold">Frente</th>
            <th className="px-3 py-2.5 font-semibold">Accionista</th>
            <th className="px-3 py-2.5 font-semibold text-right">Días completos</th>
            <th className="px-3 py-2.5 font-semibold text-right">Medios días</th>
            <th className="px-3 py-2.5 font-semibold text-right">Horas</th>
            <th className="px-3 py-2.5 font-semibold text-right">Viajes</th>
            <th className="px-3 py-2.5 font-semibold text-right">Total día-equipo</th>
          </tr>
        </thead>
        <tbody>
          {filas.map((fila) => {
            const meta = ACCIONISTA_META[fila.accionista]
            return (
              <tr
                key={`${fila.equipo}-${fila.accionista}-${fila.frente ?? ""}`}
                className="border-b border-foreground/5 last:border-b-0"
              >
                <td className="px-3 py-2.5">{fila.equipo}</td>
                <td className="px-3 py-2.5 text-muted-foreground">
                  {resumenFrenteEtiqueta(fila.frente)}
                </td>
                <td className="px-3 py-2.5">
                  <span
                    className={cn(
                      "inline-flex rounded-md border px-2 py-0.5 text-xs font-medium",
                      meta.chipClass
                    )}
                  >
                    {meta.label}
                  </span>
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums">{fila.diasCompletos}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{fila.mediosDias}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{fila.horas}</td>
                <td className="px-3 py-2.5 text-right tabular-nums">{fila.viajes}</td>
                <td className="px-3 py-2.5 text-right font-medium tabular-nums">
                  {formatearNumero(fila.totalDiaEquipo)}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
