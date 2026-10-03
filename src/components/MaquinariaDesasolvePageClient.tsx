"use client"

import Link from "next/link"
import { Map, Printer, Trash2, Truck } from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { KpiCard } from "@/src/components/KpiCard"
import { MaquinariaCatalogoEquipos } from "@/src/components/MaquinariaCatalogoEquipos"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { useEquiposMaquinariaProyecto } from "@/src/hooks/use-equipos-maquinaria-proyecto"
import { useEsViewportMovil } from "@/src/hooks/useEsViewportMovil"
import { useJornadasMaquinariaProyecto } from "@/src/hooks/use-jornadas-maquinaria-proyecto"
import {
  agruparJornadasPorFecha,
  formatearMetrosDesasolveResumen,
  kpisMaquinariaDesasolve,
  resumenPorEquipoDesasolve,
  resumenPorTramoDesasolve,
} from "@/src/lib/maquinaria-desasolve-resumen"
import { formatearNumero } from "@/src/lib/maquinaria-resumen"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import {
  eliminarRegistroMaquinariaTramo,
  formatearFechaRegistro,
  formatearMetrosDesasolados,
  mapaEquiposPorId,
  nombreEquipoParaMostrar,
} from "@/src/lib/tramo-maquinaria-historial"
import { createClient } from "@/src/lib/supabase/client"
import { cn } from "@/lib/utils"

function SeccionTitulo({ etiqueta, titulo }: { etiqueta: string; titulo: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{etiqueta}</p>
      <h2 className="mt-0.5 text-base font-semibold tracking-tight text-foreground">{titulo}</h2>
    </div>
  )
}

