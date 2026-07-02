"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { ACCIONISTA_META } from "@/src/data/registro-maquinaria"
import {
  agruparSemanas,
  construirMatrizCalendario,
  EQUIPO_ETIQUETA_CORTA,
  intensidadVisual,
  textoDetalleCelda,
  tituloColumna,
  tooltipColumna,
  type CeldaMatriz,
  type ColumnaMatriz,
  type FilaMatriz,
} from "@/src/lib/maquinaria-matriz"
import { cn } from "@/lib/utils"

const matriz = construirMatrizCalendario()
const semanas = agruparSemanas(matriz.columnas)

function claveCelda(filaId: string, fecha: string): string {
  return `${filaId}::${fecha}`
}

function colorAccionista(accionista: FilaMatriz["accionista"], intensidad: number): string {
  if (intensidad <= 0) return "transparent"

  const meta = ACCIONISTA_META[accionista]
  if (intensidad >= 1) return meta.celdaPlena
  if (intensidad >= 0.5) return meta.celdaMedia
  return meta.celdaBaja
}

type DetalleCelda = {
  filaId: string
  fecha: string
  texto: string
}

type CeldaMatrizVisualProps = {
  fila: FilaMatriz
  columna: ColumnaMatriz
  celda: CeldaMatriz | undefined
  tamano?: "sm" | "md"
  interactiva?: boolean
  seleccionada?: boolean
  onSeleccionar?: (detalle: DetalleCelda) => void
}

function tamanoCeldaClase(tamano: "sm" | "md"): string {
  return tamano === "md" ? "size-8 sm:size-9" : "size-6 min-h-6 min-w-6 sm:size-8"
}

function CeldaMatrizVisual({
  fila,
  columna,
  celda,
  tamano = "md",
  interactiva = false,
  seleccionada = false,
  onSeleccionar,
}: CeldaMatrizVisualProps) {
  const sinObra = columna.trabajado === false
  const sinRegistro = columna.sinRegistro
  const detalle = textoDetalleCelda(fila, columna, celda)
  const sizeClass = tamanoCeldaClase(tamano)

  function envoltura(
    contenido: React.ReactNode,
    extraClass?: string
  ) {
    const base = cn(
      "border border-foreground/5 p-0.5",
      interactiva && "touch-manipulation",
      seleccionada && "bg-primary/5 ring-2 ring-primary/30 ring-inset",
      extraClass
    )

    if (interactiva && onSeleccionar) {
      return (
        <td className={base}>
          <button
            type="button"
            className="flex w-full items-center justify-center rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
            aria-label={detalle}
            aria-pressed={seleccionada}
            onClick={() =>
              onSeleccionar({
                filaId: fila.id,
                fecha: columna.fecha,
                texto: detalle,
              })
            }
          >
            {contenido}
          </button>
        </td>
      )
    }

    return (
      <td className={base} title={detalle} aria-label={detalle}>
        {contenido}
      </td>
    )
  }

  if (sinObra) {
    return envoltura(
      <div
        className={cn(
          "mx-auto bg-[repeating-linear-gradient(-45deg,transparent,transparent_3px,oklch(0.85_0_0/0.35)_3px,oklch(0.85_0_0/0.35)_6px)]",
          sizeClass
        )}
      />
    )
  }

  if (!celda || celda.intensidad <= 0) {
    return envoltoriaVacia(envoltura, sizeClass, sinRegistro)
  }

  const meta = ACCIONISTA_META[fila.accionista]

  if (fila.esViajes) {
    return envoltura(
      <div
        className={cn(
          "mx-auto flex items-center justify-center rounded-sm font-bold tabular-nums text-white",
          sizeClass,
          tamano === "sm" ? "text-[9px]" : "text-[10px] sm:text-xs",
          colorAccionista(fila.accionista, 1)
        )}
      >
        {celda.cantidad}
      </div>
    )
  }

  if (fila.esActividad) {
    return envoltura(
      <div className={cn("mx-auto flex items-center justify-center", sizeClass)}>
        <span
          className={cn(
            "rotate-45 rounded-sm",
            tamano === "sm" ? "size-2.5" : "size-3 sm:size-3.5",
            meta.dotClass
          )}
          aria-hidden
        />
      </div>
    )
  }

  const visual = intensidadVisual(celda)
  const mostrarCantidad = celda.intensidad > 1

  return envoltura(
    <div className={cn("relative mx-auto overflow-hidden rounded-sm bg-muted/20", sizeClass)}>
      <div
        className={cn("absolute inset-x-0 bottom-0", colorAccionista(fila.accionista, visual))}
        style={{ height: `${Math.max(visual * 100, visual > 0 ? 18 : 0)}%` }}
      />
      {mostrarCantidad ? (
        <span
          className={cn(
            "absolute inset-0 flex items-center justify-center font-bold text-white drop-shadow-sm",
            tamano === "sm" ? "text-[8px]" : "text-[9px] sm:text-[10px]"
          )}
        >
          {Math.round(celda.intensidad)}
        </span>
      ) : null}
      {celda.nota ? (
        <span
          className="absolute right-0 top-0 size-1.5 rounded-full bg-red-500 ring-1 ring-white"
          aria-hidden
        />
      ) : null}
    </div>
  )
}

