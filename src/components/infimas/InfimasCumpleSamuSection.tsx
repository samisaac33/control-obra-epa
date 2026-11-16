"use client"

import { Cake, Download, ExternalLink, Palette } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  CUMPLE_SAMU_HOJAS_IMPRESION,
  CUMPLE_SAMU_PDF,
  CUMPLE_SAMU_PDF_VERSION,
  CUMPLE_SAMU_TOTAL_PAGINAS,
} from "@/src/data/infimas/cumple-samu"
import { imposicionCuadernillo } from "@/src/lib/infimas/cumple-samu-imposicion"

export function InfimasCumpleSamuSection() {
  const pdfUrl = `${CUMPLE_SAMU_PDF}?v=${CUMPLE_SAMU_PDF_VERSION}`
  const plan = imposicionCuadernillo(CUMPLE_SAMU_TOTAL_PAGINAS)

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
                {CUMPLE_SAMU_TOTAL_PAGINAS} láminas en cuadernillo: {CUMPLE_SAMU_HOJAS_IMPRESION} hojas A4
                en horizontal, dos dibujos por cara, ordenadas para doblar por la mitad (como imposición de
                libro). La primera hoja del PDF lleva la lámina 12 a la izquierda y la portada (1) a la
                derecha.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <ol className="list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
            <li>Descargue el PDF e imprima las {CUMPLE_SAMU_HOJAS_IMPRESION} páginas en A4, orientación horizontal.</li>
            <li>Active impresión a doble cara y voltee por el borde corto (típico para hojas apaisadas).</li>
            <li>Apile en orden, doble cada hoja por la línea central y engrape o abroche como cuadernillo.</li>
          </ol>
          <div className="rounded-md border border-foreground/10 bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            <p className="font-medium text-foreground">Orden de imposición (izquierda | derecha)</p>
            <ul className="mt-1 space-y-0.5">
              {plan.map(([izq, der], idx) => (
                <li key={idx}>
                  Hoja {idx + 1}: {izq} | {der}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Palette className="size-4 shrink-0" aria-hidden />
              Papel bond u oficio; una cara con color si la impresora lo permite.
            </div>
            <div className="ml-auto flex flex-wrap gap-2">
              <Button asChild variant="outline" size="sm">
                <a href={pdfUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="size-4" aria-hidden />
                  Abrir PDF
                </a>
              </Button>
              <Button asChild size="sm">
                <a href={pdfUrl} download="libro-colorear-cumple-samu-cuadernillo.pdf">
                  <Download className="size-4" aria-hidden />
                  Descargar PDF
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Vista previa (hojas impresas)</h2>
        <div className="overflow-hidden rounded-lg border border-foreground/10 bg-neutral-100">
          <iframe
            title="Libro para colorear — cumple Samu"
            src={`${pdfUrl}#view=FitH&toolbar=1`}
            className="min-h-[70vh] w-full bg-white sm:min-h-[80vh]"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Cada vista es una hoja horizontal: mitad izquierda y mitad derecha son dos láminas distintas del
          libro. Si el visor no carga,{" "}
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer" className="underline">
            abra el PDF en una pestaña nueva
          </a>
          .
        </p>
      </section>
    </div>
  )
}