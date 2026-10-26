import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"

import { PlanillaCronogramaValoradoPdfDocument } from "@/src/components/pdf/PlanillaCronogramaValoradoPdfDocument"
import type { ResumenCronogramaValoradoVigente } from "@/src/lib/planilla-cronograma-valorado-vigente"

export function nombreArchivoCronogramaValoradoPdf(): string {
  return "cronograma-valorado-trabajos-vigente.pdf"
}

export async function renderCronogramaValoradoPdfBuffer(
  cronograma: ResumenCronogramaValoradoVigente
): Promise<Buffer> {
  const doc = createElement(PlanillaCronogramaValoradoPdfDocument, {
    cronograma,
  }) as ReactElement<DocumentProps>
  const buffer = await renderToBuffer(doc)
  return Buffer.from(buffer)
}
