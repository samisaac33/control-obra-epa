import { readFileSync } from "node:fs"
import { mkdir } from "node:fs/promises"
import path from "node:path"

import { renderToFile } from "@react-pdf/renderer"
import React from "react"

import { InfimaInformePdfDocument } from "../src/components/infimas/InfimaInformePdfDocument"
import {
  ARCHIVO_PDF_CRUCITA_LEOPOLDO_CEDENO,
  INFORME_CRUCITA_LEOPOLDO_CEDENO,
} from "../src/data/infimas/crucita-leopoldo-cedeno"
import {
  ARCHIVO_PDF_GARANTIA_CRUCITA_LEOPOLDO_CEDENO,
  INFORME_GARANTIA_CRUCITA_LEOPOLDO_CEDENO,
} from "../src/data/infimas/crucita-leopoldo-cedeno-garantia"
import type { InfimaInformeData } from "../src/data/infimas/types"

const DOCUMENTOS: { informe: InfimaInformeData; archivo: string; conImagenes: boolean }[] = [
  {
    informe: INFORME_CRUCITA_LEOPOLDO_CEDENO,
    archivo: ARCHIVO_PDF_CRUCITA_LEOPOLDO_CEDENO,
    conImagenes: true,
  },
  {
    informe: INFORME_GARANTIA_CRUCITA_LEOPOLDO_CEDENO,
    archivo: ARCHIVO_PDF_GARANTIA_CRUCITA_LEOPOLDO_CEDENO,
    conImagenes: false,
  },
]

async function main() {
  const outDir = path.join(process.cwd(), "public", "infimas")
  await mkdir(outDir, { recursive: true })

  const resolverImagen = (archivo: string) => {
    const filePath = path.join(process.cwd(), "public", archivo.replace(/^\//, ""))
    const data = readFileSync(filePath)
    const esJpeg = data[0] === 0xff && data[1] === 0xd8
    const mime = esJpeg ? "image/jpeg" : "image/png"
    return `data:${mime};base64,${data.toString("base64")}`
  }

  for (const doc of DOCUMENTOS) {
    const outPath = path.join(outDir, doc.archivo)

    await renderToFile(
      React.createElement(InfimaInformePdfDocument, {
        informe: doc.informe,
        resolverImagen: doc.conImagenes ? resolverImagen : undefined,
      }),
      outPath
    )

    console.log(`PDF generado: ${outPath}`)
  }
}

main().catch((error) => {
  console.error("Error al generar PDF de ínfimas:", error)
  process.exit(1)
})
