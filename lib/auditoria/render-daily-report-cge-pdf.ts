import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"

import {
  DailyReportCGEDocument,
  type DailyReportCgeData,
} from "@/src/components/pdf/DailyReportCGE"

export function nombreArchivoReporteDiarioCge(fecha: string): string {
  return `reporte-diario-cge-${fecha}.pdf`
}

export async function renderDailyReportCgePdfBuffer(
  data: DailyReportCgeData
): Promise<Buffer> {
  const doc = createElement(DailyReportCGEDocument, { data }) as ReactElement<DocumentProps>
  const buffer = await renderToBuffer(doc)
  return Buffer.from(buffer)
}