function envoltoriaVacia(
  envoltura: (node: React.ReactNode, extra?: string) => React.ReactElement,
  sizeClass: string,
  sinRegistro: boolean
) {
  return envoltura(
    <div className={cn("mx-auto rounded-sm", sizeClass, sinRegistro ? "bg-muted/30" : "bg-muted/15")} />
  )
}

function LeyendaMatriz({ compacta = false }: { compacta?: boolean }) {
  const jimmy = ACCIONISTA_META.consorcio
  const mauricio = ACCIONISTA_META.mauricio

  const items = [
    {
      swatch: <span className={cn("inline-block size-3.5 rounded-sm sm:size-4", jimmy.celdaPlena)} aria-hidden />,
      texto: `${jimmy.label} — pleno`,
    },
    {
      swatch: (
        <span className={cn("inline-block size-3.5 rounded-sm sm:size-4", mauricio.celdaPlena)} aria-hidden />
      ),
      texto: `${mauricio.label} — pleno`,
    },
    {
      swatch: (
        <span
          className="inline-block size-3.5 bg-[repeating-linear-gradient(-45deg,transparent,transparent_2px,oklch(0.75_0_0/0.4)_2px,oklch(0.75_0_0/0.4)_4px)] sm:size-4"
          aria-hidden
        />
      ),
      texto: "Sin actividad",
    },
    {
      swatch: (
        <span className={cn("relative inline-block size-3.5 rounded-sm sm:size-4", jimmy.celdaBaja)} aria-hidden>
          <span className={cn("absolute inset-x-0 bottom-0 h-1/2", jimmy.celdaMedia)} />
        </span>
      ),
      texto: "Medio día",
    },
    {
      swatch: (
        <span className={cn("inline-block size-2.5 rotate-45 rounded-sm sm:size-3", jimmy.dotClass)} aria-hidden />
      ),
      texto: "Actividad",
    },
    {
      swatch: (
        <span className="relative inline-block size-3.5 rounded-sm bg-muted/20 sm:size-4" aria-hidden>
          <span className="absolute right-0 top-0 size-1.5 rounded-full bg-red-500" />
        </span>
      ),
      texto: "Evento",
    },
  ]

  return (
    <div
      className={cn(
        "gap-x-4 gap-y-2 text-muted-foreground",
        compacta ? "grid grid-cols-2 text-[11px]" : "flex flex-wrap text-xs"
      )}
    >
      {items.map(({ swatch, texto }) => (
        <span key={texto} className="inline-flex items-center gap-1.5">
          {swatch}
          {texto}
        </span>
      ))}
    </div>
  )
}

