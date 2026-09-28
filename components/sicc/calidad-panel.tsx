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
import { GUIA_ENSAYOS_CONTRATANTE, guiaPorRubroId } from "@/data/guia-ensayos-contratante-severino"
import {
  ENSAYOS_TOLERANCIAS_SEVERINO,
  SOLICITUD_CONTRATANTE,
  type EstadoCumplimientoEnsayo,
} from "@/data/ensayos-tolerancias-severino"
import { calcularResumenCumplimiento } from "@/lib/sicc/calidad-ensayos"
import {
  generarDocumentoEnsayoRubro,
  generarIndiceEntregaPlanilla3,
  tituloDocumentoRubro,
} from "@/lib/sicc/documentos-ensayos-severino"
import { imprimirDocumentoTextoPlano } from "@/lib/sicc/imprimir-documento-html"
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

  const indiceEntrega = useMemo(
    () => generarIndiceEntregaPlanilla3(obra, estadosEnsayos),
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

  function imprimirIndice() {
    imprimirDocumentoTextoPlano(
      `Índice entrega Planilla ${SOLICITUD_CONTRATANTE.planillaReferencia} — ${obra.nombre}`,
      indiceEntrega
    )
  }

  function imprimirDocumentoRubro(rubroId: number) {
    imprimirDocumentoTextoPlano(
      `${tituloDocumentoRubro(rubroId)} — ${obra.nombre}`,
      generarDocumentoEnsayoRubro(obra, rubroId)
    )
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
            Cada imagen que envió la EPA corresponde a un rubro de Severino. No basta copiar el
            pliego: hay que ejecutar ensayos y adjuntar actas, informes o certificados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              <ul className="mt-3 space-y-2">
                {guia.ensayosRequeridos.map((e) => (
                  <li key={e.nombre} className="text-sm leading-relaxed">
                    <span className="font-medium text-foreground">{e.nombre}</span>
                    <span className="text-muted-foreground"> ({e.tipo}) — </span>
                    {e.descripcionPractica}
                    <span className="mt-1 block text-xs text-muted-foreground">
                      Entregar: {e.evidenciaAEntregar}
                    </span>
                  </li>
                ))}
              </ul>
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
                  Incluye: {guia.documentosGenerados.join(" · ")}
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
                Lista de actas e informes por rubro. Imprima un documento por imagen/rubro y
                complételo en campo o con el taller de balanceo / END.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <pre className="max-h-64 overflow-auto rounded-lg border border-foreground/10 bg-muted/30 p-4 font-mono text-[11px] leading-relaxed whitespace-pre-wrap text-muted-foreground">
            {indiceEntrega}
          </pre>
        </CardContent>
      </Card>
    </div>
  )
}
