import { ClipboardList } from "lucide-react"

import { DesglosePresupuestoAccordion } from "@/components/desglose-presupuesto-accordion"
import { ResumenContratoAccordion } from "@/src/components/resumen-contrato-accordion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VINCULOS_PRESUPUESTO_INFRAESTRUCTURA } from "@/src/data/presupuesto-infraestructura"
import { RESUMEN_CONTRATO } from "@/src/data/proyecto"
import {
  montoTotalContrato,
  presupuestoAgrupadoPorCategoria,
  presupuestoData,
} from "@/data/presupuesto"

export default function PresupuestoPage() {
  const presupuesto = presupuestoData
  const total = montoTotalContrato(presupuesto)
  const cantidadRubros = presupuesto.length
  const grupos = presupuestoAgrupadoPorCategoria(presupuesto)

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
              <ClipboardList className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Presupuesto contractual
              </h1>
              <p className="text-sm text-muted-foreground">
                Desglose por rubro — vinculado a la infraestructura afectada del informe EPA
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col space-y-6 overflow-hidden px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <ResumenContratoAccordion
          montoTotal={total}
          cantidadRubros={cantidadRubros}
          resumen={RESUMEN_CONTRATO}
          className="shrink-0"
        />

        <Card className="shrink-0 border-foreground/10 bg-card/95 ring-1 ring-foreground/10 shadow-sm">
          <CardHeader className="border-b border-foreground/10 bg-muted/20 pb-4">
            <CardTitle className="text-base sm:text-lg">Relación con la infraestructura afectada</CardTitle>
            <CardDescription>
              Cada categoría del presupuesto responde a componentes del Sistema Trasvase Manabí descritos en
              el informe de afectación
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <ul className="space-y-3">
              {VINCULOS_PRESUPUESTO_INFRAESTRUCTURA.map((vinculo) => (
                <li
                  key={vinculo.categoria}
                  className="rounded-lg border border-foreground/10 bg-muted/20 px-3 py-2.5 text-sm"
                >
                  <p className="font-medium text-foreground">{vinculo.categoria}</p>
                  <p className="mt-0.5 text-muted-foreground">{vinculo.infraestructura}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <section className="flex min-h-0 min-w-0 flex-1 flex-col" aria-labelledby="tabla-rubros-title">
          <h2 id="tabla-rubros-title" className="sr-only">
            Presupuesto por rubro
          </h2>
          <Card className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden border-foreground/10 bg-card/95 ring-1 ring-foreground/10 shadow-sm">
            <CardHeader className="shrink-0 border-b border-foreground/10 bg-muted/20 pb-4">
              <CardTitle className="text-base sm:text-lg">Desglose por rubro</CardTitle>
              <CardDescription>
                Toca cada categoría para desplegar las partidas, importes (USD) y subtotal
              </CardDescription>
            </CardHeader>
            <CardContent className="min-h-0 min-w-0 flex-1 px-0 pt-0 pb-0">
              <DesglosePresupuestoAccordion className="px-3 pb-0 sm:px-4" grupos={grupos} montoTotal={total} />
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  )
}
