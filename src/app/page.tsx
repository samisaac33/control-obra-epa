import { ClipboardList } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  montoTotalContrato,
  presupuestoData,
  subtotalRubro,
} from "@/data/presupuesto"
import { cn } from "@/lib/utils"

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

function formatearCantidad(value: number): string {
  return value.toLocaleString("es-AR", {
    maximumFractionDigits: 4,
    minimumFractionDigits: 0,
  })
}

const RESUMEN_CONTRATO = {
  nombreObra: "Obra civil — Sistema de bombeo Severino",
  numeroContrato: "CTO-2026-EP-0142",
  cliente: "Ente Público de Agua (simulado)",
} as const

export default function Home() {
  const presupuesto = presupuestoData
  const total = montoTotalContrato(presupuesto)
  const cantidadRubros = presupuesto.length

  return (
    <div className="min-h-dvh flex flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div className="flex items-start gap-3 min-w-0">
              <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
                <ClipboardList className="size-4" strokeWidth={1.75} aria-hidden />
              </div>
              <div className="min-w-0">
                <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                  Control de obra
                </h1>
                <p className="text-sm text-muted-foreground">
                  Presupuesto de obra — Desglose por rubro
                </p>
              </div>
            </div>
            <div
              className="rounded-lg border border-dashed border-foreground/15 bg-muted/30 px-4 py-3 text-right sm:min-w-[16rem] sm:shrink-0"
              role="region"
              aria-label="Monto total del contrato"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Monto total del contrato
              </p>
              <p
                className="mt-1 font-mono text-2xl font-semibold leading-none tabular-nums text-foreground sm:text-2xl"
                id="monto-total-contrato"
              >
                {usd.format(total)}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col space-y-6 overflow-hidden px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <Card
          className="shrink-0 border-foreground/10 bg-card/95 ring-1 ring-foreground/10 shadow-sm"
          data-testid="resumen-contrato"
        >
          <CardHeader className="border-b border-foreground/10 bg-muted/30 pb-4">
            <CardTitle className="text-base sm:text-lg">Resumen del contrato</CardTitle>
            <CardDescription>
              Datos de convenio, alcance y cantidad de partidas
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-lg border border-foreground/10 bg-background/50 px-3 py-2.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Obra
                </dt>
                <dd className="mt-1 text-sm font-medium leading-snug text-foreground">
                  {RESUMEN_CONTRATO.nombreObra}
                </dd>
              </div>
              <div className="rounded-lg border border-foreground/10 bg-background/50 px-3 py-2.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Contrato
                </dt>
                <dd className="mt-1 font-mono text-sm text-foreground">
                  {RESUMEN_CONTRATO.numeroContrato}
                </dd>
              </div>
              <div className="rounded-lg border border-foreground/10 bg-background/50 px-3 py-2.5">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Cliente
                </dt>
                <dd className="mt-1 text-sm text-foreground">{RESUMEN_CONTRATO.cliente}</dd>
              </div>
              <div className="rounded-lg border border-foreground/10 bg-primary/5 px-3 py-2.5 ring-1 ring-foreground/5">
                <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Partidas
                </dt>
                <dd className="mt-1 font-mono text-sm tabular-nums text-foreground">
                  {cantidadRubros}
                </dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-muted-foreground">
              El monto total del encabezado se calcula en tiempo real: suma de (cantidad ×
              precio unitario) de {cantidadRubros} partidas, en dólares estadounidenses (USD).
            </p>
            <p
              className="sr-only"
              aria-live="polite"
            >{`Total actualizado: ${usd.format(total)}`}</p>
          </CardContent>
        </Card>

        <section
          className="flex min-h-0 min-w-0 flex-1 flex-col"
          aria-labelledby="tabla-rubros-title"
        >
          <h2
            id="tabla-rubros-title"
            className="sr-only"
          >
            Presupuesto por rubro
          </h2>
          <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-foreground/10 bg-card/95 ring-1 ring-foreground/10 shadow-sm">
            <CardHeader className="shrink-0 border-b border-foreground/10 bg-muted/20 pb-4">
              <CardTitle className="text-base sm:text-lg">Desglose por rubro</CardTitle>
              <CardDescription>
                Categoría, unidad, cantidad y precio unitario (USD)
              </CardDescription>
            </CardHeader>
            <div
              className="min-h-0 min-w-0 flex-1 overflow-hidden"
              data-slot="table-scroll-outer"
            >
              <div
                className="max-h-[calc(100dvh-22rem)] min-h-[12rem] w-full min-w-0 overflow-auto [scrollbar-gutter:stable] sm:max-h-[min(100dvh-20rem,720px)]"
                tabIndex={0}
                role="group"
                aria-label="Tabla de rubros, desplazable vertical y horizontal"
              >
                <Table containerClassName="min-w-0 overflow-visible">
                  <TableHeader>
                    <TableRow
                      className="border-foreground/10 bg-muted/30 hover:bg-transparent"
                    >
                      <TableHead
                        className="sticky top-0 z-20 w-12 border-b border-border/80 bg-muted/95 py-2 pl-4 text-left text-foreground font-semibold backdrop-blur supports-[backdrop-filter]:bg-muted/80"
                      >
                        Nº
                      </TableHead>
                      <TableHead
                        className="sticky top-0 z-20 min-w-[14rem] border-b border-border/80 bg-muted/95 font-semibold text-foreground backdrop-blur supports-[backdrop-filter]:bg-muted/80"
                      >
                        Detalle
                      </TableHead>
                      <TableHead
                        className="sticky top-0 z-20 w-20 border-b border-border/80 bg-muted/95 text-center font-semibold text-foreground backdrop-blur supports-[backdrop-filter]:bg-muted/80"
                      >
                        Unid.
                      </TableHead>
                      <TableHead
                        className="sticky top-0 z-20 w-24 border-b border-border/80 bg-muted/95 text-right font-semibold text-foreground backdrop-blur supports-[backdrop-filter]:bg-muted/80"
                      >
                        Cant.
                      </TableHead>
                      <TableHead
                        className="sticky top-0 z-20 w-32 border-b border-border/80 bg-muted/95 text-right font-semibold text-foreground backdrop-blur supports-[backdrop-filter]:bg-muted/80"
                      >
                        P. unit. (US$)
                      </TableHead>
                      <TableHead
                        className="sticky top-0 z-20 w-32 border-b border-border/80 bg-muted/95 pr-4 text-right font-semibold text-foreground backdrop-blur supports-[backdrop-filter]:bg-muted/80"
                      >
                        Subtotal
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {presupuesto.map((r, i) => {
                      const sub = subtotalRubro(r)
                      return (
                        <TableRow
                          key={r.id}
                          className={cn(
                            "border-foreground/10",
                            i % 2 === 0 ? "bg-transparent" : "bg-muted/20"
                          )}
                        >
                          <TableCell className="align-top py-2.5 pl-4 font-mono text-sm tabular-nums text-foreground/90">
                            {r.id}
                          </TableCell>
                          <TableCell className="min-w-0 max-w-[32rem] align-top py-2.5 whitespace-normal">
                            <p className="text-sm text-foreground">{r.detalle}</p>
                            <div className="mt-1.5 max-w-2xl">
                              <Badge
                                variant="outline"
                                className="h-auto max-w-full w-fit min-w-0 border-foreground/10 bg-background/50 px-2 py-0.5 text-left font-normal leading-snug text-muted-foreground whitespace-normal hover:bg-background/50"
                                title={r.categoria}
                              >
                                {r.categoria}
                              </Badge>
                            </div>
                          </TableCell>
                          <TableCell className="align-top text-center font-mono text-sm text-muted-foreground">
                            {r.unidad}
                          </TableCell>
                          <TableCell className="align-top text-right font-mono text-sm tabular-nums text-foreground">
                            {formatearCantidad(r.cantidad)}
                          </TableCell>
                          <TableCell className="align-top text-right font-mono text-sm tabular-nums text-foreground/90">
                            {usd.format(r.precioUnitario)}
                          </TableCell>
                          <TableCell className="pr-4 align-top text-right font-mono text-sm font-medium tabular-nums text-foreground">
                            {usd.format(sub)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                  <TableFooter>
                    <TableRow className="border-foreground/15 bg-muted/40 font-semibold hover:bg-muted/40">
                      <TableCell
                        colSpan={5}
                        className="pl-4 text-right text-foreground"
                      >
                        Monto total del presupuesto
                      </TableCell>
                      <TableCell className="pr-4 text-right font-mono tabular-nums text-foreground">
                        {usd.format(total)}
                      </TableCell>
                    </TableRow>
                  </TableFooter>
                </Table>
              </div>
            </div>
          </Card>
        </section>
      </main>

      <footer className="shrink-0 border-t border-foreground/10 py-3 text-center text-xs text-muted-foreground">
        Control de obra — Datos de demostración
      </footer>
    </div>
  )
}
