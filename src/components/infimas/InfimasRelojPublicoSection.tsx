"use client"

import { CalendarClock, Download, FileText } from "lucide-react"
import { useMemo, useState } from "react"

import { resolverFechaCartaEmision } from "@/lib/infimas/reloj-publico-pdf/render-reloj-publico-pdf"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ORDEN_COMPRA_RELOJ_PUBLICO,
  PRESUPUESTO_MENSUAL_RELOJ,
  RUBROS_ORDEN_COMPRA_RELOJ,
} from "@/src/data/infimas/reloj-publico-orden-compra"
import {
  BUNDLES_RELOJ_PUBLICO,
  CONTRATO_RELOJ_PUBLICO_PORTOVIEJO,
  opcionSelectPeriodo,
} from "@/src/data/infimas/reloj-publico-portoviejo"
import type { RelojPublicoDocumento } from "@/src/data/infimas/reloj-publico-types"
import { RelojInformeActividadesVista } from "@/src/components/infimas/reloj-publico/RelojInformeActividadesVista"
import { RelojOficioEntregaVista } from "@/src/components/infimas/reloj-publico/RelojOficioEntregaVista"
import { RelojOficioNotificacionVista } from "@/src/components/infimas/reloj-publico/RelojOficioNotificacionVista"
import {
  construirCartaData,
  isoFechaLocalHoy,
} from "@/src/components/infimas/reloj-publico/relojPublicoPreviewData"

async function descargarPdfDinamico(
  periodoId: string,
  tipo: "entrega" | "informe",
  fechaIso?: string | null
) {
  const params = new URLSearchParams({ periodo: periodoId, tipo })
  if (fechaIso) params.set("fecha", fechaIso)
  const response = await fetch(`/api/infimas/reloj-publico/pdf?${params.toString()}`)
  if (!response.ok) throw new Error("No se pudo generar el PDF")
  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement("a")
  anchor.href = url
  anchor.download =
    tipo === "entrega" ? `oficio-entrega-${periodoId}.pdf` : `informe-actividades-${periodoId}.pdf`
  anchor.click()
  URL.revokeObjectURL(url)
}

function VistaDocumento({
  documento,
  periodoId,
  fechaEmisionIso,
}: {
  documento: RelojPublicoDocumento
  periodoId: string
  fechaEmisionIso?: string | null
}) {
  const bundle = BUNDLES_RELOJ_PUBLICO.find((b) => b.periodo.id === periodoId)
  if (!bundle) return null

  const data = construirCartaData(bundle.periodo, documento.tipo, fechaEmisionIso)

  switch (documento.tipo) {
    case "notificacion":
      return <RelojOficioNotificacionVista data={data} />
    case "entrega":
      return <RelojOficioEntregaVista data={data} />
    case "informe":
      return <RelojInformeActividadesVista data={data} />
    default:
      return null
  }
}

