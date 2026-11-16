import { readFileSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { PageSizes, PDFDocument } from "pdf-lib"

import {
  CUMPLE_SAMU_PAGINAS,
  CUMPLE_SAMU_PDF,
} from "../src/data/infimas/cumple-samu"

/** ~7 mm — margen mínimo para impresoras domésticas */
const MARGEN_PT = 20

const ARCHIVO_SALIDA = CUMPLE_SAMU_PDF.replace(/^\//, "")

async function main() {
  const paginasDir = path.join(process.cwd(), "public", "infimas", "cumple-samu", "paginas")
  const outDir = path.join(process.cwd(), "public", "infimas", "cumple-samu")
  await mkdir(outDir, { recursive: true })

  const outPath = path.join(process.cwd(), "public", ARCHIVO_SALIDA)
  const pdf = await PDFDocument.create()
  const [anchoPagina, altoPagina] = PageSizes.A4

  for (const nombre of CUMPLE_SAMU_PAGINAS) {
    const filePath = path.join(paginasDir, nombre)
    const bytes = readFileSync(filePath)
    const esPng = nombre.toLowerCase().endsWith(".png")
    const imagen = esPng
      ? await pdf.embedPng(bytes)
      : await pdf.embedJpg(bytes)

    const page = pdf.addPage([anchoPagina, altoPagina])
    const anchoImagen = imagen.width
    const altoImagen = imagen.height

    const areaUtilAncho = anchoPagina - MARGEN_PT * 2
    const areaUtilAlto = altoPagina - MARGEN_PT * 2
    const escala = Math.min(areaUtilAncho / anchoImagen, areaUtilAlto / altoImagen)
    const anchoDibujo = anchoImagen * escala
    const altoDibujo = altoImagen * escala
    const x = (anchoPagina - anchoDibujo) / 2
    const y = (altoPagina - altoDibujo) / 2

    page.drawImage(imagen, {
      x,
      y,
      width: anchoDibujo,
      height: altoDibujo,
    })
  }

  const pdfBytes = await pdf.save()
  await writeFile(outPath, pdfBytes)

  console.log(
    `PDF generado: ${outPath} (${CUMPLE_SAMU_PAGINAS.length} páginas, formato A4 vertical)`
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})