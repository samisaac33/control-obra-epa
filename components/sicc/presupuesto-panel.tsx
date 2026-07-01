"use client"

import { useMemo, useState } from "react"
import { AlertTriangle, Calculator, Search, TrendingDown, TrendingUp } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
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
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { CurvaSChart } from "@/components/sicc/curva-s-chart"
import { EstadoModuloBadge } from "@/components/sicc/estado-modulo-badge"
import { KpiCard } from "@/components/sicc/kpi-card"
import { useSiccData } from "@/components/sicc/sicc-data-provider"
import { presupuestoData } from "@/data/presupuesto"
import { formatearCantidad, formatearUsd } from "@/lib/sicc/format"
import {
  calcularDesviacionesRubro,
  FACTOR_PE_DEMO,
  rubrosConDesviacionSignificativa,
} from "@/lib/sicc/presupuesto-sicc"
import type { EstadoAvanceRubro } from "@/lib/sicc/types"
import { cn } from "@/lib/utils"

const ESTADO_ETIQUETAS: Record<EstadoAvanceRubro, string> = {
  sin_inicio: "Sin inicio",
  en_ejecucion: "En ejecución",
  completado: "Completado",
  sobre_ejecucion: "Sobre ejecución",
}

export function PresupuestoPanel() {
  const { obra, resumenesMetrados, resumenPresupuesto, curvaS } = useSiccData()
  const [busqueda, setBusqueda] = useState("")
  const [vistaTabla, setVistaTabla] = useState<"desviaciones" | "rubros">("desviaciones")

  const resumenes = resumenesMetrados
  const resumen = resumenPresupuesto

  const desviaciones = useMemo(
    () => calcularDesviacionesRubro(resumenes, resumen.avanceProgramado),
    [resumenes, resumen.avanceProgramado]
  )

  const alertas = useMemo(
    () => rubrosConDesviacionSignificativa(desviaciones),
    [desviaciones]
  )

  const rubrosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase()
    const lista = vistaTabla === "desviaciones" ? desviaciones : resumenes
    if (!termino) return lista
    return lista.filter(
      (r) =>
        r.detalle.toLowerCase().includes(termino) ||
        r.categoria.toLowerCase().includes(termino) ||
        String(r.rubroId).includes(termino)
    )
  }, [busqueda, vistaTabla, desviaciones, resumenes])

  const desviacionTendencia =
    resumen.desviacionFisicoFinanciero >= 0 ? "positiva" : "negativa"

  return (
    <div className="space-y-6">
      <div>
        <div className="mb-2">
          <EstadoModuloBadge estado="activo" />
        </div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          Presupuesto y costos
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Control económico del contrato con curva S, presupuesto de ejecución y
          desviaciones por rubro. Los montos ejecutados provienen de los metrados
          registrados en campo.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          kpi={{
            etiqueta: "Monto contractual",
            valor: formatearUsd(resumen.montoContrato),
            detalle: `${presupuestoData.length} rubros · ${obra.numeroContrato}`,
            tendencia: "neutral",
          }}
        />
        <KpiCard
          kpi={{
            etiqueta: "Monto ejecutado",
            valor: formatearUsd(resumen.montoEjecutado),
            detalle: `${resumen.avanceFinanciero.toFixed(1)} % del contrato`,
            tendencia: "positiva",
          }}
        />
        <KpiCard
          kpi={{
            etiqueta: "Avance físico",
            valor: `${resumen.avanceFisico.toFixed(1)}%`,
            detalle: `Programado: ${resumen.avanceProgramado.toFixed(1)}%`,
            tendencia:
              resumen.desviacionVsProgramado >= 0 ? "positiva" : "negativa",
          }}
        />
        <KpiCard
          kpi={{
            etiqueta: "Desv. físico − financiero",
            valor: `${resumen.desviacionFisicoFinanciero >= 0 ? "+" : ""}${resumen.desviacionFisicoFinanciero.toFixed(1)} pp`,
            detalle: "Diferencia entre curvas",
            tendencia: desviacionTendencia,
          }}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,0.9fr)]">
        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Calculator className="size-4" />
              Curva S
            </CardTitle>
            <CardDescription>
              Avance programado vs. físico y financiero acumulado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CurvaSChart datos={curvaS} />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-foreground/10">
            <CardHeader>
              <CardTitle className="text-base">Presupuesto de ejecución (PE)</CardTitle>
              <CardDescription>
                Estimación interna al {(FACTOR_PE_DEMO * 100).toFixed(0)} % del monto
                contractual (demo)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  PE estimado
                </p>
                <p className="mt-1 font-mono text-2xl font-semibold tabular-nums">
                  {formatearUsd(resumen.presupuestoEjecucion)}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Margen contractual estimado
                </p>
                <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-emerald-700 dark:text-emerald-400">
                  {formatearUsd(resumen.margenEstimado)}
                </p>
              </div>
              <div className="rounded-lg border border-foreground/10 bg-muted/20 px-3 py-2 text-sm text-muted-foreground">
                Saldo por ejecutar:{" "}
                <span className="font-mono font-medium text-foreground">
                  {formatearUsd(resumen.montoSaldo)}
                </span>
              </div>
            </CardContent>
          </Card>

          {alertas.length > 0 ? (
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="size-4" />
                  Alertas de desviación
                </CardTitle>
                <CardDescription>
                  Rubros con desviación significativa respecto al avance programado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {alertas.slice(0, 4).map((d) => (
                  <div
                    key={d.rubroId}
                    className="flex items-start justify-between gap-2 rounded-lg border border-amber-500/20 bg-background/80 px-3 py-2 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="font-mono text-xs text-muted-foreground">
                        #{d.rubroId}
                      </p>
                      <p className="line-clamp-2 leading-snug">{d.detalle}</p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 font-mono text-xs font-medium tabular-nums",
                        d.desviacionUsd >= 0
                          ? "text-amber-700 dark:text-amber-300"
                          : "text-sky-700 dark:text-sky-300"
                      )}
                    >
                      {d.desviacionUsd >= 0 ? "+" : ""}
                      {formatearUsd(d.desviacionUsd)}
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>

      <Card className="border-foreground/10">
        <CardHeader className="gap-4 border-b border-foreground/10 bg-muted/20 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <CardTitle className="text-base">Desglose por rubro</CardTitle>
            <CardDescription>
              Montos contractuales, ejecutados y desviación vs. programado
            </CardDescription>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[18rem]">
            <div className="relative">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                placeholder="Buscar rubro…"
                className="pl-8"
              />
            </div>
            <Select
              value={vistaTabla}
              onValueChange={(v) => setVistaTabla(v as "desviaciones" | "rubros")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desviaciones">Ordenado por desviación</SelectItem>
                <SelectItem value="rubros">Orden contractual (Nº)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="max-h-[28rem] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30">
                  <TableHead className="w-12 pl-4">Nº</TableHead>
                  <TableHead className="min-w-[14rem]">Detalle</TableHead>
                  <TableHead className="w-28 text-right">Contrato</TableHead>
                  <TableHead className="w-28 text-right">Ejecutado</TableHead>
                  <TableHead className="w-20 text-right">Avance</TableHead>
                  {vistaTabla === "desviaciones" ? (
                    <TableHead className="w-28 text-right">Desviación</TableHead>
                  ) : null}
                  <TableHead className="w-28 pr-4">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rubrosFiltrados.map((r) => {
                  const desviacion =
                    "desviacionUsd" in r ? r.desviacionUsd : undefined
                  return (
                    <TableRow key={r.rubroId} className="border-foreground/10">
                      <TableCell className="pl-4 font-mono text-sm tabular-nums">
                        {r.rubroId}
                      </TableCell>
                      <TableCell className="max-w-[16rem] whitespace-normal">
                        <p className="text-sm leading-snug">{r.detalle}</p>
                        <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
                          {r.categoria}
                        </p>
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums">
                        {formatearUsd(r.subtotalContratado)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium tabular-nums">
                        {formatearUsd(r.subtotalEjecutado)}
                      </TableCell>
                      <TableCell className="text-right font-mono text-sm tabular-nums text-muted-foreground">
                        {r.avancePorcentaje.toFixed(1)}%
                      </TableCell>
                      {vistaTabla === "desviaciones" && desviacion !== undefined ? (
                        <TableCell className="text-right">
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 font-mono text-sm tabular-nums",
                              desviacion > 0 && "text-amber-700 dark:text-amber-300",
                              desviacion < 0 && "text-sky-700 dark:text-sky-300",
                              desviacion === 0 && "text-muted-foreground"
                            )}
                          >
                            {desviacion > 0 ? (
                              <TrendingUp className="size-3.5" />
                            ) : desviacion < 0 ? (
                              <TrendingDown className="size-3.5" />
                            ) : null}
                            {desviacion >= 0 ? "+" : ""}
                            {formatearUsd(desviacion)}
                          </span>
                        </TableCell>
                      ) : null}
                      <TableCell className="pr-4">
                        <Badge variant="outline" className="font-normal">
                          {ESTADO_ETIQUETAS[r.estado]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
          {rubrosFiltrados.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No hay rubros que coincidan con la búsqueda.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground">
        Los montos ejecutados se calculan en tiempo real desde los metrados compartidos
        del SICC. Registre un metrado en el módulo{" "}
        <strong className="font-medium text-foreground">Metrados</strong> y vuelva aquí
        para ver la curva S y las desviaciones actualizadas.
      </p>
    </div>
  )
}
