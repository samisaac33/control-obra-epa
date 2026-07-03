import Link from "next/link"
import { FileWarning } from "lucide-react"

import { AfectacionesResumen } from "@/src/components/AfectacionesResumen"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AFECTACIONES,
  AREA_INFLUENCIA,
  CLIMATOLOGIA,
  CONCLUSION,
  CRITERIOS_EMERGENCIA,
  GENERALIDADES,
  INFORME_META,
  JUSTIFICATIVO,
  MARCO_JURIDICO,
  OFICIOS_BENEFICIARIOS,
  PRESAS_DERIVADORAS,
  SISTEMA_TRASVASE,
  ZONAS_CANALES,
} from "@/src/data/informe-afectacion"
import { SECTORES_FOTOGRAFICOS } from "@/src/data/sectores-fotos"

export default function EmergenciaPage() {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col bg-[oklch(0.98_0.002_264)] text-foreground">
      <header className="shrink-0 border-b border-foreground/10 bg-card/80 shadow-sm ring-1 ring-foreground/5 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80 text-foreground/80">
              <FileWarning className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0">
              <h1 className="font-heading text-lg font-semibold tracking-tight text-foreground sm:text-xl">
                Informe de afectación
              </h1>
              <p className="text-sm text-muted-foreground">
                Canales Poza Honda y compuertas La Estancilla y La Ciénega — {INFORME_META.periodoReferencia}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-8">
        <Card className="border-foreground/10">
          <CardHeader>
            <CardTitle className="text-base">{INFORME_META.titulo}</CardTitle>
            <CardDescription>
              {INFORME_META.entidad} — {INFORME_META.autor}, {INFORME_META.cargoAutor}
            </CardDescription>
          </CardHeader>
        </Card>

        <Accordion type="multiple" className="space-y-3">
          <AccordionItem value="contexto" className="rounded-xl border border-foreground/10 px-4">
            <AccordionTrigger className="text-base font-semibold">1. Contexto y generalidades</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4 text-sm leading-relaxed text-muted-foreground">
              <p>{GENERALIDADES.parrafo1}</p>
              <p>{GENERALIDADES.parrafo2}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="sistema" className="rounded-xl border border-foreground/10 px-4">
            <AccordionTrigger className="text-base font-semibold">2. Sistema Trasvase Manabí</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{SISTEMA_TRASVASE.descripcion}</p>
              <ul className="space-y-2">
                {SISTEMA_TRASVASE.componentes.map((componente) => (
                  <li
                    key={componente.nombre}
                    className="rounded-lg border border-foreground/10 bg-muted/20 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-foreground">{componente.nombre}</p>
                    <p className="mt-0.5 text-muted-foreground">{componente.detalle}</p>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="canales" className="rounded-xl border border-foreground/10 px-4">
            <AccordionTrigger className="text-base font-semibold">3. Canales y sectores</AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              {ZONAS_CANALES.map((zona) => (
                <div key={zona.id} className="rounded-lg border border-foreground/10 bg-muted/20 px-3 py-2">
                  <p className="text-sm font-medium text-foreground">{zona.nombre}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{zona.descripcion}</p>
                </div>
              ))}
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">8 presas derivadoras (canales de tierra)</p>
                {PRESAS_DERIVADORAS.map((presa) => (
                  <div
                    key={presa.nombre}
                    className="rounded-lg border border-foreground/10 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-foreground">
                      {presa.nombre} — {presa.totalKm} km total
                    </p>
                    <ul className="mt-1 list-inside list-disc text-muted-foreground">
                      {presa.canales.map((canal) => (
                        <li key={canal.nombre}>
                          {canal.nombre} ({canal.longitudKm} km)
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm text-muted-foreground">
                  El registro fotográfico clasifica las evidencias por rubro de obra del contrato:
                </p>
                <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
                  {SECTORES_FOTOGRAFICOS.flatMap((grupo) =>
                    grupo.sectores.map((sector) => (
                      <li key={sector.id}>{sector.label}</li>
                    ))
                  )}
                </ul>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/fotos">Consultar evidencias por sector</Link>
                </Button>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="clima" className="rounded-xl border border-foreground/10 px-4">
            <AccordionTrigger className="text-base font-semibold">4. Evidencias climatológicas</AccordionTrigger>
            <AccordionContent className="space-y-2 pb-4 text-sm text-muted-foreground">
              <p>Febrero 2025: {CLIMATOLOGIA.febrero2025}</p>
              <p>Marzo 2025: {CLIMATOLOGIA.marzo2025}</p>
              <p>Acumulado Feb–Mar: {CLIMATOLOGIA.acumulado}</p>
              <p className="leading-relaxed">{CLIMATOLOGIA.notaErfen}</p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="afectaciones" className="rounded-xl border border-foreground/10 px-4">
            <AccordionTrigger className="text-base font-semibold">5. Afectaciones actuales</AccordionTrigger>
            <AccordionContent className="pb-4">
              <AfectacionesResumen variant="detalle" afectaciones={AFECTACIONES} />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="justificativo" className="rounded-xl border border-foreground/10 px-4">
            <AccordionTrigger className="text-base font-semibold">6. Justificativo de las acciones</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4 text-sm leading-relaxed text-muted-foreground">
              {JUSTIFICATIVO.parrafos.map((parrafo) => (
                <p key={parrafo.slice(0, 24)}>{parrafo}</p>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="oficios" className="rounded-xl border border-foreground/10 px-4">
            <AccordionTrigger className="text-base font-semibold">
              7. Solicitudes de beneficiarios
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4">
              {OFICIOS_BENEFICIARIOS.map((oficio) => (
                <article
                  key={oficio.id}
                  className="rounded-lg border border-foreground/10 bg-muted/20 px-3 py-2.5 text-sm"
                >
                  <p className="font-medium text-foreground">{oficio.entidad}</p>
                  <p className="text-xs text-muted-foreground">
                    {oficio.referencia} — {oficio.fecha}
                  </p>
                  <p className="mt-1 text-muted-foreground">{oficio.resumen}</p>
                </article>
              ))}
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="marco" className="rounded-xl border border-foreground/10 px-4">
            <AccordionTrigger className="text-base font-semibold">8. Marco jurídico y conclusión</AccordionTrigger>
            <AccordionContent className="space-y-4 pb-4">
              <p className="text-sm leading-relaxed text-muted-foreground">{MARCO_JURIDICO}</p>
              <p className="text-sm leading-relaxed text-muted-foreground">{CONCLUSION}</p>
              <div className="space-y-2">
                <p className="text-sm font-medium text-foreground">Criterios de emergencia (LOSNCP)</p>
                {CRITERIOS_EMERGENCIA.map((criterio) => (
                  <div
                    key={criterio.letra}
                    className="rounded-lg border border-foreground/10 px-3 py-2 text-sm"
                  >
                    <p className="font-medium text-foreground">
                      {criterio.letra}. {criterio.titulo}
                    </p>
                    <p className="mt-0.5 text-muted-foreground">{criterio.descripcion}</p>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="area" className="rounded-xl border border-foreground/10 px-4">
            <AccordionTrigger className="text-base font-semibold">9. Área de influencia</AccordionTrigger>
            <AccordionContent className="space-y-3 pb-4 text-sm">
              <div>
                <p className="font-medium text-foreground">Cantones beneficiados</p>
                <p className="mt-1 text-muted-foreground">{AREA_INFLUENCIA.cantones.join(", ")}</p>
              </div>
              <div>
                <p className="font-medium text-foreground">Sistemas de agua potable</p>
                <ul className="mt-1 list-inside list-disc text-muted-foreground">
                  {AREA_INFLUENCIA.aguaPotable.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>
    </div>
  )
}
