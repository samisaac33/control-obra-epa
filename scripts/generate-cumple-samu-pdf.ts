import { readFileSync } from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { PageSizes, PDFDocument, type PDFImage } from "pdf-lib"

import {
  CUMPLE_SAMU_PAGINAS,
  CUMPLE_SAMU_PDF,
} from "../src/data/infimas/cumple-samu"
import { imposicionCuadernillo } from "../src/lib/infimas/cumple-samu-imposicion"

/** ~5 mm dentro de cada mitad de hoja */
const MARGEN_MITAD_PT = 14

const ARCHIVO_SALIDA = CUMPLE_SAMU_PDF.replace(/^\//, "")

function dibujarEnMitad(
  imagen: PDFImage,
  page: ReturnType<PDFDocument["addPage"]>,
  anchoHoja: number,
  altoHoja: number,
  mitad: "izquierda" | "derecha"
) {
  const mitadAncho = anchoHoja / 2
  const areaAncho = mitadAncho - MARGEN_MITAD_PT * 2
  const areaAlto = altoHoja - MARGEN_MITAD_PT * 2

  const escala = Math.min(areaAncho / imagen.width, areaAlto / imagen.height)
  const anchoDibujo = imagen.width * escala
  const altoDibujo = imagen.height * escala

  const baseX = mitad === "izquierda" ? 0 : mitadAncho
  const x = baseX + (mitadAncho - anchoDibujo) / 2
  const y = (altoHoja - altoDibujo) / 2

  page.drawImage(imagen, {
    x,
    y,
    width: anchoDibujo,
    height: altoDibujo,
  })
}

async function main() {
  const paginasDir = path.join(process.cwd(), "public", "infimas", "cumple-samu", "paginas")
  const outDir = path.join(process.cwd(), "public", "infimas", "cumple-samu")
  await mkdir(outDir, { recursive: true })

  const outPath = path.join(process.cwd(), "public", ARCHIVO_SALIDA)
  const pdf = await PDFDocument.create()
  const [anchoA4, altoA4] = PageSizes.A4
  const anchoHoja = altoA4
  const altoHoja = anchoA4

  const embebidas: PDFImage[] = []
  for (const nombre of CUMPLE_SAMU_PAGINAS) {
    const filePath = path.join(paginasDir, nombre)
    const bytes = readFileSync(filePath)
    const esPng = nombre.toLowerCase().endsWith(".png")
    embebidas.push(esPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes))
  }

  const plan = imposicionCuadernillo(CUMPLE_SAMU_PAGINAS.length)

  for (const [numIzq, numDer] of plan) {
    const page = pdf.addPage([anchoHoja, altoHoja])
    dibujarEnMitad(embebidas[numIzq - 1], page, anchoHoja, altoHoja, "izquierda")
    dibujarEnMitad(embebidas[numDer - 1], page, anchoHoja, altoHoja, "derecha")
  }

  const pdfBytes = await pdf.save()
  await writeFile(outPath, pdfBytes)

  console.log(
    `PDF cuadernillo: ${outPath} (${plan.length} hojas A4 horizontal, ${CUMPLE_SAMU_PAGINAS.length} láminas interiores)`
  )
  for (let i = 0; i < plan.length; i++) {
    const [izq, der] = plan[i]
    console.log(`  Hoja ${i + 1}: ${izq} | ${der}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})