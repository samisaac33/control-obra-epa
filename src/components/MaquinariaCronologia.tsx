"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MaquinariaRegistroBadge } from "@/src/components/MaquinariaRegistroBadge"
import { ACCIONISTA_META, REGISTRO_MAQUINARIA } from "@/src/data/registro-maquinaria"
import { conteoRegistrosPorAccionista, formatearFechaCorta } from "@/src/lib/maquinaria-resumen"
import { cn } from "@/lib/utils"

export function MaquinariaCronologia() {
  return (
    <Accordion type="multiple" className="space-y-2">
      {REGISTRO_MAQUINARIA.map((dia) => {
        const conteo = conteoRegistrosPorAccionista(dia)
        const resumenConteo = [
          conteo.consorcio > 0 ? `${conteo.consorcio} ${ACCIONISTA_META.consorcio.label}` : null,
          conteo.mauricio > 0 ? `${conteo.mauricio} ${ACCIONISTA_META.mauricio.label}` : null,
        ]
          .filter(Boolean)
          .join(" · ")

        return (
          <AccordionItem
            key={dia.fecha}
            value={dia.fecha}
            className={cn(
              "rounded-xl border px-4",
              dia.trabajado ? "border-foreground/10" : "border-dashed border-muted-foreground/30 bg-muted/20"
            )}
          >
            <AccordionTrigger className="py-3 text-left hover:no-underline">
              <div className="flex min-w-0 flex-1 flex-col gap-1 pr-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <span className="text-base font-semibold">
                    {dia.diaSemana} {formatearFechaCorta(dia.fecha)}
                  </span>
                  {!dia.trabajado ? (
                    <span className="ml-2 text-sm font-normal text-muted-foreground">Sin actividad</span>
                  ) : null}
                </div>
                {dia.trabajado && resumenConteo ? (
                  <span className="text-xs text-muted-foreground sm:text-sm">{resumenConteo}</span>
                ) : null}
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-4">
              {!dia.trabajado ? (
                <p className="text-sm text-muted-foreground">No se registró trabajo en obra este día.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {dia.registros.map((registro, index) => (
                    <MaquinariaRegistroBadge key={`${dia.fecha}-${index}`} registro={registro} />
                  ))}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
