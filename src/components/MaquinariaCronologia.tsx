"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { MaquinariaRegistroBadge } from "@/src/components/MaquinariaRegistroBadge"
import { ACCIONISTA_META, FRENTE_META } from "@/src/data/registro-maquinaria"
import { useRegistroMaquinariaProyecto } from "@/src/hooks/use-registro-maquinaria-proyecto"
import { conteoRegistrosPorAccionista, formatearFechaCorta, frentesDelDia } from "@/src/lib/maquinaria-resumen"
import { cn } from "@/lib/utils"

export function MaquinariaCronologia() {
  const { registros } = useRegistroMaquinariaProyecto()

  if (registros.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay registros de maquinaria para este proyecto.
      </p>
    )
  }

  return (
    <Accordion type="multiple" className="space-y-2">
      {registros.map((dia) => {
        const conteo = conteoRegistrosPorAccionista(dia)
        const frentes = frentesDelDia(dia)
        const resumenConteo = [
          conteo.consorcio > 0 ? `${conteo.consorcio} ${ACCIONISTA_META.consorcio.label}` : null,
          conteo.mauricio > 0 ? `${conteo.mauricio} ${ACCIONISTA_META.mauricio.label}` : null,
        ]
          .filter(Boolean)
          .join(" · ")
        const resumenFrentes = frentes
          .map((frente) => FRENTE_META[frente].label)
          .join(" · ")

        return (
          <AccordionItem
            key={dia.fecha}
            value={dia.fecha}
            className="rounded-xl border border-foreground/10 px-3"
          >
            <AccordionTrigger className="py-3 hover:no-underline">
              <div className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <div>
                  <p className="font-medium">
                    {formatearFechaCorta(dia.fecha)} — {dia.diaSemana}
                  </p>
                  {resumenFrentes ? (
                    <p className="text-xs text-muted-foreground">{resumenFrentes}</p>
                  ) : null}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    dia.trabajado ? "text-emerald-700" : "text-muted-foreground"
                  )}
                >
                  {dia.trabajado ? resumenConteo || "Con actividad" : "Sin trabajo"}
                </span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pb-3">
              {dia.trabajado ? (
                <ul className="space-y-2">
                  {dia.registros.map((registro, index) => (
                    <li key={`${dia.fecha}-${index}`}>
                      <MaquinariaRegistroBadge registro={registro} />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted-foreground">Día sin registro de equipos.</p>
              )}
            </AccordionContent>
          </AccordionItem>
        )
      })}
    </Accordion>
  )
}
