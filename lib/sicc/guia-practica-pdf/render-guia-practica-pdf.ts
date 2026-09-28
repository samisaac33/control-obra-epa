import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React, { type ReactElement } from "react"

import { GuiaPracticaSeverinoPdfDocument } from "@/src/components/sicc/GuiaPracticaSeverinoPdfDocument"

export const NOMBRE_ARCHIVO_GUIA_PRACTICA_PDF =
  "Guia-Practica-Ensayos-Severino-Planilla-3.pdf"

export async function renderGuiaPracticaPdfBuffer(fechaGeneracion?: string): Promise<Buffer> {
  const element = React.createElement(GuiaPracticaSeverinoPdfDocument, {
    fechaGeneracion,
  })
  const buffer = await renderToBuffer(element as ReactElement<DocumentProps>)
  return Buffer.from(buffer)
}