export function InfimasRelojPublicoSection() {
  const bundles = BUNDLES_RELOJ_PUBLICO
  const [periodoId, setPeriodoId] = useState(bundles[0]?.periodo.id ?? "")
  const [vistaSlug, setVistaSlug] = useState<string | null>(null)
  const [fechaEmisionOverride, setFechaEmisionOverride] = useState<Record<string, string>>({})
  const [descargandoSlug, setDescargandoSlug] = useState<string | null>(null)

  const fechaEmisionPeriodo = fechaEmisionOverride[periodoId] ?? null

  const bundleActual = useMemo(
    () => bundles.find((b) => b.periodo.id === periodoId) ?? bundles[0],
    [bundles, periodoId]
  )

  if (!bundleActual) {
    return null
  }

  const { periodo, documentos } = bundleActual

  function fechaEmisionVisible(doc: RelojPublicoDocumento): string {
    if (doc.tipo === "entrega" || doc.tipo === "informe") {
      if (fechaEmisionPeriodo) {
        return (
          resolverFechaCartaEmision(doc.tipo, periodo.id, fechaEmisionPeriodo) ?? doc.fecha
        )
      }
    }
    return doc.fecha
  }

  function aplicarFechaHoy() {
    setFechaEmisionOverride((prev) => ({ ...prev, [periodoId]: isoFechaLocalHoy() }))
  }

  return (
    <section className="space-y-6">
      <div className="rounded-xl border border-foreground/10 bg-card/60 p-4 sm:p-5">
        <p className="text-sm text-muted-foreground">
          Ciclo mensual: actividades del <strong className="font-medium text-foreground">7</strong> al{" "}
          <strong className="font-medium text-foreground">6</strong> del mes siguiente; oficio de notificación el día{" "}
          <strong className="font-medium text-foreground">4</strong>; oficio de entrega e informe el día{" "}
          <strong className="font-medium text-foreground">6</strong> de cierre. Doce periodos (jul 2026 – jun 2027).
        </p>

        <div className="mt-4 space-y-2">
          <label htmlFor="periodo-reloj" className="text-sm font-medium">
            Periodo de actividades
          </label>
          <Select
            value={periodoId}
            onValueChange={(value) => {
              setPeriodoId(value)
              setVistaSlug(null)
            }}
          >
            <SelectTrigger id="periodo-reloj" className="w-full max-w-xl">
              <SelectValue placeholder="Seleccione un periodo" />
            </SelectTrigger>
            <SelectContent>
              {bundles.map((b) => (
                <SelectItem key={b.periodo.id} value={b.periodo.id}>
                  {opcionSelectPeriodo(b.periodo)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Orden de compra y presupuesto mensual</CardTitle>
          <CardDescription>
            Rubros de la OC {CONTRATO_RELOJ_PUBLICO_PORTOVIEJO.codigo} ({ORDEN_COMPRA_RELOJ_PUBLICO.fecha}). Valores
            anuales ÷ 12 meses.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
            <span>Certificación: {ORDEN_COMPRA_RELOJ_PUBLICO.certificacionPresupuestaria}</span>
            <span>Área requirente: {ORDEN_COMPRA_RELOJ_PUBLICO.areaRequirente}</span>
          </div>
          <div className="overflow-x-auto rounded-lg border border-foreground/10">
            <table className="w-full min-w-[640px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-foreground/10 bg-muted/50 text-left">
                  <th className="p-2 font-medium">Ítem</th>
                  <th className="p-2 font-medium">Descripción</th>
                  <th className="p-2 font-medium text-right">Cant./mes</th>
                  <th className="p-2 font-medium text-right">P. unit.</th>
                  <th className="p-2 font-medium text-right">Valor/mes (USD)</th>
                </tr>
              </thead>
              <tbody>
                {RUBROS_ORDEN_COMPRA_RELOJ.map((rubro) => (
                  <tr key={rubro.item} className="border-b border-foreground/10 align-top">
                    <td className="p-2">{rubro.item}</td>
                    <td className="p-2">
                      <p className="font-medium text-foreground">{rubro.titulo}</p>
                      <p className="mt-1 text-muted-foreground">{rubro.descripcionResumen}</p>
                    </td>
                    <td className="p-2 text-right tabular-nums">
                      {rubro.cantidadMensual} {rubro.unidad}
                    </td>
                    <td className="p-2 text-right tabular-nums">{rubro.precioUnitario.toFixed(2)}</td>
                    <td className="p-2 text-right tabular-nums">{rubro.valorMensual.toFixed(2)}</td>
                  </tr>
                ))}
                <tr className="bg-muted/30 font-medium">
                  <td className="p-2" colSpan={4}>
                    Total mensual estimado
                  </td>
                  <td className="p-2 text-right tabular-nums">{PRESUPUESTO_MENSUAL_RELOJ.toFixed(2)}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <Button asChild variant="outline" size="sm">
            <a href={CONTRATO_RELOJ_PUBLICO_PORTOVIEJO.ordenCompra.archivoPdf} download>
              <Download className="size-4" aria-hidden />
              Descargar orden de compra (PDF)
            </a>
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {documentos.map((doc) => (
          <Card key={doc.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80">
                  <FileText className="size-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base leading-snug">{doc.titulo}</CardTitle>
                  <CardDescription className="mt-1">{doc.descripcion}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3 pt-0">
              <p className="text-sm text-muted-foreground">
                {CONTRATO_RELOJ_PUBLICO_PORTOVIEJO.codigo} · {fechaEmisionVisible(doc)}
              </p>
              <div className="ml-auto flex flex-wrap gap-2">
                {doc.tipo === "entrega" || doc.tipo === "informe" ? (
                  <Button type="button" variant="secondary" size="sm" onClick={aplicarFechaHoy}>
                    <CalendarClock className="size-4" aria-hidden />
                    Usar fecha de hoy
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVistaSlug(vistaSlug === doc.slug ? null : doc.slug)}
                >
                  {vistaSlug === doc.slug ? "Ocultar vista previa" : "Vista previa"}
                </Button>
                {doc.tipo === "entrega" || doc.tipo === "informe" ? (
                  <Button
                    type="button"
                    size="sm"
                    disabled={descargandoSlug === doc.slug}
                    onClick={async () => {
                      setDescargandoSlug(doc.slug)
                      try {
                        await descargarPdfDinamico(periodo.id, doc.tipo as "entrega" | "informe", fechaEmisionPeriodo)
                      } finally {
                        setDescargandoSlug(null)
                      }
                    }}
                  >
                    <Download className="size-4" aria-hidden />
                    {descargandoSlug === doc.slug ? "Generando…" : "Descargar PDF"}
                  </Button>
                ) : (
                  <Button asChild size="sm">
                    <a href={doc.archivoPdf} download>
                      <Download className="size-4" aria-hidden />
                      Descargar PDF
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vistaSlug ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Vista previa — {periodo.etiqueta}</h3>
          <div className="overflow-x-auto rounded-lg border border-foreground/10 bg-neutral-100 p-4 sm:p-6">
            <VistaDocumento
              documento={documentos.find((d) => d.slug === vistaSlug)!}
              periodoId={periodo.id}
              fechaEmisionIso={
                documentos.find((d) => d.slug === vistaSlug)?.tipo === "notificacion"
                  ? null
                  : fechaEmisionPeriodo
              }
            />
          </div>
        </section>
      ) : null}
    </section>
  )
}
