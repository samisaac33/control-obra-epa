"use client"

import { Smartphone } from "lucide-react"

type LibroObraAyudaGuardarPdfProps = {
  variant?: "evidencias" | "planilla"
}

export function LibroObraAyudaGuardarPdf({ variant = "evidencias" }: LibroObraAyudaGuardarPdfProps) {
  if (variant === "planilla") {
    return (
      <p className="rounded-lg border border-muted bg-muted/40 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
        <Smartphone className="mr-1 inline size-3.5 align-text-bottom" aria-hidden />
        Al pulsar <span className="font-medium text-foreground">Guardar</span> se genera el PDF del
        libro y se abre el selector para{" "}
        <span className="font-medium text-foreground">guardar en Archivos</span> (sin pasar por la
        pantalla de impresión del iPhone). Los logos se conservan como en la vista previa.
      </p>
    )
  }

  return (
    <p className="text-xs text-muted-foreground">
      Use el diálogo del navegador y desactive encabezados y pies de página si desea quitar URL y
      fecha del margen al guardar PDF.
    </p>
  )
}
