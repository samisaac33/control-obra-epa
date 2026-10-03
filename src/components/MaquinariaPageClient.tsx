"use client"

import { Truck } from "lucide-react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { KpiCard } from "@/src/components/KpiCard"
import { MaquinariaAccionistaChip } from "@/src/components/MaquinariaRegistroBadge"
import { MaquinariaCronologia } from "@/src/components/MaquinariaCronologia"
import { MaquinariaCatalogoEquipos } from "@/src/components/MaquinariaCatalogoEquipos"
import { MaquinariaExportClient } from "@/src/components/MaquinariaExportClient"
import { MaquinariaMatrizCalendario } from "@/src/components/MaquinariaMatrizCalendario"
import { MaquinariaResumenTabla } from "@/src/components/MaquinariaResumenTabla"
import { ProyectoModuloGuard } from "@/src/components/ProyectoModuloGuard"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { PROYECTO_DESASOLVE_CANALES } from "@/src/data/proyectos/catalog"
import { useEsViewportMovil } from "@/src/hooks/useEsViewportMovil"
import { cn } from "@/lib/utils"
import { ACCIONISTA_META } from "@/src/data/registro-maquinaria"
import { useRegistroMaquinariaProyecto } from "@/src/hooks/use-registro-maquinaria-proyecto"
import { formatearNumero, kpisMaquinaria } from "@/src/lib/maquinaria-resumen"

export function MaquinariaPageClient() {
  const { proyectoActivo } = useProyecto()
  const { registros, periodo } = useRegistroMaquinariaProyecto()
  const kpis = kpisMaquinaria(registros)
  const generadoEn = new Date().toISOString()
  const esDesasolve = proyectoActivo.id === PROYECTO_DESASOLVE_CANALES
  const esViewportMovil = useEsViewportMovil()
  const kpiCompact = esDesasolve && esViewportMovil

  return (
    <ProyectoModuloGuard modulo="maquinaria">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
        <header
          className={cn(
            "shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm print:hidden",
            esDesasolve && "hidden md:block"
          )}
        >
          <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-5 sm:px-6 lg:px-8">
            <div className="flex min-w-0 items-start gap-3">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
                <Truck className="size-4" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  Maquinaria y transporte
                </h1>
                <p className="text-sm text-muted-foreground">
                  {proyectoActivo.nombreObra} — Registro operativo — {periodo.etiqueta}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Accionistas:
              </span>
              <MaquinariaAccionistaChip accionista="consorcio" />
              <MaquinariaAccionistaChip accionista="mauricio" />
            </div>
          </div>
        </header>

        <main
          className={cn(
            "mx-auto flex w-full max-w-6xl flex-1 flex-col space-y-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8",
            esDesasolve ? "px-4 py-5" : "px-4 py-6"
          )}
        >
          {esDesasolve ? (
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5 md:hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Accionistas
              </span>
              <MaquinariaAccionistaChip accionista="consorcio" />
              <MaquinariaAccionistaChip accionista="mauricio" />
            </div>
          ) : null}
          <MaquinariaCatalogoEquipos />

          <section aria-labelledby="generar-documento-title">
            <h2 id="generar-documento-title" className="sr-only">
              Generar documento PDF
            </h2>
            <MaquinariaExportClient generadoEn={generadoEn} />
          </section>

          <div className="maquinaria-dashboard space-y-6 sm:space-y-8 print:hidden">
            <section aria-labelledby="kpis-maquinaria-title">
              <div className="mb-3">
                {esDesasolve ? (
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground md:hidden">
                    Período {periodo.etiqueta}
                  </p>
                ) : null}
                <h2 id="kpis-maquinaria-title" className="text-base font-semibold tracking-tight">
                  Resumen del período
                </h2>
              </div>
              <div
                className={cn(
                  "grid gap-3",
                  esDesasolve ? "grid-cols-2 gap-2.5 sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2 lg:grid-cols-3"
                )}
              >
                <KpiCard
                  label="Días con actividad"
                  valor={String(kpis.diasConActividad)}
                  detalle="Jornadas con registro de equipos en obra"
                  compact={kpiCompact}
                />
                <KpiCard
                  label="Días sin trabajo"
                  valor={String(kpis.diasSinTrabajo)}
                  detalle="Paradas registradas en el período"
                  compact={kpiCompact}
                />
                <KpiCard
                  label={`Días-equipo ${ACCIONISTA_META.consorcio.label}`}
                  valor={formatearNumero(kpis.diasEquipoConsorcio)}
                  detalle="Suma normalizada de uso (día completo = 1)"
                  compact={kpiCompact}
                />
                <KpiCard
                  label="Días-equipo Mauricio"
                  valor={formatearNumero(kpis.diasEquipoMauricio)}
                  detalle="Equipos y volquetas del accionista Mauricio"
                  compact={kpiCompact}
                />
                <KpiCard
                  label="Viajes de material"
                  valor={String(kpis.totalViajesArena)}
                  detalle="Transporte de material registrado"
                  compact={kpiCompact}
                />
                <KpiCard
                  label="Eventos destacados"
                  valor={String(kpis.eventosDestacados.length)}
                  detalle={kpis.eventosDestacados.join(" · ") || "Sin eventos especiales"}
                  compact={kpiCompact}
                />
              </div>
            </section>

            <section aria-labelledby="matriz-calendario-title">
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle id="matriz-calendario-title" className="text-base sm:text-lg">
                    Matriz calendario de uso
                  </CardTitle>
                  <CardDescription>
                    Vista tipo cronograma: filas por equipo y accionista, columnas por día. Azul ={" "}
                    {ACCIONISTA_META.consorcio.label}, ámbar = Mauricio. Columnas rayadas = días sin obra.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MaquinariaMatrizCalendario />
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="resumen-equipo-title">
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle id="resumen-equipo-title" className="text-base sm:text-lg">
                    Resumen por equipo y accionista
                  </CardTitle>
                  <CardDescription>
                    Totales acumulados del período. Los colores distinguen {ACCIONISTA_META.consorcio.label}{" "}
                    (azul) y Mauricio (ámbar).
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MaquinariaResumenTabla />
                </CardContent>
              </Card>
            </section>

            <section aria-labelledby="cronologia-title">
              <Card className="border-foreground/10">
                <CardHeader>
                  <CardTitle id="cronologia-title" className="text-base sm:text-lg">
                    Cronología diaria
                  </CardTitle>
                  <CardDescription>
                    Detalle día a día. Expanda cada fecha para ver equipos, duración y notas.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MaquinariaCronologia />
                </CardContent>
              </Card>
            </section>
          </div>
        </main>
      </div>
    </ProyectoModuloGuard>
  )
}
