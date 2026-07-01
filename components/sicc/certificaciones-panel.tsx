"use client"

import { useEffect, useMemo, useState } from "react"
import { ClipboardCheck, FileText, Printer } from "lucide-react"

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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { EstadoModuloBadge } from "@/components/sicc/estado-modulo-badge"
import { KpiCard } from "@/components/sicc/kpi-card"
import { useSiccData } from "@/components/sicc/sicc-data-provider"
import { presupuestoData } from "@/data/presupuesto"
import {
  calcularResumenCertificacion,
  generarTextoCertificacion,
} from "@/lib/sicc/certificaciones"
import { formatearCantidad, formatearUsd } from "@/lib/sicc/format"
import type { EstadoCertificacion } from "@/lib/sicc/types"
import { cn } from "@/lib/utils"

const ESTADO_CERT: Record<
  EstadoCertificacion,
  { etiqueta: string; className: string }
> = {
  borrador: {
    etiqueta: "Borrador",
    className: "border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-300",
  },
  enviada: {
    etiqueta: "Enviada",
    className: "border-sky-500/30 bg-sky-500/10 text-sky-800 dark:text-sky-300",
  },
  aprobada: {
    etiqueta: "Aprobada",
    className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300",
  },
}

export function CertificacionesPanel() {
  const { obra, metrados, periodosCertificacion } = useSiccData()

  const [periodoId, setPeriodoId] = useState(
    periodosCertificacion[periodosCertificacion.length - 1]?.id ?? "2026-02"
  )

  useEffect(() => {
    const existe = periodosCertificacion.some((p) => p.id === periodoId)
    if (!existe && periodosCertificacion.length > 0) {
      setPeriodoId(periodosCertificacion[periodosCertificacion.length - 1].id)
    }
  }, [periodosCertificacion, periodoId])

  const periodoActivo =
    periodosCertificacion.find((p) => p.id === periodoId) ?? periodosCertificacion[0]

  const resumen = useMemo(() => {
    if (!periodoActivo) return null
    return calcularResumenCertificacion(presupuestoData, metrados, periodoActivo)
  }, [periodoActivo, metrados])

  const textoCertificacion = useMemo(() => {
    if (!resumen) return ""
    return generarTextoCertificacion(obra, resumen)
  }, [resumen, obra])

  function imprimirCertificacion() {
    if (!resumen) return
    const ventana = window.open("", "_blank", "noopener,noreferrer")
    if (!ventana) return

    ventana.document.write(`
      <!DOCTYPE html>
      <html lang="es">
        <head>
          <meta charset="utf-8" />
          <title>Certificación ${resumen.periodo.etiqueta} — ${obra.nombre}</title>
          <style>
            body { font-family: ui-monospace, monospace; font-size: 11px; line-height: 1.5; padding: 2rem; white-space: pre-wrap; }
          </style>
        </head>
        <body>${textoCertificacion.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</body>
      </html>
    `)
    ventana.document.close()
    ventana.focus()
    ventana.print()
  }

  if (!resumen || !periodoActivo) {
    return (
      <p className="text-sm text-muted-foreground">
        No hay periodos de certificación disponibles.
      </p>
    )
  }

  const estadoCert = ESTADO_CERT[periodoActivo.estado]

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <EstadoModuloBadge estado="activo" />
            <Badge variant="outline" className={cn("font-normal", estadoCert.className)}>
              {estadoCert.etiqueta}
            </Badge>
          </div>
          <h1 className="font-heading text-2xl font-semibold tracking-tight">
            Certificaciones
          </h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Planillas de avance mensual generadas desde los metrados acumulados. Listas
            para revisión del fiscalizador y facturación al cliente.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={periodoId} onValueChange={setPeriodoId}>
            <SelectTrigger className="w-[11rem]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              {periodosCertificacion.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  Cert. Nº {p.numero} — {p.etiqueta}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="button" variant="outline" onClick={imprimirCertificacion}>
            <Printer className="size-4" />
            Imprimir planilla
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          kpi={{
            etiqueta: "Monto del periodo",
            valor: formatearUsd(resumen.montoPeriodo),
            detalle: `${resumen.periodo.etiqueta} · Cert. Nº ${resumen.periodo.numero}`,
            tendencia: "positiva",
          }}
        />
        <KpiCard
          kpi={{
            etiqueta: "Monto acumulado",
            valor: formatearUsd(resumen.montoAcumulado),
            detalle: `${resumen.porcentajeAcumulado.toFixed(1)} % del contrato`,
            tendencia: "neutral",
          }}
        />
        <KpiCard
          kpi={{
            etiqueta: "Rubros en periodo",
            valor: String(resumen.rubrosConAvancePeriodo),
            detalle: `${resumen.lineas.length} rubros con avance acumulado`,
            tendencia: "positiva",
          }}
        />
        <KpiCard
          kpi={{
            etiqueta: "Monto contractual",
            valor: formatearUsd(resumen.montoContrato),
            detalle: `Saldo: ${formatearUsd(resumen.montoContrato - resumen.montoAcumulado)}`,
            tendencia: "neutral",
          }}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)]">
        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ClipboardCheck className="size-4" />
              Planilla de avance — {resumen.periodo.etiqueta}
            </CardTitle>
            <CardDescription>
              Cantidades del periodo y acumulados por rubro · {obra.numeroContrato}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[32rem] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30 hover:bg-muted/30">
                    <TableHead className="w-10 pl-4">Nº</TableHead>
                    <TableHead className="min-w-[12rem]">Detalle</TableHead>
                    <TableHead className="w-14 text-center">Unid.</TableHead>
                    <TableHead className="w-20 text-right">Contrat.</TableHead>
                    <TableHead className="w-20 text-right">Anterior</TableHead>
                    <TableHead className="w-20 text-right">Periodo</TableHead>
                    <TableHead className="w-20 text-right">Acum.</TableHead>
                    <TableHead className="w-24 text-right">Monto per.</TableHead>
                    <TableHead className="w-24 pr-4 text-right">Monto ac.</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {resumen.lineas.map((l) => (
                    <TableRow key={l.rubroId} className="border-foreground/10">
                      <TableCell className="pl-4 font-mono text-sm tabular-nums">
                        {l.rubroId}
                      </TableCell>
                      <TableCell className="max-w-[14rem] whitespace-normal">
                        <p className="text-sm leading-snug">{l.detalle}</p>
                      </TableCell>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {l.unidad}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums">
                        {formatearCantidad(l.cantidadContratada)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-xs tabular-nums text-muted-foreground">
                        {formatearCantidad(l.cantidadAnterior)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium tabular-nums text-sky-700 dark:text-sky-300">
                        {formatearCantidad(l.cantidadPeriodo)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">
                        {formatearCantidad(l.cantidadAcumulada)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">
                        {formatearUsd(l.montoPeriodo)}
                      </TableCell>
                      <TableCell className="pr-4 text-right font-mono text-sm font-medium tabular-nums">
                        {formatearUsd(l.montoAcumulado)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted/40 font-semibold hover:bg-muted/40">
                    <TableCell colSpan={7} className="pl-4 text-right">
                      Totales {resumen.periodo.etiqueta}
                    </TableCell>
                    <TableCell className="text-right font-mono tabular-nums">
                      {formatearUsd(resumen.montoPeriodo)}
                    </TableCell>
                    <TableCell className="pr-4 text-right font-mono tabular-nums">
                      {formatearUsd(resumen.montoAcumulado)}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="size-4" />
              Vista previa para fiscalización
            </CardTitle>
            <CardDescription>
              Documento generado automáticamente desde metrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="max-h-[32rem] overflow-auto rounded-lg border border-foreground/10 bg-muted/30 p-4 font-mono text-xs leading-relaxed whitespace-pre-wrap">
              {textoCertificacion}
            </pre>
          </CardContent>
        </Card>
      </div>

      <p className="text-xs text-muted-foreground">
        Las cantidades se calculan en tiempo real desde los metrados compartidos. Al
        registrar un metrado en un mes nuevo, aparecerá automáticamente un periodo de
        certificación adicional.
      </p>
    </div>
  )
}
