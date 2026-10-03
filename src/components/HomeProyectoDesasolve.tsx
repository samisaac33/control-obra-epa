"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Camera, ChevronRight, LayoutDashboard, Map, Truck } from "lucide-react"
import { useCallback, useEffect, useMemo, useState } from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UltimasEvidencias } from "@/src/components/UltimasEvidencias"
import { MapaTramosKpisBar } from "@/src/components/mapa/MapaTramosKpisBar"
import { MapaTramosLeyenda } from "@/src/components/mapa/MapaTramosLeyenda"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"
import { useEsViewportMovil } from "@/src/hooks/useEsViewportMovil"
import { tramosMapaDesasolveSinExcluidos } from "@/src/data/tramos/tramos-excluidos"
import { cargarTramosMapaProyecto } from "@/src/lib/cargar-tramos-mapa-proyecto"
import { rutaObra } from "@/src/lib/rutas-proyecto"
import { createClient } from "@/src/lib/supabase/client"
import { calcularKpisTramos } from "@/src/lib/tramos-avance"
const accesos = [
  {
    segment: "mapa",
    label: "Mapa de avance",
    descripcion: "Tramos de canal georreferenciados con estado y avance por longitud",
    icon: Map,
  },
  {
    segment: "fotos",
    label: "Evidencias fotográficas",
    descripcion: "Registro de campo georreferenciado por canal y frente",
    icon: Camera,
  },
  {
    segment: "maquinaria",
    label: "Maquinaria y transporte",
    descripcion: "Uso diario de excavadoras y equipos de apoyo",
    icon: Truck,
  },
] as const

function SeccionTitulo({ id, etiqueta, titulo }: { id: string; etiqueta: string; titulo: string }) {
  return (
    <div className="mb-3">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{etiqueta}</p>
      <h2 id={id} className="mt-0.5 text-base font-semibold tracking-tight text-foreground">
        {titulo}
      </h2>
    </div>
  )
}

