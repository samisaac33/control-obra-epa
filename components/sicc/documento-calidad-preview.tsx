"use client"

import { ESTILOS_DOCUMENTO_CALIDAD } from "@/lib/sicc/placeholder-documento"

type DocumentoCalidadPreviewProps = {
  html: string
  className?: string
}

/** Vista previa de actas HTML con marcadores [[amarillo]]. */
export function DocumentoCalidadPreview({ html, className }: DocumentoCalidadPreviewProps) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: ESTILOS_DOCUMENTO_CALIDAD }} />
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </>
  )
}
