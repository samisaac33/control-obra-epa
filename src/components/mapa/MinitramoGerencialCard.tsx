"use client"

import Link from "next/link"

import { cn } from "@/lib/utils"
import {
  colorEstadoTramo,
  etiquetaEstadoTramo,
  type CanalTramo,
  type EstadoTramo,
} from "@/src/data/tramos/types"
import {
  pctSobreTramo,
  textoAcumuladoTramo,
  type MinitramoCompletoResumen,
} from "@/src/lib/minitramo-gerencial-resumen"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import type { JornadaMinitramoMapa } from "@/src/lib/tramo-maquinaria-historial"
import { formatearFechaRegistro } from "@/src/lib/tramo-maquinaria-historial"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import { etiquetaLetra, formatLongitudSegmentoMapa, type TramoPuntoAvance } from "@/src/lib/tramo-geometria"

type MinitramoGerencialCardProps = {
  item: MinitramoCompletoResumen
  indiceVisual: number
  tramo: CanalTramo
  acumuladoTerminado_m: number
  jornada?: JornadaMinitramoMapa | null
  puntoFin?: TramoPuntoAvance | null
  destacado?: boolean
}

function filaDato({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-0.5 text-xs">
      <dt className="text-muted-foreground">{etiqueta}</dt>
      <dd className="text-right font-medium text-foreground tabular-nums">{valor}</dd>
    </div>
  )
}

function mensajeEstadoOperativo(estado: EstadoTramo): string | null {
  if (estado === "terminado") return null
  if (estado === "en_ejecucion") {
    return "En ejecución: aún no suma al avance % hasta marcarse terminado."
  }
  return "Pendiente: no suma al avance del tramo."
}

export function MinitramoGerencialCard({
  item,
  indiceVisual,
  tramo,
  acumuladoTerminado_m,
  jornada,
  puntoFin,
  destacado = false,
}: MinitramoGerencialCardProps) {
  const etiqueta = `${etiquetaLetra(item.letraInicio)}–${etiquetaLetra(item.letraFin)}`
  const pctTramo = pctSobreTramo(item.longitud_m, tramo)
  const acumulado_m = acumuladoTerminado_m
  const filaPar = indiceVisual % 2 === 0
  const avisoEstado = mensajeEstadoOperativo(item.estado)
  const fechaGps = puntoFin?.created_at ? formatearFechaRegistro(puntoFin.created_at.slice(0, 10)) : null
  const fotoId = puntoFin?.registro_foto_id

  return (
    <li
      className={cn(
        "rounded-xl border px-3 py-3 text-sm shadow-sm",
        destacado
          ? "border-primary/40 bg-primary/5 ring-1 ring-primary/20"
          : filaPar
            ? "border-foreground/10 bg-muted/30"
            : "border-foreground/10 bg-card"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold leading-tight">Minitramo {etiqueta}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {formatLongitudSegmentoMapa(item.longitud_m)}
            <span className="mx-1 text-muted-foreground/60">·</span>
            {formatearNumero(pctTramo, 1)} % del tramo
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-foreground/10 bg-muted/40 px-2 py-0.5 text-[11px] font-medium">
          <span
            className="size-2 rounded-full ring-1 ring-foreground/10"
            style={{ backgroundColor: colorEstadoTramo(item.estado) }}
            aria-hidden
          />
          {etiquetaEstadoTramo(item.estado)}
        </span>
      </div>

      <dl className="mt-3 space-y-1.5 rounded-lg border border-foreground/8 bg-muted/20 px-2.5 py-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Jornada de trabajo
        </p>
        {jornada ? (
          <>
            {filaDato({ etiqueta: "Fecha", valor: formatearFechaRegistro(jornada.fecha) })}
            {filaDato({
              etiqueta: "Longitud trabajada",
              valor: formatLongitudSegmentoMapa(item.longitud_m),
            })}
            {filaDato({ etiqueta: "Maquinaria", valor: jornada.equipoNombre })}
            {filaDato({
              etiqueta: "Horas",
              valor:
                jornada.duracion_horas != null && Number.isFinite(jornada.duracion_horas)
                  ? `${formatearNumero(jornada.duracion_horas, 1)} h`
                  : "—",
            })}
          </>
        ) : (
          <p className="text-xs text-muted-foreground">Sin jornada de maquinaria registrada.</p>
        )}
      </dl>

      <p className="mt-2.5 text-xs text-muted-foreground">
        <span className="font-medium text-foreground">Acumulado terminado en el tramo: </span>
        {textoAcumuladoTramo(acumulado_m, tramo)}
      </p>

      {avisoEstado ? <p className="mt-1.5 text-xs text-muted-foreground">{avisoEstado}</p> : null}

      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-foreground/5 pt-2 text-[11px] text-muted-foreground">
        {fechaGps ? <span>Confirmación GPS: {fechaGps}</span> : null}
        {fotoId ? (
          <Link
            href={rutaObra(tramo.proyecto_id, "fotos")}
            className="font-medium text-primary underline-offset-2 hover:underline"
          >
            Ver registro fotográfico
          </Link>
        ) : null}
      </div>
    </li>
  )
}
