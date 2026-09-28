"use client"

import { useMemo } from "react"
import { Camera, ClipboardList, FileWarning, ListOrdered, Printer, ShieldCheck } from "lucide-react"

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
import { DocumentoCalidadPreview } from "@/components/sicc/documento-calidad-preview"
import { EstadoModuloBadge } from "@/components/sicc/estado-modulo-badge"
import { KpiCard } from "@/components/sicc/kpi-card"
import { useSiccData } from "@/components/sicc/sicc-data-provider"
import {
  ETIQUETA_CLASIFICACION,
  GUIA_ENSAYOS_CONTRATANTE,
  guiaPorRubroId,
} from "@/data/guia-ensayos-contratante-severino"
import {
  ENSAYOS_TOLERANCIAS_SEVERINO,
  SOLICITUD_CONTRATANTE,
  type EstadoCumplimientoEnsayo,
} from "@/data/ensayos-tolerancias-severino"
import { calcularResumenCumplimiento } from "@/lib/sicc/calidad-ensayos"
import {
  generarDocumentoEnsayoRubroHtml,
  generarIndiceEntregaPlanilla3Html,
  tituloDocumentoRubro,
} from "@/lib/sicc/documentos-ensayos-severino"
import { imprimirDocumentoHtml } from "@/lib/sicc/imprimir-documento-html"
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

  const indiceHtml = useMemo(
    () => generarIndiceEntregaPlanilla3Html(obra, estadosEnsayos),
    [obra, estadosEnsayos]
  )

  const documentosHtmlPorRubro = useMemo(() => {
    const map: Record<number, string> = {}
    for (const id of [1, 2, 3, 4]) {
      map[id] = generarDocumentoEnsayoRubroHtml(obra, id)
    }
    return map
  }, [obra])

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

  function imprimirIndice() {
    imprimirDocumentoHtml(
      `Índice entrega Planilla ${SOLICITUD_CONTRATANTE.planillaReferencia} — ${obra.nombre}`,
      indiceHtml
    )
  }

  function imprimirDocumentoRubro(rubroId: number) {
    imprimirDocumentoHtml(
      `${tituloDocumentoRubro(rubroId)} — ${obra.nombre}`,
      documentosHtmlPorRubro[rubroId]
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <EstadoModuloBadge estado="activo" />
            <span className="text-xs text-muted-foreground">Fase 2</span>
            <Badge className="border-yellow-500/40 bg-yellow-100 text-yellow-950 dark:bg-yellow-500/20 dark:text-yellow-100">
              Amarillo [[·]] = dato ficticio a reemplazar
            </Badge>
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
        <Button type="button" onClick={imprimirIndice} variant="outline" className="gap-2">
          <Printer className="size-4" />
          Índice de entrega Planilla {SOLICITUD_CONTRATANTE.planillaReferencia}
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

      <Card className="border-foreground/10 bg-muted/10">
        <CardHeader>
          <CardTitle className="text-base">Qué solicita la contratante (guía práctica)</CardTitle>
          <CardDescription className="leading-relaxed">
            Procedimiento en campo, tipo de actividad (no siempre es «ensayo») y fotos mínimas
            para adjuntar al expediente PDF.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {GUIA_ENSAYOS_CONTRATANTE.map((guia) => (
            <div
              key={guia.rubroId}
              className="rounded-lg border border-foreground/10 bg-background p-4"
            >
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {guia.imagenReferencia}
              </p>
              <p className="mt-1 text-sm font-medium">{guia.actividadContractual}</p>
              <p className="mt-2 text-sm text-muted-foreground">{guia.quePideLaContratante}</p>
              <div className="mt-4 space-y-4">
                {guia.ensayosRequeridos.map((e) => (
                  <div
                    key={e.nombre}
                    className="rounded-md border border-foreground/10 bg-muted/20 p-3"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-foreground">{e.nombre}</p>
                      <Badge variant="outline" className="text-xs font-normal">
                        {ETIQUETA_CLASIFICACION[e.clasificacion]}
                      </Badge>
                    </div>
                    <p className="mt-1.5 text-sm text-muted-foreground">{e.descripcionPractica}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Instrumento: {e.instrumento} · {e.normaReferencia}
                    </p>
                    <div className="mt-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <ListOrdered className="size-3.5" />
                        Cómo se realiza
                      </p>
                      <ol className="mt-1.5 list-decimal space-y-1 pl-5 text-xs leading-relaxed text-muted-foreground">
                        {e.pasos.map((paso) => (
                          <li key={paso}>{paso}</li>
                        ))}
                      </ol>
                    </div>
                    <div className="mt-3">
                      <p className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Camera className="size-3.5" />
                        Fotos a adjuntar
                      </p>
                      <ul className="mt-1.5 space-y-1.5 text-xs text-muted-foreground">
                        {e.fotosAdjuntar.map((f) => (
                          <li key={f.id}>
                            <strong className="text-foreground">{f.id}</strong> — {f.titulo} (
                            {f.momento}): {f.contenidoMinimo}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="space-y-4">
        {ENSAYOS_TOLERANCIAS_SEVERINO.map((esp) => {
          const guia = guiaPorRubroId(esp.rubroId)
          return (
            <Card key={esp.seccion} className="border-foreground/10">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="outline" className="font-mono tabular-nums">
                      Rubro {esp.rubroId}
                    </Badge>
                    <Badge variant="secondary" className="font-mono">
                      § {esp.seccion}
                    </Badge>
                    <CardTitle className="text-base">{esp.titulo}</CardTitle>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    className="gap-2"
                    onClick={() => imprimirDocumentoRubro(esp.rubroId)}
                  >
                    <Printer className="size-4" />
                    Imprimir documento § {esp.seccion}
                  </Button>
                </div>
                <CardDescription className="mt-1">{esp.rubroDetalle}</CardDescription>
                {guia ? (
                  <p className="mt-2 text-xs text-muted-foreground">
                    Modelo incluye: {guia.documentosGenerados.join(" · ")}
                  </p>
                ) : null}
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
                            <SelectTrigger
                              className="w-[150px]"
                              aria-label={`Estado de ${req.id}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {(Object.keys(ESTADO_UI) as EstadoCumplimientoEnsayo[]).map(
                                (key) => (
                                  <SelectItem key={key} value={key}>
                                    {ESTADO_UI[key].etiqueta}
                                  </SelectItem>
                                )
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  )
                })}
                <div className="mt-4 rounded-lg border border-dashed border-foreground/15 bg-background p-3">
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Vista previa — acta/informe modelo (§ {esp.seccion})
                  </p>
                  <DocumentoCalidadPreview
                    html={documentosHtmlPorRubro[esp.rubroId]}
                    className="max-h-80 overflow-auto rounded-md border border-foreground/10 bg-white p-3 text-foreground dark:bg-zinc-950"
                  />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Card className="border-dashed border-foreground/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg border border-foreground/10 bg-background">
              <ShieldCheck className="size-5 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-base">Índice de entrega a fiscalización</CardTitle>
              <CardDescription>
                Lista de actas, informes y fotos por rubro. Imprima un documento por imagen y
                reemplace los datos en amarillo antes de enviar a la EPA.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DocumentoCalidadPreview
            html={indiceHtml}
            className="max-h-96 overflow-auto rounded-lg border border-foreground/10 bg-white p-4 dark:bg-zinc-950"
          />
        </CardContent>
      </Card>
    </div>
  )
}