type MatrizTablaProps = {
  columnas: ColumnaMatriz[]
  tamano?: "sm" | "md"
  etiquetasCortas?: boolean
  interactiva?: boolean
  detalleSeleccionado?: DetalleCelda | null
  onSeleccionar?: (detalle: DetalleCelda) => void
}

function MatrizTabla({
  columnas,
  tamano = "md",
  etiquetasCortas = false,
  interactiva = false,
  detalleSeleccionado,
  onSeleccionar,
}: MatrizTablaProps) {
  return (
    <table className="w-full border-collapse text-xs">
      <thead>
        <tr className="border-b border-foreground/10 bg-muted/30">
          <th
            className={cn(
              "sticky left-0 z-20 border-r border-foreground/10 bg-muted/30 px-1.5 py-2 text-left font-semibold shadow-[4px_0_8px_-4px_rgba(0,0,0,0.12)]",
              tamano === "sm" ? "min-w-[6.5rem] max-w-[6.5rem]" : "min-w-[11rem] sm:min-w-[14rem]"
            )}
          >
            Equipo
          </th>
          {columnas.map((columna) => {
            const tieneEvento = columna.eventos.length > 0 && !columna.sinRegistro
            return (
              <th
                key={columna.fecha}
                className={cn(
                  "min-w-[2rem] px-0 py-1.5 text-center font-medium sm:min-w-[2.25rem]",
                  columna.trabajado === false && "bg-muted/40"
                )}
                title={tooltipColumna(columna)}
              >
                <div className="flex flex-col items-center gap-0.5">
                  <span className="text-[9px] uppercase text-muted-foreground sm:text-[10px]">
                    {columna.diaSemana}
                  </span>
                  <span className="text-[11px] tabular-nums sm:text-xs">{tituloColumna(columna)}</span>
                  {tieneEvento ? (
                    <span className="size-1 rounded-full bg-red-500" aria-hidden />
                  ) : (
                    <span className="size-1" aria-hidden />
                  )}
                </div>
              </th>
            )
          })}
        </tr>
      </thead>
      <tbody>
        {matriz.filas.map((fila) => {
          const meta = ACCIONISTA_META[fila.accionista]
          const nombreEquipo = etiquetasCortas
            ? (EQUIPO_ETIQUETA_CORTA[fila.equipo] ?? fila.equipo)
            : fila.equipo

          return (
            <tr key={fila.id} className="border-b border-foreground/5 last:border-b-0">
              <th
                scope="row"
                className="sticky left-0 z-10 border-r border-foreground/10 bg-card px-1.5 py-1 text-left font-normal shadow-[4px_0_8px_-4px_rgba(0,0,0,0.08)]"
              >
                <span className="inline-flex items-center gap-1 sm:gap-1.5">
                  <span className={cn("size-1.5 shrink-0 rounded-full sm:size-2", meta.dotClass)} aria-hidden />
                  <span className="min-w-0 leading-snug">
                    <span
                      className={cn(
                        "block font-medium",
                        etiquetasCortas ? "text-[10px] leading-tight" : "text-xs sm:text-sm"
                      )}
                    >
                      {nombreEquipo}
                    </span>
                    <span className="text-[9px] text-muted-foreground sm:text-[10px]">{meta.label}</span>
                  </span>
                </span>
              </th>
              {columnas.map((columna) => {
                const seleccionada =
                  detalleSeleccionado?.filaId === fila.id &&
                  detalleSeleccionado.fecha === columna.fecha

                return (
                  <CeldaMatrizVisual
                    key={`${fila.id}-${columna.fecha}`}
                    fila={fila}
                    columna={columna}
                    celda={matriz.celdas.get(claveCelda(fila.id, columna.fecha))}
                    tamano={tamano}
                    interactiva={interactiva}
                    seleccionada={seleccionada}
                    onSeleccionar={onSeleccionar}
                  />
                )
              })}
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

function MatrizCalendarioEscritorio() {
  return (
    <div className="hidden md:block">
      <LeyendaMatriz />
      <div className="mt-4 overflow-x-auto rounded-xl border border-foreground/10">
        <MatrizTabla columnas={matriz.columnas} tamano="md" />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        May – Jun 2026. Desplaza horizontalmente para ver todo el período. Pasa el cursor sobre una celda
        para ver el detalle.
      </p>
    </div>
  )
}

function MatrizCalendarioMovil() {
  const [semanaActiva, setSemanaActiva] = useState(0)
  const [detalleSeleccionado, setDetalleSeleccionado] = useState<DetalleCelda | null>(null)

  const semana = semanas[semanaActiva]
  const esPrimera = semanaActiva === 0
  const esUltima = semanaActiva === semanas.length - 1

  return (
    <div className="md:hidden">
      <details className="rounded-lg border border-foreground/10 bg-muted/20 px-3 py-2">
        <summary className="cursor-pointer text-xs font-medium text-foreground touch-manipulation">
          Leyenda de colores
        </summary>
        <div className="mt-3 border-t border-foreground/10 pt-3">
          <LeyendaMatriz compacta />
        </div>
      </details>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          disabled={esPrimera}
          onClick={() => {
            setSemanaActiva((prev) => Math.max(0, prev - 1))
            setDetalleSeleccionado(null)
          }}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-card disabled:opacity-40 touch-manipulation"
          aria-label="Semana anterior"
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Semana {semanaActiva + 1} de {semanas.length}
          </p>
          <p className="truncate text-sm font-semibold">{semana.etiqueta}</p>
        </div>

        <button
          type="button"
          disabled={esUltima}
          onClick={() => {
            setSemanaActiva((prev) => Math.min(semanas.length - 1, prev + 1))
            setDetalleSeleccionado(null)
          }}
          className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-card disabled:opacity-40 touch-manipulation"
          aria-label="Semana siguiente"
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      </div>

      <div className="mt-2 flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {semanas.map((s) => (
          <button
            key={s.indice}
            type="button"
            onClick={() => {
              setSemanaActiva(s.indice)
              setDetalleSeleccionado(null)
            }}
            className={cn(
              "shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-medium touch-manipulation",
              s.indice === semanaActiva
                ? "border-primary bg-primary text-primary-foreground"
                : "border-foreground/15 bg-card text-muted-foreground"
            )}
          >
            S{s.indice + 1}
          </button>
        ))}
      </div>

      <div className="relative mt-3 overflow-hidden rounded-xl border border-foreground/10">
        <div className="pointer-events-none absolute inset-y-0 right-0 z-30 w-6 bg-linear-to-l from-card to-transparent" />
        <div className="overflow-x-auto overscroll-x-contain">
          <MatrizTabla
            columnas={semana.columnas}
            tamano="sm"
            etiquetasCortas
            interactiva
            detalleSeleccionado={detalleSeleccionado}
            onSeleccionar={setDetalleSeleccionado}
          />
        </div>
      </div>

      <div
        className={cn(
          "mt-3 min-h-[3.25rem] rounded-lg border px-3 py-2.5 text-xs leading-relaxed transition-colors",
          detalleSeleccionado
            ? "border-primary/25 bg-primary/5 text-foreground"
            : "border-dashed border-foreground/15 bg-muted/15 text-muted-foreground"
        )}
        aria-live="polite"
      >
        {detalleSeleccionado ? (
          detalleSeleccionado.texto
        ) : (
          <>Toca una celda para ver el detalle del equipo y la jornada.</>
        )}
      </div>

      <p className="mt-2 text-[11px] text-muted-foreground">
        Vista por semanas para móvil. Usa las flechas o los chips S1–S{semanas.length}.
      </p>
    </div>
  )
}

export function MaquinariaMatrizCalendario() {
  return (
    <div className="space-y-0">
      <MatrizCalendarioMovil />
      <MatrizCalendarioEscritorio />
    </div>
  )
}
