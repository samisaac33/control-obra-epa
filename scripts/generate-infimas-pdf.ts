import { existsSync, readFileSync } from "node:fs"
import { mkdir } from "node:fs/promises"
import path from "node:path"

import { renderToFile } from "@react-pdf/renderer"
import React from "react"

import { InfimaInformePdfDocument } from "../src/components/infimas/InfimaInformePdfDocument"
import {
  ARCHIVO_PAGINA_FIRMA_CRUCITA_LEOPOLDO_CEDENO,
  ARCHIVO_PDF_CRUCITA_LEOPOLDO_CEDENO,
  INFORME_CRUCITA_LEOPOLDO_CEDENO,
} from "../src/data/infimas/crucita-leopoldo-cedeno"
import { replacePdfLastPage } from "./lib/replace-pdf-last-page"
import {
  ARCHIVO_PDF_GARANTIA_CRUCITA_LEOPOLDO_CEDENO,
  INFORME_GARANTIA_CRUCITA_LEOPOLDO_CEDENO,
} from "../src/data/infimas/crucita-leopoldo-cedeno-garantia"
import type { InfimaInformeData } from "../src/data/infimas/types"

const DOCUMENTOS: {
  informe: InfimaInformeData
  archivo: string
  conImagenes: boolean
  paginaFirmaAsset?: string
}[] = [
  {
    informe: INFORME_CRUCITA_LEOPOLDO_CEDENO,
    archivo: ARCHIVO_PDF_CRUCITA_LEOPOLDO_CEDENO,
    conImagenes: true,
    paginaFirmaAsset: ARCHIVO_PAGINA_FIRMA_CRUCITA_LEOPOLDO_CEDENO,
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

    if (doc.paginaFirmaAsset) {
      const firmaPath = path.join(outDir, doc.paginaFirmaAsset)
      if (!existsSync(firmaPath)) {
        throw new Error(
          `Falta la hoja de firma: ${firmaPath}. Extrae la página con npm run extract-pdf-page.`
        )
      }
      const { outCount } = await replacePdfLastPage({
        basePath: outPath,
        donorPath: firmaPath,
        outPath,
      })
      console.log(`PDF generado (con firma escaneada): ${outPath} (${outCount} páginas)`)
    } else {
      console.log(`PDF generado: ${outPath}`)
    }
  }
}

main().catch((error) => {
  console.error("Error al generar PDF de ínfimas:", error)
  process.exit(1)
})
