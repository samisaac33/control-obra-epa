"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  cargarEquiposMaquinariaProyecto,
  type ProyectoEquipoMaquinaria,
} from "@/src/lib/proyecto-equipos-maquinaria"
import {
  idsRegistrosMaquinariaCanonicosPorMinitramo,
  mapaMinitramoTerminadoPorPuntoFin,
  tramoTienePuntosGpsConfirmados,
} from "@/src/lib/mapa-jornada-minitramo"
import { horasEfectivasJornada } from "@/src/lib/maquinaria-desasolve-proyecto"
import type { CanalTramo } from "@/src/data/tramos/types"
import type { TramoPuntoAvance } from "@/src/lib/tramo-geometria"
import {
  cargarRegistrosMaquinariaTramo,
  eliminarRegistroMaquinariaTramo,
  formatearFechaRegistro,
  formatearMetrosDesasolados,
  mapaEquiposPorId,
  nombreEquipoParaMostrar,
  type TramoRegistroMaquinaria,
} from "@/src/lib/tramo-maquinaria-historial"
import { createClient } from "@/src/lib/supabase/client"

type TramoMaquinariaHistorialBlockProps = {
  tramo: Pick<CanalTramo, "id" | "proyecto_id" | "geometria" | "origen_extremo">
  puntosAvance: TramoPuntoAvance[]
  isResident: boolean
  refreshKey?: number
}

