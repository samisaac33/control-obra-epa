import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"

import { PlanillaRequerimientoPagoPdfDocument } from "@/src/components/pdf/PlanillaRequerimientoPagoPdfDocument"
import type { ResumenRequerimientoPago } from "@/src/lib/planilla-requerimiento-pago"

export type RequerimientoPagoPdfInput = {
  proyectoNombre: string
  numeroContrato: string
  resumen: ResumenRequerimientoPago
  generadoEnIso: string
}

export function nombreArchivoRequerimientoPagoPdf(planillaNumero: number): string {
  return `requerimiento-pago-planilla-${planillaNumero}.pdf`
}

export async function renderRequerimientoPagoPdfBuffer(
  input: RequerimientoPagoPdfInput
): Promise<Buffer> {
  const doc = createElement(PlanillaRequerimientoPagoPdfDocument, input) as ReactElement<DocumentProps>
  const buffer = await renderToBuffer(doc)
  return Buffer.from(buffer)
}
