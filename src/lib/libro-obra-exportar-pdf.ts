import { jsPDF } from "jspdf"

import { prepararDocumentoClonadoParaPdf } from "@/src/lib/libro-obra-pdf-capture-styles"

const MARGEN_MM = 6
const ANCHO_A4_MM = 210
const ALTO_A4_MM = 297
const ANCHO_UTIL_MM = ANCHO_A4_MM - MARGEN_MM * 2
const ALTO_UTIL_MM = ALTO_A4_MM - MARGEN_MM * 2

export type ProgresoPdfLibroObra = {
  hoja: number
  total: number
}

async function esperarImagenesElemento(root: HTMLElement): Promise<void> {
  const imagenes = [...root.querySelectorAll("img")]
  await Promise.all(
    imagenes.map(
      (img) =>
        new Promise<void>((resolve) => {
          if (img.complete) {
            resolve()
            return
          }
          img.addEventListener("load", () => resolve(), { once: true })
          img.addEventListener("error", () => resolve(), { once: true })
        })
    )
  )
}

function escalaCaptura(totalHojas: number): number {
  if (totalHojas > 20) return 1.15
  if (totalHojas > 10) return 1.35
  if (typeof window !== "undefined" && window.innerWidth < 768) return 1.5
  return 2
}

async function canvasDeHoja(hoja: HTMLElement, scale: number): Promise<HTMLCanvasElement> {
  const html2canvas = (await import("html2canvas")).default
  return html2canvas(hoja, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    onclone: (_doc, clonedHoja) => {
      prepararDocumentoClonadoParaPdf(_doc)
      clonedHoja.style.background = "#ffffff"
      clonedHoja.style.width = "190mm"
    },
  })
}

export async function generarBlobPdfLibroObra(
  elemento: HTMLElement,
  onProgreso?: (p: ProgresoPdfLibroObra) => void
): Promise<Blob> {
  await esperarImagenesElemento(elemento)

  const hojas = [...elemento.querySelectorAll<HTMLElement>(".libro-obra-hoja-epa")]
  const targets = hojas.length > 0 ? hojas : [elemento]
  const scale = escalaCaptura(targets.length)
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  for (let i = 0; i < targets.length; i++) {
    onProgreso?.({ hoja: i + 1, total: targets.length })
    if (i > 0) pdf.addPage()

    const canvas = await canvasDeHoja(targets[i], scale)
    const imgData = canvas.toDataURL("image/jpeg", 0.9)
    const altoMm = (canvas.height * ANCHO_UTIL_MM) / canvas.width
    const altoFinal = Math.min(altoMm, ALTO_UTIL_MM)
    pdf.addImage(imgData, "JPEG", MARGEN_MM, MARGEN_MM, ANCHO_UTIL_MM, altoFinal)
  }

  return pdf.output("blob")
}

export async function entregarPdfLibroObra(blob: Blob, nombreArchivo: string): Promise<void> {
  const file = new File([blob], nombreArchivo, { type: "application/pdf" })

  if (typeof navigator.share === "function" && navigator.canShare?.({ files: [file] })) {
    await navigator.share({
      files: [file],
      title: "Libro de obra",
    })
    return
  }

  const url = URL.createObjectURL(blob)
  const enlace = document.createElement("a")
  enlace.href = url
  enlace.download = nombreArchivo
  enlace.rel = "noopener"
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  URL.revokeObjectURL(url)
}

export function nombreArchivoLibroObra(desde: string, hasta: string): string {
  const d = desde || "periodo"
  const h = hasta || d
  return `libro-obra_${d}_${h}.pdf`.replace(/[^\w.-]+/g, "-")
}