export function TramoMaquinariaHistorialBlock({
  tramo,
  puntosAvance,
  isResident,
  refreshKey = 0,
}: TramoMaquinariaHistorialBlockProps) {
  const tramoId = tramo.id
  const proyectoId = tramo.proyecto_id
  const supabase = useMemo(() => createClient(), [])
  const [registros, setRegistros] = useState<TramoRegistroMaquinaria[]>([])
  const [loading, setLoading] = useState(true)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [equiposCatalogo, setEquiposCatalogo] = useState<ProyectoEquipoMaquinaria[]>([])

  const equiposPorId = useMemo(() => mapaEquiposPorId(equiposCatalogo), [equiposCatalogo])
  const tramoConGps = useMemo(
    () => tramoTienePuntosGpsConfirmados(tramoId, puntosAvance),
    [tramoId, puntosAvance]
  )

  const registrosEnConsolidado = useMemo(() => {
    if (!tramoConGps) return registros
    const ids = idsRegistrosMaquinariaCanonicosPorMinitramo(
      [tramo as CanalTramo],
      puntosAvance,
      registros
    )
    return registros.filter((r) => r.es_incidencia || ids.has(r.id))
  }, [registros, tramoConGps, tramo, puntosAvance])

  const registrosExcluidosDelConsolidado = useMemo(() => {
    if (!tramoConGps) return []
    const visibles = new Set(registrosEnConsolidado.map((r) => r.id))
    return registros.filter((r) => !r.es_incidencia && !visibles.has(r.id))
  }, [registros, registrosEnConsolidado, tramoConGps])

  const terminadoPorPuntoFin = useMemo(
    () => mapaMinitramoTerminadoPorPuntoFin([tramo as CanalTramo], puntosAvance),
    [tramo, puntosAvance]
  )

  const totalHorasConsolidado = useMemo(() => {
    let total = 0
    for (const r of registrosEnConsolidado) {
      if (r.es_incidencia) continue
      const horas = horasEfectivasJornada(r, terminadoPorPuntoFin)
      if (horas != null) total += horas
    }
    return total
  }, [registrosEnConsolidado, terminadoPorPuntoFin])

  const cargarCatalogoEquipos = useCallback(async () => {
    try {
      const data = await cargarEquiposMaquinariaProyecto(supabase, proyectoId)
      setEquiposCatalogo(data)
    } catch {
      setEquiposCatalogo([])
    }
  }, [proyectoId, supabase])

  const cargar = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await cargarRegistrosMaquinariaTramo(supabase, tramoId)
      setRegistros(data)
    } catch (err) {
      setRegistros([])
      setError(err instanceof Error ? err.message : "No se pudo cargar el historial.")
    } finally {
      setLoading(false)
    }
  }, [supabase, tramoId])

  useEffect(() => {
    void cargar()
    void cargarCatalogoEquipos()
  }, [cargar, cargarCatalogoEquipos, refreshKey])

  async function handleEliminar(id: string) {
    if (!isResident) return
    if (!window.confirm("¿Eliminar este registro de maquinaria?")) return
    setEliminandoId(id)
    setError(null)
    try {
      await eliminarRegistroMaquinariaTramo(supabase, id)
      await cargar()
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar.")
    } finally {
      setEliminandoId(null)
    }
  }

  const totalMetrosConsolidado = registrosEnConsolidado.reduce(
    (sum, r) => (r.es_incidencia ? sum : sum + r.metros_desasolados),
    0
  )

  return (
    <section className="space-y-3">
      <div>
        <h3 className="text-sm font-medium">Historial de maquinaria</h3>
        <p className="text-xs text-muted-foreground">
          {tramoConGps
            ? "Las jornadas operativas se registran al confirmar un punto (minitramo). Lo que ves aquí coincide con /maquinaria."
            : "Jornadas de desasolve registradas en este tramo."}
          {registrosEnConsolidado.some((r) => !r.es_incidencia) ? (
            <>
              {" "}
              · horas en consolidado:{" "}
              {totalHorasConsolidado > 0 ? `${totalHorasConsolidado.toFixed(1)} h` : "—"}
              {" · "}
              metros: {formatearMetrosDesasolados(totalMetrosConsolidado)}
            </>
          ) : null}
        </p>
        {registrosExcluidosDelConsolidado.length > 0 ? (
          <p className="mt-1 text-xs text-amber-800 dark:text-amber-200">
            {registrosExcluidosDelConsolidado.length} registro(s) manual(es) antiguo(s) no entran
            en /maquinaria (evita duplicar horas). Puede eliminarlos con la papelera.
          </p>
        ) : null}
      </div>

      {error ? (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-xs text-muted-foreground">Cargando historial…</p>
      ) : registrosEnConsolidado.length === 0 && registrosExcluidosDelConsolidado.length === 0 ? (
        <p className="rounded-lg border border-dashed border-foreground/15 bg-muted/20 px-3 py-2.5 text-sm text-muted-foreground">
          {isResident
            ? tramoConGps
              ? "Aún no hay jornadas en este tramo. Regístrelas al confirmar un punto en el mapa."
              : "Aún no hay jornadas registradas."
            : "Aún no hay jornadas de maquinaria registradas en este tramo."}
        </p>
      ) : (
        <ul className="space-y-2">
          {[...registrosEnConsolidado, ...registrosExcluidosDelConsolidado].map((registro) => {
            const excluido = registrosExcluidosDelConsolidado.some((r) => r.id === registro.id)
            const horasEnConsolidado = excluido
              ? null
              : horasEfectivasJornada(registro, terminadoPorPuntoFin)
            return (
            <li
              key={registro.id}
              className={
                excluido
                  ? "rounded-lg border border-amber-500/30 bg-amber-500/5 px-3 py-2.5 text-sm"
                  : "rounded-lg border border-foreground/10 bg-background px-3 py-2.5 text-sm"
              }
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium">{formatearFechaRegistro(registro.fecha)}</p>
                  <p className="mt-0.5 text-foreground">
                    {nombreEquipoParaMostrar(registro, equiposPorId)}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="font-mono text-sm font-semibold tabular-nums">
                    {formatearMetrosDesasolados(registro.metros_desasolados)}
                  </p>
                  <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    desazolvados
                  </p>
                </div>
              </div>
              {(horasEnConsolidado != null ||
                registro.duracion_horas != null ||
                registro.observaciones) && (
                <dl className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                  {horasEnConsolidado != null ? (
                    <div className="flex justify-between gap-2">
                      <dt>Horas en consolidado</dt>
                      <dd className="font-medium text-foreground">
                        {horasEnConsolidado.toFixed(1)} h
                      </dd>
                    </div>
                  ) : registro.duracion_horas != null && !excluido ? (
                    <div className="flex justify-between gap-2">
                      <dt>Horas registradas</dt>
                      <dd className="text-amber-800 dark:text-amber-200">
                        {registro.duracion_horas.toFixed(1)} h (minitramo no terminado, no suma)
                      </dd>
                    </div>
                  ) : null}
                  {registro.observaciones ? (
                    <div>
                      <dt className="sr-only">Observaciones</dt>
                      <dd>{registro.observaciones}</dd>
                    </div>
                  ) : null}
                </dl>
              )}
              {excluido ? (
                <p className="mt-2 text-xs text-amber-800 dark:text-amber-200">
                  No suma en /maquinaria (registro manual duplicado).
                </p>
              ) : null}
              {isResident ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-2 h-8 px-2 text-destructive hover:text-destructive"
                  disabled={eliminandoId === registro.id}
                  onClick={() => void handleEliminar(registro.id)}
                >
                  <Trash2 className="mr-1 size-3.5" aria-hidden />
                  {eliminandoId === registro.id ? "Eliminando…" : "Eliminar"}
                </Button>
              ) : null}
            </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
