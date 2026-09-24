"use client"

import { Download, FileText } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { InfimaInformeVista } from "@/src/components/infimas/InfimaInformeVista"
import type { InfimaDocumento } from "@/src/data/infimas/catalog"

type InfimasDocumentoListaProps = {
  documentos: InfimaDocumento[]
}

export function InfimasDocumentoLista({ documentos }: InfimasDocumentoListaProps) {
  const [vistaSlug, setVistaSlug] = useState<string | null>(
    documentos.length === 1 ? documentos[0].slug : null
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        {documentos.map((doc) => (
          <Card key={doc.id}>
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg border border-foreground/10 bg-muted/80">
                  <FileText className="size-4" strokeWidth={1.75} aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base leading-snug">{doc.titulo}</CardTitle>
                  <CardDescription className="mt-1">{doc.descripcion}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex flex-wrap items-center gap-3 pt-0">
              <p className="text-sm text-muted-foreground">
                O/C {doc.ordenCompra} · {doc.fecha}
              </p>
              <div className="ml-auto flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setVistaSlug(vistaSlug === doc.slug ? null : doc.slug)}
                >
                  {vistaSlug === doc.slug ? "Ocultar vista previa" : "Vista previa"}
                </Button>
                <Button asChild size="sm">
                  <a href={doc.archivoPdf} download>
                    <Download className="size-4" aria-hidden />
                    Descargar PDF
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {vistaSlug ? (
        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-muted-foreground">Vista previa del documento</h2>
          <div className="overflow-x-auto rounded-lg border border-foreground/10 bg-neutral-100 p-4 sm:p-6">
            <InfimaInformeVista
              informe={documentos.find((doc) => doc.slug === vistaSlug)!.informe}
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}
