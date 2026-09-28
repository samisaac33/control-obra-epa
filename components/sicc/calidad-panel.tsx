"use client"

import { useMemo } from "react"
import { ClipboardList, FileWarning, Printer, ShieldCheck } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { EstadoModuloBadge } from "@/components/sicc/estado-modulo-badge"
import { KpiCard } from "@/components/sicc/kpi-card"
import { useSiccData } from "@/components/sicc/sicc-data-provider"
import {
  ENSAYOS_TOLERANCIAS_SEVERINO,
  SOLICITUD_CONTRATANTE,
  type EstadoCumplimientoEnsayo,
} from "@/data/ensayos-tolerancias-severino"
import {
  calcularResumenCumplimiento,
  generarTextoAnexoEnsayos,
} from "@/lib/sicc/calidad-ensayos"
import type { KpiObra } from "@/lib/sicc/types"
import { cn } from "@/lib/utils"

const ESTADO_UI: Record<
  EstadoCumplimientoEnsayo,
  { etiqueta: string; className: string }
> = {
  pendiente: {
    etiqueta: "Pendiente",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-900 dark:text-amber-300",
  },
  en_proceso: {
    etiqueta: "En proceso",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-900 dark:text-sky-300",
  },
  cumplido: {
    etiqueta: "Cumplido",
    className:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-900 dark:text-emerald-300",
  },
  no_aplica: {
    etiqueta: "No aplica",
    className: "border-foreground/15 bg-muted/60 text-muted-foreground",
  },
}

export function CalidadPanel() {
  const { obra, estadosEnsayos, actualizarEstadoEnsayo } = useSiccData()

  const resumen = useMemo(
    () => calcularResumenCumplimiento(estadosEnsayos),
    [estadosEnsayos]
  )

  const textoAnexo = useMemo(
    () => generarTextoAnexoEnsayos(obra, estadosEnsayos),
    [obra, estadosEnsayos]
  )

  const kpis: KpiObra[] = [
    {
      etiqueta: "Cumplimiento",
      valor: `${resumen.porcentajeCumplimiento}%`,
      detalle: `${resumen.cumplidos} de ${resumen.total - resumen.noAplica} aplicables`,
      tendencia: resumen.porcentajeCumplimiento >= 80 ? "positiva" : "neutral",
    },
    {
      etiqueta: "Pendientes",
      valor: String(resumen.pendientes),
      detalle: "Requisitos sin iniciar",
      tendencia: resumen.pendientes > 0 ? "negativa" : "positiva",
    },
    {
      etiqueta: "En proceso",
      valor: String(resumen.enProceso),
      detalle: "Ensayos en ejecución",
      tendencia: "neutral",
    },
    {
      etiqueta: "Planilla",
      valor: `N.º ${SOLICITUD_CONTRATANTE.planillaReferencia}`,
      detalle: "Observaciones de la contratante",
      tendencia: "neutral",
    },
  ]

  function imprimirAnexo() {
    const ventana = window.open("", "_blank", "noopener,noreferrer")
    if (!ventana) return

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Anexo ensayos Planilla ${SOLICITUD_CONTRATANTE.planillaReferencia} — ${obra.nombre}</title>
          <style>
            body { font-family: ui-monospace, monospace; font-size: 11px; line-height: 1.5; padding: 2rem; white-space: pre-wrap; }
          </style>
        </head>
        <body>${textoAnexo.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body>
      </html>
    `)
    ventana.document.close()
    ventana.focus()
    ventana.print()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <EstadoModuloBadge estado="activo" />
            <span className="text-xs text-muted-foreground">Fase 2</span>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Calidad — Ensayos y tolerancias
          </h1>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            Requisitos solicitados por {SOLICITUD_CONTRATANTE.entidad} tras la presentación
            de la Planilla {SOLICITUD_CONTRATANTE.planillaReferencia}, para los rubros 1–4
            de {SOLICITUD_CONTRATANTE.categoria}.
          </p>
        </div>
        <Button type="button" onClick={imprimirAnexo} className="gap-2">
          <Printer className="size-4" />
          Imprimir anexo Planilla {SOLICITUD_CONTRATANTE.planillaReferencia}
        </Button>
      </div>

      <Card className="border-amber-500/25 bg-amber-500/5">
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border border-amber-500/20 bg-background">
              <FileWarning className="size-5 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base">Solicitud de la entidad contratante</CardTitle>
              <CardDescription className="mt-1.5 text-sm leading-relaxed">
                {SOLICITUD_CONTRATANTE.resumen}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <KpiCard key={kpi.etiqueta} kpi={kpi} />
        ))}
      </div>

      <div className="space-y-4">
        {ENSAYOS_TOLERANCIAS_SEVERINO.map((esp) => (
          <Card key={esp.seccion} className="border-foreground/10">
            <CardHeader className="pb-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="font-mono tabular-nums">
                  Rubro {esp.rubroId}
                </Badge>
                <Badge variant="secondary" className="font-mono">
                  § {esp.seccion}
                </Badge>
                <CardTitle className="text-base">{esp.titulo}</CardTitle>
              </div>
              <CardDescription className="mt-1">{esp.rubroDetalle}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {esp.requisitos.map((req) => {
                const estado = estadosEnsayos[req.id] ?? "pendiente"
                const ui = ESTADO_UI[estado]
                return (
                  <div
                    key={req.id}
                    className="rounded-lg border border-foreground/10 bg-muted/20 p-3 sm:p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <ClipboardList className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                          <p className="text-sm leading-relaxed text-foreground">{req.texto}</p>
                        </div>
                        {req.criterio ? (
                          <p className="pl-6 text-xs text-muted-foreground">
                            Criterio: {req.criterio}
                          </p>
                        ) : null}
                      </div>
                      <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end">
                        <Badge className={cn("border", ui.className)}>{ui.etiqueta}</Badge>
                        <Select
                          value={estado}
                          onValueChange={(value) =>
                            actualizarEstadoEnsayo(req.id, value as EstadoCumplimientoEnsayo)
                          }
                        >
                          <SelectTrigger className="w-[150px]" aria-label={`Estado de ${req.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(
                              Object.keys(ESTADO_UI) as EstadoCumplimientoEnsayo[]
                            ).map((key) => (
                              <SelectItem key={key} value={key}>
                                {ESTADO_UI[key].etiqueta}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-dashed border-foreground/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-foreground/10 bg-background">
              <ShieldCheck className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Anexo para fiscalización</CardTitle>
              <CardDescription>
                Documento listo para adjuntar a la respuesta de observaciones de la Planilla{" "}
                {SOLICITUD_CONTRATANTE.planillaReferencia}.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="max-h-64 overflow-auto rounded-lg border border-foreground/10 bg-muted/30 p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {textoAnexo}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
