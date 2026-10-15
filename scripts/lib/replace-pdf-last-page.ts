import { readFileSync, writeFileSync } from "node:fs"
import { mkdirSync } from "node:fs"
import path from "node:path"

import { PDFDocument } from "pdf-lib"

export type ReplacePdfLastPageOptions = {
  basePath: string
  donorPath: string
  outPath: string
}

export async function replacePdfLastPage({
  basePath,
  donorPath,
  outPath,
}: ReplacePdfLastPageOptions): Promise<{ baseCount: number; outCount: number; donorPageIndex: number }> {
  const baseAbs = path.resolve(basePath)
  const donorAbs = path.resolve(donorPath)
  const outAbs = path.resolve(outPath)

  const baseDoc = await PDFDocument.load(readFileSync(baseAbs))
  const donorDoc = await PDFDocument.load(readFileSync(donorAbs))

  const baseCount = baseDoc.getPageCount()
  const donorCount = donorDoc.getPageCount()

  if (baseCount < 1 || donorCount < 1) {
    throw new Error("Base y donor deben tener al menos una página")
  }

  if (baseCount !== donorCount && donorCount > 1) {
    console.warn(
      `Advertencia: base tiene ${baseCount} páginas y donor ${donorCount}; se usará la última del donor.`
    )
  }

  const outDoc = await PDFDocument.create()
  const lastBaseIndex = baseCount - 1
  const donorPageIndex = donorCount === 1 ? 0 : donorCount - 1

  if (lastBaseIndex > 0) {
    const basePages = await outDoc.copyPages(
      baseDoc,
      Array.from({ length: lastBaseIndex }, (_, i) => i)
    )
    for (const page of basePages) {
      outDoc.addPage(page)
    }
  }

  const [donorPage] = await outDoc.copyPages(donorDoc, [donorPageIndex])
  outDoc.addPage(donorPage)

  const pdfBytes = await outDoc.save()
  mkdirSync(path.dirname(outAbs), { recursive: true })
  writeFileSync(outAbs, pdfBytes)

  return { baseCount, outCount: outDoc.getPageCount(), donorPageIndex }
}
