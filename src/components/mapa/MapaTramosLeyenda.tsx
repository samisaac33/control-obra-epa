import { cn } from "@/lib/utils"
import { ESTADOS_OPERATIVOS_MAPA } from "@/src/data/tramos/types"

export function MapaTramosLeyenda({ compact = false }: { compact?: boolean }) {
  return (
    <div className="space-y-1.5">
      <div
        className={cn(
          "rounded-lg border border-foreground/10 bg-card px-2 py-2 text-xs sm:px-3",
          compact
            ? "grid grid-cols-3 gap-x-1 text-[10px] leading-tight sm:text-xs"
            : "flex flex-wrap gap-x-4 gap-y-2"
        )}
      >
        {ESTADOS_OPERATIVOS_MAPA.map((estado) => (
          <span
            key={estado.id}
            className={cn(
              "inline-flex items-center gap-1",
              compact && "min-w-0 justify-center gap-0.5 whitespace-nowrap sm:gap-1"
            )}
          >
            <span
              className={
                estado.id === "en_ejecucion"
                  ? "mapa-punto-en-ejecucion size-3 rounded-full ring-2 ring-[#ca8a04]"
                  : "size-3 rounded-sm ring-1 ring-foreground/10"
              }
              style={{ backgroundColor: estado.color }}
              aria-hidden
            />
            {estado.label}
          </span>
        ))}
      </div>
      {compact ? null : (
        <p className="text-[11px] text-muted-foreground">
          Colores del trazado y marcadores según avance operativo (minitramos GPS). Coincide con el
          filtro «Estado».
        </p>
      )}
    </div>
  )
}
