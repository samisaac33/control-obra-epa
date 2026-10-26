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
        <span className="font-medium text-foreground">Guardar</span> genera el PDF y abre el selector
        para almacenar en Archivos (sin la pantalla de impresión del iPhone). Los logos se ven como en
        la vista previa.
      </p>
    )
  }

  return (
    <details
      className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-3 py-2 text-xs leading-relaxed text-amber-950 print:hidden"
      aria-label="Cómo guardar PDF sin URL en el pie"
    >
      <summary className="flex cursor-pointer list-none items-center gap-1.5 font-semibold marker:content-none [&::-webkit-details-marker]:hidden">
        <Smartphone className="size-3.5 shrink-0" aria-hidden />
        Guardar PDF sin URL ni fecha en el pie
      </summary>
      <div className="mt-2 border-t border-amber-200/60 pt-2">
        <p className="mt-2 text-[11px] text-amber-900/85">
          En el diálogo de impresión desactive encabezados y pies de página para quitar URL y fecha del
          margen.
        </p>
      </div>
    </details>
  )
}
