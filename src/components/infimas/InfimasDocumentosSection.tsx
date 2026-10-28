"use client"

import { Download, FileText } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { InfimaDocumentoPersonal } from "@/src/data/infimas/documentos"

type InfimasDocumentosSectionProps = {
  documentos: InfimaDocumentoPersonal[]
}

export function InfimasDocumentosSection({ documentos }: InfimasDocumentosSectionProps) {
  const [activoId, setActivoId] = useState(documentos[0]?.id ?? "")

  const activo = documentos.find((doc) => doc.id === activoId) ?? documentos[0]

  if (!activo) {
    return (
      <p className="text-sm text-muted-foreground">No hay documentos publicados en esta sección.</p>
    )
  }

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
              <p className="text-sm text-muted-foreground">Actualizado: {doc.actualizado}</p>
              <div className="ml-auto flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant={activoId === doc.id ? "secondary" : "outline"}
                  size="sm"
                  onClick={() => setActivoId(doc.id)}
                >
                  {activoId === doc.id ? "Viendo en pantalla" : "Ver en pantalla"}
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

      <section className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Vista del documento</h2>
        <div className="overflow-hidden rounded-lg border border-foreground/10 bg-neutral-100">
          <iframe
            title={activo.titulo}
            src={`${activo.archivoPdf}#view=FitH`}
            className="h-[min(80vh,920px)] w-full bg-white"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Si el visor no carga, use{" "}
          <a href={activo.archivoPdf} target="_blank" rel="noopener noreferrer" className="underline">
            abrir PDF en pestaña nueva
          </a>
          .
        </p>
      </section>
    </div>
  )
}