export function MaquinariaDesasolvePageClient() {
  const { proyectoActivo, proyectoId } = useProyecto()
  const esViewportMovil = useEsViewportMovil()
  const kpiCompact = esViewportMovil
  const supabase = useMemo(() => createClient(), [])
  const residentEmail = process.env.NEXT_PUBLIC_RESIDENTE_EMAIL?.trim().toLowerCase()
  const [isResident, setIsResident] = useState(false)
  const [eliminandoId, setEliminandoId] = useState<string | null>(null)
  const [errorEliminar, setErrorEliminar] = useState<string | null>(null)
  const { jornadas, periodo, loading, error, recargar } = useJornadasMaquinariaProyecto()
  const { equipos } = useEquiposMaquinariaProyecto()

  useEffect(() => {
    async function checkResident() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsResident(Boolean(user?.email && user.email.toLowerCase() === residentEmail))
    }
    void checkResident()
  }, [supabase, residentEmail])

  async function handleEliminarJornada(id: string) {
    if (!isResident) return
    if (!window.confirm("¿Eliminar este registro de jornada de maquinaria?")) return
    setEliminandoId(id)
    setErrorEliminar(null)
    try {
      await eliminarRegistroMaquinariaTramo(supabase, id)
      await recargar()
    } catch (err) {
      setErrorEliminar(err instanceof Error ? err.message : "No se pudo eliminar la jornada.")
    } finally {
      setEliminandoId(null)
    }
  }

  const kpis = useMemo(() => kpisMaquinariaDesasolve(jornadas), [jornadas])
  const porEquipo = useMemo(() => resumenPorEquipoDesasolve(jornadas, equipos), [jornadas, equipos])
  const porTramo = useMemo(() => resumenPorTramoDesasolve(jornadas), [jornadas])
  const porFecha = useMemo(() => agruparJornadasPorFecha(jornadas), [jornadas])
  const equiposPorId = useMemo(() => mapaEquiposPorId(equipos), [equipos])
  const generadoEn = useMemo(() => new Date().toISOString(), [])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="hidden shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm md:block print:hidden">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
              <Truck className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Maquinaria y transporte
              </h1>
              <p className="text-sm text-muted-foreground">
                {proyectoActivo.nombreObra} — Jornadas registradas en mapa — {periodo.etiqueta}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8 print:py-4">
        <Card className="border-foreground/10 bg-card shadow-sm ring-1 ring-foreground/5 print:hidden">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Origen de los datos</CardTitle>
            <CardDescription className="text-sm leading-relaxed">
              Las jornadas se registran en el{" "}
              <Link
                href={rutaObra(proyectoId, "mapa")}
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                mapa de avance
              </Link>{" "}
              al confirmar minitramos GPS o en el historial de maquinaria de cada tramo. Esta página
              consolida y detalla esos registros.
              {isResident ? (
                <>
                  {" "}
                  Como residente puede eliminar jornadas erróneas con el botón de papelera en cada
                  fila del detalle.
                </>
              ) : null}
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Button variant="outline" size="sm" asChild className="gap-2">
              <Link href={rutaObra(proyectoId, "mapa")}>
                <Map className="size-4" aria-hidden />
                Ir al mapa de avance
              </Link>
            </Button>
          </CardContent>
        </Card>

        <div className="print:hidden">
          <MaquinariaCatalogoEquipos />
        </div>

        <section aria-labelledby="imprimir-maquinaria-title" className="print:hidden">
          <Card className="border-foreground/10">
            <CardHeader>
              <CardTitle id="imprimir-maquinaria-title" className="text-base sm:text-lg">
                Reporte consolidado
              </CardTitle>
              <CardDescription>
                Imprima o guarde como PDF el consolidado por equipo y el detalle de jornadas ({periodo.etiqueta}).
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button type="button" variant="outline" className="gap-2" onClick={() => window.print()}>
                <Printer className="size-4" aria-hidden />
                Imprimir / guardar PDF
              </Button>
            </CardContent>
          </Card>
        </section>

        <div id="maquinaria-desasolve-reporte" className="space-y-6 sm:space-y-8">
          <div className="hidden print:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Control de Obra · EPA</p>
            <h1 className="font-heading text-xl font-semibold">{proyectoActivo.nombreObra}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Reporte de maquinaria — {periodo.etiqueta} — generado {formatearFechaRegistro(generadoEn.slice(0, 10))}
            </p>
          </div>

          {error ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {errorEliminar ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {errorEliminar}
            </p>
          ) : null}

          <section aria-labelledby="kpis-desasolve-title">
            <SeccionTitulo etiqueta="Consolidado" titulo="Resumen del período" />
            {loading ? (
              <p className="text-sm text-muted-foreground">Cargando jornadas registradas en el mapa…</p>
            ) : (
              <>
                <div
                  className={cn(
                    "grid gap-3",
                    "grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-3"
                  )}
                >
                  <KpiCard
                    label="Jornadas registradas"
                    valor={String(kpis.totalJornadas)}
                    detalle="Registros en tramos del proyecto"
                    compact={kpiCompact}
                  />
                  <KpiCard
                    label="Metros desazolvados"
                    valor={formatearMetrosDesasolveResumen(kpis.totalMetros)}
                    detalle="Suma de metros por jornada"
                    compact={kpiCompact}
                  />
                  <KpiCard
                    label="Días con actividad"
                    valor={String(kpis.diasConActividad)}
                    detalle="Fechas distintas con registro"
                    compact={kpiCompact}
                  />
                  <KpiCard
                    label="Horas registradas"
                    valor={formatearNumero(kpis.totalHoras, 1)}
                    detalle="Suma de duración en horas cuando se indicó"
                    compact={kpiCompact}
                  />
                  <KpiCard
                    label="Tramos con jornada"
                    valor={String(kpis.tramosConJornada)}
                    detalle="Tramos de canal con al menos un registro"
                    compact={kpiCompact}
                  />
                </div>

                {jornadas.length === 0 ? (
                  <p className="mt-4 text-sm text-muted-foreground">
                    Aún no hay jornadas de maquinaria. El residente puede registrarlas desde el mapa de avance.
                  </p>
                ) : null}
              </>
            )}
          </section>

          {!loading && porEquipo.length > 0 ? (
            <section aria-labelledby="resumen-equipo-desasolve-title">
              <SeccionTitulo etiqueta="Por equipo" titulo="Consolidado por maquinaria" />
              <Card className="border-foreground/10">
                <CardContent className="overflow-x-auto pt-4">
                  <table className="w-full min-w-[28rem] text-sm">
                    <thead>
                      <tr className="border-b border-foreground/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="pb-2 pr-3 font-medium">Equipo</th>
                        <th className="pb-2 pr-3 font-medium text-right">Jornadas</th>
                        <th className="pb-2 pr-3 font-medium text-right">Metros</th>
                        <th className="pb-2 font-medium text-right">Horas</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porEquipo.map((fila) => (
                        <tr key={fila.clave} className="border-b border-foreground/5 last:border-0">
                          <td className="py-2.5 pr-3 font-medium">{fila.nombreEquipo}</td>
                          <td className="py-2.5 pr-3 text-right tabular-nums">{fila.jornadas}</td>
                          <td className="py-2.5 pr-3 text-right font-mono tabular-nums">
                            {formatearMetrosDesasolveResumen(fila.metros)}
                          </td>
                          <td className="py-2.5 text-right font-mono tabular-nums">
                            {fila.horas > 0 ? formatearNumero(fila.horas, 1) : "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </section>
          ) : null}

          {!loading && porTramo.length > 0 ? (
            <section aria-labelledby="resumen-tramo-desasolve-title" className="print:hidden">
              <SeccionTitulo etiqueta="Por tramo" titulo="Metros desazolvados por tramo de canal" />
              <Card className="border-foreground/10">
                <CardContent className="overflow-x-auto pt-4">
                  <table className="w-full min-w-[24rem] text-sm">
                    <thead>
                      <tr className="border-b border-foreground/10 text-left text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="pb-2 pr-3 font-medium">Tramo</th>
                        <th className="pb-2 pr-3 font-medium">Canal</th>
                        <th className="pb-2 pr-3 font-medium text-right">Jornadas</th>
                        <th className="pb-2 font-medium text-right">Metros</th>
                      </tr>
                    </thead>
                    <tbody>
                      {porTramo.map((fila) => (
                        <tr
                          key={`${fila.tramo_codigo}-${fila.tramo_canal}`}
                          className="border-b border-foreground/5 last:border-0"
                        >
                          <td className="py-2.5 pr-3 font-mono font-medium tabular-nums">{fila.tramo_codigo}</td>
                          <td className="py-2.5 pr-3 text-muted-foreground">{fila.tramo_canal}</td>
                          <td className="py-2.5 pr-3 text-right tabular-nums">{fila.jornadas}</td>
                          <td className="py-2.5 text-right font-mono tabular-nums">
                            {formatearMetrosDesasolveResumen(fila.metros)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </section>
          ) : null}

          {!loading && porFecha.length > 0 ? (
            <section aria-labelledby="detalle-jornadas-title">
              <SeccionTitulo etiqueta="Detalle" titulo="Jornadas registradas" />
              <Accordion type="multiple" className="space-y-2" defaultValue={[porFecha[0]?.fecha ?? ""]}>
                {porFecha.map(({ fecha, jornadas: delDia }) => (
                  <AccordionItem
                    key={fecha}
                    value={fecha}
                    className="overflow-hidden rounded-xl border border-foreground/10 bg-card px-3 shadow-sm ring-1 ring-foreground/5"
                  >
                    <AccordionTrigger className="py-3 text-left hover:no-underline">
                      <span className="flex flex-1 items-center justify-between gap-2 pr-2">
                        <span className="font-semibold">{formatearFechaRegistro(fecha)}</span>
                        <span className="text-xs font-normal text-muted-foreground">
                          {delDia.length} jornada{delDia.length === 1 ? "" : "s"}
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pb-3">
                      {delDia.map((j) => (
                        <article
                          key={j.id}
                          className="rounded-lg border border-foreground/10 bg-background px-3 py-2.5 text-sm"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="font-medium">
                                Tramo {j.tramo_codigo}
                                <span className="font-normal text-muted-foreground"> · {j.tramo_canal}</span>
                              </p>
                              <p className="mt-0.5 text-foreground">
                                {nombreEquipoParaMostrar(j, equiposPorId)}
                              </p>
                            </div>
                            <div className="shrink-0 text-right">
                              <p className="font-mono text-sm font-semibold tabular-nums">
                                {formatearMetrosDesasolados(j.metros_desasolados)}
                              </p>
                              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                                desazolvados
                              </p>
                            </div>
                          </div>
                          {j.duracion_horas != null || j.observaciones ? (
                            <dl className="mt-2 space-y-0.5 text-xs text-muted-foreground">
                              {j.duracion_horas != null ? (
                                <div className="flex justify-between gap-2">
                                  <dt>Horas de trabajo</dt>
                                  <dd className="font-mono tabular-nums">{formatearNumero(j.duracion_horas, 1)} h</dd>
                                </div>
                              ) : null}
                              {j.observaciones ? (
                                <div>
                                  <dt className="sr-only">Observaciones</dt>
                                  <dd className="mt-1 leading-relaxed">{j.observaciones}</dd>
                                </div>
                              ) : null}
                            </dl>
                          ) : null}
                          {isResident ? (
                            <div className="mt-2 flex justify-end border-t border-foreground/5 pt-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-8 gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive"
                                disabled={eliminandoId === j.id}
                                onClick={() => void handleEliminarJornada(j.id)}
                              >
                                <Trash2 className="size-3.5" aria-hidden />
                                {eliminandoId === j.id ? "Eliminando…" : "Eliminar jornada"}
                              </Button>
                            </div>
                          ) : null}
                        </article>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </section>
          ) : null}
        </div>
      </main>
    </div>
  )
}
