import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"

import { cargarLogosCronogramaEpaPdf } from "@/lib/planilla/cronograma-epa-logos-pdf"
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
  const logos = cargarLogosCronogramaEpaPdf()
  const doc = createElement(PlanillaCronogramaEpaPdfDocument, {
    programado,
    ejecutado,
    firmaContratista,
    logos,
  }) as ReactElement<DocumentProps>
  const buffer = await renderToBuffer(doc)
  return Buffer.from(buffer)
}
