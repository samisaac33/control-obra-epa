import { COLOR_MINITRAMO, ESTADOS_TRAMO_MAPA } from "@/src/data/tramos/types"

export function MapaTramosLeyenda() {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg border border-foreground/10 bg-card px-3 py-2 text-xs">
      {ESTADOS_TRAMO_MAPA.map((estado) => (
        <span key={estado.id} className="inline-flex items-center gap-1.5">
          <span
            className="size-3 rounded-sm ring-1 ring-foreground/10"
            style={{ backgroundColor: estado.color }}
            aria-hidden
          />
          {estado.label}
        </span>
      ))}
      <span className="inline-flex items-center gap-1.5">
        <span
          className="size-3 rounded-sm ring-1 ring-foreground/10"
          style={{ backgroundColor: COLOR_MINITRAMO }}
          aria-hidden
        />
        Minitramo ejecutado
      </span>
    </div>
  )
}