export function HomeProyectoDesasolve() {
  const { proyectoActivo, proyectoId } = useProyecto()
  const pathname = usePathname()
  const esViewportMovil = useEsViewportMovil()
  const supabase = useMemo(() => createClient(), [])
  const [kpis, setKpis] = useState(() => calcularKpisTramos([]))
  const [loadingKpis, setLoadingKpis] = useState(true)
  const [errorKpis, setErrorKpis] = useState<string | null>(null)

  const cargarKpis = useCallback(async () => {
    setLoadingKpis(true)
    setErrorKpis(null)
    try {
      const { tramos, puntosAvance } = await cargarTramosMapaProyecto(supabase, proyectoId)
      setKpis(
        calcularKpisTramos(tramosMapaDesasolveSinExcluidos(tramos), puntosAvance)
      )
    } catch (err) {
      setKpis(calcularKpisTramos([]))
      setErrorKpis(err instanceof Error ? err.message : "No se pudieron cargar los indicadores.")
    } finally {
      setLoadingKpis(false)
    }
  }, [proyectoId, supabase])

  useEffect(() => {
    void cargarKpis()
  }, [cargarKpis, pathname])

  useEffect(() => {
    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        void cargarKpis()
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange)
    return () => document.removeEventListener("visibilitychange", onVisibilityChange)
  }, [cargarKpis])

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="hidden shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm md:block">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
              <LayoutDashboard className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                {proyectoActivo.nombreObra}
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col space-y-6 px-4 py-5 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <Card className="border-foreground/10 bg-card shadow-sm ring-1 ring-foreground/5">
          <CardHeader className="pb-3">
            <CardTitle className="hidden text-base sm:block sm:text-lg">{proyectoActivo.nombreObra}</CardTitle>
            <CardDescription className="grid gap-3 text-sm sm:mt-2">
              <dl className="contents">
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cliente</dt>
                  <dd className="mt-0.5 text-foreground">{proyectoActivo.cliente}</dd>
                </div>
                <div>
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Contrato</dt>
                  <dd className="mt-0.5 text-foreground">{proyectoActivo.numeroContrato}</dd>
                </div>
                <div className="md:hidden">
                  <details className="group rounded-lg border border-foreground/10 bg-muted/20 px-3 py-2">
                    <summary className="cursor-pointer text-xs font-medium uppercase tracking-wider text-muted-foreground touch-manipulation">
                      Objeto contractual
                    </summary>
                    <dd className="mt-2 text-sm leading-relaxed text-foreground">{proyectoActivo.objeto}</dd>
                  </details>
                </div>
                <div className="hidden md:block">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Objeto</dt>
                  <dd className="mt-0.5 leading-relaxed text-foreground">{proyectoActivo.objeto}</dd>
                </div>
              </dl>
            </CardDescription>
          </CardHeader>
        </Card>

        <section aria-labelledby="kpis-mapa-title">
          <SeccionTitulo id="kpis-mapa-title" etiqueta="Indicadores" titulo="Avance del desasolve" />
          <Card className="border-foreground/10">
            <CardContent className="space-y-3 pt-4">
              {errorKpis ? (
                <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {errorKpis}
                </p>
              ) : null}
              {loadingKpis ? (
                <p className="text-sm text-muted-foreground">Cargando indicadores del mapa…</p>
              ) : (
                <>
                  <MapaTramosKpisBar
                    kpis={kpis}
                    modo="stack"
                    chipsCarrusel={false}
                    chipsLayout={esViewportMovil ? "grid" : "scroll"}
                  />
                  <MapaTramosLeyenda compact={esViewportMovil} />
                  <p className="text-xs text-muted-foreground">
                    Mismos indicadores que el{" "}
                    <Link
                      href={rutaObra(proyectoId, "mapa")}
                      className="font-medium text-primary underline-offset-4 hover:underline"
                    >
                      mapa de avance
                    </Link>
                    . Km ejecutados según minitramos GPS en estado terminado.
                  </p>
                </>
              )}
            </CardContent>
          </Card>
        </section>

        <section aria-labelledby="accesos-desasolve-title">
          <SeccionTitulo id="accesos-desasolve-title" etiqueta="Navegación" titulo="Accesos rápidos" />
          <div className="divide-y divide-foreground/10 overflow-hidden rounded-xl border border-foreground/10 bg-card shadow-sm ring-1 ring-foreground/5 sm:hidden">
            {accesos.map(({ segment, label, descripcion, icon: Icon }) => {
              const href = rutaObra(proyectoId, segment)
              return (
                <Link
                  key={segment}
                  href={href}
                  className="group flex min-h-[4.25rem] items-center gap-3 px-4 py-3 transition-colors active:bg-muted/50"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/60 text-foreground/80">
                    <Icon className="size-4" aria-hidden strokeWidth={1.75} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{label}</p>
                    <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                      {descripcion}
                    </p>
                  </div>
                  <ChevronRight
                    className="size-4 shrink-0 text-muted-foreground group-hover:text-foreground"
                    aria-hidden
                  />
                </Link>
              )
            })}
          </div>
          <div className="hidden gap-3 sm:grid sm:grid-cols-2 lg:grid-cols-3">
            {accesos.map(({ segment, label, descripcion, icon: Icon }) => {
              const href = rutaObra(proyectoId, segment)
              return (
                <Link
                  key={segment}
                  href={href}
                  className="group flex flex-col rounded-xl border border-foreground/10 bg-card p-4 shadow-sm ring-1 ring-foreground/5 transition-colors hover:border-primary/30 hover:bg-primary/5"
                >
                  <div className="mb-3 flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4" aria-hidden />
                  </div>
                  <p className="text-sm font-semibold text-foreground group-hover:text-primary">{label}</p>
                  <p className="mt-1 flex-1 text-xs leading-relaxed text-muted-foreground">{descripcion}</p>
                  <span className="mt-3 text-xs font-medium text-primary">Ir a la sección →</span>
                </Link>
              )
            })}
          </div>
        </section>

        <section aria-labelledby="evidencias-desasolve-title">
          <Card className="border-foreground/10">
            <CardHeader>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground md:hidden">
                Registro de campo
              </p>
              <CardTitle id="evidencias-desasolve-title" className="text-base sm:text-lg">
                Últimas evidencias fotográficas
              </CardTitle>
              <CardDescription>
                Registro de campo georreferenciado — proyecto desasolve de canales
              </CardDescription>
            </CardHeader>
            <CardContent>
              <UltimasEvidencias proyectoId={PROYECTO_DESASOLVE_CANALES} />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
