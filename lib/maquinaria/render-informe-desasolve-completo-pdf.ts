import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import React, { type ReactElement } from "react"

import { MaquinariaInformeDesasolveCompletoPdfDocument } from "@/src/components/maquinaria/MaquinariaInformeDesasolveCompletoPdfDocument"
import type { InformeDesasolveCompletoPayload } from "@/src/lib/maquinaria/cargar-informe-desasolve-completo"

export async function renderInformeDesasolveCompletoPdfBuffer(
  data: InformeDesasolveCompletoPayload
): Promise<Buffer> {
  const element = React.createElement(MaquinariaInformeDesasolveCompletoPdfDocument, { data })
  const buffer = await renderToBuffer(element as ReactElement<DocumentProps>)
  return Buffer.from(buffer)
}

export function nombreArchivoInformeDesasolveCompleto(proyectoId: string): string {
  return `informe-completo-maquinaria-${proyectoId}.pdf`
}