import { jsPDF } from "jspdf"

import {
  aplicarEstilosCalculadosAlClon,
  prepararDocumentoClonadoParaPdf,
} from "@/src/lib/libro-obra-pdf-capture-styles"

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
    const src = img.currentSrc || img.src
    if (src && !img.complete) {
      img.src = src
    }
  }

  await Promise.all(imagenes.map((img) => esperarUnaImagen(img, TIMEOUT_IMAGEN_MS)))
}

function escalaCaptura(totalHojas: number): number {
  const esMovil = typeof window !== "undefined" && window.innerWidth < 768
  if (esMovil) return totalHojas > 8 ? 1.25 : 1.5
  if (totalHojas > 20) return 1.35
  if (totalHojas > 10) return 1.5
  return 2
}

type Html2CanvasFn = (
  element: HTMLElement,
  options?: Record<string, unknown>
) => Promise<HTMLCanvasElement>

function canvasTieneContenido(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d")
  if (!ctx) return false

  const puntos = [
    [0.05, 0.08],
    [0.5, 0.15],
    [0.5, 0.5],
    [0.5, 0.85],
  ] as const

  for (const [rx, ry] of puntos) {
    const x = Math.min(canvas.width - 1, Math.floor(canvas.width * rx))
    const y = Math.min(canvas.height - 1, Math.floor(canvas.height * ry))
    const [r, g, b] = ctx.getImageData(x, y, 1, 1).data
    if (r < 248 || g < 248 || b < 248) return true
  }
  return false
}

async function canvasDeHoja(
  html2canvas: Html2CanvasFn,
  hoja: HTMLElement,
  scale: number
): Promise<HTMLCanvasElement> {
  const rect = hoja.getBoundingClientRect()
  if (rect.width < 8 || rect.height < 8) {
    throw new Error("La hoja no es visible en pantalla. Desplácese e intente de nuevo.")
  }

  const canvas = await html2canvas(hoja, {
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: "#ffffff",
    foreignObjectRendering: false,
    imageTimeout: TIMEOUT_IMAGEN_MS,
    scrollX: 0,
    scrollY: -window.scrollY,
    width: Math.ceil(rect.width),
    height: Math.ceil(rect.height),
    onclone: (_doc: Document, clonedHoja: HTMLElement) => {
      prepararDocumentoClonadoParaPdf(_doc)
      aplicarEstilosCalculadosAlClon(hoja, clonedHoja)
      clonedHoja.style.background = "#ffffff"
      clonedHoja.style.margin = "0"
    },
  })

  if (!canvasTieneContenido(canvas)) {
    throw new Error(
      "La captura salió en blanco. Recargue la página, espere a ver las hojas en pantalla e intente otra vez."
    )
  }

  return canvas
}

function medidasImagenUnaPagina(canvas: HTMLCanvasElement): {
  anchoMm: number
  altoMm: number
  x: number
  y: number
} {
  let anchoMm = ANCHO_UTIL_MM
  let altoMm = (canvas.height / canvas.width) * anchoMm

  if (altoMm > ALTO_UTIL_MM) {
    const factor = ALTO_UTIL_MM / altoMm
    altoMm = ALTO_UTIL_MM
    anchoMm = anchoMm * factor
  }

  const x = MARGEN_MM + (ANCHO_UTIL_MM - anchoMm) / 2
  const y = MARGEN_MM

  return { anchoMm, altoMm, x, y }
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

    const imgData = canvas.toDataURL("image/jpeg", 0.9)
    const { anchoMm, altoMm, x, y } = medidasImagenUnaPagina(canvas)
    pdf.addImage(imgData, "JPEG", x, y, anchoMm, altoMm, undefined, "FAST")

    await new Promise<void>((resolve) => window.setTimeout(resolve, 0))
  }

  return pdf.output("blob")
}

/**
 * Entrega el PDF como documento (visor nativo), no como adjunto del menú Compartir.
 * En iPhone Safari abre el PDF; el usuario usa Compartir → Guardar en Archivos.
 * En escritorio intenta descarga directa.
 */
export async function entregarPdfLibroObra(blob: Blob, nombreArchivo: string): Promise<void> {
  const url = URL.createObjectURL(blob)
  const esMovil =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (esMovil) {
    const abierta = window.open(url, "_blank")
    if (!abierta) {
      // Safari a veces bloquea popups: navegar en la misma pestaña
      window.location.assign(url)
    } else {
      window.setTimeout(() => URL.revokeObjectURL(url), 120_000)
    }
    return
  }

  const enlace = document.createElement("a")
  enlace.href = url
  enlace.download = nombreArchivo
  enlace.rel = "noopener"
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000)
}

export function nombreArchivoLibroObra(desde: string, hasta: string): string {
  const d = desde || "periodo"
  const h = hasta || d
  return `libro-obra_${d}_${h}.pdf`.replace(/[^\w.-]+/g, "-")
}
