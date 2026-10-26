import { jsPDF } from "jspdf"

import { prepararDocumentoClonadoParaPdf } from "@/src/lib/libro-obra-pdf-capture-styles"

const MARGEN_MM = 6
const ANCHO_A4_MM = 210
const ALTO_A4_MM = 297
const ANCHO_UTIL_MM = ANCHO_A4_MM - MARGEN_MM * 2
const ALTO_UTIL_MM = ALTO_A4_MM - MARGEN_MM * 2
const TIMEOUT_IMAGEN_MS = 6_000

export type ProgresoPdfLibroObra = {
  hoja: number
  total: number
  fase?: "preparando" | "capturando"
}

function esperarUnaImagen(img: HTMLImageElement, timeoutMs: number): Promise<void> {
  return new Promise((resolve) => {
    const terminar = () => {
      window.clearTimeout(timer)
      resolve()
    }
    const timer = window.setTimeout(terminar, timeoutMs)

    if (img.complete && img.naturalWidth > 0) {
      terminar()
      return
    }

    img.addEventListener("load", terminar, { once: true })
    img.addEventListener("error", terminar, { once: true })
  })
}

async function prepararHojaParaCaptura(hoja: HTMLElement): Promise<void> {
  hoja.scrollIntoView({ block: "start" })
  await new Promise<void>((resolve) => {
    window.requestAnimationFrame(() => window.requestAnimationFrame(() => resolve()))
  })

  const imagenes = [...hoja.querySelectorAll("img")]
  for (const img of imagenes) {
    img.loading = "eager"
    if (!img.crossOrigin) img.crossOrigin = "anonymous"
    const src = img.currentSrc || img.src
    if (src && !img.complete) {
      img.src = src
    }
  }

  await Promise.all(imagenes.map((img) => esperarUnaImagen(img, TIMEOUT_IMAGEN_MS)))
}

function escalaCaptura(totalHojas: number): number {
  const esMovil = typeof window !== "undefined" && window.innerWidth < 768
  if (esMovil) return totalHojas > 8 ? 1 : 1.15
  if (totalHojas > 20) return 1.15
  if (totalHojas > 10) return 1.35
  return 2
}

type Html2CanvasFn = (
  element: HTMLElement,
  options?: Record<string, unknown>
) => Promise<HTMLCanvasElement>

async function canvasDeHoja(
  html2canvas: Html2CanvasFn,
  hoja: HTMLElement,
  scale: number
): Promise<HTMLCanvasElement> {
  return html2canvas(hoja, {
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: "#ffffff",
    foreignObjectRendering: false,
    imageTimeout: TIMEOUT_IMAGEN_MS,
    onclone: (_doc: Document, clonedHoja: HTMLElement) => {
      prepararDocumentoClonadoParaPdf(_doc)
      clonedHoja.style.background = "#ffffff"
      clonedHoja.style.width = "190mm"
      clonedHoja.querySelectorAll("img").forEach((node) => {
        const img = node as HTMLImageElement
        img.loading = "eager"
        if (!img.crossOrigin) img.crossOrigin = "anonymous"
      })
    },
  })
}

function timeoutCaptura<T>(promesa: Promise<T>, ms: number, mensaje: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = window.setTimeout(() => reject(new Error(mensaje)), ms)
    promesa
      .then((valor) => {
        window.clearTimeout(timer)
        resolve(valor)
      })
      .catch((err) => {
        window.clearTimeout(timer)
        reject(err)
      })
  })
}

export async function generarBlobPdfLibroObra(
  elemento: HTMLElement,
  onProgreso?: (p: ProgresoPdfLibroObra) => void
): Promise<Blob> {
  const hojas = [...elemento.querySelectorAll<HTMLElement>(".libro-obra-hoja-epa")]
  const targets = hojas.length > 0 ? hojas : [elemento]
  const scale = escalaCaptura(targets.length)

  onProgreso?.({ hoja: 0, total: targets.length, fase: "preparando" })
  const html2canvas = (await import("html2canvas")).default as Html2CanvasFn

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" })

  for (let i = 0; i < targets.length; i++) {
    onProgreso?.({ hoja: i + 1, total: targets.length, fase: "capturando" })

    await prepararHojaParaCaptura(targets[i])

    if (i > 0) pdf.addPage()

    const canvas = await timeoutCaptura(
      canvasDeHoja(html2canvas, targets[i], scale),
      90_000,
      `Tiempo agotado al capturar la hoja ${i + 1}. Acorte el rango de fechas e intente de nuevo.`
    )

    const imgData = canvas.toDataURL("image/jpeg", 0.88)
    const altoMm = (canvas.height * ANCHO_UTIL_MM) / canvas.width
    const altoFinal = Math.min(altoMm, ALTO_UTIL_MM)
    pdf.addImage(imgData, "JPEG", MARGEN_MM, MARGEN_MM, ANCHO_UTIL_MM, altoFinal)

    await new Promise<void>((resolve) => window.setTimeout(resolve, 0))
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
