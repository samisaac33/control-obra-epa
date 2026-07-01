import type { PuntoCurvaS } from "@/lib/sicc/types"
import { cn } from "@/lib/utils"

const MARGEN = { top: 24, right: 24, bottom: 40, left: 48 }
const ANCHO = 640
const ALTO = 280
const PLOT_W = ANCHO - MARGEN.left - MARGEN.right
const PLOT_H = ALTO - MARGEN.top - MARGEN.bottom

function puntosLinea(
  datos: PuntoCurvaS[],
  campo: keyof Pick<PuntoCurvaS, "fisico" | "financiero" | "programado">
): string {
  if (datos.length === 0) return ""
  const ultimo = Math.max(datos.length - 1, 1)

  return datos
    .map((punto, i) => {
      const x = MARGEN.left + (i / ultimo) * PLOT_W
      const y = MARGEN.top + PLOT_H - (punto[campo] / 100) * PLOT_H
      return `${x},${y}`
    })
    .join(" ")
}

export function CurvaSChart({ datos }: { datos: PuntoCurvaS[] }) {
  const ticksY = [0, 25, 50, 75, 100]

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox={`0 0 ${ANCHO} ${ALTO}`}
        className="w-full min-w-[20rem]"
        role="img"
        aria-label="Curva S: avance físico, financiero y programado"
      >
        {ticksY.map((tick) => {
          const y = MARGEN.top + PLOT_H - (tick / 100) * PLOT_H
          return (
            <g key={tick}>
              <line
                x1={MARGEN.left}
                y1={y}
                x2={ANCHO - MARGEN.right}
                y2={y}
                className="stroke-foreground/10"
                strokeWidth={1}
              />
              <text
                x={MARGEN.left - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-muted-foreground text-[10px]"
              >
                {tick}%
              </text>
            </g>
          )
        })}

        <polyline
          points={puntosLinea(datos, "programado")}
          fill="none"
          className="stroke-muted-foreground"
          strokeWidth={2}
          strokeDasharray="6 4"
        />
        <polyline
          points={puntosLinea(datos, "fisico")}
          fill="none"
          className="stroke-sky-600"
          strokeWidth={2.5}
        />
        <polyline
          points={puntosLinea(datos, "financiero")}
          fill="none"
          className="stroke-emerald-600"
          strokeWidth={2.5}
        />

        {datos.map((punto, i) => {
          const ultimo = Math.max(datos.length - 1, 1)
          const x = MARGEN.left + (i / ultimo) * PLOT_W
          return (
            <text
              key={punto.fecha}
              x={x}
              y={ALTO - 10}
              textAnchor="middle"
              className="fill-muted-foreground text-[9px]"
            >
              {punto.etiqueta}
            </text>
          )
        })}
      </svg>

      <div className="mt-3 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 border-t-2 border-dashed border-muted-foreground" />
          <span className="text-muted-foreground">Programado</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-0.5 w-6 bg-sky-600" />
          <span className="text-muted-foreground">Físico</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn("inline-block h-0.5 w-6 bg-emerald-600")} />
          <span className="text-muted-foreground">Financiero</span>
        </div>
      </div>
    </div>
  )
}
