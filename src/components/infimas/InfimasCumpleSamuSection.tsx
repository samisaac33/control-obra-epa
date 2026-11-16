"use client"

import { Cake, Download, ExternalLink, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CUMPLE_SAMU_PDF,
  CUMPLE_SAMU_TOTAL_PAGINAS,
} from "@/src/data/infimas/cumple-samu"

export function InfimasCumpleSamuSection() {
  const pdfUrl = `${CUMPLE_SAMU_PDF}?v=1`

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80">
              <Cake className="size-4" strokeWidth={1.75} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base leading-snug">Libro para colorear — cumple Samu</CardTitle>
              <CardDescription className="mt-1">
                {CUMPLE_SAMU_TOTAL_PAGINAS} láminas en blanco y negro, formato A4 vertical, listas para
                imprimir en casa o en imprenta. Tema Plaza Sésamo y galletas.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3 pt-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Palette className="size-4 shrink-0" aria-hidden />
            Impresión a una cara, papel bond u oficio.
          </div>
          <div className="ml-auto flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm">
              <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="size-4" aria-hidden />
                Abrir PDF
              </a>
            </Button>
            <Button asChild size="sm">
              <a href={CUMPLE_SAMU_PDF} download="libro-colorear-cumple-samu.pdf">
                <Download className="size-4" aria-hidden />
                Descargar PDF
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Vista previa</h2>
        <div className="overflow-hidden rounded-lg border border-foreground/10 bg-neutral-100">
          <iframe
            title="Libro para colorear — cumple Samu"
            src={`${pdfUrl}#view=FitH&toolbar=1`}
            className="min-h-[70vh] w-full bg-white sm:min-h-[80vh]"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Si el visor no carga, use{" "}
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="underline">
            abrir PDF en pestaña nueva
          </a>
          .
        </p>
      </section>
    </div>
  )
}