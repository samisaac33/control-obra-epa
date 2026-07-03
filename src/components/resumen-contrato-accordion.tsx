"use client"

import * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

type ResumenContratoAccordionProps = {
  montoTotal: number
  cantidadRubros: number
  resumen: {
    nombreObra: string
    numeroContrato: string
    cliente: string
  }
  className?: string
} & React.ComponentProps<"div">

export function ResumenContratoAccordion({
  montoTotal,
  cantidadRubros,
  resumen,
  className,
  ...divProps
}: ResumenContratoAccordionProps) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-foreground/10 bg-card/95 shadow-sm ring-1 ring-foreground/10",
        className
      )}
      {...divProps}
    >
      <Accordion
        type="single"
        collapsible
        className="w-full"
      >
        <AccordionItem
          value="resumen"
          className="!border-0"
        >
          <AccordionTrigger
            className={cn(
              "w-full flex-col! items-stretch! gap-3! px-4! py-4! sm:flex-row! sm:items-start! sm:gap-4! sm:px-6! sm:py-5!",
              "rounded-none border-0! bg-muted/30 hover:no-underline"
            )}
          >
            <div className="min-w-0 flex-1 text-left">
              <h2 className="font-heading text-base font-medium text-foreground sm:text-lg">
                Resumen del contrato
              </h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Datos de convenio, alcance y cantidad de partidas
              </p>
            </div>
            <div
              className="hidden w-full shrink-0 rounded-lg border border-dashed border-foreground/15 bg-muted/30 px-3 py-3 text-center sm:ml-auto sm:block sm:w-auto sm:min-w-[12rem] sm:text-right"
            >
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Monto total del contrato
              </p>
              <p
                className="mt-1 font-mono text-xl font-semibold leading-none tabular-nums text-foreground sm:text-2xl"
                id="monto-total-contrato"
              >
                {usd.format(montoTotal)}
              </p>
            </div>
          </AccordionTrigger>
          <AccordionContent className="border-t border-foreground/10 bg-card !pb-0">
            <div className="px-4 py-4 sm:px-6 sm:py-5">
              <div className="mb-4 rounded-lg border border-dashed border-foreground/15 bg-muted/30 px-3 py-3 text-center sm:hidden">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  Monto total del contrato
                </p>
                <p className="mt-1 font-mono text-xl font-semibold leading-none tabular-nums text-foreground">
                  {usd.format(montoTotal)}
                </p>
              </div>
              <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-lg border border-foreground/10 bg-background/50 px-3 py-2.5">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Obra</dt>
                  <dd className="mt-1 text-sm font-medium leading-snug text-foreground">
                    {resumen.nombreObra}
                  </dd>
                </div>
                <div className="rounded-lg border border-foreground/10 bg-background/50 px-3 py-2.5">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Contrato</dt>
                  <dd className="mt-1 font-mono text-sm text-foreground">{resumen.numeroContrato}</dd>
                </div>
                <div className="rounded-lg border border-foreground/10 bg-background/50 px-3 py-2.5">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Cliente</dt>
                  <dd className="mt-1 text-sm text-foreground">{resumen.cliente}</dd>
                </div>
                <div className="rounded-lg border border-foreground/10 bg-primary/5 px-3 py-2.5 ring-1 ring-foreground/5">
                  <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Partidas</dt>
                  <dd className="mt-1 font-mono text-sm tabular-nums text-foreground">{cantidadRubros}</dd>
                </div>
              </dl>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <p
        className="sr-only"
        aria-live="polite"
      >{`Total: ${usd.format(montoTotal)}`}</p>
    </div>
  )
}
