import { PDFDocument } from "pdf-lib"
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"

import { cargarLogosCronogramaEpaPdf } from "@/lib/planilla/cronograma-epa-logos-pdf"
import {
  PlanillaCronogramaEpaSoloPdfDocument,
} from "@/src/components/pdf/PlanillaCronogramaEpaPdfDocument"
import type { ResumenCronogramaEpa } from "@/src/lib/planilla-cronograma-epa"

export function nombreArchivoCronogramasEpaPdf(planillaNumero: number): string {
  return `cronogramas-epa-planilla-${planillaNumero}.pdf`
}

export async function renderCronogramaEpaSoloPdfBuffer(
  datos: ResumenCronogramaEpa,
  firmaContratista?: string
): Promise<Buffer> {
  const logos = cargarLogosCronogramaEpaPdf()
  const doc = createElement(PlanillaCronogramaEpaSoloPdfDocument, {
    datos,
    firmaContratista,
    logos,
  }) as ReactElement<DocumentProps>
  const buffer = await renderToBuffer(doc)
  return Buffer.from(buffer)
}

export async function renderCronogramasEpaCombinadoPdfBuffer(
  programadoPdfBytes: Buffer,
  ejecutado: ResumenCronogramaEpa,
  firmaContratista?: string
): Promise<Buffer> {
  const ejecutadoPdf = await renderCronogramaEpaSoloPdfBuffer(ejecutado, firmaContratista)
  const merged = await PDFDocument.create()
  const programadoDoc = await PDFDocument.load(programadoPdfBytes)
  const ejecutadoDoc = await PDFDocument.load(ejecutadoPdf)

  const paginasProgramado = await merged.copyPages(programadoDoc, programadoDoc.getPageIndices())
  for (const page of paginasProgramado) merged.addPage(page)

  const paginasEjecutado = await merged.copyPages(ejecutadoDoc, ejecutadoDoc.getPageIndices())
  for (const page of paginasEjecutado) merged.addPage(page)

  return Buffer.from(await merged.save())
}
