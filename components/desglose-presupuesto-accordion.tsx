"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
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
  subtotalRubro,
  type GrupoPresupuestoPorCategoria,
  type Rubro,
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

type DesglosePresupuestoAccordionProps = {
  grupos: GrupoPresupuestoPorCategoria[]
  montoTotal: number
  className?: string
}

export function DesglosePresupuestoAccordion({
  grupos,
  montoTotal,
  className,
}: DesglosePresupuestoAccordionProps) {
  return (
    <div
      className={cn("flex w-full min-w-0 min-h-0 flex-1 flex-col", className)}
    >
      <div
        className="min-h-0 w-full min-w-0 max-h-[min(100dvh-18rem,720px)] flex-1 overflow-y-auto [scrollbar-gutter:stable] px-1"
        data-slot="desglose-accordion-scroll"
        role="region"
        aria-label="Desglose del presupuesto por categoría"
        tabIndex={-1}
      >
        <Accordion
          type="single"
          collapsible
          className="w-full min-w-0 space-y-2"
        >
          {grupos.map((g, i) => (
            <AccordionItem
              key={g.categoria}
              value={`cat-${i}`}
              className="overflow-hidden rounded-lg border border-foreground/10 bg-muted/5"
            >
              <AccordionTrigger
                className="items-center gap-3 py-3 pl-3 pr-3 hover:no-underline sm:pl-4 sm:pr-3"
                aria-label={`Categoría ${g.categoria}, ${g.rubros.length} partidas, subtotal ${usd.format(
                  g.subtotal
                )}`}
              >
                <div
                  className="min-w-0 flex-1 text-left sm:flex sm:items-baseline sm:justify-between sm:gap-4"
                >
                  <p className="line-clamp-2 text-left text-sm font-medium leading-snug text-foreground sm:line-clamp-3 sm:pr-2">
                    {g.categoria}
                  </p>
                  <div className="mt-1 flex shrink-0 items-center justify-start gap-2.5 min-w-0 sm:mt-0 sm:justify-end">
                    <Badge
                      variant="secondary"
                      className="font-mono text-[0.7rem] font-medium tabular-nums text-muted-foreground"
                    >
                      {g.rubros.length}{" "}
                      {g.rubros.length === 1 ? "partida" : "partidas"}
                    </Badge>
                    <span className="whitespace-nowrap text-right font-mono text-sm font-semibold tabular-nums text-foreground sm:text-sm">
                      {usd.format(g.subtotal)}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="!overflow-visible !pb-0 !pt-0 pr-0 pl-0">
                <div
                  className="w-full min-w-0 max-w-full overflow-x-auto border-t border-foreground/10 bg-card/30"
                >
                  <CategoriaTable rubros={g.rubros} />
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="mt-3 flex shrink-0 items-center justify-between border-t border-foreground/10 bg-muted/30 px-3 py-3 sm:px-4">
        <span className="text-sm font-semibold text-foreground">Monto total del presupuesto</span>
        <span
          className="font-mono text-base font-semibold tabular-nums text-foreground"
          data-slot="monto-total-pie"
        >
          {usd.format(montoTotal)}
        </span>
      </div>
    </div>
  )
}

function CategoriaTable({ rubros }: { rubros: Rubro[] }) {
  return (
    <Table
      className="text-sm"
      containerClassName="min-w-0 !overflow-x-auto !overflow-y-visible"
    >
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className="h-9 w-11 border-b border-foreground/10 pl-2 text-left sm:pl-3">Nº</TableHead>
          <TableHead className="h-9 min-w-[8rem] border-b border-foreground/10 sm:min-w-[12rem]">
            Detalle
          </TableHead>
          <TableHead className="h-9 w-14 border-b border-foreground/10 text-center sm:w-20">
            Unid.
          </TableHead>
          <TableHead className="h-9 w-20 border-b border-foreground/10 text-right">Cant.</TableHead>
          <TableHead className="h-9 w-28 border-b border-foreground/10 text-right sm:w-32">
            P. unit. (US$)
          </TableHead>
          <TableHead className="h-9 w-28 border-b border-foreground/10 pr-2 text-right sm:pr-3 sm:w-32">
            Subtotal
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rubros.map((r, j) => {
          const sub = subtotalRubro(r)
          return (
            <TableRow
              key={r.id}
              className={cn(
                "border-foreground/5",
                j % 2 === 0 ? "bg-transparent" : "bg-muted/15"
              )}
            >
              <TableCell className="pl-2 align-top font-mono text-sm tabular-nums text-foreground/90 sm:pl-3">
                {r.id}
              </TableCell>
              <TableCell className="max-w-[20rem] align-top whitespace-normal text-foreground sm:max-w-md">
                {r.detalle}
              </TableCell>
              <TableCell className="text-center font-mono text-sm text-muted-foreground">
                {r.unidad}
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums text-foreground">
                {formatearCantidad(r.cantidad)}
              </TableCell>
              <TableCell className="text-right font-mono text-sm tabular-nums text-foreground/90">
                {usd.format(r.precioUnitario)}
              </TableCell>
              <TableCell className="pr-2 align-top text-right font-mono text-sm font-medium tabular-nums text-foreground sm:pr-3">
                {usd.format(sub)}
              </TableCell>
            </TableRow>
          )
        })}
        <TableRow className="border-foreground/10 bg-muted/25 font-medium hover:bg-muted/25">
          <TableCell colSpan={5} className="pl-2 text-right sm:pl-3">
            Subtotal categoría
          </TableCell>
          <TableCell className="pr-2 text-right font-mono tabular-nums sm:pr-3">
            {usd.format(montoTotalContrato(rubros))}
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  )
}
