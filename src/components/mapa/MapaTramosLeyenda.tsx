import { ESTADOS_TRAMO } from "@/src/data/tramos/types"

export function MapaTramosLeyenda() {
  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg border border-foreground/10 bg-card px-3 py-2 text-xs">
        {ESTADOS_TRAMO.map((estado) => (
          <span key={estado.id} className="inline-flex items-center gap-1.5">
            <span
              className="size-3 rounded-sm ring-1 ring-foreground/10"
              style={{ backgroundColor: estado.color }}
              aria-hidden
            />
            {estado.label}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5 text-muted-foreground">
          <span
            className="mapa-punto-en-ejecucion size-3 rounded-full ring-2 ring-[#ca8a04]"
            style={{ backgroundColor: "#ca8a04" }}
            aria-hidden
          />
          Punto en ejecución (parpadeo)
        </span>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Colores del trazado según estado operativo GPS del segmento. El filtro «Estado» arriba es
        planificación del tramo.
      </p>
    </div>
  )
}
