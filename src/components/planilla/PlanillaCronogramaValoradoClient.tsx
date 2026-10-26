"use client"

import Link from "next/link"
import { ArrowLeft, Download, FileText, Printer } from "lucide-react"
import { Fragment, useMemo } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { presupuestoRubrosPorProyecto } from "@/src/data/planilla/presupuesto-por-proyecto"
import type { ProyectoPlanillaConfig } from "@/src/data/planilla/types"
import {
  calcularCronogramaValoradoVigente,
  CRONOGRAMA_VALORADO_FIRMADO_PUBLIC_PATH,
} from "@/src/lib/planilla-cronograma-valorado-vigente"
import {
  formatearNumeroCronograma,
  formatearUsdCronograma,
} from "@/src/lib/planilla-cronograma-valorado-formato"
import { useProyecto } from "@/src/contexts/ProyectoContext"
import { rutaObra } from "@/src/lib/rutas-proyecto"

type PlanillaCronogramaValoradoClientProps = {
  config: ProyectoPlanillaConfig
}

export function PlanillaCronogramaValoradoClient({ config }: PlanillaCronogramaValoradoClientProps) {
  const { proyectoId } = useProyecto()
  const rubros = useMemo(() => presupuestoRubrosPorProyecto(proyectoId), [proyectoId])
  const cronograma = useMemo(
    () => calcularCronogramaValoradoVigente(rubros, config),
    [rubros, config]
  )

  const pdfHref = rutaObra(proyectoId, "planillas/cronograma-valorado-vigente/pdf")

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 p-4 print:max-w-none print:p-2 sm:p-6">
      <div className="flex flex-col gap-3 print:hidden sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-3">
          <Link
            href={rutaObra(proyectoId, "planillas/1")}
            className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/50"
            aria-label="Volver a planilla"
          >
            <ArrowLeft className="size-4" aria-hidden />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Cronograma valorado de trabajos vigente</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Oferta adjudicada VAE — reparto por planillas 1 y 2 (sin IVA).
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={() => window.print()}>
            <Printer className="size-4" aria-hidden />
            Imprimir
          </Button>
          <Button type="button" variant="default" asChild>
            <a href={pdfHref} target="_blank" rel="noopener noreferrer">
              <FileText className="size-4" aria-hidden />
              Generar PDF
            </a>
          </Button>
          <Button type="button" variant="secondary" asChild>
            <a href={CRONOGRAMA_VALORADO_FIRMADO_PUBLIC_PATH} download>
              <Download className="size-4" aria-hidden />
              PDF firmado (contrato)
            </a>
          </Button>
        </div>
      </div>

      <Card className="cronograma-valorado-doc border-foreground/10 print:border-0 print:shadow-none">
        <CardHeader className="pb-2 text-center print:pb-1">
          <CardTitle className="text-base font-bold uppercase tracking-wide">
            {cronograma.titulo}
          </CardTitle>
          <CardDescription className="text-xs font-semibold uppercase text-foreground">
            {cronograma.objeto}
          </CardDescription>
          <p className="text-xs text-muted-foreground print:text-foreground">
            <span className="font-semibold uppercase">Nombre del oferente:</span> {cronograma.oferente}
          </p>
        </CardHeader>
        <CardContent className="overflow-x-auto px-2 sm:px-6">
          <Table className="min-w-[880px] border-collapse text-[11px]">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-8 border border-foreground/20 px-1 text-center" rowSpan={2}>
                  Item N°
                </TableHead>
                <TableHead className="h-8 border border-foreground/20 px-1" rowSpan={2}>
                  Descripción
                </TableHead>
                <TableHead className="h-8 border border-foreground/20 px-1 text-center" rowSpan={2}>
                  Unidad
                </TableHead>
                <TableHead className="h-8 border border-foreground/20 px-1 text-center" rowSpan={2}>
                  Cantidad
                </TableHead>
                <TableHead className="h-8 border border-foreground/20 px-1 text-center" rowSpan={2}>
                  P. Unit.
                </TableHead>
                <TableHead className="h-8 border border-foreground/20 px-1 text-center" rowSpan={2}>
                  P. Total
                </TableHead>
                <TableHead
                  className="h-8 border border-foreground/20 px-1 text-center"
                  colSpan={2}
                >
                  Periodos
                </TableHead>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-7 border border-foreground/20 px-1 text-center">1</TableHead>
                <TableHead className="h-7 border border-foreground/20 px-1 text-center">2</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cronograma.secciones.map((sec) => (
                <Fragment key={`sec-${sec.numero}`}>
                  <TableRow className="bg-muted/40 font-semibold hover:bg-muted/40">
                    <TableCell className="border border-foreground/20 px-1">{sec.numero}</TableCell>
                    <TableCell className="border border-foreground/20 px-1 uppercase" colSpan={4}>
                      {sec.titulo}
                    </TableCell>
                    <TableCell className="border border-foreground/20 px-1 text-right">
                      {formatearNumeroCronograma(sec.montoTotalSeccion)}
                    </TableCell>
                    <TableCell className="border border-foreground/20 px-1" colSpan={2} />
                  </TableRow>
                  {sec.filas.map((f) => (
                    <TableRow key={f.rubroId} className="hover:bg-transparent">
                      <TableCell className="border border-foreground/20 px-1">{f.codigoItem}</TableCell>
                      <TableCell className="border border-foreground/20 px-1">{f.descripcion}</TableCell>
                      <TableCell className="border border-foreground/20 px-1 text-center">{f.unidad}</TableCell>
                      <TableCell className="border border-foreground/20 px-1 text-right">
                        {formatearNumeroCronograma(f.cantidadContrato)}
                      </TableCell>
                      <TableCell className="border border-foreground/20 px-1 text-right">
                        {formatearNumeroCronograma(f.precioUnitario)}
                      </TableCell>
                      <TableCell className="border border-foreground/20 px-1 text-right">
                        {formatearNumeroCronograma(f.montoTotalRubro)}
                      </TableCell>
                      <TableCell className="border border-foreground/20 px-1 text-right">
                        {formatearNumeroCronograma(f.cantidadPeriodo1)}
                      </TableCell>
                      <TableCell className="border border-foreground/20 px-1 text-right">
                        {formatearNumeroCronograma(f.cantidadPeriodo2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </Fragment>
              ))}
              <TableRow className="font-bold hover:bg-transparent">
                <TableCell className="border border-foreground/20 px-1" colSpan={5}>
                  TOTAL:
                </TableCell>
                <TableCell className="border border-foreground/20 px-1 text-right">
                  {formatearUsdCronograma(cronograma.montoTotalContrato)}
                </TableCell>
                <TableCell className="border border-foreground/20 px-1" colSpan={2} />
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell className="border border-foreground/20 px-1 font-semibold" colSpan={5}>
                  INVERSIÓN MENSUAL
                </TableCell>
                <TableCell className="border border-foreground/20 px-1" />
                <TableCell className="border border-foreground/20 px-1 text-right">
                  {formatearNumeroCronograma(cronograma.inversionPeriodo1)}
                </TableCell>
                <TableCell className="border border-foreground/20 px-1 text-right">
                  {formatearNumeroCronograma(cronograma.inversionPeriodo2)}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell className="border border-foreground/20 px-1 font-semibold" colSpan={5}>
                  AVANCE PARCIAL EN %
                </TableCell>
                <TableCell className="border border-foreground/20 px-1" />
                <TableCell className="border border-foreground/20 px-1 text-right">
                  {formatearNumeroCronograma(cronograma.avanceParcialPct1, 2)}
                </TableCell>
                <TableCell className="border border-foreground/20 px-1 text-right">
                  {formatearNumeroCronograma(cronograma.avanceParcialPct2, 2)}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell className="border border-foreground/20 px-1 font-semibold" colSpan={5}>
                  INVERSIÓN ACUMULADA
                </TableCell>
                <TableCell className="border border-foreground/20 px-1" />
                <TableCell className="border border-foreground/20 px-1 text-right">
                  {formatearNumeroCronograma(cronograma.inversionAcumulada1)}
                </TableCell>
                <TableCell className="border border-foreground/20 px-1 text-right">
                  {formatearNumeroCronograma(cronograma.inversionAcumulada2)}
                </TableCell>
              </TableRow>
              <TableRow className="hover:bg-transparent">
                <TableCell className="border border-foreground/20 px-1 font-semibold" colSpan={5}>
                  AVANCE ACUMULADO EN %
                </TableCell>
                <TableCell className="border border-foreground/20 px-1" />
                <TableCell className="border border-foreground/20 px-1 text-right">
                  {formatearNumeroCronograma(cronograma.avanceAcumuladoPct1, 2)}
                </TableCell>
                <TableCell className="border border-foreground/20 px-1 text-right">
                  {formatearNumeroCronograma(cronograma.avanceAcumuladoPct2, 2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <p className="mt-3 text-[10px] text-muted-foreground print:text-foreground">
            Periodo 1: {cronograma.periodos[0]?.fecha_inicio} — {cronograma.periodos[0]?.fecha_fin}. Periodo
            2: {cronograma.periodos[1]?.fecha_inicio} — {cronograma.periodos[1]?.fecha_fin}. Monto oferta
            referencial sin IVA: {formatearUsdCronograma(cronograma.montoDeclaradoOferta)}.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
