import { pdf, type DocumentProps } from "@react-pdf/renderer"
import { createElement, type ReactElement } from "react"

import {
  LibroObraPdfDocument,
  rutasLogosLibroObra,
} from "@/src/components/LibroObraPdfDocument"
import type { LibroObraEntradaDia } from "@/src/lib/libro-obra"

export type ProgresoPdfLibroObra = {
  hoja: number
  total: number
  fase?: "preparando" | "capturando"
}

type LogosDataUrl = { epa: string; consorcio: string }

async function fetchComoDataUrl(url: string): Promise<string> {
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`No se pudo cargar el logo (${res.status}). Recargue la página.`)
  }
  const blob = await res.blob()
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("No se pudieron leer los logos para el PDF."))
    reader.readAsDataURL(blob)
  })
}

async function cargarLogosPdf(): Promise<LogosDataUrl> {
  const origen =
    typeof window !== "undefined" ? window.location.origin : "http://localhost:3000"
  const rutas = rutasLogosLibroObra(origen)
  const [epa, consorcio] = await Promise.all([
    fetchComoDataUrl(rutas.epa),
    fetchComoDataUrl(rutas.consorcio),
  ])
  return { epa, consorcio }
}

/**
 * PDF nativo con @react-pdf/renderer (sin html2canvas).
 * Evita el error lab/oklch de Tailwind en Safari / iPhone.
 */
export async function generarBlobPdfLibroObra(
  entradas: LibroObraEntradaDia[],
  onProgreso?: (p: ProgresoPdfLibroObra) => void
): Promise<Blob> {
  const conEpa = entradas.filter((e) => e.formatoEpa)
  if (conEpa.length === 0) {
    throw new Error("No hay hojas EPA en el rango seleccionado.")
  }

  onProgreso?.({ hoja: 0, total: conEpa.length, fase: "preparando" })
  const logos = await cargarLogosPdf()

  onProgreso?.({ hoja: 0, total: conEpa.length, fase: "capturando" })

  // Ceder el hilo para que la UI muestre “Generando…”
  await new Promise<void>((resolve) => window.setTimeout(resolve, 0))

  const documento = createElement(LibroObraPdfDocument, {
    entradas: conEpa,
    logos,
  }) as ReactElement<DocumentProps>

  const blob = await pdf(documento).toBlob()

  onProgreso?.({ hoja: conEpa.length, total: conEpa.length, fase: "capturando" })
  return blob
}

/**
 * Abre el PDF en el visor nativo (iPhone) o descarga (escritorio).
 * No usa navigator.share (evita presentarlo como “adjunto”).
 */
export async function entregarPdfLibroObra(blob: Blob, nombreArchivo: string): Promise<void> {
  const url = URL.createObjectURL(blob)
  const esMovil =
    typeof navigator !== "undefined" &&
    /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

  if (esMovil) {
    const abierta = window.open(url, "_blank")
    if (!abierta) {
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
