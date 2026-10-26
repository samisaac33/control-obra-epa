import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"

import { PlanillaCronogramaEpaPdfDocument } from "@/src/components/pdf/PlanillaCronogramaEpaPdfDocument"
import type { ResumenCronogramaEpa } from "@/src/lib/planilla-cronograma-epa"

export function nombreArchivoCronogramasEpaPdf(planillaNumero: number): string {
  return `cronogramas-epa-planilla-${planillaNumero}.pdf`
}

export async function renderCronogramasEpaPdfBuffer(
  programado: ResumenCronogramaEpa,
  ejecutado: ResumenCronogramaEpa,
  firmaContratista?: string
): Promise<Buffer> {
  const doc = createElement(PlanillaCronogramaEpaPdfDocument, {
    programado,
    ejecutado,
    firmaContratista,
  }) as ReactElement<DocumentProps>
  const buffer = await renderToBuffer(doc)
  return Buffer.from(buffer)
}
