import { readFileSync, writeFileSync } from "node:fs"
import { mkdirSync } from "node:fs"
import path from "node:path"

import { PDFDocument } from "pdf-lib"

export type ExtractPdfPageOptions = {
  inPath: string
  page: number
  outPath: string
}

/** `page` es 1-based (1 = primera página). */
export async function extractPdfPage({ inPath, page, outPath }: ExtractPdfPageOptions): Promise<void> {
  if (!Number.isInteger(page) || page < 1) {
    throw new Error("page debe ser un entero >= 1")
  }

  const inAbs = path.resolve(inPath)
  const outAbs = path.resolve(outPath)

  const srcDoc = await PDFDocument.load(readFileSync(inAbs))
  const pageCount = srcDoc.getPageCount()
  const pageIndex = page - 1

  if (pageIndex >= pageCount) {
    throw new Error(`El PDF tiene ${pageCount} páginas; se pidió la página ${page}`)
  }

  const outDoc = await PDFDocument.create()
  const [copied] = await outDoc.copyPages(srcDoc, [pageIndex])
  outDoc.addPage(copied)

  const pdfBytes = await outDoc.save()
  mkdirSync(path.dirname(outAbs), { recursive: true })
  writeFileSync(outAbs, pdfBytes)
}
