"use client"

import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

type MapaTramosBrechasControlProps = {
  mostrarBrechas: boolean
  incluirBrechasAuto: boolean
  onMostrarBrechasChange: (value: boolean) => void
  onIncluirAutoChange: (value: boolean) => void
  compact?: boolean
}

export function MapaTramosBrechasControl({
  mostrarBrechas,
  incluirBrechasAuto,
  onMostrarBrechasChange,
  onIncluirAutoChange,
  compact = false,
}: MapaTramosBrechasControlProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-foreground/10 bg-muted/20 px-3 py-2.5 text-xs",
        compact && "space-y-2"
      )}
    >
      <label className="flex cursor-pointer items-start gap-2">
        <input
          type="checkbox"
          className="mt-0.5 size-4 rounded border-input"
          checked={mostrarBrechas}
          onChange={(e) => onMostrarBrechasChange(e.target.checked)}
        />
        <span>
          <span className="font-medium text-foreground">Brechas de conexión (QA)</span>
          <span className="mt-0.5 block text-muted-foreground">
            Líneas punteadas entre extremos de tramos no unidos en el KMZ. Validar en campo antes
            de fusionar geometrías.
          </span>
        </span>
      </label>

      {mostrarBrechas ? (
        <>
          <label className="mt-2 flex cursor-pointer items-center gap-2 pl-6">
            <input
              type="checkbox"
              className="size-3.5 rounded border-input"
              checked={incluirBrechasAuto}
              onChange={(e) => onIncluirAutoChange(e.target.checked)}
            />
            <Label className="cursor-pointer font-normal text-muted-foreground">
              Incluir brechas automáticas (&lt;800 m)
            </Label>
          </label>
          <ul className="mt-2 space-y-1 pl-6 text-[10px] text-muted-foreground sm:text-[11px]">
            <li className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-red-600" />
              Enlace propuesto (prioridad alta / &gt;500 m)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-orange-600" />
              Enlace propuesto (media)
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block h-0.5 w-6 border-t border-dashed border-slate-400" />
              Brecha automática
            </li>
          </ul>
        </>
      ) : null}
    </div>
  )
}
